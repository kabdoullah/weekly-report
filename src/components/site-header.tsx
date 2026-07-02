import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/features/auth/components/user-menu"
import { findUserById, getSession } from "@/services/auth"

export async function SiteHeader() {
  const session = await getSession()
  const user = session ? await findUserById(session.userId) : null

  return (
    <header className="border-b border-border bg-background/85 sticky top-0 z-30 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-display text-lg font-semibold tracking-tight">
            Weekly report
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
