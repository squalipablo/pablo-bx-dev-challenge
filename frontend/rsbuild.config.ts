import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    meta: {
      viewport: "initial-scale=1, width=device-width",
    },
  },
});
