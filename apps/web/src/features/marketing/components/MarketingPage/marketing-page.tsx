import type React from "react"

export type MarketingPageProps = {
  description?: string
  children: React.ReactNode
  title: string
}

export const MarketingPage = ({
  children,
  description,
  title,
}: MarketingPageProps): React.JSX.Element => (
  <section className="constrainer py-16 lg:py-24">
    <div className="space-y-6">
      <h1 className="max-w-3xl font-display text-heading-xl text-text-primary lg:text-heading-2xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-3xl text-body-lg text-text-secondary">
          {description}
        </p>
      )}
      <div className="space-y-4 text-body-lg text-text-secondary">
        {children}
      </div>
    </div>
  </section>
)
