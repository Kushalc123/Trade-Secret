/* ------------------------------------------------------------------
   src/app/edit/[id]/page.tsx   – live canvas editor
-------------------------------------------------------------------*/
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";

/* load FabricCanvas only in the browser */
const FabricCanvas = dynamic(() => import("@/components/FabricCanvas"), {
  ssr: false,
});

type Workflow = "edit" | "edit_model" | "edit_model_pose" | "studio_retouch";

export default function EditPage() {
  /* ----------------------------------------------------------------
     0. router helpers + supabase
  ---------------------------------------------------------------- */
  const router       = useRouter();
  const { id }       = useParams<{ id: string }>();
  const supabase     = supabaseBrowser();

  /* ----------------------------------------------------------------
     1. local state
  ---------------------------------------------------------------- */
  const [imgUrl,    setImgUrl]    = useState<string>();
  const [imgSize,   setImgSize]   = useState<{ w: number; h: number }>();
  const [workflow,  setWorkflow]  = useState<Workflow>();

  /* ----------------------------------------------------------------
     2. fetch project once
  ---------------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("image_url")
        .eq("id", id)
        .single();

      if (error || !data?.image_url) return router.push("/dashboard");
      setImgUrl(data.image_url);
    })();
  }, [id, supabase, router]);

  if (!imgUrl) return null; // still loading

  /* ----------------------------------------------------------------
     3. render
  ---------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">
      {/* ── A. choose workflow (once) ─────────────────────────────── */}
      {!workflow && (
        <div className="flex flex-wrap gap-4">
          {[
            ["edit",            "Image Edit"],
            ["edit_model",      "Image Edit + Model"],
            ["edit_model_pose", "Edit + Model + Pose"],
            ["studio_retouch",  "Studio Retouch"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setWorkflow(key as Workflow)}
              className="px-5 py-3 rounded bg-blue-600 hover:brightness-110"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── B. canvas UI ─────────────────────────────────────────── */}
      {workflow && (
        <>
          {/* tips bar */}
          <p className="bg-gray-900/60 p-3 rounded text-sm">
            <b>Tip:</b> draw with the green brush to mark the area to edit.
          </p>

          {/* image + drawing layer */}
          <div className="relative w-full max-w-[900px] mx-auto">
            {/* 1️⃣ the base image */}
            <img
              src={imgUrl}
              alt="project"
              className="block w-full h-auto max-h-[70vh] rounded-lg select-none pointer-events-none"
              onLoad={(e) => {
                const { naturalWidth, naturalHeight } = e.currentTarget;
                /* scale factor to fit our max-dimensions */
                const r = Math.min(
                  900 / naturalWidth,
                  (window.innerHeight * 0.70) / naturalHeight,
                  1
                );
                setImgSize({ w: naturalWidth * r, h: naturalHeight * r });
              }}
            />

            {/* 2️⃣ the free-drawing canvas */}
            {imgSize && (
              <FabricCanvas
                width={imgSize.w}
                height={imgSize.h}
                className="absolute inset-0 z-10 pointer-events-auto rounded-lg"
              />
            )}
          </div>

          {/* prompt box */}
          <textarea
            defaultValue={
              workflow === "edit" || workflow === "studio_retouch"
                ? "1+6+7+8"
                : "6+7+8"
            }
            rows={3}
            className="w-full bg-gray-800/60 p-3 rounded outline-none"
          />

          {/* footer */}
          <div className="flex gap-4">
            <button className="flex-1 bg-emerald-600 py-3 rounded">
              Apply&nbsp;edit
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-3 bg-gray-700 rounded"
            >
              Back
            </button>
          </div>
        </>
      )}
    </main>
  );
}
