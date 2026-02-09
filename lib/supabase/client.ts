import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Soporta tanto ANON_KEY (estándar) como PUBLISHABLE_KEY
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
    throw new Error(
      "Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey,
  );
}
