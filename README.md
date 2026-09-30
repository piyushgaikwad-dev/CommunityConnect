# CommunityConnect

> **Hyperlocal Community Issue Mapping & Resolution Portal**  
> *A Community Engagement Project (CEP) for Civic Issue Triage, Geotagged Mapping, and Verified Photographic Resolution.*

---

## 🌟 Executive Summary

**CommunityConnect** is a full-stack civic engagement platform engineered to bridge the communication gap between local neighborhood residents and municipal administration. The portal empowers residents to report hyper-localized public infrastructure defects (such as potholed roads, faulty street lighting, solid waste dumps, water main leaks, and blocked drainage canals), drop an exact GPS map pin, and track progress through a transparent civic lifecycle.

Administrators evaluate reports, assign field crews, prioritize hazards using a deterministic **Community Priority Index (CPI)** algorithm, and publish **verified Before/After photographic resolution proof** to close the feedback loop.

---

## 🚀 Core Civic Workflow

```
[Resident Detects Hazard]
           ↓
[Reports Issue with Photo & GPS Pin]
           ↓
[Stored in Supabase (PostgreSQL & Storage)]
           ↓
[Community Priority Index (CPI) Computed]
           ↓
[Ward Admin Assigns Field Crew & Updates Status to "In Progress"]
           ↓
[Field Crew Fixes Problem]
           ↓
[Admin Uploads Resolution Proof Photo & Resolution Note]
           ↓
[Status Marked "Resolved"]
           ↓
[Live Homepage Impact Metrics Automatically Update]
           ↓
[Residents Inspect Verified BEFORE → AFTER Evidence]
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Free-Tier Rationale |
|---|---|---|
| **Frontend** | React 19, Vite, Modern ES Modules | High performance, lightweight bundle |
| **Styling** | Custom Responsive Design System (CSS Tokens) | Clean typography, accessible contrast, mobile-friendly |
| **Backend / DB** | Supabase (PostgreSQL, Supabase Auth, Storage, RLS) | 100% Free-Tier compliant, zero paid extensions |
| **Mapping** | Leaflet, OpenStreetMap | Open-source, zero API-key cost, precise coordinate markers |
| **Icons** | Lucide React | Clean, scalable civic iconography |
| **SEO & Meta** | Semantic HTML5, Schema.org JSON-LD, Sitemap, robots.txt, llms.txt | Full crawlability & rich snippets |

---

## ⚡ Key Features

1. **Resident Issue Reporting:**
   - Geotagged map pin selection with interactive Leaflet map picker and browser GPS auto-locate.
   - Category selection across 8 municipal domains (*Roads & Potholes, Street Lighting, Waste & Garbage, Water & Leakage, Drainage, Public Infrastructure, Stagnant Water, Other*).
   - Severity level indicator (*Low, Medium, High*).
   - Photo evidence upload with client-side format & size validation (JPEG, PNG, WebP, max 5MB).

2. **Verified Resolution Proof (Before / After Showcase):**
   - Mandatory field resolution proof: Administrators cannot mark an issue as resolved without supplying official resolution notes and resolution proof photography.
   - Dedicated Before (Reported Condition) vs After (Repaired State) comparison viewer.

3. **Dynamic Community Impact Statistics:**
   - Real-time aggregation of Total Reports, Verified Resolved Count, Active In-Progress queue, and Percentage Resolution Rate.
   - Turnaround metrics (Average Resolution Time in Days).
   - Automatic live re-calculation whenever an admin resolves an issue.

4. **Community Priority Index (CPI) Algorithm:**
   - A transparent, rule-based triage score (0 to 100):
     $$\text{CPI Score} = \text{Base Severity} + \text{Hazard Category Boost} + \text{Queue Age Penalty}$$
     - **Base Severity:** High = 60 pts, Medium = 35 pts, Low = 15 pts
     - **Hazard Boost:** +10 pts for Public Health/Vector risks (*Water, Drainage, Stagnant Water, Waste*); +5 pts for Transit hazards (*Roads, Lighting*)
     - **Aging Penalty:** $+2\text{ pts/day}$ (capped at $+30\text{ pts}$) to prevent old backlogs from lingering.

5. **Interactive Geospatial Issue Map:**
   - Custom color-coded status pins: Pending (Amber), In Progress (Blue), Resolved (Emerald Green).
   - Interactive popups with thumbnail previews and direct navigation to details.
   - Category and status filters directly on the map.

6. **Role-Based Security & Row-Level Security (RLS):**
   - Protected routes for residents (*My Reports*) and administrators (*Admin Portal*).
   - Strict database-level RLS policies preventing unauthorized status changes or resolution uploads by standard accounts.

7. **Authentication & Secure Password Recovery:**
   - Supabase Auth integration with registration, sign-in, session persistence, and full password recovery flow (`/forgot-password` → recovery email → `/reset-password` → new password update).

---

## 📦 Database Schema (`supabase_schema.sql`)

### 1. `profiles` Table
| Column | Type | Description |
|---|---|---|
| `id` | `UUID PRIMARY KEY` | References `auth.users(id)` |
| `user_id` | `UUID` | Foreign key to `auth.users(id)` |
| `name` | `TEXT` | Resident or Administrator full name |
| `email` | `TEXT` | Email address |
| `role` | `TEXT CHECK ('resident', 'admin')` | Access tier (defaults to `resident`) |
| `created_at`| `TIMESTAMPTZ` | Timestamp of registration |

### 2. `issues` Table
| Column | Type | Description |
|---|---|---|
| `id` | `UUID PRIMARY KEY` | Auto-generated UUID |
| `user_id` | `UUID` | References reporting user |
| `title` | `TEXT` | Concise summary of the defect |
| `category` | `TEXT` | Municipal domain |
| `description`| `TEXT` | Detailed context and observations |
| `location` | `TEXT` | Street address or landmark |
| `latitude` | `NUMERIC(10, 7)` | GPS latitude coordinate |
| `longitude` | `NUMERIC(10, 7)` | GPS longitude coordinate |
| `severity` | `TEXT` | `Low`, `Medium`, or `High` |
| `status` | `TEXT` | `Pending`, `In Progress`, or `Resolved` |
| `reported_image_url` | `TEXT` | URL of initial evidence photo |
| `resolution_image_url`| `TEXT` | URL of verified resolution proof photo |
| `resolution_note` | `TEXT` | Official repair log and notes |
| `priority_score` | `INTEGER` | Community Priority Index (0–100) |
| `created_at` | `TIMESTAMPTZ` | Date reported |
| `resolved_at` | `TIMESTAMPTZ` | Date verified & resolved |

---

## ⚙️ Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd CEP
npm install
```

### 2. Configure Supabase Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Initialize Database Schema
1. Open your Supabase Dashboard: [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).
3. Ensure the storage buckets `reported-images` and `resolution-images` are set to public read.

### 4. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

> **Note on Evaluation / Offline Mode:** If `.env` is omitted, the portal automatically operates in an offline-resilient demo mode with pre-seeded community issues and quick 1-click test credentials for examiners!

---

## 🧪 Testing & Examiner Fast-Track

- **Resident Flow:** Navigate to `/report`, click **"Quick Demo Auto-Fill"**, and submit an issue. View your submission under `/my-reports`.
- **Admin Flow:** Click **"Admin Portal"** or sign in as Admin. Review the priority queue, click **"Resolve"**, upload a resolution proof photo, write a repair note, and observe the live homepage statistics update in real-time.
- **Geospatial Map:** Explore `/map` to inspect color-coded GPS markers across the locality.

---

## 📜 License & CEP Attribution
Developed as an academic **Community Engagement Project (CEP)** for civic governance, urban resilience, and transparent public infrastructure maintenance.
