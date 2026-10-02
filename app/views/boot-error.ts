/**
 * Boot-error view (DESIGN §5, feature DESIGN §5): boot parsing/validation
 * failed, so the site names the offending file and field plus the violation,
 * developer-readable, and offers a retry — never a white page. Re-running the
 * boot is wired by `app/main.tsx` (the view stays presentational).
 */

import { h, type JSX } from "preact";
import type { ContentBootError } from "../content/load.ts";

export function BootErrorView(props: { error: ContentBootError; onRetry: () => void }): JSX.Element {
  return h(
    "section",
    { className: "boot-error", role: "alert" },
    h("p", { className: "eyebrow boot-error__eyebrow" }, "BOOT ERROR"),
    h("h1", { className: "boot-error__title" }, "The guide could not be loaded"),
    h(
      "p",
      { className: "boot-error__detail" },
      h("code", { className: "boot-error__file" }, props.error.file),
      " · ",
      h("code", { className: "boot-error__field" }, props.error.field),
      " — ",
      props.error.message,
    ),
    h(
      "button",
      { className: "button button--ghost", type: "button", onClick: props.onRetry },
      "Retry",
    ),
  );
}
