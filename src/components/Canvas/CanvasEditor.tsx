/*  src/components/Canvas/CanvasEditor.tsx
    ────────────────────────────────────────────────────────────────
    Fixes that make drawing actually work:

    1.  Events are now attached to the *top overlay layer*, not Stage.
        (Stage events bubble strangely when there’s an image layer.)
    2.  We stop mutating state in place – every point addition now
        pushes a fresh Stroke object into Zustand so React/Konva
        actually re-renders.
    3.  Brush preview cursor for better UX (green circle).
    4.  A tiny DropZone so you don’t have to rely on the file input
        (optional – remove <DropZone> if you don’t want it yet).

    SAM-powered one-click segmentation will be layered on top in the
    next sprint – this file is now stable enough for that.
──────────────────────────────────────────────────────────────────*/

'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle, Rect } from 'react-konva';
//import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import { useMaskStore, Stroke } from '@/store/useMaskStore';
import useImage from 'use-image';
import Dropzone from 'react-dropzone';                // tiny helper (4 kB)

interface Props {
  imgSrc: string;
  onFile?: (f: File) => void;      // for the drop-zone
}

export default function CanvasEditor({ imgSrc, onFile }: Props) {
  /* ───────  load base image  ─────── */
  const [image] = useImage(imgSrc, 'anonymous');
  const stageRef = useRef<any>(null);

  /* ───────  global mask state  ─────── */
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

  /* ───────  live drawing  ─────── */
  const [isDrawing, setIsDrawing]   = useState(false);
  const [cursorPos, setCursorPos]   = useState<{x: number; y: number} | null>(null);

  const startStroke = (x:number, y:number) => {
    addStroke({ tool, size: brushSize, points: [x, y] });
    setIsDrawing(true);
  };

  const extendStroke = (x: number, y: number) => {
    useMaskStore.setState((state) => {
      const next = [...state.strokes];
      const last = next[next.length - 1];
      if (!last) return state;                    // ← always return something
      next[next.length - 1] = {
        ...last,
        points: [...last.points, x, y],
      };
      return { ...state, strokes: next };        // ← valid Partial<MaskState>
    });
  };
  

  const endStroke = () => setIsDrawing(false);

  /* ───────  viewport-aware sizing  ─────── */
  const [dims, setDims] = useState({ w: 600, h: 400 });
  useEffect(() => {
    if (!image) return;
    const vw = window.innerWidth  * 0.9;
    const vh = window.innerHeight * 0.8;
    const scale = Math.min(1, vw / image.width, vh / image.height);
    setDims({ w: image.width * scale, h: image.height * scale });
  }, [image]);

  /* ───────  small helper  ─────── */
  const Btn = ({ label, active, onClick }: { label:string; active?:boolean; onClick?:()=>void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-sm transition-colors
                  ${active ? 'bg-emerald-600 text-white'
                           : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100'}`}
    >
      {label}
    </button>
  );

  /* ───────  render  ─────── */
  return (
    <div className="flex flex-col items-center gap-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Btn label="Brush" active={tool==='brush'} onClick={()=>setTool('brush')} />
        <Btn label="Erase" active={tool==='erase'} onClick={()=>setTool('erase')} />
        <Btn label="Undo" onClick={undo}/>
        <Btn label="Redo" onClick={redo}/>
        <Btn label="Clear" onClick={clear}/>
        <span className="ml-4 text-sm">Size</span>
        <input type="range" min={8} max={100} value={brushSize}
               onChange={e=>setBrushSize(+e.target.value)} />
      </div>

      {/* optional drag-drop (remove if you dislike it) */}
      {onFile && (
        <Dropzone
          onDrop={files => files[0] && onFile(files[0])}
          accept={{ 'image/*': [] }}
        >
          {({getRootProps, getInputProps, isDragActive}) => (
            <div {...getRootProps()}
                 className={`border-2 border-dashed rounded w-full max-w-md p-4 text-center
                             ${isDragActive ? 'border-emerald-400 bg-emerald-950/20'
                                             : 'border-zinc-600 bg-zinc-800/30'}`}>
              <input {...getInputProps()} />
              {isDragActive
                ? 'Drop the image here …'
                : 'Drag an image here, or click to browse'}
            </div>
          )}
        </Dropzone>
      )}

      {/* stage */}
      {image && (
        <Stage
          ref={stageRef}
          width={dims.w}
          height={dims.h}
          onMouseMove={e=>{
            const p = e.target.getStage()?.getPointerPosition();
            if (p) setCursorPos(p);
            if (isDrawing && p) extendStroke(p.x, p.y);
          }}
          onMouseUp={endStroke}
          onTouchEnd={endStroke}
        >
          {/* image */}
          <Layer listening={false}>
            <KonvaImage image={image} width={dims.w} height={dims.h}/>
          </Layer>

          {/* overlay -- captures events */}
          <Layer
            onMouseDown={e=>{
              const p = e.target.getStage()?.getPointerPosition();
              if (p) startStroke(p.x, p.y);
            }}
            onTouchStart={e=>{
              const p = e.target.getStage()?.getPointerPosition();
              if (p) startStroke(p.x, p.y);
            }}
          >
            {/* all strokes */}
            {strokes.map((s,i)=>(
              <Line key={i}
                    points={s.points}
                    stroke="#00FF00"
                    strokeWidth={s.size}
                    lineCap="round"
                    lineJoin="round"
                    opacity={0.5}
                    globalCompositeOperation={s.tool==='brush'
                      ? 'source-over' : 'destination-out'}
              />
            ))}

            {/* live cursor circle */}
            {cursorPos && !isDrawing && (
              <Circle
                x={cursorPos.x}
                y={cursorPos.y}
                radius={brushSize/2}
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
