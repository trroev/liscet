import { SettingsGroup } from "../SettingsGroup"
import { SettingsRow } from "../SettingsRow"
import { ThemeToggle } from "../ThemeToggle"

export const PreferencesPane = () => (
  <SettingsGroup title="Appearance">
    <SettingsRow
      description="Choose how Liscet looks on this device."
      label="Theme"
    >
      <ThemeToggle />
    </SettingsRow>
  </SettingsGroup>
)
