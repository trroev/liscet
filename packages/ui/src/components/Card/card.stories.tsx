import { preview } from "@repo/storybook-config/preview"
import { Badge } from "@repo/ui/components/Badge"

import { Card as Component } from "./card"

const meta = preview.meta({
  args: {
    href: "#",
    lockUp: {
      title: "Cassoulet de Toulouse",
      body: "A long-simmered classic of southern France.",
    },
  },
  argTypes: {
    media: { table: { disable: true } },
    badges: { table: { disable: true } },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Molecules/Card",
})

export const Default = meta.story({
  render: (args) => (
    <div className="w-72">
      <Component {...args} />
    </div>
  ),
})

export const Showcase = meta.story({
  render: () => (
    <div className="grid w-[40rem] grid-cols-2 gap-6">
      <Component
        badges={<Badge variant="muted">Entrée</Badge>}
        href="#"
        lockUp={{ title: "Cassoulet de Toulouse", body: "Hearty bean stew." }}
      />
      <Component
        href="#"
        lockUp={{ title: "Pâte brisée", body: "Tender all-butter dough." }}
      />
    </div>
  ),
})
