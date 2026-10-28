import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outlineOnDark";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent-600 text-navy-950 hover:bg-accent-400",
  secondary: "border border-navy-900 text-navy-900 hover:bg-surface",
  outlineOnDark: "border border-white/30 text-white hover:bg-white/10",
};

function styles(variant: Variant, className?: string) {
  return `${base} ${variants[variant]} ${className ?? ""}`.trim();
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={styles(variant, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  return <Link className={styles(variant, className)} {...props} />;
}