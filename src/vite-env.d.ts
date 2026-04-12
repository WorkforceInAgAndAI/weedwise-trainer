/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  /** Instructor dashboard gate; set in Lovable secrets / Amplify when deploying */
  readonly VITE_INSTRUCTOR_PIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
