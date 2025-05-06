/* ------------------------------------------------------------------
   src/app/dashboard/page.tsx               – DASHBOARD (fixed columns)
-------------------------------------------------------------------*/
"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";

type Profile = { credits: number | null; email: string | null };

type ProjectRow = {
  id: string;
  user_id: string;
  image_url: string;   // ← matches the DB
  prompt: string | null;
  created_at: string;
};

export default function Dashboard() {
  const supabase = supabaseBrowser();

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading,  setLoading]  = useState(true);

  /* ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      /* 1.  Logged-in user? */
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth";
        return;
      }

      /* 2.  Profile row */
      const { data: prof } = await supabase
        .from("profiles")
        .select("credits, email")
        .eq("id", user.id)
        .single();
      setProfile(prof as Profile | null);

      /* 3.  Latest 16 projects (correct column names) */
      const { data: proj, error } = await supabase
        .from("projects")
        .select("id,user_id,image_url,prompt,created_at")
        .order("created_at", { ascending: false })
        .limit(16);

      if (error) console.error("projects query error →", error);
      else       setProjects(proj ?? []);

      setLoading(false);
    })();
  }, [supabase]);

  if (loading) return null;

  /* ───────────────────────────── UI ───────────────────────────── */
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6">
      {/* top-bar */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Trade Secret</h1>

        <div className="flex items-center gap-6">
          <span className="text-sm">
            Credits:&nbsp;<b>{profile?.credits ?? 0}</b>
          </span>
          <button
            className="text-sm opacity-80 hover:underline"
            onClick={() =>
              supabase.auth.signOut().then(() => (window.location.href = "/auth"))
            }
          >
            Log&nbsp;out
          </button>
        </div>
      </header>

      {/* welcome card */}
      <section className="bg-gray-900/60 backdrop-blur rounded-2xl p-10 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-medium mb-4">
          Welcome{profile?.email ? `, ${profile.email.split("@")[0]}!` : "!"}
        </h2>
        <p className="mb-8 text-gray-400">
          Ready to transform your product photos with AI?
        </p>
        <Link
          href="/upload"
          className="inline-block bg-gradient-to-r from-brand to-brand-light text-white px-6 py-3 rounded-md font-semibold hover:brightness-110 transition"
        >
          Upload a photo →
        </Link>
      </section>

      {/* recent projects */}
      <section className="max-w-5xl mx-auto mt-16">
        <h3 className="text-lg font-medium mb-4">Recent Projects</h3>

        {projects.length === 0 ? (
          <p className="text-center text-gray-400/80">
            You haven’t edited any images yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/project/${p.id}`}
                className="group block bg-gray-900/40 rounded-lg overflow-hidden"
              >
                <Image
                  src={p.image_url}
                  alt={p.prompt ?? "project image"}
                  width={400}
                  height={400}
                  className="h-40 w-full object-cover group-hover:opacity-90 transition"
                />
                <div className="p-3">
                  <p className="text-sm font-medium truncate">
                    {p.prompt || "— untitled —"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
