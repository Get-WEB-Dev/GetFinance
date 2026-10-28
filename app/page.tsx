import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import {
  ArrowRight,
  FileUp,
  ListChecks,
  Save,
  Search,
} from "lucide-react";
import { loanProducts } from "@/config/loans";
import { LoanCard } from "@/components/loans/LoanCard";
import { HeroPreview } from "@/components/home/HeroPreview";

const facts = [
  { value: "3", label: "Loan products" },
  { value: "10", label: "Guided steps" },
  { value: "No account", label: "Needed to start" },
  { value: "Auto-save", label: "Resume any time" },
];

const steps = [
  { title: "Choose a loan", text: "Pick the product that fits your purpose." },
  { title: "Complete the form", text: "Answer short sections at your own pace." },
  { title: "Add documents", text: "Attach what your loan type requires." },
  { title: "Review and sign", text: "Check everything, then sign with a simulated e-signature." },
];

const features = [
  { icon: FileUp, title: "Document checklist", text: "See exactly which documents are required and which are still missing." },
  { icon: Save, title: "Automatic progress saving", text: "Leave and come back. Your draft is kept in this browser." },
  { icon: Search, title: "Reference number", text: "Every application gets a reference you can use to resume." },
  { icon: ListChecks, title: "Instant validation", text: "Mistakes are flagged as you type, not after you submit." },
];

const faqs = [
  { q: "Do I need an account?", a: "No. You can start straight away and resume later using your application reference." },
  { q: "Is this a real loan offer?", a: "No. GetFinance is a demonstration. Every figure and result shown is illustrative." },
  { q: "Can I save and finish later?", a: "Yes. Your progress saves automatically in this browser." },
  { q: "What documents will I need?", a: "It depends on the loan type. The application lists them at the document step." },
];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">
              Online loan applications
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Borrowing, handled with clarity.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Choose a loan, complete a guided application in minutes, and see
              an illustrative pre-approval summary. Your progress is saved at
              every step.
            </p>
       <div className="mt-10 flex flex-wrap gap-4">
  <ButtonLink href="/apply" className="px-6 py-3.5">
    Apply now <ArrowRight aria-hidden className="h-4 w-4" />
  </ButtonLink>
  <ButtonLink href="/loans" variant="outlineOnDark" className="px-6 py-3.5">
    Explore loans
  </ButtonLink>
</div>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* Facts strip */}
      <section aria-label="At a glance" className="border-b border-line bg-white">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 md:grid-cols-4 md:divide-x md:divide-line">
          {facts.map((fact) => (
            <div key={fact.label} className="md:px-6 md:first:pl-0">
              <dt className="order-2 text-sm text-slate-500">{fact.label}</dt>
              <dd className="text-2xl font-semibold text-navy-900">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Loan products */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-700">
            Products
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy-900">
            A loan for each purpose
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Three sample products with their own requirements. All amounts and terms are illustrative.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {loanProducts.map((product) => (
              <LoanCard key={product.type} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-700">
          Process
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy-900">
          How applying works
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-navy-900 pt-5">
              <span className="text-sm font-semibold text-accent-700">
                Step {index + 1}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-navy-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">
            Built to make applying easier
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-navy-900 p-8">
                <Icon aria-hidden className="h-7 w-7 text-accent-400" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-navy-900">
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="cursor-pointer list-none font-medium text-navy-900 marker:content-none">
                {faq.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-navy-900">Ready to start?</h2>
            <p className="mt-1 text-slate-600">No account needed. Your progress saves as you go.</p>
          </div>
      <ButtonLink href="/apply" className="px-6 py-3.5">
  Start your application <ArrowRight aria-hidden className="h-4 w-4" />
</ButtonLink>
        </div>
      </section>
    </>
  );
}