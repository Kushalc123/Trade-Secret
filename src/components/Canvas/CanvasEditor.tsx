/*  src/components/Canvas/CanvasEditor.tsx
    ────────────────────────────────────────────────────────────────
    Working Canvas Editor – 7 May 2025
    • Brush / Erase / Undo / Redo / Clear
    • Brush-size slider (8-100 px)
    • Invisible hit-area <Rect> so the first click always registers
    • Green cursor preview
    • Download Mask (black/white PNG)
──────────────────────────────────────────────────────────────────*/

'use client';

import { useRef, useState, useEffect } from 'react';
import { buildMaskPNG } from '@/utils/buildMask';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Line,
  Circle,
  Rect,
} from 'react-konva';
import useImage from 'use-image';
import { useMaskStore, Stroke } from '@/store/useMaskStore';

interface CanvasEditorProps {
  imgSrc: string;        // URL | data-URL | blob-URL
  maxScale?: number;     // optional scaling factor (default 0.9)
}

export default function CanvasEditor({ imgSrc, maxScale = 0.9 }: CanvasEditorProps) {
  /* ─────────────── base image ─────────────── */
  const [image] = useImage(imgSrc, 'anonymous');
  const stageRef = useRef<any>(null);

  /* ─────────────── global store ─────────────── */
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

  /* ─────────────── live stroke state ─────────────── */
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const startStroke = (x: number, y: number) => {
    addStroke({ tool, size: brushSize, points: [x, y] });
    setIsDrawing(true);
  };

  const extendStroke = (x: number, y: number) => {
    useMaskStore.setState((state) => {
      if (state.strokes.length === 0) return state;
      const updated: Stroke[] = [...state.strokes];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = { ...last, points: [...last.points, x, y] };
      return { ...state, strokes: updated };
    });
  };

  const stopStroke = () => setIsDrawing(false);

  /* ─────────────── image fit ─────────────── */
  const [dims, setDims] = useState({ w: 600, h: 400 });
  useEffect(() => {
    if (!image) return;
    const vw = window.innerWidth * maxScale;
    const vh = window.innerHeight * maxScale;
    const scale = Math.min(1, vw / image.width, vh / image.height);
    setDims({ w: image.width * scale, h: image.height * scale });
  }, [image, maxScale]);

  /* ─────────────── reusable button ─────────────── */
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
      onClick={onClick}
      className={`px-3 py-1 rounded text-sm transition
                  ${active ? 'bg-emerald-600 text-white'
                           : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100'}`}
    >
      {label}
    </button>
  );

  /* ─────────────── render ─────────────── */
  return (
    <div className="flex flex-col items-center gap-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Btn label="Brush" active={tool === 'brush'} onClick={() => setTool('brush')} />
        <Btn label="Erase" active={tool === 'erase'} onClick={() => setTool('erase')} />
        <Btn label="Undo" onClick={undo} />
        <Btn label="Redo" onClick={redo} />
        <Btn label="Clear" onClick={clear} />
        {/* Download Mask */}
        <Btn
          label="Download Mask"
          onClick={async () => {
            const blob = await buildMaskPNG(strokes, dims.w, dims.h);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mask.png';
            a.click();
            URL.revokeObjectURL(url);
          }}
        />
        <span className="ml-4 text-sm">Size</span>
        <input
          type="range"
          min={8}
          max={100}
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
        />
      </div>

      {/* stage */}
      {image && (
        <Stage
          ref={stageRef}
          width={dims.w}
          height={dims.h}
          onMouseMove={(e) => {
            const p = e.target.getStage()?.getPointerPosition();
            if (p) {
              setCursor(p);
              if (isDrawing) extendStroke(p.x, p.y);
            }
          }}
          onTouchMove={(e) => {
            const p = e.target.getStage()?.getPointerPosition();
            if (p) {
              setCursor(p);
              if (isDrawing) extendStroke(p.x, p.y);
            }
          }}
          onMouseUp={stopStroke}
          onTouchEnd={stopStroke}
        >
          {/* base image */}
          <Layer listening={false}>
            <KonvaImage image={image} width={dims.w} height={dims.h} />
          </Layer>

          {/* overlay */}
          <Layer>
            {/* invisible hit-area */}
            <Rect
              width={dims.w}
              height={dims.h}
              fill="rgba(0,0,0,0)"
              onMouseDown={(e) => {
                const p = e.target.getStage()?.getPointerPosition();
                if (p) startStroke(p.x, p.y);
              }}
              onTouchStart={(e) => {
                const p = e.target.getStage()?.getPointerPosition();
                if (p) startStroke(p.x, p.y);
              }}
            />

            {/* existing strokes */}
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

            {/* cursor preview */}
            {cursor && !isDrawing && (
              <Circle
                x={cursor.x}
                y={cursor.y}
                radius={brushSize / 2}
                stroke="#00FF00"
                strokeWidth={1}
                opacity={0.6}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
