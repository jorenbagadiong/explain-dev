import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// Builds the sandboxed Coding Lab preview runtime as one classic script: public/lab-runtime/runtime.js.
// React's development build is used on purpose so learners get full error messages and warnings.
export default defineConfig({
  publicDir: false,
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
  build: {
    outDir: fileURLToPath(new URL("./public/lab-runtime", import.meta.url)),
    emptyOutDir: false,
    copyPublicDir: false,
    target: "es2022",
    minify: true,
    sourcemap: false,
    lib: {
      entry: fileURLToPath(new URL("./src/lab-runtime/main.ts", import.meta.url)),
      formats: ["iife"],
      name: "ExplainDevLabRuntime",
      fileName: () => "runtime.js",
    },
  },
});
