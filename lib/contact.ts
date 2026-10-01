import { z } from "zod"

/** Minimum time between rendering the form and submitting it (bot check). */
export const MIN_FILL_MS = 3000

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  message: z.string().trim().min(10).max(5000),
  // Honeypot: real people never see or fill this field.
  company: z.string().max(0).optional(),
  startedAt: z.number(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ContactResult =
  { ok: true } | { ok: false; reason: "invalid" | "spam" | "unavailable" }
