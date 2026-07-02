import { z } from "zod"

/**
 * Auth input/output shapes — single source of truth, mirrors the
 * report schema pattern. Never export a schema that includes the
 * password hash; that stays internal to `services/auth/user-store.ts`.
 */

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
})
export type SignupInput = z.infer<typeof signupSchema>

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})
export type LoginInput = z.infer<typeof loginSchema>

/** Public-safe user shape — never includes the password hash. */
export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  createdAt: z.iso.datetime(),
})
export type User = z.infer<typeof userSchema>
