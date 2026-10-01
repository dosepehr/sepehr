import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // R3F code mutates three.js objects (uniforms, materials, matrices) inside
    // useFrame by design. The React Compiler rules assume immutable render
    // values, so they're off for the 3D layer (the compiler itself isn't enabled).
    files: ["components/Arcade/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party Claude Code skills (bundled scripts aren't project code).
    ".claude/**",
  ]),
]);

export default eslintConfig;
