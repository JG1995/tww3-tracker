/// <reference types="vite/client" />

/**
 * App shell entry (ADR-0001, feature DESIGN §3): boot performs exactly one
 * `load.ts` pass over real `fetch` of `content/` and builds the immutable
 * tree; the shell owns the tree and the top navigation, and every view is a
 * presentational component over query results. No global state store, no
 * localStorage.
 *
 * Boot outcomes:
 * - `content/index.json` 404/absent → the loader returns the empty tree and
 *   home renders the explicit empty state (a fresh checkout is valid, not an
 *   error);
 * - any other boot failure (parse/validate) → the boot-error view naming the
 *   offending file and field — never a white page;
 * - success → the hash router renders home / lord / route / not-found.
 *
 * This is the only JSX file in the app (Vite loads it; nothing under
 * node:test imports it — the views are plain `h()`-based `.ts` modules).
 * `vite/client` supplies the `*.css` module declaration for the app.css
 * import; it does not exist in the repo's source set, so no .d.ts is needed.
 */

import { render, type VNode } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { ContentBootError, createFetchReader, loadContentTree } from "./content/load.ts";
import { getLord, getRoute, getVcoObjectives, listLords } from "./content/query.ts";
import type { ContentTree, Lord, Route } from "./content/types.ts";
import { listLedgers, saveLedger } from "./ledger/io.ts";
import { createCampaign, itemsFor } from "./ledger/logic.ts";
import { useCampaign, type LedgerIndexState } from "./ledger/useCampaign.ts";
import { useHashRoute, type HashRoute } from "./router.ts";
import { BootErrorView } from "./views/boot-error.ts";
import { HomeView } from "./views/home.ts";
import { LedgerView } from "./views/ledger.ts";
import { LordView } from "./views/lord.ts";
import { NotFoundView } from "./views/not-found.ts";
import { RouteView, type RouteCampaignProps } from "./views/route.ts";
import "./styles/app.css";

type Boot =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly tree: ContentTree }
  | { readonly kind: "error"; readonly error: ContentBootError };

/** `content/` resolved against the site root (the static server / dev origin). */
function contentRootUrl(): string {
  return new URL("content/", window.location.href).href;
}

