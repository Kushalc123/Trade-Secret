/* ------------------------------------------------------------------
   src/app/edit/[id]/page.tsx  –  very-small demo editor (fixed)
-------------------------------------------------------------------*/
'use client';

import {
  notFound,
  useRouter,
  useParams,          // ⬅️ grab route params here
} from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabaseBrowser } from '@/lib/supabaseClient';

/* lazy-load the Fabric wrapper only on the client */
const FabricCanvas = dynamic(
  () => import('@/components/FabricCanvas').then((m) => m.default),
  { ssr: false, loading: () => <p className="text-gray-400">loading…</p> }
);

export default function Edit() {
  /* ----------------------------------------------------------------
     1) routing helpers
  ---------------------------------------------------------------- */
  const router          = useRouter();
  const { id }          = useParams<{ id: string }>(); // ✅
  const supabase        = supabaseBrowser();

  /* ----------------------------------------------------------------
     2) state
  ---------------------------------------------------------------- */
  const [url, setUrl]   = useState<string>();
  const [size, setSize] = useState<{ w: number; h: number }>();

  /* ----------------------------------------------------------------
     3) fetch project once
  ---------------------------------------------------------------- */
  useEffect(() => {
    if (!id) return;                // params yet to be resolved
    (async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('image_url')
        .eq('id', id)
        .single();

      if (error || !data) return notFound();
      setUrl(data.image_url as string);
    })();
  }, [id, supabase]);

  if (!url) return null;            // simple loading fallback

  /* ----------------------------------------------------------------
     4) view
  ---------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">
      <p className="text-sm text-gray-400">
        <b>Tip:</b> draw with the green brush to mark the area to edit.
      </p>

      {/* base image + drawing layer */}
      <div className="relative inline-block max-w-[900px] w-full">
        <img
          src={url}
          alt="project"
          className="block w-full h-auto select-none pointer-events-none rounded-lg"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            setSize({ w, h });
          }}
        />

        {size && (
          <FabricCanvas
            key={url}                 /* reset brush when image changes */
            imageUrl={url}
            maskColor="rgba(0,255,0,0.5)"
            className="absolute inset-0 rounded-lg"
          />
        )}
      </div>

      {/* back button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="px-6 py-3 rounded bg-gray-700"
      >
        back
      </button>
    </main>
  );
}
