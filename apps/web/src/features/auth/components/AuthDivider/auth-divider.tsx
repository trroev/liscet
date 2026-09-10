import { Separator } from "@repo/ui/components/Separator"

export const AuthDivider = () => (
  <div className="flex items-center gap-3">
    <Separator className="flex-1" />
    <span className="font-sans text-body-sm text-text-muted">or</span>
    <Separator className="flex-1" />
  </div>
)
