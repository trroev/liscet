import { Heading, Text } from "@react-email/components"
import type { RenewalNotificationType } from "@repo/utils/renewalThreshold"
import type { LicenseState } from "@repo/utils/stateToTimezone"
import { stateToTimezone } from "@repo/utils/stateToTimezone"
import type { CSSProperties, ReactElement } from "react"
import { BaseLayout } from "../../layouts/BaseLayout"
import { pluralizeDays, RENEWAL_TONE, renewalSubject } from "./content"

type RenewalReminderProps = {
  readonly daysRemaining: number
  readonly expiresAt: Date | string
  readonly licenseNumber: string
  readonly licenseType: string
  readonly notificationType: RenewalNotificationType
  readonly practitionerName: string
  readonly state: LicenseState
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

const detailStyle = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  color: "#111111",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
  padding: "12px 16px",
} as const satisfies CSSProperties

const footnoteStyle = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "24px 0 0",
} as const satisfies CSSProperties

const RenewalReminder = ({
  daysRemaining,
  expiresAt,
  licenseNumber,
  licenseType,
  notificationType,
  practitionerName,
  state,
}: RenewalReminderProps): ReactElement => {
  const expiryFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: stateToTimezone(state),
    year: "numeric",
  })

  return (
    <BaseLayout previewText={renewalSubject(daysRemaining)}>
      <Heading as="h1" style={headingStyle}>
        Your license expires in {pluralizeDays(daysRemaining)}
      </Heading>
      <Text style={textStyle}>Hi {practitionerName},</Text>
      <Text style={textStyle}>{RENEWAL_TONE[notificationType]}</Text>
      <Text style={detailStyle}>
        {state} {licenseType} license #{licenseNumber}
        <br />
        Expires {expiryFormatter.format(new Date(expiresAt))}
      </Text>
      <Text style={footnoteStyle}>
        If you have already renewed, no action is needed and you can ignore this
        email.
      </Text>
    </BaseLayout>
  )
}

// Default export consumed only by React Email's preview server (`email dev`).
// Application code imports the named `RenewalReminder` via the package barrel.
const RenewalReminderPreview = (): ReactElement => (
  <RenewalReminder
    daysRemaining={30}
    expiresAt={new Date("2026-07-15T12:00:00Z")}
    licenseNumber="LCSW-12345"
    licenseType="LCSW"
    notificationType="renewal-30d"
    practitionerName="Jordan Rivera"
    state="CA"
  />
)

export type { RenewalReminderProps }
export { RenewalReminder }
export default RenewalReminderPreview
