import Link from "next/link"
import type React from "react"

export const Disclaimer = (): React.JSX.Element => (
  <>
    <p>
      Liscet is a tool to help you track your continuing-education credits. It
      is not legal, compliance, or professional advice.
    </p>
    <p>
      You are solely responsible for verifying your compliance with your state
      board&rsquo;s requirements. Liscet makes no guarantee that the credits,
      deadlines, or requirements shown are accurate, current, or complete.
    </p>
    <p>
      The service is provided &ldquo;as is,&rdquo; without warranty of any kind,
      express or implied.
    </p>
    <p>
      Questions? Email us at{" "}
      <Link
        className="underline hover:text-text-primary"
        href="mailto:support@liscet.com"
      >
        support@liscet.com
      </Link>
      .
    </p>
  </>
)
