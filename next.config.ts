import createMDX from "@next/mdx"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
}

// No remark/rehype plugins: Turbopack can't take function plugins, and each
// MDX file exports its own `meta` object instead of frontmatter.
const withMDX = createMDX({})

export default withMDX(nextConfig)
