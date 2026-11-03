import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { brand } from "@/config/brand";

const navLinks = [
  { href: "/loans", label: "Loans" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/resume", label: "Resume application" },
];

// On the dark header the focus ring needs a light colour to stay clearly visible.
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400";

export function Header() {
  return (
    <>
      <div className="bg-navy-900 text-xs text-slate-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <p>Demonstration product. All figures are illustrative.</p>
          <Link href="/resume" className={`hidden rounded hover:text-white sm:inline ${focusRing}`}>
            Resume a saved application
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
          <Link href="/" className={`rounded ${focusRing}`}>
            <Image
              src="/logo-light.png"
              alt={`${brand.name} home`}
              width={1571}
              height={323}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded text-sm font-medium text-slate-200 hover:text-white ${focusRing}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/apply"
              className={`hidden rounded-md bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 sm:inline-flex ${focusRing}`}
            >
              Apply now
            </Link>

            <details className="relative md:hidden">
              <summary
                className={`flex cursor-pointer list-none items-center rounded-md border border-white/30 p-2 text-white ${focusRing}`}
              >
                <Menu aria-hidden className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </summary>
              <nav
                aria-label="Mobile"
                className="absolute right-0 mt-2 w-60 rounded-md border border-line bg-white p-2 shadow-lg"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-surface"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/apply"
                  className="mt-1 block rounded bg-accent-600 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Apply now
                </Link>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}