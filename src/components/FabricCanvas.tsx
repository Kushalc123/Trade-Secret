/* transparent Fabric overlay */
"use client";

import { useEffect, useRef } from "react";
import type { FabricCanvas } from "fabric/fabric-impl";
import * as fabric from "fabric";

interface Props {
  width: number;
  height: number;
  maskColor?: string;
  brushSize?: number;
  className?: string;
}

export default function FabricCanvas({
  width,
  height,
  maskColor = "rgba(0,255,0,0.5)",
  brushSize = 40,
  className = "",
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
    brush.color = maskColor;
    brush.width = brushSize;
    brush.decimate = 8;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;

    return () => canvas.dispose();
  }, [width, height, maskColor, brushSize]);

  /* 👇 no more extra spacing – absolute & inset-0 */
  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={`absolute inset-0 ${className}`}
    />
  );
}
