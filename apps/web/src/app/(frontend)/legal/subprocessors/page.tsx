import type { Metadata } from "next"
import type React from "react"
import { SubprocessorsTable } from "~/features/legal/components/SubprocessorsTable"
import { MarketingPage } from "~/features/marketing/components/MarketingPage"

export function generateMetadata(): Metadata {
  return {
    title: "Subprocessors",
    description: "The third-party services Liscet relies on to operate.",
  }
}

export default function SubprocessorsPage(): React.JSX.Element {
  return (
    <MarketingPage title="Subprocessors">
      <p>
        Liscet relies on the following third-party services to operate. We
        update this list when a subprocessor is added or removed.
      </p>
      <SubprocessorsTable />
    </MarketingPage>
  )
}
