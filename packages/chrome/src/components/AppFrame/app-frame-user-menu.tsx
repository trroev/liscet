"use client"

import { transformCloudinaryAvatar } from "@repo/chrome/utils/transformCloudinary"
import type { SignedInAuth } from "@repo/types/HeaderAuth"
import { Avatar } from "@repo/ui/components/Avatar"
import { Menu } from "@repo/ui/components/Menu"
import Link from "next/link"

export type AppFrameUserMenuProps = {
  auth: SignedInAuth
  profileHref: string
}

export const AppFrameUserMenu = ({
  auth,
  profileHref,
}: AppFrameUserMenuProps) => (
  <Menu.Root>
    <Menu.Trigger
      aria-label={`Account menu for ${auth.displayName}`}
      className={
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-raised/60"
      }
    >
      <Avatar
        alt=""
        initials={auth.initials}
        size="sm"
        src={auth.avatarUrl}
        transformSrc={transformCloudinaryAvatar}
      />
      <span className="truncate text-body-sm text-text-primary">
        {auth.displayName}
      </span>
    </Menu.Trigger>
    <Menu.Content align="start" sideOffset={8}>
      <Menu.LinkItem closeOnClick render={<Link href={profileHref} />}>
        Profile
      </Menu.LinkItem>
      <Menu.Separator />
      <Menu.Item onClick={auth.onSignOut} variant="destructive">
        Sign out
      </Menu.Item>
    </Menu.Content>
  </Menu.Root>
)
