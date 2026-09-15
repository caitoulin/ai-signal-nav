import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 相对路径产物，方便直接丢到任意静态托管 / 子路径
  base: "./",
  server: { host: "127.0.0.1", port: 5181, strictPort: true },
  build: { outDir: "dist", sourcemap: false, target: "es2020" },
});
