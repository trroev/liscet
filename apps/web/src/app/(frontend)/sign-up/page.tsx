import type { Metadata } from "next"
import Link from "next/link"
import { SignUpForm } from "~/features/auth/components/SignUpForm"

export const metadata: Metadata = {
  title: "Sign Up",
}

export default function SignUpPage() {
  return (
    <section className="constrainer flex flex-col items-center py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="font-display text-heading-xl text-text-primary">
            Create an account
          </h1>
          <p className="text-body text-text-secondary">
            Already have an account?{" "}
            <Link
              className="text-text-primary underline-offset-4 hover:underline"
              href="/sign-in"
            >
              Sign in
            </Link>
          </p>
        </div>
        <SignUpForm />
      </div>
    </section>
  )
}
