import "server-only"

import { randomUUID } from "node:crypto"

import type { SignupInput, User } from "@/features/auth/types/auth.schema"

import { getDb } from "../storage/db"
import { hashPassword } from "./password"

/**
 * SQLite-backed user store, alongside `services/storage/report-store.ts`.
 * The first account ever created inherits every pre-existing ownerless
 * report — see `createUser`.
 */

export class EmailTakenError extends Error {
  constructor(email: string) {
    super(`Email already in use: ${email}`)
    this.name = "EmailTakenError"
  }
}

interface UserRow {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: string
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  }
}

export async function createUser(input: SignupInput): Promise<User> {
  const passwordHash = await hashPassword(input.password)
  const db = getDb()

  const row: UserRow = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  }

  const insertUser = db.transaction(() => {
    try {
      db.prepare(
        `INSERT INTO users (id, name, email, password_hash, created_at)
         VALUES (@id, @name, @email, @password_hash, @created_at)`
      ).run(row)
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "SQLITE_CONSTRAINT_UNIQUE"
      ) {
        throw new EmailTakenError(input.email)
      }
      throw error
    }

    const isFirstUser =
      (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number })
        .n === 1
    if (isFirstUser) {
      db.prepare("UPDATE reports SET user_id = ? WHERE user_id IS NULL").run(
        row.id
      )
    }
  })
  insertUser()

  return toUser(row)
}

export async function findUserByEmail(
  email: string
): Promise<(User & { passwordHash: string }) | null> {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as UserRow | undefined

  return row ? { ...toUser(row), passwordHash: row.password_hash } : null
}

export async function findUserById(id: string): Promise<User | null> {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined

  return row ? toUser(row) : null
}
