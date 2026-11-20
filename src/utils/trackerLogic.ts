import { McuEntry, MediaKind, SagaId } from '../data/mcuTimeline';

export type StatusFilter = 'all' | 'unwatched' | 'watched';
export type MediaFilter = 'all' | MediaKind;
export type SagaFilter = 'all' | SagaId;

export interface FilterCriteria {
  status: StatusFilter;
  media: MediaFilter;
  saga: SagaFilter;
  searchQuery: string;
}

export interface SagaProgressStats {
  totalCount: number;
  watchedCount: number;
  percentage: number;
  totalMinutes: number;
  watchedMinutes: number;
  isComplete: boolean;
}

export interface TrackerSummary {
  overall: SagaProgressStats;
  infinity: SagaProgressStats;
  multiverse: SagaProgressStats;
  nextUpEntry: McuEntry | null;
}

export function computeSagaStats(
  entries: McuEntry[],
  watchedIds: Set<number>
): SagaProgressStats {
  const totalCount = entries.length;
  let watchedCount = 0;
  let totalMinutes = 0;
  let watchedMinutes = 0;

  for (const entry of entries) {
    totalMinutes += entry.runtimeMinutes;
    if (watchedIds.has(entry.id)) {
      watchedCount += 1;
      watchedMinutes += entry.runtimeMinutes;
    }
  }

  const percentage =
    totalCount === 0 ? 0 : Math.round((watchedCount / totalCount) * 100);

  return {
    totalCount,
    watchedCount,
    percentage,
    totalMinutes,
    watchedMinutes,
    isComplete: totalCount > 0 && watchedCount === totalCount,
  };
}

export function computeTrackerSummary(
  entries: McuEntry[],
  watchedIds: Set<number>
): TrackerSummary {
  const sorted = [...entries].sort((a, b) => a.order - b.order);
  const infinityEntries = sorted.filter((e) => e.saga === 'infinity');
  const multiverseEntries = sorted.filter((e) => e.saga === 'multiverse');

  const nextUpEntry = sorted.find((e) => !watchedIds.has(e.id)) ?? null;

  return {
    overall: computeSagaStats(sorted, watchedIds),
    infinity: computeSagaStats(infinityEntries, watchedIds),
    multiverse: computeSagaStats(multiverseEntries, watchedIds),
    nextUpEntry,
  };
}

export function filterTimelineEntries(
  entries: McuEntry[],
  watchedIds: Set<number>,
  criteria: FilterCriteria
): McuEntry[] {
  const normalizedQuery = criteria.searchQuery.trim().toLowerCase();

  return entries
    .filter((entry) => {
      if (criteria.saga !== 'all' && entry.saga !== criteria.saga) {
        return false;
      }
      if (criteria.media !== 'all' && entry.mediaKind !== criteria.media) {
        return false;
      }
      const isWatched = watchedIds.has(entry.id);
      if (criteria.status === 'watched' && !isWatched) {
        return false;
      }
      if (criteria.status === 'unwatched' && isWatched) {
        return false;
      }
      if (normalizedQuery.length > 0) {
        const matchesTitle = entry.title.toLowerCase().includes(normalizedQuery);
        const matchesSynopsis = entry.synopsis
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesEra = entry.timelineEra
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesYear = entry.releaseYear
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesOrder = String(entry.order) === normalizedQuery;
        if (
          !matchesTitle &&
          !matchesSynopsis &&
          !matchesEra &&
          !matchesYear &&
          !matchesOrder
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

export function formatRuntimeHours(minutes: number): {
  hours: number;
  mins: number;
  formatted: string;
} {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return {
    hours,
    mins,
    formatted: `${hours} ч ${mins.toString().padStart(2, '0')} мин`,
  };
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  watchedIds: number[];
  notes: Record<number, string>;
}

export function serializeProgress(
  watchedIds: Set<number>,
  notes: Record<number, string> = {}
): string {
  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    watchedIds: Array.from(watchedIds).sort((a, b) => a - b),
    notes,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseImportedProgress(
  rawJson: string,
  validIds: Set<number>
): { watchedIds: number[]; notes: Record<number, string> } | null {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') return null;

    const rawWatched: unknown[] = Array.isArray(parsed.watchedIds)
      ? parsed.watchedIds
      : Array.isArray(parsed)
        ? parsed
        : [];

    if (!Array.isArray(parsed.watchedIds) && !Array.isArray(parsed)) {
      return null;
    }

    const watchedIds = Array.from(
      new Set(
        rawWatched
          .map((item) => Number(item))
          .filter((id) => Number.isInteger(id) && validIds.has(id))
      )
    ).sort((a, b) => a - b);

    const notes: Record<number, string> = {};
    if (parsed.notes && typeof parsed.notes === 'object') {
      for (const [key, val] of Object.entries(parsed.notes)) {
        const numKey = Number(key);
        if (
          Number.isInteger(numKey) &&
          validIds.has(numKey) &&
          typeof val === 'string'
        ) {
          notes[numKey] = val.slice(0, 500);
        }
      }
    }

    return { watchedIds, notes };
  } catch {
    return null;
  }
}
