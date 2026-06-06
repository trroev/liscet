"use client"

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu"
import { cn } from "@repo/ui/utils/cn"
import type React from "react"

export type NavigationMenuRootProps = React.ComponentProps<
  typeof BaseNavigationMenu.Root
>
export const NavigationMenuRoot = BaseNavigationMenu.Root

export type NavigationMenuListProps = React.ComponentProps<
  typeof BaseNavigationMenu.List
>
export const NavigationMenuList = ({
  className,
  ...props
}: NavigationMenuListProps) => (
  <BaseNavigationMenu.List
    className={cn("flex items-center", className)}
    {...props}
  />
)

export type NavigationMenuItemProps = React.ComponentProps<
  typeof BaseNavigationMenu.Item
>
export const NavigationMenuItem = BaseNavigationMenu.Item

export type NavigationMenuTriggerProps = React.ComponentProps<
  typeof BaseNavigationMenu.Trigger
>
export const NavigationMenuTrigger = ({
  className,
  ...props
}: NavigationMenuTriggerProps) => (
  <BaseNavigationMenu.Trigger
    className={cn(
      "flex items-center justify-center rounded-md text-text-secondary",
      "transition-colors hover:text-text-primary",
      "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
      className
    )}
    {...props}
  />
)

export type NavigationMenuPortalProps = React.ComponentProps<
  typeof BaseNavigationMenu.Portal
>
export const NavigationMenuPortal = BaseNavigationMenu.Portal

export type NavigationMenuBackdropProps = React.ComponentProps<
  typeof BaseNavigationMenu.Backdrop
>
export const NavigationMenuBackdrop = ({
  className,
  ...props
}: NavigationMenuBackdropProps) => (
  <BaseNavigationMenu.Backdrop
    className={cn(
      "fixed inset-0 z-40 bg-black/50",
      "data-ending-style:opacity-0 data-starting-style:opacity-0",
      "transition-opacity duration-200",
      className
    )}
    {...props}
  />
)

export type NavigationMenuPositionerProps = React.ComponentProps<
  typeof BaseNavigationMenu.Positioner
>
export const NavigationMenuPositioner = ({
  className,
  ...props
}: NavigationMenuPositionerProps) => (
  <BaseNavigationMenu.Positioner className={cn(className)} {...props} />
)

export type NavigationMenuPopupProps = React.ComponentProps<
  typeof BaseNavigationMenu.Popup
>
export const NavigationMenuPopup = ({
  className,
  ...props
}: NavigationMenuPopupProps) => (
  <BaseNavigationMenu.Popup
    className={cn("bg-surface focus:outline-none", className)}
    {...props}
  />
)

export type NavigationMenuLinkProps = React.ComponentProps<
  typeof BaseNavigationMenu.Link
>
export const NavigationMenuLink = ({
  className,
  ...props
}: NavigationMenuLinkProps) => (
  <BaseNavigationMenu.Link
    className={cn(
      "text-text-primary transition-colors hover:text-text-secondary",
      className
    )}
    {...props}
  />
)

export type NavigationMenuViewportProps = React.ComponentProps<
  typeof BaseNavigationMenu.Viewport
>
export const NavigationMenuViewport = BaseNavigationMenu.Viewport

export type NavigationMenuContentProps = React.ComponentProps<
  typeof BaseNavigationMenu.Content
>
export const NavigationMenuContent = BaseNavigationMenu.Content

export type NavigationMenuArrowProps = React.ComponentProps<
  typeof BaseNavigationMenu.Arrow
>
export const NavigationMenuArrow = BaseNavigationMenu.Arrow
