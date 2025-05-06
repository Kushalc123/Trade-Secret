console.log(
  "ENV",
  process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0,30),
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0,15)
);
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types_db";   // stub for now

export const supabaseBrowser = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );