import {
  type LexicalEditorProps,
  lexicalEditor,
} from "@payloadcms/richtext-lexical"
import type { RichTextField } from "payload"

type RichTextFieldArgs = {
  name: string
  required?: boolean
  localized?: boolean
  features?: LexicalEditorProps["features"]
}

export const richTextField = ({
  name,
  required,
  localized,
  features,
}: RichTextFieldArgs): RichTextField => ({
  name,
  type: "richText",
  required,
  localized,
  editor: lexicalEditor({ features }),
})
