import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_ISSUES } from './mockData';
import { calculatePriorityScore } from '../utils/priorityCalculator';
import { uploadReportImage, uploadResolutionImage } from './storageService';

const LOCAL_STORAGE_KEY = 'communityconnect_issues_v1';

// Helper to get local issues database
const getLocalIssues = () => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_ISSUES));
    return INITIAL_ISSUES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_ISSUES;
  }
};

const saveLocalIssues = (issues) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(issues));
};

/**
 * Fetch all issues with optional filtering & sorting
 */
export const getIssues = async (filters = {}) => {
  const { category, status, severity, search, sort = 'newest' } = filters;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('issues').select('*');

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      if (status && status !== 'All') {
        query = query.eq('status', status);
      }
      if (severity && severity !== 'All') {
        query = query.eq('severity', severity);
      }
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`);
      }

      if (sort === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sort === 'priority') {
        query = query.order('priority_score', { ascending: false });
      } else if (sort === 'severity') {
        query = query.order('priority_score', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase query error, falling back to local store:', err);
    }
  }

  // Fallback / Local Store
  let results = [...getLocalIssues()];

  if (category && category !== 'All') {
    results = results.filter((i) => i.category === category);
  }
  if (status && status !== 'All') {
    results = results.filter((i) => i.status === status);
  }
  if (severity && severity !== 'All') {
    results = results.filter((i) => i.severity === severity);
  }
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );
  }

  if (sort === 'oldest') {
    results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sort === 'priority') {
    results.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
  } else {
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return results;
};

/**
 * Fetch single issue by ID
 */
export const getIssueById = async (id) => {
  if (!id) return null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) return data;
    } catch (err) {
      console.warn('Supabase getIssueById fallback:', err);
    }
  }

  const local = getLocalIssues();
  return local.find((i) => i.id === id) || null;
};

/**
 * Fetch issues submitted by a specific user (My Reports)
 */
export const getUserIssues = async (userId) => {
  if (!userId) return [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase getUserIssues fallback:', err);
    }
  }

  const local = getLocalIssues();
  return local.filter((i) => i.user_id === userId);
};

/**
 * Compute Dynamic Homepage Impact Statistics directly from database
 */
export const getImpactStats = async () => {
  let allIssues = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('id, status, category, severity, created_at, resolved_at');
      
      if (error) throw error;
      allIssues = data || [];
    } catch (err) {
      console.warn('Supabase getImpactStats fallback:', err);
      allIssues = getLocalIssues();
    }
  } else {
    allIssues = getLocalIssues();
  }

  const total = allIssues.length;
  const resolved = allIssues.filter((i) => i.status === 'Resolved').length;
  const inProgress = allIssues.filter((i) => i.status === 'In Progress').length;
  const pending = allIssues.filter((i) => i.status === 'Pending').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Calculate Average Resolution Time in Days
  const resolvedWithDates = allIssues.filter((i) => i.status === 'Resolved' && i.resolved_at && i.created_at);
  let avgResolutionDays = null;
  if (resolvedWithDates.length > 0) {
    const totalDays = resolvedWithDates.reduce((acc, item) => {
      const start = new Date(item.created_at);
      const end = new Date(item.resolved_at);
      const days = Math.max(0.1, (end - start) / (1000 * 60 * 60 * 24));
      return acc + days;
    }, 0);
    avgResolutionDays = (totalDays / resolvedWithDates.length).toFixed(1);
  }

  // Category Distribution Map
  const categoryCounts = allIssues.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  // Severity Distribution Map
  const severityCounts = {
    High: allIssues.filter((i) => i.severity === 'High').length,
    Medium: allIssues.filter((i) => i.severity === 'Medium').length,
    Low: allIssues.filter((i) => i.severity === 'Low').length,
  };

  return {
    total,
    resolved,
    inProgress,
    pending,
    resolutionRate,
    avgResolutionDays,
    categoryCounts,
    severityCounts,
  };
};

/**
 * Fetch Recently Resolved issues for showcase
 */
export const getRecentlyResolvedIssues = async (limit = 4) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('status', 'Resolved')
        .order('resolved_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase getRecentlyResolvedIssues fallback:', err);
    }
  }

  const local = getLocalIssues();
  return local
    .filter((i) => i.status === 'Resolved')
    .sort((a, b) => new Date(b.resolved_at || b.created_at) - new Date(a.resolved_at || a.created_at))
    .slice(0, limit);
};

/**
 * Report a new issue
 */
export const createIssue = async (issueData, imageFile, user) => {
  const tempId = `iss_${Date.now()}`;
  const now = new Date().toISOString();

  // Upload reported image if provided
  let imageUrl = issueData.reported_image_url || null;
  if (imageFile) {
    imageUrl = await uploadReportImage(imageFile, user?.id, tempId);
  }

  // Compute Community Priority Index
  const priorityResult = calculatePriorityScore({
    severity: issueData.severity,
    category: issueData.category,
    createdAt: now,
  });

  const newIssueRecord = {
    user_id: user?.id || null,
    title: issueData.title.trim(),
    category: issueData.category,
    description: issueData.description.trim(),
    location: issueData.location.trim(),
    latitude: issueData.latitude ? Number(issueData.latitude) : null,
    longitude: issueData.longitude ? Number(issueData.longitude) : null,
    severity: issueData.severity,
    status: 'Pending',
    reported_image_url: imageUrl,
    resolution_image_url: null,
    resolution_note: null,
    priority_score: priorityResult.totalScore,
    created_at: now,
    resolved_at: null,
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .insert([newIssueRecord])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase createIssue error, writing to local store:', err);
    }
  }

  // Fallback / Local Store
  const localRecord = { ...newIssueRecord, id: tempId, reporter_name: user?.name || 'Resident' };
  const current = getLocalIssues();
  saveLocalIssues([localRecord, ...current]);
  return localRecord;
};

/**
 * Update Issue Status & Resolution Evidence (Admin Action)
 */
export const updateIssueStatus = async ({
  issueId,
  newStatus,
  resolutionNote,
  resolutionImageFile,
  user,
}) => {
  if (!issueId) throw new Error('Issue ID is required.');

  // Resolution Proof Rule: Admin cannot resolve without note or image
  if (newStatus === 'Resolved') {
    if (!resolutionNote && !resolutionImageFile) {
      throw new Error('Resolution requires a resolution note or resolution-proof image.');
    }
  }

  let resolutionImageUrl = null;
  if (resolutionImageFile) {
    resolutionImageUrl = await uploadResolutionImage(resolutionImageFile, issueId);
  }

  const updates = {
    status: newStatus,
  };

  if (newStatus === 'Resolved') {
    updates.resolved_at = new Date().toISOString();
    if (resolutionNote) updates.resolution_note = resolutionNote.trim();
    if (resolutionImageUrl) updates.resolution_image_url = resolutionImageUrl;
  } else {
    // If moving back from Resolved
    updates.resolved_at = null;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', issueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase updateIssueStatus fallback:', err);
    }
  }

  // Fallback / Local Store
  const issues = getLocalIssues();
  const index = issues.findIndex((i) => i.id === issueId);
  if (index === -1) throw new Error('Issue not found.');

  const updatedItem = {
    ...issues[index],
    ...updates,
    resolution_image_url: resolutionImageUrl || issues[index].resolution_image_url,
    resolution_note: resolutionNote || issues[index].resolution_note,
  };

  issues[index] = updatedItem;
  saveLocalIssues(issues);
  return updatedItem;
};

/**
 * Delete issue (Admin only)
 */
export const deleteIssue = async (issueId) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('issues').delete().eq('id', issueId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase deleteIssue fallback:', err);
    }
  }

  const issues = getLocalIssues();
  const filtered = issues.filter((i) => i.id !== issueId);
  saveLocalIssues(filtered);
  return true;
};
