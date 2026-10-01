import type { MDXComponents } from "mdx/types"
import type { ComponentProps } from "react"

// Neon prose styles for every MDX file (blog posts and project case studies).
const components = {
  h1: (props: ComponentProps<"h1">) => (
    <h1
      className="mt-8 mb-4 font-display text-3xl text-neon-pink text-glow"
      {...props}
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="mt-8 mb-3 font-display text-xl tracking-wide text-neon-cyan"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="mt-6 mb-2 text-lg font-semibold text-neon-purple"
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-4 leading-7" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-neon-cyan underline decoration-neon-cyan/50 underline-offset-4 hover:decoration-neon-cyan"
      {...props}
    />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className="my-4 list-disc space-y-2 ps-6 marker:text-neon-pink"
      {...props}
    />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="my-4 list-decimal space-y-2 ps-6 marker:text-neon-pink"
      {...props}
    />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-6 border-s-2 border-neon-yellow bg-neon-yellow/5 py-2 ps-4 text-neon-yellow"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-neon-cyan"
      dir="ltr"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      dir="ltr"
      className="my-6 overflow-x-auto rounded-lg border border-border bg-black/40 p-4 text-sm [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
