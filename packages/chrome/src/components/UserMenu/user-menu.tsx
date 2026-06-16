"use client"

import type { SignedInAuth } from "@repo/types/HeaderAuth"
import { Avatar } from "@repo/ui/components/Avatar"
import { Menu } from "@repo/ui/components/Menu"
import Link from "next/link"

export type UserMenuProps = {
  auth: SignedInAuth
}

export const UserMenu = ({ auth }: UserMenuProps) => (
  <Menu.Root>
    <Menu.Trigger
      aria-label={`Account menu for ${auth.displayName}`}
      className="rounded-full"
    >
      <Avatar alt="" initials={auth.initials} size="sm" src={auth.avatarUrl} />
    </Menu.Trigger>
    <Menu.Content align="end" sideOffset={8}>
      <Menu.LinkItem closeOnClick render={<Link href="/profile" />}>
        Profile
      </Menu.LinkItem>
      <Menu.Separator />
      <Menu.Item onClick={auth.onSignOut} variant="destructive">
        Sign out
      </Menu.Item>
    </Menu.Content>
  </Menu.Root>
)
