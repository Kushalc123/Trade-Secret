/* ------------------------------------------------------------------
   FabricCanvas – plain drawing layer (no image)                  v1
-------------------------------------------------------------------*/
"use client";

import { useEffect, useRef } from "react";
import type { FabricCanvas } from "fabric";
import { fabric } from "fabric";

interface Props {
  width:  number;
  height: number;
  className?: string;
  maskColor?: string;   // any CSS color – default = 50 % green
  brushSize?: number;   // px
}

export default function FabricCanvas({
  width,
  height,
  className    = "",
  maskColor    = "rgba(0,255,0,0.5)",
  brushSize    = 40,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  /* build once on mount */
  useEffect(() => {
    if (!ref.current) return;
    const canvas: FabricCanvas = new fabric.Canvas(ref.current, {
      width,
      height,
      selection: false,
    });

    /* custom brush */
    const brush = new fabric.PencilBrush(canvas);
    brush.color  = maskColor;
    brush.width  = brushSize;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode    = true;

    return () => canvas.dispose();
  }, [width, height, maskColor, brushSize]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={className}
    />
  );
}
