import { createClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_ vars build zamanında bundle'a gömülür.
// Vercel'de tanımlı değilse build sırasında undefined gelir — fallback ile crash önlenir.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabaseBrowser = createClient(url, key);
