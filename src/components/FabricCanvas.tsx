/*  src/components/Canvas/CanvasEditor.tsx
    ------------------------------------------------------------------
    Sprint-1 editor (patched):
    – correct event names  ✅
    – small helper to append points immutably
    – everything else unchanged
--------------------------------------------------------------------- */

'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva';
import { useMaskStore, Stroke, Tool } from '@/store/useMaskStore';
import useImage from 'use-image';

interface Props {
  imgSrc: string;
  maxWidth?: number;
  maxHeight?: number;
}

export default function CanvasEditor({ imgSrc, maxWidth, maxHeight }: Props) {
  /* ─────────────── Load the base image ─────────────── */
  const [image] = useImage(imgSrc, 'anonymous');
  const stageRef = useRef<any>(null);

  /* ─────────────── Global canvas state ─────────────── */
  const {
    strokes,
    tool,
    brushSize,
    setTool,
    setBrushSize,
    addStroke,
    undo,
    redo,
    clear,
  } = useMaskStore();

  /* ─────────────── Pointer tracking ─────────────── */
  const [isDrawing, setIsDrawing] = useState(false);

  const appendPoint = (x: number, y: number) =>
    useMaskStore.setState((state) => {
      const all = [...state.strokes];
      const last = all[all.length - 1];
      if (!last) return;
      all[all.length - 1] = { ...last, points: [...last.points, x, y] };
      return { strokes: all };
    });

  const handlePointerDown = (e: any) => {
    if (!image) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    setIsDrawing(true);
    addStroke({
      tool,
      size: brushSize,
      points: [pos.x, pos.y],
    });
  };

  const handlePointerMove = (e: any) => {
    if (!isDrawing) return;
    const point = e.target.getStage().getPointerPosition();
    if (point) appendPoint(point.x, point.y);
  };

  const endDrawing = () => setIsDrawing(false);

  /* ─────────────── Resize to fit viewport ─────────────── */
  const [dims, setDims] = useState({ w: 600, h: 600 });
  useEffect(() => {
    if (!image) return;
    const vw = maxWidth ?? window.innerWidth;
    const vh = maxHeight ?? window.innerHeight * 0.8;
    const scale = Math.min(1, vw / image.width, vh / image.height);
    setDims({ w: image.width * scale, h: image.height * scale });
  }, [image, maxWidth, maxHeight]);

  /* ─────────────── Button helper ─────────────── */
  const Btn = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active?: boolean;
    onClick?: () => void;
  }) => (
    <button
      className={`px-3 py-1 rounded text-sm ${
        active ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-100'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  /* ─────────────── Render ─────────────── */
  return (
    <div className="flex flex-col gap-3 items-center">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Btn label="Brush" active={tool === 'brush'} onClick={() => setTool('brush')} />
        <Btn label="Erase" active={tool === 'erase'} onClick={() => setTool('erase')} />
        <Btn label="Undo" onClick={undo} />
        <Btn label="Redo" onClick={redo} />
        <Btn label="Clear" onClick={clear} />

        <div className="flex items-center gap-2 ml-4">
          <label htmlFor="size" className="text-sm text-zinc-300">
            Size
          </label>
          <input
            id="size"
            type="range"
            min={8}
            max={100}
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
          />
        </div>
      </div>

      {/* Stage */}
      {image && (
        <Stage
          ref={stageRef}
          width={dims.w}
          height={dims.h}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onMouseUp={endDrawing}
          onTouchEnd={endDrawing}
        >
          {/* Base image */}
          <Layer>
            <KonvaImage
              image={image}
              width={dims.w}
              height={dims.h}
              listening={false}
            />
          </Layer>

          {/* Mask overlay */}
          <Layer>
            {strokes.map((s, i) => (
              <Line
                key={i}
                points={s.points}
                stroke="#00FF00"
                strokeWidth={s.size}
                lineCap="round"
                lineJoin="round"
                opacity={0.5}
                globalCompositeOperation={
                  s.tool === 'brush' ? 'source-over' : 'destination-out'
                }
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
