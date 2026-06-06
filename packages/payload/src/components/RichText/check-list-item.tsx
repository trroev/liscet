"use client"

import { Checkbox } from "@repo/ui/components/Checkbox"
import { Label } from "@repo/ui/components/Label"
import type { ReactNode } from "react"
import { useId } from "react"
import { richText } from "./rich-text.variants"

const styles = richText()

export type CheckListItemProps = {
  checked: boolean
  children: ReactNode
}

export const CheckListItem = ({ checked, children }: CheckListItemProps) => {
  const id = useId()
  return (
    <li className={styles.checkListItem()}>
      <Checkbox defaultChecked={checked} id={id} />
      <Label className={styles.checkListLabel()} htmlFor={id}>
        {children}
      </Label>
    </li>
  )
}
