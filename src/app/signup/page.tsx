import { redirect } from "next/navigation"

import { SignupForm } from "@/features/auth/components/signup-form"
import { getSession } from "@/services/auth"

export default async function SignupPage() {
  const session = await getSession()
  if (session) redirect("/")

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-1 border-b border-border pb-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
          Accès
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Créer un compte
        </h1>
      </div>
      <SignupForm />
    </div>
  )
}
