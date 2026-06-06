export const Welcome = () => (
  <main className="mx-auto max-w-3xl space-y-6 p-8 text-text-primary">
    <header className="space-y-2">
      <p className="text-label text-text-muted uppercase tracking-widest">
        Mise Design System
      </p>
      <h1 className="font-display text-heading-xl">UI Primitives</h1>
      <p className="text-body text-text-secondary">
        Storybook for <code className="text-body-sm">@repo/ui/components</code>.
        Each primitive ships with a default story and a showcase covering every
        variant × state.
      </p>
    </header>
    <section className="space-y-2">
      <h2 className="font-display text-heading-md">Conventions</h2>
      <ul className="list-disc space-y-1 pl-6 text-body text-text-secondary">
        <li>
          Components are headless Base UI primitives styled with Tailwind v4
          semantic tokens.
        </li>
        <li>
          Default + Showcase story per primitive; toggle the theme in the
          toolbar to verify dark mode.
        </li>
        <li>
          Automated a11y / keyboard tests live in{" "}
          <code className="text-body-sm">
            packages/ui/src/components/*/*.test.tsx
          </code>
          .
        </li>
      </ul>
    </section>
  </main>
)
