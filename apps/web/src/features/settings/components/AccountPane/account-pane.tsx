import type React from "react"
import { formatLongDate } from "../../lib/format-long-date"
import { AvatarManager } from "../AvatarManager"
import { DataExportRow } from "../DataExportRow"
import { DeleteAccountDialog } from "../DeleteAccountDialog"
import { DeletionBanner } from "../DeletionBanner"
import { SettingsGroup } from "../SettingsGroup"
import { SettingsRow } from "../SettingsRow"

export type AccountPaneProps = {
  avatarUrl: string | null
  deletedAt: Date | null
  email: string
  memberSince: Date
  signOutSlot: React.ReactNode
}

export const AccountPane = ({
  avatarUrl,
  deletedAt,
  email,
  memberSince,
  signOutSlot,
}: AccountPaneProps) => (
  <div className="space-y-10">
    {deletedAt ? <DeletionBanner deletedAt={deletedAt} /> : null}

    <SettingsGroup title="Profile">
      <div className="py-4">
        <AvatarManager avatarUrl={avatarUrl} email={email} />
      </div>
      <SettingsRow label="Email">
        <span className="text-text-primary">{email}</span>
      </SettingsRow>
      <SettingsRow label="Member since">
        <span className="text-text-primary">{formatLongDate(memberSince)}</span>
      </SettingsRow>
    </SettingsGroup>

    <SettingsGroup title="Session">
      <SettingsRow
        description="Sign out of your account on this device."
        label="Sign out"
      >
        {signOutSlot}
      </SettingsRow>
    </SettingsGroup>

    <SettingsGroup title="Data">
      <DataExportRow />
    </SettingsGroup>

    {deletedAt ? null : (
      <SettingsGroup title="Danger zone" tone="destructive">
        <SettingsRow
          description="Permanently delete your account and all of its data after a 30-day grace period."
          label="Delete account"
        >
          <DeleteAccountDialog />
        </SettingsRow>
      </SettingsGroup>
    )}
  </div>
)
