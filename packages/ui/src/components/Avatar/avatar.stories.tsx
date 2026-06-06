import { preview } from "@repo/storybook-config/preview"

import { Avatar as Component } from "./avatar"

const SAMPLE_SRC = "https://picsum.photos/seed/avatar/200"

const meta = preview.meta({
  args: { initials: "MK", src: SAMPLE_SRC, alt: "Marie Kondo" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["circle", "square"] },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Avatar",
})

export const Default = meta.story({})

export const Fallback = meta.story({
  args: { src: null, initials: "JD", alt: "Jane Doe" },
})

export const NoTransform = meta.story({
  args: {
    src: SAMPLE_SRC,
    initials: "RT",
    alt: "Raw URL — no transformSrc passed",
  },
})

export const Showcase = meta.story({
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Component alt="Sam" initials="SM" size="sm" src={SAMPLE_SRC} />
        <Component alt="Mel" initials="ME" size="md" src={SAMPLE_SRC} />
        <Component alt="Lou" initials="LU" size="lg" src={SAMPLE_SRC} />
      </div>
      <div className="flex items-center gap-4">
        <Component initials="SM" size="sm" />
        <Component initials="ME" size="md" />
        <Component initials="LU" size="lg" />
      </div>
      <div className="flex items-center gap-4">
        <Component initials="SQ" shape="square" size="sm" src={SAMPLE_SRC} />
        <Component initials="SQ" shape="square" size="md" src={SAMPLE_SRC} />
        <Component initials="SQ" shape="square" size="lg" src={SAMPLE_SRC} />
      </div>
    </div>
  ),
})
