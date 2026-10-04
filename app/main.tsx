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
 * - success → the hash router renders home / the desk / the lord and
 *   route pages / not-found.
 *
 * This is the only JSX file in the app (Vite loads it; nothing under
 * node:test imports it — the views are plain `h()`-based `.ts` modules).
 * `vite/client` supplies the `*.css` module declaration for the app.css
 * import; it does not exist in the repo's source set, so no .d.ts is needed.
 */

import { render, type VNode } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ContentBootError, createFetchReader, loadContentTree } from "./content/load.ts";
import { getLord, getRoute, getVcoObjectives, listLords } from "./content/query.ts";
import type { ContentTree, Lord, QueryResult, Route } from "./content/types.ts";
import { listLedgers, saveLedger } from "./ledger/io.ts";
import { createCampaign, itemsFor } from "./ledger/logic.ts";
import { useCampaign, type LedgerIndexState } from "./ledger/useCampaign.ts";
import { useHashRoute, type HashRoute, type RoutePage } from "./router.ts";
import { AtlasHeader, type HeaderRoute } from "./components/atlasHeader.ts";
import { BootErrorView } from "./views/boot-error.ts";
import { DeskView } from "./views/desk.ts";
import { HomeView } from "./views/home.ts";
import { LedgerView } from "./views/ledger.ts";
import { NotFoundView } from "./views/not-found.ts";
import { NotesView } from "./views/notes.ts";
import { ArmiesAndSkillsView, SettlementsView, WorkshopView } from "./views/panels.ts";
import { PlanView, type RouteCampaignProps } from "./views/plan.ts";
import { SourcesView } from "./views/sources.ts";
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

  // Section anchor: a plan hash with a section id scrolls the matching H2
  // into view (the plan view gives every H2 the tree's section id). Re-runs
  // when boot finishes so an initial `#/lord/plan/id/section` scrolls too.
  useEffect(() => {
    if (route.name !== "route-page" || route.page !== "plan" || route.sectionId === null) return;
    const target = document.getElementById(route.sectionId);
    if (target !== null) target.scrollIntoView();
  }, [route, boot.kind]);

  const lords = boot.kind === "ready" ? listLords(boot.tree) : [];
  const { lord: headerLord, route: headerRoute } = headerContext(boot, route);

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
      <AtlasHeader lords={lords} lord={headerLord} route={headerRoute} />
      <main id="main" className="site-main" tabIndex={-1}>
        {view}
      </main>
    </>
  );
}

/**
 * The header's form inputs (DESIGN §4 "The shell renders two header forms"):
 * the slim form serves home, not-found, and the boot states; the full
 * three-tier form serves every lord-scoped member that resolves to a real
 * page. A lord-scoped member whose lord, or whose route, does not resolve
 * renders the not-found view below, so its header falls to slim with it — the
 * same deterministic resolution the view dispatch applies (a full header
 * needs a resolvable lord, and a full header over a not-found view would
 * contradict the DESIGN's slim-for-not-found rule).
 */
function headerContext(boot: Boot, route: HashRoute): { lord: Lord | null; route: HeaderRoute | null } {
  if (boot.kind !== "ready" || route.name === "home" || route.name === "not-found") {
    return { lord: null, route: null };
  }
  const lord = getLord(boot.tree, route.lordSlug);
  if (!lord.found) return { lord: null, route: null };
  if (route.name === "desk") {
    return resolvedDeskRoute(boot.tree, route.lordSlug, route.routeId).found
      ? { lord: lord.value, route: { name: "desk", lordSlug: route.lordSlug, routeId: route.routeId } }
      : { lord: null, route: null };
  }
  if (route.name === "lord-page") {
    return lord.value.routes.length === 0
      ? { lord: null, route: null }
      : { lord: lord.value, route: { name: "lord-page", lordSlug: route.lordSlug, page: route.page } };
  }
  const found = getRoute(boot.tree, route.lordSlug, route.routeId);
  return found.found
    ? { lord: lord.value, route: { name: "route-page", lordSlug: route.lordSlug, page: route.page, routeId: route.routeId } }
    : { lord: null, route: null };
}

