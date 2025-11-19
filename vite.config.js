import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // 환경 변수 로드 (mode에 따라 .env, .env.local, .env.production 등 자동 로드)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: "esbuild", // esbuild는 빠르고 충분히 좋은 압축 제공
      // 청크 크기 제한 (500KB)
      chunkSizeWarningLimit: 500,
      // Tree shaking 활성화
      treeshake: true,
      // CSS 코드 스플리팅
      cssCodeSplit: true,
      // 롤업 옵션
      rollupOptions: {
        output: {
          // 수동 청크 분할 전략
          manualChunks(id) {
            // node_modules 의존성 분리
            if (id.includes("node_modules")) {
              // Vite는 별도 청크로 분리
              if (id.includes("vite")) {
                return "vite-vendor";
              }
              // 기타 node_modules는 vendor로
              return "vendor";
            }

            // 페이지별 코드 스플리팅
            if (id.includes("/js/pages/")) {
              const pageName = id.split("/pages/")[1].split(".")[0];
              return `page-${pageName}`;
            }

            // 컴포넌트 분리
            if (id.includes("/js/components/")) {
              return "components";
            }

            // 유틸리티 분리
            if (id.includes("/js/utils/")) {
              return "utils";
            }

            // API 및 핵심 로직은 main에 유지
            if (
              id.includes("/js/api.js") ||
              id.includes("/js/main.js") ||
              id.includes("/js/state.js")
            ) {
              return "main";
            }
          },
          // 청크 파일명 포맷
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            // 이미지는 assets/img로, 폰트는 assets/fonts로
            if (assetInfo.name.match(/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i)) {
              return "assets/img/[name]-[hash][extname]";
            }
            if (assetInfo.name.match(/\.(woff2?|eot|ttf|otf)$/i)) {
              return "assets/fonts/[name]-[hash][extname]";
            }
            return "assets/[name]-[hash][extname]";
          },
        },
      },
      // esbuild 최적화 (Vite 기본 minifier)
      // terser를 사용하려면 @rollup/plugin-terser 설치 필요
      // 현재는 esbuild 사용 (더 빠른 빌드)
    },
    define: {
      __API_BASE_URL__: JSON.stringify(
        env.VITE_API_BASE_URL ||
          "https://bayeon-hwayeon-backend.onrender.com"
      ),
    },
    server: {
      port: 5173,
      open: true,
    },
    // CSS 최적화
    css: {
      devSourcemap: false,
    },
  };
});

