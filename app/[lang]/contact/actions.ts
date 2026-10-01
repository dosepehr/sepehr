"use server"

import { Resend } from "resend"
import { contactSchema, MIN_FILL_MS, type ContactResult } from "@/lib/contact"
import { env } from "@/lib/env"

export async function sendContact(input: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    // A filled honeypot fails validation too; treat it as spam and pretend it worked.
    const honeypot = (input as { company?: string } | null)?.company
    return honeypot ? { ok: true } : { ok: false, reason: "invalid" }
  }
  const { name, email, message, startedAt } = parsed.data
  if (Date.now() - startedAt < MIN_FILL_MS) return { ok: false, reason: "spam" }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
    console.warn("Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set")
    return { ok: false, reason: "unavailable" }
  }

  const resend = new Resend(env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
    to: env.CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `Portfolio message from ${name}`,
    text: `${message}\n\n— ${name} <${email}>`,
  })
  if (error) {
    console.error("Contact form: Resend error", error)
    return { ok: false, reason: "unavailable" }
  }
  return { ok: true }
}