/**
 * The ledger page composition (the `ledger-page-wiring` package plus the
 * `ledger-complete-delete` lifecycle wiring): mounts the on-demand campaign
 * hook for the active ledger hash and computes the SINGLE `logic.itemsFor`
 * reconciliation here — the committed VCO ids via `getVcoObjectives`,
 * applied to the hook's current document (the optimistic next document
 * while a write is in flight, a completed document while the complete
 * write is). The view never computes a second intersection; the lifecycle
 * stage and its handlers pass straight through from the hook.
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
      lifecycle={campaign.lifecycle}
      onRetry={campaign.onRetry}
      onTick={campaign.onTick}
      onStep={campaign.onStep}
      onComplete={campaign.onComplete}
      onDelete={campaign.onDelete}
      onConfirmLifecycle={campaign.onConfirmLifecycle}
      onDismissLifecycle={campaign.onDismissLifecycle}
    />
  );
}

/**
 * The plan page's on-demand campaign surface (package `ledger-route-start`):
 * reads the ledger index ONLY while a plan hash is active — the mount (a
 * plan hash) is the demand, so the boot pass never issues a ledger request.
 * The read is keyed by `(lordSlug, routeId)` and re-runs on hash change, so
 * returning to this plan page after completing or deleting a campaign on
 * the ledger page re-reads the index and `start` reappears (the DESIGN's
 * "startable again"). The same `io.listLedgers` seam and entry types as the
 * ledger hook — one network contract for both surfaces. `onStart` builds
 * the campaign document from the committed VCO item ids via the pure model,
 * persists it through `io.saveLedger`, and on success navigates to the
 * ledger hash (the navigation stays `#/<lord>/ledger/<route-id>`); a failed
 * start surfaces the typed message inline near the action (the DESIGN's
 * no-silent-writes — the button must not appear to have worked).
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

/**
 * The plan case's campaign surface: mounts `useRouteCampaign` (retargeted
 * from the old route case — the hook, its index read, and the start handler
 * are unchanged) and hands its values to the presentational plan view.
 */
function PlanCampaignPage({ lord, route }: { readonly lord: Lord; readonly route: Route }): VNode {
  return <PlanView lord={lord} route={route} campaign={useRouteCampaign(lord, route)} />;
}

/**
 * The route behind a desk hash (DESIGN §2 rule 3): the hash's own route id,
 * or — when null — the lord's first route in manifest order, the atlas's own
 * default. An explicit deterministic read of the manifest, never a hidden
 * guess; a missing lord or an empty manifest is the not-found result.
 */
function resolvedDeskRoute(tree: ContentTree, lordSlug: string, routeId: string | null): QueryResult<Route> {
  if (routeId !== null) return getRoute(tree, lordSlug, routeId);
  const lord = getLord(tree, lordSlug);
  if (!lord.found) return lord;
  const first = lord.value.routes[0];
  return first === undefined ? { found: false, kind: "not-found" } : { found: true, value: first };
}

/**
 * One route-page hash's view: the page id decides the view, never the
 * segment count (DESIGN §5 — the six route pages share one segment
 * position). Every page returns explicitly; the closed `RoutePage` union
 * leaves no fallthrough.
 */
function routePageView(lord: Lord, route: Route, page: RoutePage): VNode {
  switch (page) {
    case "ledger":
      return <LedgerPage lord={lord} route={route} />;
    case "plan":
      return <PlanCampaignPage lord={lord} route={route} />;
    case "armies":
      return <ArmiesAndSkillsView lord={lord} route={route} />;
    case "settlements":
      return <SettlementsView lord={lord} route={route} />;
    case "workshop":
      return <WorkshopView lord={lord} route={route} />;
    case "desk":
      return <DeskView key={route.id} lord={lord} route={route} />;
  }
}

function routeView(tree: ContentTree, route: HashRoute): VNode {
  switch (route.name) {
    case "home":
      return <HomeView tree={tree} />;
    case "desk": {
      const lord = getLord(tree, route.lordSlug);
      const found = resolvedDeskRoute(tree, route.lordSlug, route.routeId);
      // Keyed by the resolved route id: a route switch remounts the desk and
      // resets its component-local compare toggle (the dashboard precedent).
      return lord.found && found.found ? (
        <DeskView key={found.value.id} lord={lord.value} route={found.value} />
      ) : (
        <NotFoundView />
      );
    }
    case "lord-page": {
      const lord = getLord(tree, route.lordSlug);
      if (!lord.found) return <NotFoundView />;
      return route.page === "sources" ? <SourcesView lord={lord.value} /> : <NotesView lord={lord.value} />;
    }
    case "route-page": {
      const lord = getLord(tree, route.lordSlug);
      const found = getRoute(tree, route.lordSlug, route.routeId);
      return lord.found && found.found ? routePageView(lord.value, found.value, route.page) : <NotFoundView />;
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
