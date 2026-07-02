"use client"

import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { BellIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useMarkNotificationRead, useNotifications } from "../hooks/use-notifications"
import type { Notification } from "../types/notification.schema"

export function NotificationBell() {
  const { data } = useNotifications()
  const markRead = useMarkNotificationRead()
  const notifications = data ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="relative">
            <BellIcon className="size-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[0.65rem]"
              >
                {unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            Aucune notification
          </p>
        ) : (
          notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onRead={() => markRead.mutate(notification.id)}
            />
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationRow({
  notification,
  onRead,
}: {
  notification: Notification
  onRead: () => void
}) {
  const content = (
    <div className="flex flex-col gap-0.5">
      <p className={notification.read ? "text-muted-foreground" : ""}>
        {notification.message}
      </p>
      <p className="text-xs text-muted-foreground">
        {format(parseISO(notification.createdAt), "dd/MM/yyyy HH:mm", {
          locale: fr,
        })}
      </p>
    </div>
  )

  return (
    <DropdownMenuItem
      onClick={onRead}
      render={
        notification.link ? <Link href={notification.link} /> : undefined
      }
    >
      {content}
    </DropdownMenuItem>
  )
}
