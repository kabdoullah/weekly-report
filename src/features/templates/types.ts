import { z } from "zod"

/** A reusable project/module preset to avoid re-typing common blocks. */
export const templateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  project: z.string().trim().min(1),
  module: z.string().trim().min(1),
  /** Optional default tasks pre-filled when the template is applied. */
  tasks: z.array(z.string()).default([]),
})

export type Template = z.infer<typeof templateSchema>
