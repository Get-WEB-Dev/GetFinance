import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH, type Stroke } from "./strokes";

export function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], scale: number): void {
  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);
  ctx.strokeStyle = "#0b1b3a";
  ctx.fillStyle = "#0b1b3a";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    if (stroke.length === 1) {
      ctx.beginPath();
      ctx.arc(stroke[0].x, stroke[0].y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (const point of stroke.slice(1)) ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Browser only. Produces a small PNG (typically a few KB) from the strokes. */
export function renderSignatureToDataUrl(strokes: Stroke[]): string {
  const canvas = document.createElement("canvas");
  canvas.width = SIGNATURE_WIDTH;
  canvas.height = SIGNATURE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  drawStrokes(ctx, strokes, 1);
  return canvas.toDataURL("image/png");
}