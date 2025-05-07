/*  src/utils/buildMask.ts
    --------------------------------------------------------------
    Convert our strokes[] array into a black/white PNG Blob.
    – returns a Promise<Blob> (type "image/png")
    – brushes -> white, erases -> black
-------------------------------------------------------------- */

import { Stroke } from '@/store/useMaskStore';

export function buildMaskPNG(
  strokes: Stroke[],
  width: number,
  height: number
): Promise<Blob> {
  // 1. create an off-screen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000000';          // start fully black
  ctx.fillRect(0, 0, width, height);

  // 2. draw each stroke
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  strokes.forEach((s) => {
    ctx.strokeStyle = s.tool === 'brush' ? '#FFFFFF' : '#000000';
    ctx.lineWidth = s.size;
    ctx.beginPath();
    const pts = s.points;
    if (pts.length < 2) return;
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) {
      ctx.lineTo(pts[i], pts[i + 1]);
    }
    ctx.stroke();
  });

  // 3. turn into PNG Blob
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  );
}
