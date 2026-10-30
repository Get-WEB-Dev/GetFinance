"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { drawStrokes } from "@/lib/signature/render";
import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH, type Point, type Stroke } from "@/lib/signature/strokes";

const DISPLAY_SCALE = 2;

export function SignaturePad({ onChange }: { onChange: (strokes: Stroke[]) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (context) drawStrokes(context, strokes, DISPLAY_SCALE);
  }, [strokes]);

  function commit(next: Stroke[]) {
    strokesRef.current = next;
    setStrokes(next);
    onChange(next);
  }

  function toPoint(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SIGNATURE_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * SIGNATURE_HEIGHT,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setRedoStack([]);
    commit([...strokesRef.current, [toPoint(event)]]);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const current = strokesRef.current;
    const last = current[current.length - 1];
    if (!last) return;
    commit([...current.slice(0, -1), [...last, toPoint(event)]]);
  }

  function endStroke() {
    drawingRef.current = false;
  }

  function undo() {
    const current = strokesRef.current;
    if (current.length === 0) return;
    setRedoStack((stack) => [...stack, current[current.length - 1]]);
    commit(current.slice(0, -1));
  }

  function redo() {
    const stroke = redoStack[redoStack.length - 1];
    if (!stroke) return;
    setRedoStack((stack) => stack.slice(0, -1));
    commit([...strokesRef.current, stroke]);
  }

  function clear() {
    setRedoStack([]);
    commit([]);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={SIGNATURE_WIDTH * DISPLAY_SCALE}
        height={SIGNATURE_HEIGHT * DISPLAY_SCALE}
        role="img"
        aria-label="Signature drawing area. If you can't draw, choose the option to type your name instead."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        className="w-full cursor-crosshair touch-none rounded-md border-2 border-dashed border-slate-300 bg-white"
        style={{ aspectRatio: `${SIGNATURE_WIDTH} / ${SIGNATURE_HEIGHT}` }}
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={undo} disabled={strokes.length === 0}>
          <Undo2 aria-hidden className="mr-1.5 h-4 w-4" />
          Undo
        </Button>
        <Button variant="secondary" onClick={redo} disabled={redoStack.length === 0}>
          <Redo2 aria-hidden className="mr-1.5 h-4 w-4" />
          Redo
        </Button>
        <Button variant="secondary" onClick={clear} disabled={strokes.length === 0}>
          <Eraser aria-hidden className="mr-1.5 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}