/**
 * Hash routing (DESIGN §2, ADR-0001): pure hash → route-model parsing plus a
 * `hashchange`-subscribing hook.
 *
 * Grammar: `#/` (or empty hash) → home; `#/<lord-slug>` → lord;
 * `#/<lord-slug>/route/<route-id>` → route; `#/<lord-slug>/route/<route-id>/<section-id>`
 * → route with a section anchor. Every other shape is garbage and maps to the
 * explicit not-found route (DESIGN §5): the site never guesses.
 *
 * `parseHash` is pure and exported so `node --test` can drive it without a
 * DOM; the hook below is the only part that touches the browser, so tests can
 * import this module safely.
 */

import { useEffect, useState } from "preact/hooks";

/** The four supported routes plus the explicit garbage bucket. */
export type HashRoute =
  | { readonly name: "home" }
  | { readonly name: "lord"; readonly lordSlug: string }
  | {
      readonly name: "route";
      readonly lordSlug: string;
      readonly routeId: string;
      /** Section anchor id (a route body H2), or null when the hash carries none. */
      readonly sectionId: string | null;
    }
  | { readonly name: "not-found" };

const HOME: HashRoute = { name: "home" };
const NOT_FOUND: HashRoute = { name: "not-found" };

/**
 * A segment is well-formed when it is a plain dash-separated slug. Empty
 * segments (double slashes, trailing slashes), whitespace, punctuation, and
 * the path-traversal dots are rejected at the boundary; unknown-but-valid
 * slugs still reach the query layer, which answers with the not-found view.
 */
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Parses a raw `location.hash` string (with or without the leading `#`). */
export function parseHash(hash: string): HashRoute {
  const rest = hash.startsWith("#") ? hash.slice(1) : hash;
  if (rest === "" || rest === "/") return HOME;
  // A non-empty hash must carry the `#/` prefix (a bare "single segment" is garbage).
  if (!rest.startsWith("/")) return NOT_FOUND;
  const parts = rest.slice(1).split("/");
  if (
    parts.some((p) => p === "." || p === ".." || !SEGMENT.test(p)) ||
    parts.length === 2
  ) {
    return NOT_FOUND;
  }
  if (parts.some((p) => p === "." || p === ".." || !SEGMENT.test(p))) {
    return NOT_FOUND;
  }
  if (parts.length === 1) return { name: "lord", lordSlug: parts[0] };
  // A route hash is exactly `lord/route/id` or `lord/route/id/section`.
  if (parts.length < 3 || parts.length > 4 || parts[1] !== "route") return NOT_FOUND;
  return {
    name: "route",
    lordSlug: parts[0],
    routeId: parts[2],
    sectionId: parts.length === 4 ? parts[3] : null,
  };
}

/** Subscribes to `hashchange` and returns the parsed route for the current hash. */
export function useHashRoute(): HashRoute {
  const [route, setRoute] = useState<HashRoute>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = (): void => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
