export const SIGNATURE_WIDTH = 600;
export const SIGNATURE_HEIGHT = 200;
const MIN_TOTAL_LENGTH = 120;

export interface Point {
  x: number;
  y: number;
}
export type Stroke = Point[];

export function strokeLength(stroke: Stroke): number {
  let length = 0;
  for (let i = 1; i < stroke.length; i++) {
    length += Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y);
  }
  return length;
}

export function isSignatureSubstantial(strokes: Stroke[]): boolean {
  return strokes.reduce((sum, stroke) => sum + strokeLength(stroke), 0) >= MIN_TOTAL_LENGTH;
}