import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Ignorados Globales: Evita que el "sargento" entre a carpetas de reportes o datos temporales.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
    "**/node_modules/**",
    "database/**",
    "scripts/**",
    "tests/**",
    "public/**",
    "_ARCHIVO_MAESTRO_ERP/**",
    "playwright.config.ts",
    "vitest.config.ts",
    "postcss.config.mjs",
  ]),
  {
    // Bloque de Reglas Personalizables: Aquí puedes "apagar" o "ajustar" al sargento.
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // Solo avisa, no bloquea el build.
      "@typescript-eslint/no-explicit-any": "warn", // Permite usar 'any' temporalmente.
      "prefer-const": "warn", // Avisa si una variable puede ser constante.
      "react/no-unescaped-entities": "off", // Apaga errores por caracteres especiales en HTML.
      "@typescript-eslint/no-require-imports": "off", // Permite require() en scripts antiguos.
    }
  }
]);

export default eslintConfig;
