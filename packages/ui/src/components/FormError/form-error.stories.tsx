import { preview } from "@repo/storybook-config/preview"
import { Button } from "@repo/ui/components/Button"
import { Field } from "@repo/ui/components/Field"
import { Input } from "@repo/ui/components/Input"
import { type FormEvent, useState } from "react"

import { FormError as Component } from "./form-error"

const meta = preview.meta({
  args: { message: "Something went wrong. Please try again." },
  argTypes: {
    message: { control: "text" },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/FormError",
})

export const Default = meta.story({})

export const Empty = meta.story({
  args: { message: undefined },
})

const ExampleForm = () => {
  const [error, setError] = useState<string | undefined>()

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get("email")
    setError(email ? undefined : "Enter your email to continue.")
  }

  return (
    <form className="flex w-80 flex-col gap-4" onSubmit={handleSubmit}>
      <Field label="Email">
        <Input name="email" placeholder="you@example.com" />
      </Field>
      <Component message={error} />
      <Button type="submit">Submit</Button>
    </form>
  )
}

export const InForm = meta.story({
  render: () => <ExampleForm />,
})
