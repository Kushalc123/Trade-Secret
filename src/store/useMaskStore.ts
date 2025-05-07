/*  src/store/useMaskStore.ts
    ------------------------------------------------------------------
    Centralised Zustand store for everything the masking tool needs:
    – current tool & brush size
    – array of strokes (each stroke = one drag action)
    – undo / redo stacks (20-step history)
--------------------------------------------------------------------- */

import { create } from 'zustand';

export type Tool = 'brush' | 'erase';

export interface Stroke {
  tool: Tool;
  points: number[];   // [x0, y0, x1, y1, ...]   (Konva format)
  size: number;
}

interface MaskState {
  // UI
  tool: Tool;
  brushSize: number;

  // Drawing history
  strokes: Stroke[];
  redoStack: Stroke[];

  // Actions
  setTool: (tool: Tool) => void;
  setBrushSize: (size: number) => void;
  addStroke: (stroke: Stroke) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useMaskStore = create<MaskState>((set, get) => ({
  tool: 'brush',
  brushSize: 32,

  strokes: [],
  redoStack: [],

  setTool: (tool) => set({ tool }),
  setBrushSize: (size) => set({ brushSize: size }),

  addStroke: (stroke) =>
    set((state) => {
      const next = [...state.strokes, stroke].slice(-20); // cap history at 20
      return { strokes: next, redoStack: [] };
    }),

  undo: () =>
    set((state) => {
      if (state.strokes.length === 0) return state;
      const redoStack = [state.strokes[state.strokes.length - 1], ...state.redoStack];
      return { strokes: state.strokes.slice(0, -1), redoStack };
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const [nextStroke, ...rest] = state.redoStack;
      return { strokes: [...state.strokes, nextStroke], redoStack: rest };
    }),

  clear: () => set({ strokes: [], redoStack: [] }),
}));
