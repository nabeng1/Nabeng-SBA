import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    port: 5173,
    open: "/system.html"
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
      }
    }
  }
});
