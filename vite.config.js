import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/",
  server: {
    port: 5173,
    open: "/"
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        system: resolve(__dirname, "system.html"),
        student: resolve(__dirname, "student.html"),
        about: resolve(__dirname, "about.html"),
        contact: resolve(__dirname, "contact.html")
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
