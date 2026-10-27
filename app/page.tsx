import Link from "next/link";
import { ArrowRight, FileUp, ListChecks, Save, Search } from "lucide-react";
import { brand } from "@/config/brand";
import { loanProducts } from "@/config/loans";
import { LoanCard } from "@/components/loans/LoanCard";

const steps = [
  { title: "Choose a loan", text: "Pick the product that fits your purpose." },
  { title: "Complete the form", text: "Answer a few short sections at your own pace." },
  { title: "Add documents", text: "Attach the documents your loan type needs." },
  { title: "Review and sign", text: "Check everything, then sign with a simulated e-signature." },
];

const features = [
  { icon: FileUp, title: "Document upload", text: "See exactly which documents are required and which are still missing." },
  { icon: Save, title: "Progress saving", text: "Your draft saves automatically, so you can leave and come back." },
  { icon: Search, title: "Application tracking", text: "Every application gets a reference number you can use to resume." },
  { icon: ListChecks, title: "Clear validation", text: "Mistakes are flagged as you type, not after you submit." },
];

const faqs = [
  { q: "Do I need an account?", a: "No. You can start straight away and resume later using your application reference." },
  { q: "Is this a real loan offer?", a: "No. GetFinance is a demonstration. Every figure and result shown is illustrative." },
  { q: "Can I save and finish later?", a: "Yes. Your progress saves automatically in this browser." },
  { q: "What documents will I need?", a: "It depends on the loan type, and the application tells you at the document step." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="text-sm font-medium uppercase tracking-wide text-accent-700">
            {brand.name}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold text-navy-900 md:text-5xl">
            Apply for a loan online, without the paperwork maze.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">
            Choose a loan, complete a short guided application, and get an
            illustrative pre-approval summary. Your progress saves as you go.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-md bg-accent-600 px-5 py-3 font-medium text-white hover:bg-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
            >
              Apply now <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/loans"
              className="inline-flex items-center rounded-md border border-navy-900 px-5 py-3 font-medium text-navy-900 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
            >
              Explore loans
            </Link>
          </div>
        </div>
      </section>

      {/* Loan previews */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-navy-900">Our loans</h2>
        <p className="mt-2 text-slate-600">Three sample products. All figures are illustrative.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {loanProducts.map((product) => (
            <LoanCard key={product.type} product={product} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold text-navy-900">How applying works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-lg border border-line bg-white p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-navy-900">Built to make applying easier</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <Icon aria-hidden className="mt-1 h-6 w-6 shrink-0 text-accent-600" />
              <div>
                <h3 className="font-semibold text-navy-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-2xl font-semibold text-navy-900">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-line rounded-lg border border-line bg-white">
            {faqs.map((faq) => (
              <details key={faq.q} className="group p-5">
                <summary className="cursor-pointer font-medium text-navy-900">{faq.q}</summary>
                <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}