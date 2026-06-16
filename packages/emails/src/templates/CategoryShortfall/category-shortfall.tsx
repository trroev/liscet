import { Heading, Text } from "@react-email/components"
import type { CSSProperties, ReactElement } from "react"
import { BaseLayout } from "../../layouts/BaseLayout"
import {
  categoryShortfallSubject,
  humanizeCategory,
  pluralizeHours,
} from "./content"

type CategoryShortfall = {
  readonly category: string
  readonly credited: number
  readonly required: number
}

type CategoryShortfallEmailProps = {
  readonly practitionerName: string
  readonly licenseType: string
  readonly state: string
  readonly renewalDate: string
  readonly shortfalls: Array<CategoryShortfall>
}

const headingStyle = {
  color: "#111111",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
} as const satisfies CSSProperties

const textStyle = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
} as const satisfies CSSProperties

const listItemStyle = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  color: "#111111",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 8px",
  padding: "12px 16px",
} as const satisfies CSSProperties

const footnoteStyle = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "24px 0 0",
} as const satisfies CSSProperties

const renewalFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
})

const CategoryShortfallEmail = ({
  practitionerName,
  licenseType,
  state,
  renewalDate,
  shortfalls,
}: CategoryShortfallEmailProps): ReactElement => (
  <BaseLayout previewText={categoryShortfallSubject()}>
    <Heading as="h1" style={headingStyle}>
      You still have required hours outstanding
    </Heading>
    <Text style={textStyle}>Hi {practitionerName},</Text>
    <Text style={textStyle}>
      Your {state} {licenseType} license renews on{" "}
      {renewalFormatter.format(new Date(renewalDate))}, and these required
      categories are not yet complete:
    </Text>
    {shortfalls.map((shortfall) => (
      <Text key={shortfall.category} style={listItemStyle}>
        {humanizeCategory(shortfall.category)} — {shortfall.credited} of{" "}
        {shortfall.required} hours,{" "}
        {pluralizeHours(shortfall.required - shortfall.credited)} short
      </Text>
    ))}
    <Text style={footnoteStyle}>
      If you have already completed these hours, no action is needed and you can
      ignore this email.
    </Text>
  </BaseLayout>
)

const CategoryShortfallEmailPreview = (): ReactElement => (
  <CategoryShortfallEmail
    licenseType="LCSW"
    practitionerName="Jordan Rivera"
    renewalDate="2026-07-15T12:00:00Z"
    shortfalls={[
      { category: "law-and-ethics", credited: 2, required: 6 },
      { category: "suicide-risk", credited: 0, required: 1 },
    ]}
    state="CA"
  />
)

export type { CategoryShortfall, CategoryShortfallEmailProps }
export { CategoryShortfallEmail }
export default CategoryShortfallEmailPreview
