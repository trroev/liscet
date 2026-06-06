import { tv } from "@repo/ui/utils/tv"

export const richText = tv({
  slots: {
    heading1: "mt-6 mb-4 font-display text-heading-xl text-text-primary",
    heading2: "mt-6 mb-3 font-display text-heading-lg text-text-primary",
    heading3: "mt-5 mb-2 font-display text-heading-md text-text-primary",
    heading4:
      "mt-4 mb-2 font-display font-semibold text-body-lg text-text-primary",
    heading5:
      "mt-3 mb-1 font-display font-semibold text-body text-text-primary",
    heading6:
      "mt-2 mb-1 font-display font-semibold text-body-sm text-text-primary uppercase tracking-wide",
    orderedList:
      "list-outside list-decimal space-y-1 ps-6 text-body text-text-primary",
    unorderedList:
      "list-outside list-disc space-y-1 ps-6 text-body text-text-primary",
    checkList: "list-none space-y-1 ps-0 text-body text-text-primary",
    checkListItem: "flex max-w-fit cursor-pointer items-center gap-2",
    checkListLabel: "leading-relaxed",
    blockquote:
      "my-4 border-border border-l-4 py-1 ps-4 text-text-secondary italic",
  },
})
