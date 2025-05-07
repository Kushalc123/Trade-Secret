/*  src/lib/sam.ts
    ------------------------------------------------------------------
    One-time lazy loader for SlimSAM via Transformers.js
    Exposes:
      ensureSamReady()      → 'ready' | 'err'
      getMaskAtPoint(img, x, y, positive) → 0/255 Uint8ClampedArray
--------------------------------------------------------------------- */

import { pipeline, env } from '@xenova/transformers';

type Predictor = Awaited<ReturnType<typeof pipeline<'image-segmentation'>>>;

let predictor: Predictor | null = null;
let samError: string | null = null;

export async function ensureSamReady() {
  if (predictor || samError) return { predictor, samError };

  // WebGPU if available, otherwise WASM
  env.backends.webgpu.wasmFallback = 'wasm';

  try {
    predictor = await pipeline(
      'image-segmentation',
      // Slim, 77 M parameters – <15 MB weights
      'Xenova/slimsam-77-uniform',
      { quantized: true }     // load the 8-bit weights
    );
  } catch (e) {
    samError = 'Failed to load SAM model in this browser';
  }
  return { predictor, samError };
}

export async function getMaskAtPoint(
  img: HTMLImageElement,
  x: number,
  y: number,
  label: 0 | 1 = 1            // 1 = positive, 0 = negative click
): Promise<Uint8ClampedArray | null> {
  const { predictor } = await ensureSamReady();
  if (!predictor) return null;

  // predictors expect normalized coords 0-1
  const res = await predictor(img, { points: [[x / img.width, y / img.height, label]] });
  // take the highest-probability mask
  return res?.masks?.[0]?.data ?? null;
}
