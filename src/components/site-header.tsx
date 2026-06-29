import Link from "next/link"
import { FileBarChart2Icon } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/85 sticky top-0 z-30 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-display text-lg font-semibold tracking-tight">
            <FileBarChart2Icon className="size-5 text-primary" />
            Weekly report
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
