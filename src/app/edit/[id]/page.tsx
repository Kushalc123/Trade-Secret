/* ------------------------------------------------------------------
   src/app/edit/[id]/page.tsx   – canvas editor (refreshed)
-------------------------------------------------------------------*/
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import FabricCanvas from "@/components/FabricCanvas";

/* ------------------------------------------------------------------ */
/* types / helpers                                                    */
/* ------------------------------------------------------------------ */
type Workflow = "edit" | "edit_model" | "edit_model_pose" | "studio_retouch";

interface ImgDims {
  w: number;
  h: number;
}

/* ------------------------------------------------------------------ */
/* component                                                          */
/* ------------------------------------------------------------------ */
export default function EditPage() {
  /* routing / data */
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const supabase = supabaseBrowser();

  /* state */
  const [url,  setUrl]  = useState<string>();
  const [dims, setDims] = useState<ImgDims>();          // scaled width & height
  const [mode, setMode] = useState<Workflow | null>(null);

  /* fetch the original project image once */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("image_url")
        .eq("id", id)
        .single();

      if (error || !data) return push("/dashboard");
      setUrl(data.image_url as string);
    })();
  }, [id, supabase, push]);

  if (!url) return null; // still fetching

  /* ---------------------------------------------------------------- */
  /* view                                                             */
  /* ---------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">

      {/* 0 ─── choose a workflow first ─────────────────────────────── */}
      {!mode && (
        <div className="flex flex-wrap gap-4">
          {[
            ["edit",           "Image Edit"],
            ["edit_model",     "Image Edit + Model"],
            ["edit_model_pose","Edit + Model + Pose"],
            ["studio_retouch", "Studio Retouch"],
          ].map(([k, label]) => (
            <button
              key={k}
              className="px-5 py-3 bg-blue-600 rounded-md hover:brightness-110"
              onClick={() => setMode(k as Workflow)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 1 ─── canvas UI after workflow picked ─────────────────────── */}
      {mode && (
        <>
          {/* tip box */}
          <div className="bg-gray-900/60 p-4 rounded text-sm">
            <b>Tip:</b> draw with the green brush to mark the area to edit.
          </div>

          {/* wrapper gets sized after <img> natural dims are known */}
          {dims && (
            <div
              className="relative mx-auto inline-block"
              style={{ width: dims.w, height: dims.h }}
            >
              {/* base image */}
              <img
                src={url}
                alt="project"
                width={dims.w}
                height={dims.h}
                className="block w-full h-full rounded-lg select-none pointer-events-none"
              />

              {/* drawing overlay */}
                <FabricCanvas
                 width={dims.w}
                  height={dims.h}
                   maskColor="rgba(0,255,0,0.5)"
                    /* NEW ↓ */
                    className="absolute inset-0"
                  />
            </div>
          )}

          {/* hidden until we know natural size → then set scaled dims */}
          {!dims && (
            <img
              src={url}
              alt=""
              className="absolute -z-10 opacity-0"
              onLoad={(e) => {
                const MAX_W = 750;                      // fit laptop screens
                const MAX_H = window.innerHeight * 0.65;

                const { naturalWidth, naturalHeight } = e.currentTarget;
                const r = Math.min(1, MAX_W / naturalWidth, MAX_H / naturalHeight);

                setDims({ w: Math.round(naturalWidth * r), h: Math.round(naturalHeight * r) });
              }}
            />
          )}

          {/* prompt textarea */}
          <textarea
            defaultValue={
              mode === "edit" || mode === "studio_retouch" ? "1+6+7+8" : "6+7+8"
            }
            rows={4}
            className="w-full bg-gray-800/60 p-3 rounded outline-none"
          />

          {/* footer */}
          <div className="flex gap-4">
            <button
              className="flex-1 bg-emerald-600 py-3 rounded hover:brightness-110"
            >
              Apply&nbsp;edit
            </button>
            <button
              onClick={() => push("/dashboard")}
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
