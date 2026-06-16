import { Heading, Text } from "@react-email/components"
import type { CoTelehealthNotificationType } from "@repo/utils/coTelehealthThreshold"
import type { LicenseState } from "@repo/utils/stateToTimezone"
import { stateToTimezone } from "@repo/utils/stateToTimezone"
import type { CSSProperties, ReactElement } from "react"
import { BaseLayout } from "../../layouts/BaseLayout"
import {
  CO_TELEHEALTH_TONE,
  coTelehealthSubject,
  pluralizeDays,
} from "./content"

type CoTelehealthReminderProps = {
  readonly daysRemaining: number
  readonly expiresAt: Date | string
  readonly licenseType: string
  readonly notificationType: CoTelehealthNotificationType
  readonly practitionerName: string
  readonly registrationNumber?: string
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

const CoTelehealthReminder = ({
  daysRemaining,
  expiresAt,
  licenseType,
  notificationType,
  practitionerName,
  registrationNumber,
  state,
}: CoTelehealthReminderProps): ReactElement => {
  const expiryFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: stateToTimezone(state),
    year: "numeric",
  })

  return (
    <BaseLayout previewText={coTelehealthSubject(daysRemaining)}>
      <Heading as="h1" style={headingStyle}>
        Your Colorado telehealth registration expires in{" "}
        {pluralizeDays(daysRemaining)}
      </Heading>
      <Text style={textStyle}>Hi {practitionerName},</Text>
      <Text style={textStyle}>{CO_TELEHEALTH_TONE[notificationType]}</Text>
      <Text style={detailStyle}>
        Colorado telehealth registration on your {state} {licenseType} license
        {registrationNumber ? (
          <>
            <br />
            Registration #{registrationNumber}
          </>
        ) : null}
        <br />
        Expires {expiryFormatter.format(new Date(expiresAt))}
      </Text>
      <Text style={footnoteStyle}>
        This is separate from your license renewal. If you have already renewed
        your Colorado registration, no action is needed and you can ignore this
        email.
      </Text>
    </BaseLayout>
  )
}

const CoTelehealthReminderPreview = (): ReactElement => (
  <CoTelehealthReminder
    daysRemaining={30}
    expiresAt={new Date("2026-07-15T12:00:00Z")}
    licenseType="LCSW"
    notificationType="co-telehealth-30d"
    practitionerName="Jordan Rivera"
    registrationNumber="CO-TH-9912"
    state="CA"
  />
)

export type { CoTelehealthReminderProps }
export { CoTelehealthReminder }
export default CoTelehealthReminderPreview
