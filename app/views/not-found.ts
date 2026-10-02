/**
 * Not-found view (DESIGN §5): an explicit unknown-route state with a link
 * home — malformed hashes, unknown lords, and unknown routes all land here,
 * never on a blank page.
 */

import { h, type JSX } from "preact";

export function NotFoundView(): JSX.Element {
  return h(
    "section",
    { className: "not-found", "aria-label": "Unknown route" },
    h("p", { className: "eyebrow" }, "NOT FOUND"),
    h("h1", { className: "not-found__title" }, "Unknown route"),
    h("p", { className: "not-found__copy" }, "This hash does not match any page in the guide."),
    h("a", { className: "button button--ghost", href: "#/" }, "Back to home"),
  );
}
