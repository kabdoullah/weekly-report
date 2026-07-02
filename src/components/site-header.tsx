import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/features/notifications/components/notification-bell"

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/85 sticky top-0 z-30 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-display text-lg font-semibold tracking-tight">
            Weekly report
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/history" />}
          >
            Historique
          </Button>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/settings" />}
          >
            Paramètres
          </Button>
          <NotificationBell />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
