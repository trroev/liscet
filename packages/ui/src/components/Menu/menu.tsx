"use client"

import { Menu as BaseMenu } from "@base-ui/react/menu"
import { RiArrowRightSLine, RiCheckLine } from "@remixicon/react"
import { cn } from "@repo/ui/utils/cn"
import type React from "react"

export type MenuRootProps = React.ComponentProps<typeof BaseMenu.Root>
export const MenuRoot = (props: MenuRootProps) => (
  <BaseMenu.Root data-slot="menu" {...props} />
)

export type MenuPortalProps = React.ComponentProps<typeof BaseMenu.Portal>
export const MenuPortal = (props: MenuPortalProps) => (
  <BaseMenu.Portal data-slot="menu-portal" {...props} />
)

export type MenuTriggerProps = React.ComponentProps<typeof BaseMenu.Trigger>
export const MenuTrigger = ({ className, ...props }: MenuTriggerProps) => (
  <BaseMenu.Trigger
    className={cn(
      "inline-flex items-center justify-center",
      "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
      className
    )}
    data-slot="menu-trigger"
    {...props}
  />
)

export type MenuBackdropProps = React.ComponentProps<typeof BaseMenu.Backdrop>
export const MenuBackdrop = BaseMenu.Backdrop

export type MenuContentProps = BaseMenu.Popup.Props &
  Pick<
    BaseMenu.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "collisionPadding"
  >
export const MenuContent = ({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  collisionPadding,
  className,
  ...props
}: MenuContentProps) => (
  <BaseMenu.Portal>
    <BaseMenu.Positioner
      align={align}
      alignOffset={alignOffset}
      className="isolate z-50 outline-none"
      collisionPadding={collisionPadding}
      side={side}
      sideOffset={sideOffset}
    >
      <BaseMenu.Popup
        className={cn(
          "z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-lg bg-surface p-1 text-text-primary shadow-md outline-none ring-1 ring-border",
          "transition-[scale,opacity] duration-100 ease-out",
          "data-starting-style:scale-95 data-starting-style:opacity-0",
          "data-ending-style:scale-95 data-ending-style:opacity-0",
          className
        )}
        data-slot="menu-content"
        {...props}
      />
    </BaseMenu.Positioner>
  </BaseMenu.Portal>
)

export type MenuGroupProps = React.ComponentProps<typeof BaseMenu.Group>
export const MenuGroup = (props: MenuGroupProps) => (
  <BaseMenu.Group data-slot="menu-group" {...props} />
)

export type MenuLabelProps = BaseMenu.GroupLabel.Props & {
  inset?: boolean
}
export const MenuLabel = ({ className, inset, ...props }: MenuLabelProps) => (
  <BaseMenu.GroupLabel
    className={cn(
      "px-1.5 py-1 font-medium text-text-muted text-xs data-inset:pl-7",
      className
    )}
    data-inset={inset}
    data-slot="menu-label"
    {...props}
  />
)

export type MenuItemVariant = "default" | "destructive"

export type MenuItemProps = BaseMenu.Item.Props & {
  inset?: boolean
  variant?: MenuItemVariant
}
export const MenuItem = ({
  className,
  inset,
  variant = "default",
  ...props
}: MenuItemProps) => (
  <BaseMenu.Item
    className={cn(
      "group/menu-item relative flex cursor-default select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden",
      "data-highlighted:bg-secondary/10 data-highlighted:text-text-primary",
      "data-inset:pl-7",
      "data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive data-[variant=destructive]:text-destructive",
      "data-disabled:pointer-events-none data-disabled:opacity-50",
      "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      "data-[variant=destructive]:*:[svg]:text-destructive",
      className
    )}
    data-inset={inset}
    data-slot="menu-item"
    data-variant={variant}
    {...props}
  />
)

export type MenuLinkItemProps = BaseMenu.LinkItem.Props & {
  inset?: boolean
  variant?: MenuItemVariant
}
export const MenuLinkItem = ({
  className,
  inset,
  variant = "default",
  ...props
}: MenuLinkItemProps) => (
  <BaseMenu.LinkItem
    className={cn(
      "group/menu-item relative flex cursor-default select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-text-primary no-underline outline-hidden",
      "data-highlighted:bg-secondary/10 data-highlighted:text-text-primary",
      "data-inset:pl-7",
      "data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive data-[variant=destructive]:text-destructive",
      "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      "data-[variant=destructive]:*:[svg]:text-destructive",
      className
    )}
    data-inset={inset}
    data-slot="menu-link-item"
    data-variant={variant}
    {...props}
  />
)

