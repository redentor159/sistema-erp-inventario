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
    // 🔥 CAZADOR DE BUGS CRÍTICOS (Cero Ruido)
    // Apagamos los avisos tontos de estilo y tipado, y encendemos solo los mortales.
    rules: {
      // 1. APAGADOS COMPLETAMENTE (No son bugs, es deuda técnica de MVP)
      "@typescript-eslint/no-unused-vars": "off", // Ignora variables que declaraste pero no usaste.
      "@typescript-eslint/no-explicit-any": "off", // Ignora la palabra 'any'. Permite programar rápido conectando API.
      "prefer-const": "off", // Ignora si usas let en vez de const.
      "react/no-unescaped-entities": "off", // Ignora signos ortográficos en HTML.

      // 2. ENCENDIDOS EN ERROR MORTAL (Bugs que Destruyen el ERP)
      "react-hooks/rules-of-hooks": "error", // Básico: Si usas mal un useState o useEffect (ej. dentro de un IF), la app EXPLOTA.
      "react-hooks/exhaustive-deps": "warn", // Peligro de bucle infinito (Infinite Loop) consumiendo gigas de RAM en la PC del cliente.
    }
  }
]);

export default eslintConfig;
