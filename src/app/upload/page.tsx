/* ------------------------------------------------------------------
   Phase-1 upload & concept screen – FULL FILE
-------------------------------------------------------------------*/
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { ACTIVITY_COSTS } from "@/lib/billing";       // ← NEW

/* ---------- billing for this workflow (vision) ------------------ */
const COST = ACTIVITY_COSTS.vision;   // 0 credits right now

/* ---------- JSON shape the vision proxy sends back -------------- */
type VisionJSON = {
  product_description: string;
  original_human: string;
  original_background: string;
  original_lighting: string;
  brief_concept: string;
  ideal_human: string;
  ideal_background: string;
  ideal_lighting: string;
};

export default function UploadPage() {
  const supabase = supabaseBrowser();

  /* ---------------------------- state --------------------------- */
  const [file,     setFile]     = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [subject,  setSubject]  = useState("");
  const [fields,   setFields]   = useState<Partial<VisionJSON>>({});
  const [loading,  setLoading]  = useState(false);

  /* ----------------- drag-and-drop (with resize) ---------------- */
  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted[0]) return;
    let img = accepted[0];

    const bmp = await createImageBitmap(img);
    if (bmp.width > 3000 || bmp.height > 3000) {
      img = await imageCompression(img, { maxWidthOrHeight: 3000 });
    }

    setFile(img);
    setPreview(URL.createObjectURL(img));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  /* ------------------------- main flow ------------------------- */
  async function generateConcept() {
    if (!file || !subject.trim()) {
      alert("Please upload an image and enter the subject.");
      return;
    }
    setLoading(true);

    /* 1️⃣  session ------------------------------------------------ */
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return (window.location.href = "/auth");

    /* 2️⃣  credit check (only if COST > 0) ------------------------ */
    if (COST > 0) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (!prof || (prof.credits ?? 0) < COST) {
        setLoading(false);
        return alert("Not enough credits.");
      }
    }

    /* 3️⃣  upload original image --------------------------------- */
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const up   = await supabase.storage.from("uploads").upload(path, file, {
      upsert: true,
    });
    if (up.error) {
      console.error(up.error);
      alert("Storage upload failed");
      return setLoading(false);
    }
    const publicUrl = supabase.storage
      .from("uploads")
      .getPublicUrl(up.data.path).data.publicUrl;

    /* 4️⃣  call our /api/fal/vision proxy ------------------------ */
    const resp = await fetch("/api/fal/vision", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ image: publicUrl, prompt: subject.trim() }),
    });
    if (!resp.ok) {
      console.error(await resp.text());
      alert("Vision API error");
      return setLoading(false);
    }

    /* 5️⃣  parse JSON ------------------------------------------- */
    const json = (await resp.json()) as Partial<VisionJSON>;
    console.log("✅ vision JSON:", json);

    if (!json.product_description) {
      alert("Proxy did not return expected keys.");
      return setLoading(false);
    }
    setFields(json);

    /* 6️⃣  persist project row ---------------------------------- */
    const { error: insErr } = await supabase.from("projects").insert({
      user_id:   user.id,
      image_url: publicUrl,
      prompt:    subject.trim(),
      json,
      workflow:  "vision",
    });
    if (insErr) console.error("projects insert error →", insErr);

    /* 7️⃣  debit credits if needed ------------------------------- */
    if (COST > 0) {
      await supabase.rpc("change_credits", { uid: user.id, delta: -COST });
    }

    setLoading(false);
  }

  /* --------------------------- view ----------------------------- */
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      <h1 className="text-xl font-semibold">New Project</h1>

      {/* upload box */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-600 rounded-xl p-10
                   flex items-center justify-center cursor-pointer">
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="preview" className="max-h-64" />
        ) : isDragActive ? (
          <p>Drop the image here…</p>
        ) : (
          <p>Drag &amp; drop or click to upload</p>
        )}
      </div>

      {/* subject + button */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Image subject (e.g., Bag)"
          className="flex-1 bg-gray-800/60 rounded-md py-3 px-4" />
        <button
          onClick={generateConcept}
          disabled={loading}
          className="bg-blue-600 px-6 py-3 rounded-md disabled:opacity-50">
          {loading ? "Generating…" : "Generate Concepts"}
        </button>
      </div>

      {/* results grid */}
      {fields.product_description && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* ACTUAL */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400">ACTUAL</h2>
            {(
              [
                "product_description",
                "original_human",
                "original_background",
                "original_lighting",
              ] as (keyof VisionJSON)[]
            ).map((k) => (
              <textarea
                key={k}
                rows={3}
                value={(fields as any)[k] || ""}
                onChange={(e) =>
                  setFields({ ...fields, [k]: e.target.value } as Partial<VisionJSON>)
                }
                className="w-full bg-gray-900/40 p-3 rounded-md"
                placeholder={k.replace(/_/g, " ")}
              />
            ))}
          </div>

          {/* CONCEPT */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400">CONCEPT</h2>
            {(
              [
                "brief_concept",
                "ideal_human",
                "ideal_background",
                "ideal_lighting",
              ] as (keyof VisionJSON)[]
            ).map((k) => (
              <textarea
                key={k}
                rows={3}
                value={(fields as any)[k] || ""}
                onChange={(e) =>
                  setFields({ ...fields, [k]: e.target.value } as Partial<VisionJSON>)
                }
                className="w-full bg-gray-900/40 p-3 rounded-md"
                placeholder={k.replace(/_/g, " ")}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
