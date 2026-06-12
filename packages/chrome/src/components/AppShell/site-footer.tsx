import { cn } from "@repo/ui/utils/cn"

export type SiteFooterProps = {
  className?: string
}

export const SiteFooter = ({ className }: SiteFooterProps) => (
  <footer className={cn("border-border border-t", className)}>
    <div className="constrainer py-6 text-center">
      <p className="text-caption text-text-muted">
        &copy; {new Date().getFullYear()} Liscet
      </p>
    </div>
  </footer>
)
