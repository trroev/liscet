import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import { NavigationMenu } from "@repo/ui/components/NavigationMenu"
import { Separator } from "@repo/ui/components/Separator"
import { cn } from "@repo/ui/utils/cn"
import Link from "next/link"
import type React from "react"

export type MobileNavProps = {
  isOpen: boolean
  authSlot: React.ReactNode
}

export const MobileNav = ({ isOpen, authSlot }: MobileNavProps) => (
  <NavigationMenu.List className="flex md:hidden">
    <NavigationMenu.Item value="mobile">
      <NavigationMenu.Trigger
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        className="size-9"
      >
        {isOpen ? (
          <RiCloseLine aria-hidden size={20} />
        ) : (
          <RiMenuLine aria-hidden size={20} />
        )}
      </NavigationMenu.Trigger>
      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          className={cn(
            "z-30 size-full",
            "transition-[top,left,right,bottom] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-instant:transition-none"
          )}
          collisionPadding={0}
        >
          <NavigationMenu.Popup
            className={cn(
              "flex size-full flex-col bg-background p-6",
              "transition-[opacity,translate] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "data-starting-style:-translate-y-16 data-starting-style:opacity-0",
              "data-ending-style:-translate-y-16 data-ending-style:opacity-0",
              "data-ending-style:duration-150 data-ending-style:ease-in"
            )}
          >
            <ul className="flex flex-col space-y-4">
              <NavigationMenu.Item>
                <NavigationMenu.Link
                  className="text-heading-md text-text-primary hover:text-text-secondary"
                  closeOnClick
                  render={<Link href="/posts" />}
                >
                  Posts
                </NavigationMenu.Link>
              </NavigationMenu.Item>
              <Separator />
              {authSlot}
            </ul>
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Item>
  </NavigationMenu.List>
)
