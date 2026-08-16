"use client";

/**
 * Picks which season's panel is on screen, from `?season=`.
 *
 * The four panels arrive already rendered, as server children — this component
 * chooses between them and renders nothing of its own. That is deliberate:
 * everything the panels know about (the season copy, which journeys are in the
 * catalogue, what each costs) stays on the server, and none of the markup or
 * the data behind it is duplicated as browser JavaScript. Switching season is
 * then instant, with no request and no flash, which is more than the old
 * server-rendered version managed.
 *
 * It also owns the "hide the whole rail when the catalogue is filtered" rule
 * the page used to express as `{!active && …}`. A visitor who has narrowed the
 * catalogue has already answered the question this section asks.
 */

import type { ReactNode } from "react";
import { useQueryParams } from "../query-watcher";
import {
  hasActiveFilters,
  parseTourFiltersFromQuery,
} from "@/lib/tour-filters";

export type SeasonPanel = { key: string; node: ReactNode };

export default function SeasonSwitch({
  panels,
  nowKey,
}: {
  panels: SeasonPanel[];
  /** The season it actually is in Asia/Colombo, resolved on the server. */
  nowKey: string;
}) {
  const { params, watcher } = useQueryParams();

  if (hasActiveFilters(parseTourFiltersFromQuery(params)))
    return <>{watcher}</>;

  const wanted = params?.get("season");
  const panel =
    panels.find((p) => p.key === wanted) ??
    panels.find((p) => p.key === nowKey) ??
    panels[0];

  return (
    <>
      {watcher}
      {panel?.node}
    </>
  );
}
