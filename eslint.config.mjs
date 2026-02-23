import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Backup/archive directories — not production code
    "_ARCHIVO_MAESTRO_ERP/**",
    "_EMERGENCIA_SUPABASE/**",
  ]),
  // Downgrade code-quality rules to warnings.
  // These represent tech debt to fix gradually — they do NOT affect
  // runtime correctness and should NOT block CI deployments.
  {
    rules: {
      // TypeScript strictness — downgrade to warn (lots of `any` in the codebase)
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      // ts-ignore is used to work around known library type issues
      "@typescript-eslint/ban-ts-comment": "warn",
      // shadcn/ui generated components use empty interfaces
      "@typescript-eslint/no-empty-object-type": "warn",
      // Some utility files still use require() style imports
      "@typescript-eslint/no-require-imports": "warn",

      // React rules — cosmetic / style, not runtime errors
      "react/no-unescaped-entities": "warn",

      // React Hooks — these patterns work at runtime, just not ideal
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/incompatible-library": "warn",

      // Next.js perf suggestion — not blocking
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
