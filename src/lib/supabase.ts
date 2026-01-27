import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Supabase URL och Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Skapa Supabase-klient
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper: Kolla om Supabase är konfigurerad
export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '';
};

// Helper: Logga in anonymt (för single-user mode utan auth)
export const signInAnonymously = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase inte konfigurerad - kör i offline-läge');
    return null;
  }

  try {
    // Kolla om det finns en befintlig session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return session;
    }

    // Ingen session - försök anonym inloggning
    // OBS: Detta kräver att Anonymous sign-in är aktiverat i Supabase
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('Kunde inte logga in anonymt:', error);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Supabase auth error:', error);
    return null;
  }
};
