/**
 * Hash routing (feature DESIGN §2, ADR-0001): pure hash → route-model parsing
 * plus a `hashchange`-subscribing hook.
 *
 * Grammar (DESIGN §2 — the atlas IA, fresh; the old shapes are deliberately
 * broken, nothing is mapped for legacy): `#/` (or empty hash) → home;
 * `#/<lord-slug>` → the default-route desk (route id null — the first
 * manifest route, resolved at render); `#/<lord-slug>/sources|notes` → the
 * lord pages; `#/<lord-slug>/<route-page>/<route-id>[/<section-id>]` for the
 * six route pages (`desk`/`plan`/`armies`/`settlements`/`workshop`/`ledger`)
 * — a section id is valid on `plan` only (rule 4). Every other shape — every
 * old shape (`route/<id>`, section anchors under `route/`, the 2-segment
 * `#/lord/ledger`), a route page without a route id (rule 1, including
 * `#/<lord>/desk`), unknown page ids, and malformed segments — maps to the
 * explicit not-found route (DESIGN §5): the site never guesses.
 *
 * `parseHash` is pure and exported so `node --test` can drive it without a
 * DOM; the hook below is the only part that touches the browser, so tests can
 * import this module safely.
 */

import { useEffect, useState } from "preact/hooks";

/** The six route-page segments (DESIGN §2), in DESIGN table order. */
const ROUTE_PAGES: readonly string[] = ["desk", "plan", "armies", "settlements", "workshop", "ledger"];

/** The two lord-page segments (DESIGN §2). */
const LORD_PAGES: readonly string[] = ["sources", "notes"];

export type LordPage = "sources" | "notes";
export type RoutePage = "desk" | "plan" | "armies" | "settlements" | "workshop" | "ledger";

/** The supported routes plus the explicit garbage bucket. */
export type HashRoute =
  | { readonly name: "home" }
  | {
      readonly name: "desk";
      readonly lordSlug: string;
      /** Null = the lord's first manifest route, resolved deterministically at render (DESIGN §2). */
      readonly routeId: string | null;
    }
  | { readonly name: "lord-page"; readonly lordSlug: string; readonly page: LordPage }
  | {
      readonly name: "route-page";
      readonly lordSlug: string;
      readonly page: RoutePage;
      readonly routeId: string;
      /** Section anchor id (a plan body H2), or null when the hash carries none; valid on `plan` only. */
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

function isLordPage(segment: string): segment is LordPage {
  return LORD_PAGES.includes(segment);
}

function isRoutePage(segment: string): segment is RoutePage {
  return ROUTE_PAGES.includes(segment);
}

/** Parses a raw `location.hash` string (with or without the leading `#`). */
export function parseHash(hash: string): HashRoute {
  const rest = hash.startsWith("#") ? hash.slice(1) : hash;
  if (rest === "" || rest === "/") return HOME;
  // A non-empty hash must carry the `#/` prefix (a bare "single segment" is garbage).
  if (!rest.startsWith("/")) return NOT_FOUND;
  const parts = rest.slice(1).split("/");
  if (parts.some((p) => p === "." || p === ".." || !SEGMENT.test(p))) return NOT_FOUND;
  // `#/<lord>` — the default-route desk; the route id resolves at render.
  if (parts.length === 1) return { name: "desk", lordSlug: parts[0], routeId: null };
  // `#/<lord>/<lord-page>` — the two lord pages; any other 2-segment shape
  // (a route page without a route id, the old `lord/ledger`, unknown pages)
  // is not-found (rule 1).
  if (parts.length === 2) {
    if (isLordPage(parts[1])) return { name: "lord-page", lordSlug: parts[0], page: parts[1] };
    return NOT_FOUND;
  }
  // `#/<lord>/<route-page>/<route-id>[/<section-id>]` — a section id is valid
  // on `plan` only (rule 4); anything deeper stays not-found.
  if (parts.length === 3 || parts.length === 4) {
    if (!isRoutePage(parts[1])) return NOT_FOUND;
    if (parts.length === 4 && parts[1] !== "plan") return NOT_FOUND;
    return {
      name: "route-page",
      lordSlug: parts[0],
      page: parts[1],
      routeId: parts[2],
      sectionId: parts.length === 4 ? parts[3] : null,
    };
  }
  return NOT_FOUND;
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
