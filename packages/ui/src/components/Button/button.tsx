import { Button as BaseButton } from "@base-ui/react/button"
import { cn } from "@repo/ui/utils/cn"
import { type ButtonVariants, button } from "./button.variants"

export type ButtonProps = React.ComponentProps<typeof BaseButton> &
  ButtonVariants

export const Button = ({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) => (
  <BaseButton
    className={cn(button({ variant, size }), className)}
    type={type}
    {...props}
  />
)
