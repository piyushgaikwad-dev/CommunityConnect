import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validate image file before upload
 */
export const validateImageFile = (file) => {
  if (!file) return { valid: false, error: 'No image file selected.' };
  
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file format. Please upload JPEG, PNG, or WebP images only.' 
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { 
      valid: false, 
      error: 'File is too large. Maximum allowed size is 5MB.' 
    };
  }

  return { valid: true };
};

/**
 * Convert File to Data URL for instant preview or offline storage
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload Reported Issue Image to Supabase Storage Bucket 'reported-images'
 */
export const uploadReportImage = async (file, userId, issueId) => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // If Supabase is connected, upload to Supabase Storage Bucket
  if (isSupabaseConfigured() && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId || 'guest'}/${issueId || Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('reported-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload error, falling back to data URL:', error.message);
        return await fileToDataUrl(file);
      }

      const { data: publicUrlData } = supabase.storage
        .from('reported-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Storage upload error fallback:', err);
      return await fileToDataUrl(file);
    }
  }

  // Local / Demo Fallback Mode
  return await fileToDataUrl(file);
};

/**
 * Upload Resolution Proof Image to Supabase Storage Bucket 'resolution-images'
 */
export const uploadResolutionImage = async (file, issueId) => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // If Supabase is connected, upload to Supabase Storage Bucket
  if (isSupabaseConfigured() && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${issueId || Date.now()}_resolution_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('resolution-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase resolution upload error, falling back to data URL:', error.message);
        return await fileToDataUrl(file);
      }

      const { data: publicUrlData } = supabase.storage
        .from('resolution-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Storage upload fallback:', err);
      return await fileToDataUrl(file);
    }
  }

  // Local / Demo Fallback Mode
  return await fileToDataUrl(file);
};
