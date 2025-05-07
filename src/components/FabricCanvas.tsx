/* ------------------------------------------------------------------
   src/components/FabricCanvas.tsx
-------------------------------------------------------------------*/
"use client";

import { useEffect, useRef } from "react";
import type { FabricCanvas } from "fabric/fabric-impl";
import * as fabric from "fabric";          // ☑ default export provides Canvas

interface Props {
  width:  number;
  height: number;
  className?:  string;
  maskColor?:  string;
  brushSize?:  number;
}

export default function FabricCanvas({
  width,
  height,
  className = "",
  maskColor = "rgba(0,255,0,0.5)",
  brushSize = 40,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const canvas: FabricCanvas = new fabric.Canvas(ref.current, {
      width,
      height,
      selection: false,
    });

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
      className={`outline outline-1 outline-gray-700 shadow-lg ${className}`}
    />
  );
}