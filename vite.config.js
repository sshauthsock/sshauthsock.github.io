import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // 환경 변수 로드 (mode에 따라 .env, .env.local, .env.production 등 자동 로드)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: "terser",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vite"],
          },
        },
      },
    },
    define: {
      __API_BASE_URL__: JSON.stringify(
        env.VITE_API_BASE_URL ||
          "https://wind-app-backend-y7qnnpfkrq-du.a.run.app"
      ),
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});

