import Link from "next/link"
import { FileBarChart2Icon } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileBarChart2Icon className="size-5 text-primary" />
          <span>Weekly Report</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
