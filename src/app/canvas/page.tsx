'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// ── 1.  load the editor *client-side only* (react-konva needs the browser)
const CanvasEditor = dynamic(
  () => import('@/components/Canvas/CanvasEditor'),
  { ssr: false }
);

// ── 2.  simple file-picker → turns the image into a blob URL for CanvasEditor
export default function CanvasPlayground() {
  const [file, setFile] = useState<File | null>(null);

  // default demo image lives in /public
  const imgSrc = file ? URL.createObjectURL(file) : '/sample.jpg';

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Masking Tool Playground</h1>

      {/* pick an image */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />

      {/* the actual editor */}
      <CanvasEditor imgSrc={imgSrc} />
    </main>
  );
}
