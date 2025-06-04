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
});
