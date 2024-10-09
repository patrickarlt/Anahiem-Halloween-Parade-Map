import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import mkcert from "vite-plugin-mkcert";
export default defineConfig({
  plugins: [mkcert()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    open: "/index.html",
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  root: "src",
  base: "/Anahiem-Halloween-Parade-Map/",
});
