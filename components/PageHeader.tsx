// made by al with love
import Link from "next/link";
import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  extra,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  extra?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between border-b border-line pb-4">
      <div className="border-l-2 border-deep pl-3">
        <p className="font-mono text-[11px] tracking-widest text-ink/50">{eyebrow}</p>
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-ink/50">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {action && (
          <Link
            href={action.href}
            className="rounded-sm bg-deep px-4 py-2 text-sm font-medium text-sand hover:opacity-90"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
