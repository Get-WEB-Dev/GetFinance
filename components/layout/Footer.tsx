import Link from "next/link";
import { brand } from "@/config/brand";

const columns = [
  {
    title: "Loans",
   links: [
  { href: "/loans/personal", label: "Personal Loan" },
  { href: "/loans/home", label: "Home Loan" },
  { href: "/loans/business", label: "Business Loan" },
],
  },
  {
    title: "Apply",
    links: [
      { href: "/apply", label: "Start an application" },
      { href: "/resume", label: "Resume an application" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="text-xl font-semibold text-white">{brand.name}</p>
            <p className="mt-3 max-w-xs text-sm">{brand.tagline}</p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-sm font-semibold text-white">{column.title}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 border-t border-white/15 pt-6 text-xs leading-relaxed text-slate-400">
          {brand.disclaimer}
        </p>
      </div>
    </footer>
  );
}