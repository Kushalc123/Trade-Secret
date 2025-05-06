/* ------------------------------------------------------------------
   src/app/project/[id]/page.tsx            – single-project view (client)
-------------------------------------------------------------------*/
"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import Image from "next/image";

type Props = { params: { id: string } };

type Project = {
  id: string;
  image_url: string;
  prompt: string | null;
  json: any;
  created_at: string;
};

export default function ProjectPage({ params }: Props) {
  const supabase = supabaseBrowser();

  const [proj,    setProj]    = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  /* fetch once on mount ----------------------------------------- */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) console.error("project fetch error →", error);
      else       setProj(data as Project);

      setLoading(false);
    })();
  }, [supabase, params.id]);

  /* states ------------------------------------------------------- */
  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Loading…
      </main>
    );

  if (!proj)
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Project not found
      </main>
    );

  /* page --------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      <Image
        src={proj.image_url}
        alt={proj.prompt ?? "project image"}
        width={800}
        height={800}
        className="w-full max-w-xl mx-auto rounded-xl"
      />

      <pre className="bg-gray-900/60 p-6 rounded-xl overflow-x-auto text-sm">
        {JSON.stringify(proj.json, null, 2)}
      </pre>
    </main>
  );
}
