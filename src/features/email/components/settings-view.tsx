"use client"

import { useEffect, useRef } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { useEmailSettings, useUpdateEmailSettings } from "../hooks/use-email-settings"
import {
  emailSettingsFormSchema,
  joinRecipientsList,
  parseRecipientsList,
  type EmailSettingsFormValues,
} from "../types/email-settings.schema"

export function SettingsView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data, isPending, isError, error } = useEmailSettings()
  const update = useUpdateEmailSettings()
  const handledParams = useRef(false)

  useEffect(() => {
    if (handledParams.current) return
    handledParams.current = true

    if (searchParams.get("connected")) {
      toast.success("Compte Outlook connecté")
      router.replace("/settings")
    } else if (searchParams.get("error")) {
      toast.error("La connexion à Microsoft a échoué. Réessayez.")
      router.replace("/settings")
    }
  }, [searchParams, router])

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-destructive text-sm">
        {error?.message ?? "Impossible de charger les paramètres."}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <ConnectionCard
        connected={data.connected}
        outlookEmail={data.outlookEmail}
      />
      <SettingsForm
        defaultValues={{
          primaryRecipients: joinRecipientsList(data.primaryRecipients),
          ccRecipients: joinRecipientsList(data.ccRecipients),
          defaultSubject: data.defaultSubject,
          defaultBody: data.defaultBody,
          autoSendTime: data.autoSendTime,
          autoSendEnabled: data.autoSendEnabled,
        }}
        onSubmit={async (input) => {
          await update.mutateAsync(input)
          toast.success("Paramètres enregistrés")
        }}
        isSubmitting={update.isPending}
      />
    </div>
  )
}

function ConnectionCard({
  connected,
  outlookEmail,
}: {
  connected: boolean
  outlookEmail: string | null
}) {
  async function handleDisconnect() {
    const res = await fetch("/api/auth/microsoft/disconnect", {
      method: "POST",
    })
    if (res.ok) {
      toast.success("Compte Outlook déconnecté")
      window.location.reload()
    } else {
      toast.error("La déconnexion a échoué")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentification Microsoft</CardTitle>
        <CardDescription>
          {connected
            ? `Connecté avec ${outlookEmail}`
            : "Connectez votre compte Outlook professionnel pour envoyer des rapports."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connected ? (
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Déconnecter
          </Button>
        ) : (
          <Button
            size="sm"
            nativeButton={false}
            render={<a href="/api/auth/microsoft/connect" />}
          >
            Se connecter à Microsoft
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface SettingsFormProps {
  defaultValues: EmailSettingsFormValues
  onSubmit: (input: ReturnType<typeof toInput>) => Promise<void>
  isSubmitting?: boolean
}

function toInput(values: EmailSettingsFormValues) {
  return {
    ...values,
    primaryRecipients: parseRecipientsList(values.primaryRecipients),
    ccRecipients: parseRecipientsList(values.ccRecipients),
  }
}

function SettingsForm({ defaultValues, onSubmit, isSubmitting }: SettingsFormProps) {
  const form = useForm<
    z.input<typeof emailSettingsFormSchema>,
    unknown,
    EmailSettingsFormValues
  >({
    resolver: zodResolver(emailSettingsFormSchema),
    defaultValues,
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toInput(values))
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Destinataires</CardTitle>
            <CardDescription>
              Un email par ligne ou séparés par des virgules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="primaryRecipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinataires principaux</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ccRecipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinataires en copie (CC)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modèle d&apos;email</CardTitle>
            <CardDescription>
              Utilisé pour préremplir l&apos;aperçu après génération du rapport.
              Laisser vide pour utiliser le modèle par défaut ({"{{"}année{"}}"}
              -W{"{{"}semaine{"}}"}_Weekly Report_{"{{"}nom{"}}"}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="defaultSubject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet par défaut</FormLabel>
                  <FormControl>
                    <Input placeholder="Auto (voir ci-dessus)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultBody"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corps par défaut</FormLabel>
                  <FormControl>
                    <Textarea rows={8} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Envoi automatique</CardTitle>
            <CardDescription>
              Chaque vendredi, si aucun rapport n&apos;a été envoyé, l&apos;envoi
              se déclenche automatiquement à l&apos;heure choisie.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6">
            <FormField
              control={form.control}
              name="autoSendEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Activer l&apos;envoi automatique</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="autoSendTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure d&apos;envoi</FormLabel>
                  <FormControl>
                    <Input type="time" className="w-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          Enregistrer
        </Button>
      </form>
    </Form>
  )
}
