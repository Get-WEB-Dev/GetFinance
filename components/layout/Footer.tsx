import Link from "next/link";
import { brand } from "@/config/brand";

export function Footer() {
  return (
    <footer className="border-t border-line bg-navy-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-semibold text-white">{brand.name}</p>
            <p className="mt-2 text-sm">{brand.tagline}</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/loans" className="hover:text-white">Loans</Link>
            <Link href="/apply" className="hover:text-white">Apply</Link>
            <Link href="/resume" className="hover:text-white">Resume application</Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-white/15 pt-6 text-xs text-slate-400">
          {brand.disclaimer}
        </p>
      </div>
    </footer>
  );
}