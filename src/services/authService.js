import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PROFILES } from './mockData';

const LOCAL_USER_KEY = 'communityconnect_auth_user_v1';
const LOCAL_PROFILES_KEY = 'communityconnect_profiles_v1';

// Get local profiles
const getLocalProfiles = () => {
  const stored = localStorage.getItem(LOCAL_PROFILES_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(INITIAL_PROFILES));
    return INITIAL_PROFILES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_PROFILES;
  }
};

const saveLocalProfiles = (profiles) => {
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
};

/**
 * Register a new resident user
 * Default role is strictly 'resident' for security
 */
export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error('Please fill in all required fields.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
          role: 'resident',
        },
      },
    });

    if (error) throw error;

    const user = data?.user;
    if (user) {
      // Ensure profile entry exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email,
        name: cleanName,
        role: profile?.role || 'resident',
      };
    }
  }

  // Local / Fallback Authentication
  const profiles = getLocalProfiles();
  if (profiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    user_id: `usr_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    role: 'resident',
    created_at: new Date().toISOString(),
  };

  saveLocalProfiles([...profiles, newUser]);
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

/**
 * Sign in user
 */
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) throw error;

    const user = data?.user;
    if (user) {
      // Fetch role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const userObject = {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || 'Resident',
        role: profile?.role || user.user_metadata?.role || 'resident',
      };

      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userObject));
      return userObject;
    }
  }

  // Fallback / Demo Auth
  const profiles = getLocalProfiles();
  const found = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

  if (!found) {
    // If not found in seed, create resident session
    const autoUser = {
      id: `usr_${Date.now()}`,
      user_id: `usr_${Date.now()}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'resident',
      created_at: new Date().toISOString(),
    };
    saveLocalProfiles([...profiles, autoUser]);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(autoUser));
    return autoUser;
  }

  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(found));
  return found;
};

/**
 * Demo Fast Login for Presentation / Examiners
 */
export const demoLogin = async (role = 'resident') => {
  const profiles = getLocalProfiles();
  const target = profiles.find((p) => p.role === role) || profiles[0];
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(target));
  return target;
};

/**
 * Log out user
 */
export const logoutUser = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout error:', e);
    }
  }
  localStorage.removeItem(LOCAL_USER_KEY);
  return true;
};

/**
 * Send password reset email via Supabase Auth
 */
export const sendPasswordResetEmail = async (email) => {
  if (!email) {
    throw new Error('Please enter your email address.');
  }

  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  }

  // Fallback / Demo simulation
  return { message: 'Reset email simulated for local demo mode.' };
};

/**
 * Update user password after receiving recovery token/session
 */
export const updatePassword = async (newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  }

  // Fallback / Demo simulation
  return { message: 'Password updated in local demo mode.' };
};

/**
 * Get current authenticated user
 */
export const getStoredUser = () => {
  const stored = localStorage.getItem(LOCAL_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
};
