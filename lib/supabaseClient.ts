import { createClient } from '@supabase/supabase-js';

/**
 * 创建浏览器端 Supabase 客户端
 */
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://potpgjiuqimpbrhdafnz.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdHBnaml1cWltcGJyaGRhZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzc0NTgsImV4cCI6MjA3NDU1MzQ1OH0.s-m9tLoZj9nqf81k-fG5AtN-DDKWTUCyTULkAL4POjI';
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createClient(url, anonKey);
}


