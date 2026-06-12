import type { Metadata } from "next"
import Link from "next/link"
import { SignInForm } from "~/features/auth/components/SignInForm"

export const metadata: Metadata = {
  title: "Sign In",
}

export default function SignInPage() {
  return (
    <section className="constrainer flex flex-col items-center py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="font-display text-heading-xl text-text-primary">
            Sign in
          </h1>
          <p className="text-body text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              className="text-text-primary underline-offset-4 hover:underline"
              href="/sign-up"
            >
              Sign up
            </Link>
          </p>
        </div>
        <SignInForm />
      </div>
    </section>
  )
}
