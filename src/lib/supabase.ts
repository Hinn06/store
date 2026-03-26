import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (name: string, fallback: string) => {
  const value = import.meta.env[name];
  if (!value || value === 'undefined' || value === 'null' || value === '') {
    return fallback;
  }
  return value;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://nrzsnhncillisjzhbvsh.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yenNuaG5jaWxsaXNqemhidnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTMyMTEsImV4cCI6MjA4OTQ4OTIxMX0.Aw7rnEx8pUQdE4Xa-5HOnHN7p6bbKVfSOvD7Grodvrs');

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseUrl.startsWith('http')) {
    throw new Error(`URL Supabase không hợp lệ: "${supabaseUrl}". Vui lòng kiểm tra lại biến VITE_SUPABASE_URL trong phần Settings.`);
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err: any) {
      throw new Error(`Không thể khởi tạo Supabase: ${err.message}`);
    }
  }
  
  return supabaseInstance;
};

// Export a dummy for types if needed, but prefer using getSupabase()
export const supabase = supabaseInstance;