export type MenuCheckboxItemProps = BaseMenu.CheckboxItem.Props & {
  inset?: boolean
}
export const MenuCheckboxItem = ({
  className,
  children,
  inset,
  ...props
}: MenuCheckboxItemProps) => (
  <BaseMenu.CheckboxItem
    className={cn(
      "relative flex cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden",
      "data-highlighted:bg-secondary/10 data-highlighted:text-text-primary",
      "data-disabled:pointer-events-none data-inset:pl-7 data-disabled:opacity-50",
      "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className
    )}
    data-inset={inset}
    data-slot="menu-checkbox-item"
    {...props}
  >
    <span
      className="pointer-events-none absolute right-2 flex items-center justify-center"
      data-slot="menu-checkbox-item-indicator"
    >
      <BaseMenu.CheckboxItemIndicator>
        <RiCheckLine />
      </BaseMenu.CheckboxItemIndicator>
    </span>
    {children}
  </BaseMenu.CheckboxItem>
)

export type MenuRadioGroupProps = React.ComponentProps<
  typeof BaseMenu.RadioGroup
>
export const MenuRadioGroup = (props: MenuRadioGroupProps) => (
  <BaseMenu.RadioGroup data-slot="menu-radio-group" {...props} />
)

export type MenuRadioItemProps = BaseMenu.RadioItem.Props & {
  inset?: boolean
}
export const MenuRadioItem = ({
  className,
  children,
  inset,
  ...props
}: MenuRadioItemProps) => (
  <BaseMenu.RadioItem
    className={cn(
      "relative flex cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden",
      "data-highlighted:bg-secondary/10 data-highlighted:text-text-primary",
      "data-disabled:pointer-events-none data-inset:pl-7 data-disabled:opacity-50",
      "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className
    )}
    data-inset={inset}
    data-slot="menu-radio-item"
    {...props}
  >
    <span
      className="pointer-events-none absolute right-2 flex items-center justify-center"
      data-slot="menu-radio-item-indicator"
    >
      <BaseMenu.RadioItemIndicator>
        <RiCheckLine />
      </BaseMenu.RadioItemIndicator>
    </span>
    {children}
  </BaseMenu.RadioItem>
)

export type MenuSeparatorProps = React.ComponentProps<typeof BaseMenu.Separator>
export const MenuSeparator = ({ className, ...props }: MenuSeparatorProps) => (
  <BaseMenu.Separator
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    data-slot="menu-separator"
    {...props}
  />
)

export type MenuShortcutProps = React.ComponentProps<"span">
export const MenuShortcut = ({ className, ...props }: MenuShortcutProps) => (
  <span
    className={cn("ml-auto text-text-muted text-xs tracking-widest", className)}
    data-slot="menu-shortcut"
    {...props}
  />
)

export type MenuSubProps = React.ComponentProps<typeof BaseMenu.SubmenuRoot>
export const MenuSub = (props: MenuSubProps) => (
  <BaseMenu.SubmenuRoot data-slot="menu-sub" {...props} />
)

export type MenuSubTriggerProps = BaseMenu.SubmenuTrigger.Props & {
  inset?: boolean
}
export const MenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: MenuSubTriggerProps) => (
  <BaseMenu.SubmenuTrigger
    className={cn(
      "flex cursor-default select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden",
      "data-highlighted:bg-secondary/10 data-highlighted:text-text-primary",
      "data-popup-open:bg-secondary/10 data-popup-open:text-text-primary",
      "data-inset:pl-7",
      "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className
    )}
    data-inset={inset}
    data-slot="menu-sub-trigger"
    {...props}
  >
    {children}
    <RiArrowRightSLine className="ml-auto" />
  </BaseMenu.SubmenuTrigger>
)

export type MenuSubContentProps = MenuContentProps
export const MenuSubContent = ({
  align = "start",
  alignOffset = -3,
  side = "inline-end",
  sideOffset = 0,
  className,
  ...props
}: MenuSubContentProps) => (
  <MenuContent
    align={align}
    alignOffset={alignOffset}
    className={cn("min-w-24 shadow-lg", className)}
    data-slot="menu-sub-content"
    side={side}
    sideOffset={sideOffset}
    {...props}
  />
)

export type MenuArrowProps = React.ComponentProps<typeof BaseMenu.Arrow>
export const MenuArrow = BaseMenu.Arrow
