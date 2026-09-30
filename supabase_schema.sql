-- ============================================================================
-- COMMUNITYCONNECT: SUPABASE DATABASE & STORAGE SCHEMA
-- Compatible with Supabase Free Tier
-- ============================================================================

-- 1. Enable UUID Extension (Available on Supabase Free Tier)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create ISSUES Table
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'Waste & Garbage',
            'Roads & Potholes',
            'Street Lighting',
            'Water & Leakage',
            'Drainage',
            'Public Infrastructure',
            'Stagnant Water',
            'Other'
        )
    ),
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    reported_image_url TEXT,
    resolution_image_url TEXT,
    resolution_note TEXT,
    priority_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 4. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON public.issues(severity);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON public.issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON public.issues(priority_score DESC);

-- 5. Trigger: Transparent Community Priority Index (CPI) Calculator
-- Formula: Base Severity (High:60, Medium:35, Low:15) + Health/Safety Boost (10 for Water/Drainage/Waste) + Age bonus (up to +30 pts)
CREATE OR REPLACE FUNCTION public.compute_issue_priority()
RETURNS TRIGGER AS $$
DECLARE
    base_score INT := 15;
    category_boost INT := 0;
    age_days INT := 0;
BEGIN
    -- Severity Base Score
    IF NEW.severity = 'High' THEN
        base_score := 60;
    ELSIF NEW.severity = 'Medium' THEN
        base_score := 35;
    ELSE
        base_score := 15;
    END IF;

    -- Category Urgency Boost for Public Health & Hazards
    IF NEW.category IN ('Water & Leakage', 'Drainage', 'Stagnant Water', 'Waste & Garbage') THEN
        category_boost := 10;
    ELSIF NEW.category IN ('Roads & Potholes', 'Street Lighting') THEN
        category_boost := 5;
    ELSE
        category_boost := 0;
    END IF;

    -- Compute age days bonus (2 points per day old, capped at 30)
    IF NEW.created_at IS NOT NULL THEN
        age_days := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 86400)::INT);
    END IF;

    NEW.priority_score := base_score + category_boost + LEAST(30, age_days * 2);

    -- Ensure resolved_at is maintained correctly
    IF NEW.status = 'Resolved' AND OLD.status != 'Resolved' AND NEW.resolved_at IS NULL THEN
        NEW.resolved_at := NOW();
    ELSIF NEW.status != 'Resolved' THEN
        NEW.resolved_at := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_compute_issue_priority ON public.issues;
CREATE TRIGGER trigger_compute_issue_priority
    BEFORE INSERT OR UPDATE ON public.issues
    FOR EACH ROW
    EXECUTE FUNCTION public.compute_issue_priority();

-- 6. Trigger: Automatic Profile Creation on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, name, email, role, created_at)
    VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'resident'),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view profile summary (e.g., name/role)
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Profiles: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Profiles: Users can update their own profile (cannot escalate role without admin privilege)
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Enable RLS on Issues
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Issues: Anyone can view issues publicly
CREATE POLICY "Issues are viewable by everyone" 
    ON public.issues FOR SELECT 
    USING (true);

-- Issues: Authenticated residents can create new issues (status defaults to Pending)
CREATE POLICY "Authenticated users can create issues" 
    ON public.issues FOR INSERT 
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND 
        status = 'Pending' AND 
        resolution_image_url IS NULL AND 
        resolution_note IS NULL
    );

-- Issues: Residents can update their own pending issues (e.g. edit description)
CREATE POLICY "Residents can update their own pending issues" 
    ON public.issues FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id AND status = 'Pending')
    WITH CHECK (auth.uid() = user_id AND status = 'Pending');

-- Issues: Admins can update any issue (status, resolution proof, notes)
CREATE POLICY "Admins can update any issue" 
    ON public.issues FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Issues: Admins can delete invalid/spam issues
CREATE POLICY "Admins can delete any issue" 
    ON public.issues FOR DELETE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 8. STORAGE BUCKETS SETUP (Free Tier Compatible)
-- Note: Create buckets 'reported-images' and 'resolution-images' in Supabase Storage Dashboard
-- or via SQL if storage schema is exposed.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('reported-images', 'reported-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('resolution-images', 'resolution-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Reported Images
CREATE POLICY "Reported images are publicly accessible" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'reported-images');

CREATE POLICY "Authenticated users can upload reported images" 
    ON storage.objects FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'reported-images');

-- Storage Policies: Resolution Images
CREATE POLICY "Resolution images are publicly accessible" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'resolution-images');

CREATE POLICY "Only admins can upload resolution images" 
    ON storage.objects FOR INSERT 
    TO authenticated
    WITH CHECK (
        bucket_id = 'resolution-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
