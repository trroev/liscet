import { transformCloudinaryAvatar } from "@repo/chrome/utils/transformCloudinary"
import { preview } from "@repo/storybook-config/preview"
import { Avatar as Component } from "@repo/ui/components/Avatar"

const CLOUDINARY_SRC = "https://res.cloudinary.com/demo/image/upload/sample.jpg"

const meta = preview.meta({
  args: {
    alt: "Marie Kondo",
    initials: "MK",
    src: CLOUDINARY_SRC,
    transformSrc: transformCloudinaryAvatar,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["circle", "square"] },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Integrations/Avatar + Cloudinary",
})

export const CloudinaryTransform = meta.story({})
