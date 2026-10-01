import type { MDXComponents } from "mdx/types"
import type { ComponentProps } from "react"

// Prose styles for every MDX file (blog posts and project case studies).
// Semantic tokens only, so contrast holds in both light and dark themes.
const components = {
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mt-8 mb-3 text-xl font-semibold" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-6 mb-2 text-lg font-semibold" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-4 leading-7" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="font-medium text-primary-text underline underline-offset-4 hover:no-underline"
      {...props}
    />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className="my-4 list-disc space-y-2 ps-6 marker:text-muted-foreground"
      {...props}
    />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="my-4 list-decimal space-y-2 ps-6 marker:text-muted-foreground"
      {...props}
    />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-6 rounded-md border-s-4 border-primary bg-muted py-2 ps-4 text-foreground"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
      dir="ltr"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      dir="ltr"
      className="my-6 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
