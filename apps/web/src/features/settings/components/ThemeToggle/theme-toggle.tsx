"use client"

import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react"
import { Menu } from "@repo/ui/components/Menu"
import { cn } from "@repo/ui/utils/cn"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { match } from "ts-pattern"

const THEMES = ["light", "dark", "system"] as const satisfies ReadonlyArray<
  "light" | "dark" | "system"
>

type Theme = (typeof THEMES)[number]

const isTheme = (value: string): value is Theme =>
  (THEMES as ReadonlyArray<string>).includes(value)

const triggerClass = cn(
  "inline-flex size-10 items-center justify-center rounded-md text-text-secondary",
  "hover:bg-surface hover:text-text-primary",
  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
)

export const ThemeToggle = (): React.JSX.Element => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const current: Theme = mounted && theme && isTheme(theme) ? theme : "system"

  const TriggerIcon = match(current)
    .with("light", () => RiSunLine)
    .with("dark", () => RiMoonLine)
    .with("system", () => RiComputerLine)
    .exhaustive()

  return (
    <Menu.Root>
      <Menu.Trigger aria-label="Change theme" className={triggerClass}>
        <TriggerIcon aria-hidden className="size-4" />
      </Menu.Trigger>
      <Menu.Content align="end" sideOffset={8}>
        <Menu.RadioGroup
          onValueChange={(value) => {
            if (isTheme(value)) {
              setTheme(value)
            }
          }}
          value={current}
        >
          <Menu.RadioItem value="light">
            <RiSunLine aria-hidden className="size-4" />
            Light
          </Menu.RadioItem>
          <Menu.RadioItem value="dark">
            <RiMoonLine aria-hidden className="size-4" />
            Dark
          </Menu.RadioItem>
          <Menu.RadioItem value="system">
            <RiComputerLine aria-hidden className="size-4" />
            System
          </Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  )
}
