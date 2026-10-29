import { Info } from "lucide-react";

export function SimulationNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-md border border-sky-300 bg-sky-50 p-4 text-sm text-sky-950"
    >
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}