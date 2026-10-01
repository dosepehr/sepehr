"use client"

import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"
import { sendContact } from "@/app/[lang]/contact/actions"
import { useDictionary } from "@/components/DictionaryProvider"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import { contactSchema, type ContactInput } from "@/lib/contact"

type FormValues = Pick<ContactInput, "name" | "email" | "message"> & { company: string }

export default function ContactForm() {
  const { dict } = useDictionary()
  const t = dict.contact
  const [startedAt] = useState(() => Date.now())
  const [sent, setSent] = useState(false)

  // Small zod resolver: maps each field's first issue to a localized message.
  const resolver: Resolver<FormValues> = async (values) => {
    const result = contactSchema.safeParse({ ...values, startedAt: 0 })
    if (result.success) return { values, errors: {} }
    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof typeof t.validation
      if (field in t.validation && !errors[field]) {
        errors[field] = { type: issue.code, message: t.validation[field] }
      }
    }
    return { values: {}, errors }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver, defaultValues: { name: "", email: "", message: "", company: "" } })

  const onSubmit = handleSubmit(async (values) => {
    const result = await sendContact({ ...values, startedAt })
    if (result.ok) {
      setSent(true)
      reset()
      toast.success(t.sent)
    } else {
      toast.error(t.error)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <Input label={t.name} autoComplete="name" required error={errors.name?.message} {...register("name")} />
      <Input
        label={t.email}
        type="email"
        dir="ltr"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <Textarea label={t.message} rows={5} required error={errors.message?.message} {...register("message")} />
      <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" {...register("company")} />
        </label>
      </div>
      <Button type="submit" isLoading={isSubmitting} loadingText={t.sending} className="self-start">
        {t.send}
      </Button>
      <p role="status" className="text-sm text-success-text">
        {sent ? t.sent : ""}
      </p>
    </form>
  )
}
