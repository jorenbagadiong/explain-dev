import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "out/**", "next-env.d.ts", "public/lab-runtime/runtime.js", "preview-host/dist/**", "preview-host/.build/**", "preview-host/.vercel/**"]),
]);
