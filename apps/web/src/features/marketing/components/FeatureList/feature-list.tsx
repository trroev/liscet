import type React from "react"

export type Feature = {
  title: string
  description: string
}

export type FeatureListProps = {
  heading: string
  features: ReadonlyArray<Feature>
}

export const FeatureList = ({
  heading,
  features,
}: FeatureListProps): React.JSX.Element => (
  <section className="constrainer border-border border-t py-16 lg:py-24">
    <h2 className="font-display text-heading-lg text-text-primary">
      {heading}
    </h2>
    <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <li className="space-y-2" key={feature.title}>
          <h3 className="font-display text-heading-md text-text-primary">
            {feature.title}
          </h3>
          <p className="text-body-sm text-text-secondary">
            {feature.description}
          </p>
        </li>
      ))}
    </ul>
  </section>
)
