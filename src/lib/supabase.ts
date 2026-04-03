import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type PublicEnv = ImportMetaEnv & {
  VITE_SUPABASE_ANON_KEY?: string;
};

const env = import.meta.env as PublicEnv;

const FALLBACK_SUPABASE_PROJECT_ID = "spjddqgrjoptfcjbhisv";
const FALLBACK_SUPABASE_URL = `https://${FALLBACK_SUPABASE_PROJECT_ID}.supabase.co`;
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwamRkcWdyam9wdGZjamJoaXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjgzNjQsImV4cCI6MjA4ODA0NDM2NH0.bODEdHaPbHWgu3g_yELvQ6vUDt38zdCrp0XD8aepiuw";

const envProjectId = env.VITE_SUPABASE_PROJECT_ID?.trim();
const envUrl = env.VITE_SUPABASE_URL?.trim();
const envPublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim();

const SUPABASE_URL = envUrl || (envProjectId ? `https://${envProjectId}.supabase.co` : FALLBACK_SUPABASE_URL);
const SUPABASE_PUBLISHABLE_KEY = envPublishableKey || FALLBACK_SUPABASE_PUBLISHABLE_KEY;

if (!envUrl || !envPublishableKey) {
  console.warn("Using embedded public backend config because Vite env vars are missing.", {
    hasSupabaseUrlEnv: Boolean(envUrl),
    hasSupabasePublishableKeyEnv: Boolean(envPublishableKey),
    hasSupabaseProjectIdEnv: Boolean(envProjectId),
  });
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});