"use client"

import { RiCloseLine } from "@remixicon/react"
import { Badge } from "@repo/ui/components/Badge"
import { Input } from "@repo/ui/components/Input"
import { type KeyboardEvent, useState } from "react"

export type TagInputProps = {
  id?: string
  value: ReadonlyArray<string>
  onChange: (next: Array<string>) => void
  placeholder?: string
  "aria-label"?: string
}

export const TagInput = ({
  id,
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
}: TagInputProps): React.JSX.Element => {
  const [draft, setDraft] = useState("")

  const addTag = (raw: string): void => {
    const tag = raw.trim()
    if (tag.length === 0 || value.includes(tag)) {
      setDraft("")
      return
    }
    onChange([...value, tag])
    setDraft("")
  }

  const removeTag = (tag: string): void => {
    onChange(value.filter((existing) => existing !== tag))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addTag(draft)
      return
    }
    if (event.key === "Backspace" && draft.length === 0 && value.length > 0) {
      removeTag(value.at(-1) as string)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        aria-label={ariaLabel}
        autoComplete="off"
        id={id}
        onBlur={() => addTag(draft)}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={draft}
      />
      {value.length > 0 && (
        <ul aria-live="polite" className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li key={tag}>
              <Badge variant="muted">
                <span className="normal-case">{tag}</span>
                <button
                  aria-label={`Remove ${tag}`}
                  className="ml-1 inline-flex cursor-pointer items-center text-text-muted hover:text-text-primary"
                  onClick={() => removeTag(tag)}
                  type="button"
                >
                  <RiCloseLine aria-hidden="true" size={12} />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
