import { cn } from "@repo/ui/utils/cn"
import Link from "next/link"

export type SiteFooterProps = {
  className?: string
}

const LEGAL_LINKS = [
  { href: "/legal/disclaimer", label: "Disclaimer" },
] as const

export const SiteFooter = ({ className }: SiteFooterProps) => (
  <footer className={cn("@container/footer border-border border-t", className)}>
    <div
      className={cn(
        "constrainer flex items-center justify-between gap-6 py-6 text-center",
        "@max-sm/footer:flex-col"
      )}
    >
      <p className="text-caption text-text-muted">
        &copy; {new Date().getFullYear()} Liscet
      </p>
      <nav aria-label="Legal" className="flex flex-wrap justify-center gap-4">
        {LEGAL_LINKS.map((link) => (
          <Link
            className="text-caption text-text-muted hover:text-text-primary"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
)
