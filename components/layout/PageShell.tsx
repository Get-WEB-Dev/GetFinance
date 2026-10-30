import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface PageShellProps {
  crumbs?: Crumb[];
  title: string;
  intro?: string;
  wide?: boolean;
  children: React.ReactNode;
}

export function PageShell({ crumbs, title, intro, wide = false, children }: PageShellProps) {
  return (
    <div className={`mx-auto px-4 py-12 md:py-16 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
      {crumbs && (
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap gap-1">
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex gap-1">
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-navy-900">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
                {index < crumbs.length - 1 && <span aria-hidden>/</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-navy-900">{title}</h1>
      {intro && <p className="mt-3 max-w-2xl text-slate-600">{intro}</p>}
      <div className="mt-10">{children}</div>
    </div>
  );
}