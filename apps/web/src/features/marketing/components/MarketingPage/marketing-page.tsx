import type React from "react"

export type MarketingPageProps = {
  title: string
  children: React.ReactNode
}

export const MarketingPage = ({
  title,
  children,
}: MarketingPageProps): React.JSX.Element => (
  <section className="constrainer py-16 lg:py-24">
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-heading-xl text-text-primary lg:text-heading-2xl">
        {title}
      </h1>
      <div className="space-y-4 text-body-lg text-text-secondary">
        {children}
      </div>
    </div>
  </section>
)
