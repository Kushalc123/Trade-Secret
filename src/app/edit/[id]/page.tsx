/* ---------------------------------------------------------
   VERY small demo editor
----------------------------------------------------------*/
"use client";

import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

const FabricCanvas = dynamic(
  () => import('@/components/FabricCanvas').then(m => m.default),
  { ssr: false, loading: () => <p className="text-gray-400">loading…</p> }
);
//import FabricCanvas from "@/components/FabricCanvas";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function Edit() {
  const { push }  = useRouter();
  const supabase  = supabaseBrowser();
  const id        = useRouter().params.id as string;

  const [url, setUrl] = useState<string>();

  /* fetch the project once */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("image_url")
        .eq("id", id)
        .single();

      if (error || !data) return notFound();
      setUrl(data.image_url as string);
    })();
  }, [id, supabase]);

  if (!url) return null;

  return (
    <main className="p-6 space-y-4 text-gray-100 bg-gray-950 min-h-screen">
      <p className="bg-gray-900/60 rounded p-3 text-sm">
        <b>Tip:</b> draw with the green brush to mark the area to edit.
      </p>

      {/* base image */}
      <img
        src={url}
        alt=""
        className="mx-auto block max-w-[900px] w-full h-auto rounded-lg"
        onLoad={e => {
          const w = e.currentTarget.naturalWidth;
          const h = e.currentTarget.naturalHeight;
          /* render drawing layer the same size */
          setSize({ w, h });
        }}
      />

      {/* drawing layer */}
      {size && (
        <div className="relative mx-auto max-w-[900px]">
          <FabricCanvas
            width={size.w}
            height={size.h}
            className="absolute inset-0 pointer-events-auto"
          />
        </div>
      )}

      <button
        onClick={() => push("/dashboard")}
        className="px-6 py-3 rounded bg-gray-700"
      >
        back
      </button>
    </main>
  );
}

/* local helper state */
function setSize(arg: { w: number; h: number }) {
  (window as any).__size__ = arg;
}
function useSize() {
  return (window as any).__size__ as { w: number; h: number } | undefined;
}