export function App(): VNode {
  const [boot, setBoot] = useState<Boot>({ kind: "loading" });
  const [attempt, setAttempt] = useState<number>(0);
  const headerRef = useRef<HTMLElement | null>(null);
  const route = useHashRoute();

  // Exactly one load.ts pass per attempt (initial mount = attempt 0; Retry bumps it).
  useEffect(() => {
    let cancelled = false;
    setBoot({ kind: "loading" });
    loadContentTree(createFetchReader(contentRootUrl()))
      .then((tree) => {
        if (!cancelled) setBoot({ kind: "ready", tree });
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        const error =
          cause instanceof ContentBootError
            ? cause
            : new ContentBootError("content", "boot", cause instanceof Error ? cause.message : String(cause));
        setBoot({ kind: "error", error });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Move `index.html`'s wordmark slot into the nav bar so the mounted shell
  // owns the full sticky header (the skip link stays first in DOM).
  useEffect(() => {
    const header = headerRef.current;
    const wordmark = document.getElementById("wordmark");
    const navInner = header !== null ? header.querySelector(".top-nav__inner") : null;
    if (wordmark !== null && navInner !== null && wordmark.parentElement !== navInner) {
      navInner.prepend(wordmark);
    }
  }, []);

  // Section anchor: a route hash with a section id scrolls the matching H2
  // into view (the route view gives every H2 the tree's section id). Re-runs
  // when boot finishes so an initial `#/lord/route/id/section` scrolls too.
  useEffect(() => {
    if (route.name !== "route" || route.sectionId === null) return;
    const target = document.getElementById(route.sectionId);
    if (target !== null) target.scrollIntoView();
  }, [route, boot.kind]);

  const lords = boot.kind === "ready" ? listLords(boot.tree) : [];

  const view: VNode =
    boot.kind === "error" ? (
      <BootErrorView error={boot.error} onRetry={() => setAttempt((n) => n + 1)} />
    ) : boot.kind === "loading" ? (
      <div className="loading" role="status">
        <p className="loading__label">LOADING CORPUS</p>
        <div className="loading__bar" aria-hidden="true" />
      </div>
    ) : (
      routeView(boot.tree, route)
    );

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          // A `#main` hash would be a not-found route; focus the main region instead.
          event.preventDefault();
          const main = document.getElementById("main");
          if (main !== null) main.focus();
        }}
      >
        Skip to content
      </a>
      <header className="top-nav" ref={headerRef}>
        <div className="top-nav__inner">
          <nav className="top-nav__links" aria-label="Lords">
            {lords.map((lord) => {
              const active = isCurrentLord(route, lord.slug);
              return (
                <a
                  key={lord.slug}
                  className={`top-nav__link${active ? " top-nav__link--active" : ""}`}
                  href={`#/${lord.slug}`}
                  aria-current={active ? "page" : undefined}
                >
                  {lord.guide.lord}
                </a>
              );
            })}
          </nav>
          <div className="search-well" role="search" aria-label="Search (reserved for F6)">
            <span className="search-well__placeholder">SEARCH</span>
          </div>
        </div>
      </header>
      <main id="main" className="site-main" tabIndex={-1}>
        {view}
      </main>
    </>
  );
}

function isCurrentLord(route: HashRoute, slug: string): boolean {
  return (route.name === "lord" || route.name === "route") && route.lordSlug === slug;
}

/**
 * The ledger page composition (the `ledger-page-wiring` package): mounts the
 * on-demand campaign hook for the active ledger hash and computes the SINGLE
 * `logic.itemsFor` reconciliation here — the committed VCO ids via
 * `getVcoObjectives`, applied to the hook's current document (the optimistic
 * next document while a row write is in flight). The view never computes a
 * second intersection.
 */
function LedgerPage({ lord, route }: { readonly lord: Lord; readonly route: Route }): VNode {
  const campaign = useCampaign(lord.slug, route.id);
  const committedIds = getVcoObjectives(lord, route.id).map((item) => item.id);
  const rows =
    campaign.phase.kind === "ready" && campaign.phase.doc !== null
      ? itemsFor(campaign.phase.doc, committedIds)
      : [];
  return (
    <LedgerView
      lord={lord}
      route={route}
      phase={campaign.phase}
      rows={rows}
      statuses={campaign.statuses}
      onRetry={campaign.onRetry}
      onTick={campaign.onTick}
      onStep={campaign.onStep}
    />
  );
}

/**
 * The route page's on-demand campaign surface (package `ledger-route-start`):
 * reads the ledger index ONLY while a route hash is active — the mount (a
 * route hash) is the demand, so the boot pass never issues a ledger request.
 * The read is keyed by `(lordSlug, routeId)` and re-runs on hash change, so
 * returning to this route page after completing or deleting a campaign on
 * the ledger page re-reads the index and `start` reappears (the DESIGN's
 * "startable again"; Commit 10 adds the in-place refresh after lifecycle
 * actions). The same `io.listLedgers` seam and entry types as the ledger
 * hook — one network contract for both surfaces. `onStart` builds the
 * campaign document from the committed VCO item ids via the pure model,
 * persists it through `io.saveLedger`, and on success navigates to the
 * ledger hash (the Commit-3 grammar); a failed start surfaces the typed
 * message inline near the action (the DESIGN's no-silent-writes — the button
 * must not appear to have worked).
 */
function useRouteCampaign(lord: Lord, route: Route): RouteCampaignProps {
  const [index, setIndex] = useState<LedgerIndexState>({ kind: "loading" });
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIndex({ kind: "loading" });
    void listLedgers()
      .then((entries) => {
        if (!cancelled) setIndex({ kind: "ready", entries });
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setIndex({ kind: "error", message: cause instanceof Error ? cause.message : String(cause) });
      });
    return () => {
      cancelled = true;
    };
  }, [lord.slug, route.id]);

  const onStart = (): void => {
    setStartError(null); // a fresh attempt clears the previous failure (the retry affordance)
    const doc = createCampaign(
      lord.slug,
      route.id,
      getVcoObjectives(lord, route.id).map((item) => item.id),
      new Date().toISOString(),
    );
    void saveLedger(doc)
      .then(() => {
        window.location.hash = `#/${lord.slug}/ledger/${route.id}`;
      })
      .catch((cause: unknown) => {
        setStartError(cause instanceof Error ? cause.message : String(cause));
      });
  };

  return { index, startError, onStart };
}

/** The route case's campaign surface: mounts `useRouteCampaign` and hands its values to the presentational route view. */
function RouteCampaignPage({ lord, route }: { readonly lord: Lord; readonly route: Route }): VNode {
  return <RouteView lord={lord} route={route} campaign={useRouteCampaign(lord, route)} />;
}

function routeView(tree: ContentTree, route: HashRoute): VNode {
  switch (route.name) {
    case "home":
      return <HomeView tree={tree} />;
    case "lord": {
      const lord = getLord(tree, route.lordSlug);
      return lord.found ? <LordView lord={lord.value} /> : <NotFoundView />;
    }
    case "route": {
      const lord = getLord(tree, route.lordSlug);
      const found = getRoute(tree, route.lordSlug, route.routeId);
      return lord.found && found.found ? <RouteCampaignPage lord={lord.value} route={found.value} /> : <NotFoundView />;
    }
    case "ledger": {
      // The ledger case mirrors the route case's resolution: lord/route must
      // both resolve, otherwise the explicit not-found view (the Commit 3
      // stub is replaced — the ledger view wires in here now).
      const lord = getLord(tree, route.lordSlug);
      const found = getRoute(tree, route.lordSlug, route.routeId);
      return lord.found && found.found ? <LedgerPage lord={lord.value} route={found.value} /> : <NotFoundView />;
    }
    case "not-found":
      return <NotFoundView />;
  }
}

const mount = document.getElementById("app");
if (mount === null) {
  throw new Error("index.html is missing the #app mount node");
}
render(<App />, mount);
