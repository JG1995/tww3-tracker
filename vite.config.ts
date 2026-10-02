import { defineConfig } from "vite";

// Build configuration only. `base: "./"` makes emitted asset URLs relative so
// the built site opens via `file://` with no server (verified in full by the
// static-server package); no plugins.
export default defineConfig({
  base: "./",
});
