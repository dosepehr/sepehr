import { notFound } from "next/navigation"

// Any unknown path under a locale renders app/[lang]/not-found.tsx inside the root layout.
export default function CatchAll() {
  notFound()
}
