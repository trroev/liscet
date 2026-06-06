const FONT_SIZES = [
  "display",
  "heading-xl",
  "heading-lg",
  "heading-md",
  "body-lg",
  "body",
  "body-sm",
  "caption",
  "label",
] as const

export const twMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZES] }],
    },
  },
}
