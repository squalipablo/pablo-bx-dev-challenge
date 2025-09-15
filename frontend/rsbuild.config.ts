import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    exclude: [
      /\.spec\.(tsx?|jsx?)$/,
      /\.test\.(tsx?|jsx?)$/,
      /__tests__/,
      /\.stories\.(tsx?|jsx?)$/,
    ],
  },
  html: {
    meta: {
      viewport: "initial-scale=1, width=device-width",
    },
  },
  server: {
    port: 5000,
    host: "localhost",
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  dev: {
    hmr: {
      host: "localhost",
    },
    client: {
      // Let the browser determine the WebSocket host to avoid proxy issues
    },
  },
});
