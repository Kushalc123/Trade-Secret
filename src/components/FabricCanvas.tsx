/* ---------------------------------------------------------
   Lightweight Fabric 6 drawing layer
----------------------------------------------------------*/
"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";   // ← full namespace

export interface FabricCanvasProps {
  width:  number;
  height: number;
  mask   ?: string;   // rgba() — default 50 % green
  size   ?: number;   // brush px
}

export default function FabricCanvas({
  width,
  height,
  mask = "rgba(0,255,0,0.5)",
  size = 40,
}: FabricCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  /* build once */
  useEffect(() => {
    if (!ref.current) return;
    const canvas = new fabric.Canvas(ref.current, {
      width,
      height,
      selection: false,
    });

    const brush         = new fabric.PencilBrush(canvas);
    brush.stroke        = mask;     // colour incl. alpha
    brush.width         = size;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode    = true;

    return () => canvas.dispose();
  }, [width, height, mask, size]);

  return <canvas ref={ref} className="block" />;
}
