export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
      <div className="mt-2 space-y-3 text-slate-700">{children}</div>
    </section>
  );
}