import type { ReactNode } from "react"
import { AuthDivider } from "../AuthDivider"
import { SocialSignInButton } from "../SocialSignInButton"

export type AuthFormLayoutProps = {
  /** Same-origin path the social sign-in lands on after the OAuth round-trip. */
  callbackUrl: string
  children: ReactNode
}

export const AuthFormLayout = ({
  callbackUrl,
  children,
}: AuthFormLayoutProps): React.JSX.Element => (
  <div className="flex flex-col gap-6">
    {children}
    <AuthDivider />
    <SocialSignInButton callbackUrl={callbackUrl} provider="google" />
  </div>
)
