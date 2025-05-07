/* ---------------------------------------------------------
   Lightweight Fabric 6 drawing layer
----------------------------------------------------------*/
"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";   // ← full namespace
import clsx from "clsx";   

export interface FabricCanvasProps {
  imageUrl: string;
  maskColor?: string;
  className?: string;
}

export default function FabricCanvas({
  imageUrl,
  maskColor = "rgba(0,255,0,0.5)",
  className,
}: FabricCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  /* build once */
  useEffect(() => {
    if (!ref.current || !imageUrl) return;
    
    // Create a new fabric canvas
    const canvas = new fabric.Canvas(ref.current, {
      selection: false,
    });

    // Load the image and set canvas dimensions
    fabric.Image.fromURL(imageUrl, (img) => {
      // Set canvas dimensions to match image
      canvas.setWidth(img.width ?? 800);
      canvas.setHeight(img.height ?? 600);
      
      // Set up brush
      const brush = new fabric.PencilBrush(canvas);
      brush.color = maskColor;
      brush.width = 40; // You could make this configurable
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;
    });

    return () => canvas.dispose();
  }, [imageUrl, maskColor]);

  return <canvas ref={ref} className={className} />;
}