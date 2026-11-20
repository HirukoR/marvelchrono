import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Award, CheckCircle2, Database, RotateCcw, Sparkles } from 'lucide-react';
import {
  MCU_TIMELINE,
  McuEntry,
  SagaId,
  SAGA_METADATA,
} from './data/mcuTimeline';
import {
  computeTrackerSummary,
  FilterCriteria,
  filterTimelineEntries,
  formatRuntimeHours,
  MediaFilter,
  parseImportedProgress,
  SagaFilter,
  serializeProgress,
  StatusFilter,
} from './utils/trackerLogic';
import { HeroBento } from './components/HeroBento';
import { FloatingFilterBar } from './components/FloatingFilterBar';
import { TimelineCard } from './components/TimelineCard';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { DataManagementModal } from './components/DataManagementModal';

const STORAGE_WATCHED_KEY = 'mcu_chronos_watched_v1';
const STORAGE_NOTES_KEY = 'mcu_chronos_notes_v1';

const VALID_IDS = new Set<number>(MCU_TIMELINE.map((e) => e.id));

function loadInitialWatched(): Set<number> {
  try {
    const raw = window.localStorage.getItem(STORAGE_WATCHED_KEY);
    if (!raw) return new Set<number>();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<number>();
    return new Set<number>(
      parsed
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && VALID_IDS.has(id))
    );
  } catch {
    return new Set<number>();
  }
}

function loadInitialNotes(): Record<number, string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_NOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const clean: Record<number, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const id = Number(k);
      if (Number.isInteger(id) && VALID_IDS.has(id) && typeof v === 'string') {
        clean[id] = v;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export default function App() {
  const [watchedIds, setWatchedIds] = useState<Set<number>>(loadInitialWatched);
  const [notes, setNotes] = useState<Record<number, string>>(loadInitialNotes);
  const [criteria, setCriteria] = useState<FilterCriteria>({
    status: 'all',
    media: 'all',
    saga: 'all',
    searchQuery: '',
  });
  const [celebratingSaga, setCelebratingSaga] = useState<SagaId | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  const summary = useMemo(
    () => computeTrackerSummary(MCU_TIMELINE, watchedIds),
    [watchedIds]
  );

  // Track previous saga completion state so we only fire confetti on new 100% transitions
  const prevCompletionRef = useRef<{ infinity: boolean; multiverse: boolean }>({
    infinity: summary.infinity.isComplete,
    multiverse: summary.multiverse.isComplete,
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_WATCHED_KEY,
        JSON.stringify(Array.from(watchedIds).sort((a, b) => a - b))
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [watchedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));
    } catch {
      // Ignore storage quota errors
    }
  }, [notes]);

  useEffect(() => {
    const wasInfinityComplete = prevCompletionRef.current.infinity;
    const wasMultiverseComplete = prevCompletionRef.current.multiverse;

    if (!wasInfinityComplete && summary.infinity.isComplete) {
      setCelebratingSaga('infinity');
    } else if (!wasMultiverseComplete && summary.multiverse.isComplete) {
      setCelebratingSaga('multiverse');
    }

    prevCompletionRef.current = {
      infinity: summary.infinity.isComplete,
      multiverse: summary.multiverse.isComplete,
    };
  }, [summary.infinity.isComplete, summary.multiverse.isComplete]);

  const filteredEntries = useMemo(
    () => filterTimelineEntries(MCU_TIMELINE, watchedIds, criteria),
    [watchedIds, criteria]
  );

  const infinityFiltered = useMemo(
    () => filteredEntries.filter((e) => e.saga === 'infinity'),
    [filteredEntries]
  );

  const multiverseFiltered = useMemo(
    () => filteredEntries.filter((e) => e.saga === 'multiverse'),
    [filteredEntries]
  );

  const handleToggleWatched = useCallback((id: number) => {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleMarkWatched = useCallback((id: number) => {
    setWatchedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleQuickCompleteSaga = useCallback((saga: SagaId) => {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      for (const entry of MCU_TIMELINE) {
        if (entry.saga === saga) {
          next.add(entry.id);
        }
      }
      return next;
    });
  }, []);

  const handleSaveNote = useCallback((id: number, noteText: string) => {
    setNotes((prev) => {
      const trimmed = noteText.trim();
      const next = { ...prev };
      if (!trimmed) {
        delete next[id];
      } else {
        next[id] = trimmed;
      }
      return next;
    });
  }, []);

  const handleSelectSaga = useCallback((saga: SagaFilter) => {
    setCriteria((prev) => ({ ...prev, saga }));
  }, []);

  const handleStatusChange = useCallback((status: StatusFilter) => {
    setCriteria((prev) => ({ ...prev, status }));
  }, []);

  const handleMediaChange = useCallback((media: MediaFilter) => {
    setCriteria((prev) => ({ ...prev, media }));
  }, []);

  const handleSearchChange = useCallback((searchQuery: string) => {
    setCriteria((prev) => ({ ...prev, searchQuery }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setCriteria({
      status: 'all',
      media: 'all',
      saga: 'all',
      searchQuery: '',
    });
  }, []);

  const handleScrollToEntry = useCallback((id: number) => {
    const el = document.getElementById(`timeline-entry-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleImportJson = useCallback((rawJson: string): boolean => {
    const parsed = parseImportedProgress(rawJson, VALID_IDS);
    if (!parsed) return false;
    setWatchedIds(new Set(parsed.watchedIds));
    setNotes(parsed.notes);
    return true;
  }, []);

  const handleResetAll = useCallback(() => {
    setWatchedIds(new Set());
    setNotes({});
    setCelebratingSaga(null);
  }, []);

  const exportedJson = useMemo(
    () => serializeProgress(watchedIds, notes),
    [watchedIds, notes]
  );

  // Determine active ambient glow palette based on selected saga or current chronological era
  const isMultiverseMood =
    criteria.saga === 'multiverse' ||
    (criteria.saga === 'all' && summary.nextUpEntry?.saga === 'multiverse');

  const renderSagaTimelineSection = (
    sagaId: SagaId,
    entries: McuEntry[]
  ) => {
    if (entries.length === 0) return null;
    const meta = SAGA_METADATA[sagaId];
    const sagaStats =
      sagaId === 'infinity' ? summary.infinity : summary.multiverse;
    const isInfinity = sagaId === 'infinity';
    const sagaRuntime = formatRuntimeHours(sagaStats.totalMinutes);

    return (
      <section
        id={`saga-${sagaId}`}
        key={sagaId}
        aria-label={`${meta.title} (${meta.yearsRange})`}
        className="mb-14"
      >
        {/* Saga Header Banner */}
        <div
          className={`mb-8 overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-colors ${
            isInfinity
              ? 'border-amber-500/25 bg-gradient-to-r from-zinc-900/90 via-zinc-900/75 to-amber-950/25'
              : 'border-emerald-500/25 bg-gradient-to-r from-zinc-900/90 via-zinc-900/75 to-emerald-950/25'
          }`}
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-400">
                <span
                  className={
                    isInfinity
                      ? 'font-semibold text-amber-400'
                      : 'font-semibold text-emerald-400'
                  }
                >
                  ХРОНОЛОГИЧЕСКИЙ СЕКТОР: {meta.yearsRange}
                </span>
                <span aria-hidden="true">·</span>
                <span>{sagaStats.totalCount} ГЛАВ</span>
                <span aria-hidden="true">·</span>
                <span>{sagaRuntime.formatted}</span>
              </div>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {meta.title}{' '}
                <span className="font-mono text-lg font-normal text-zinc-400">
                  ({meta.yearsRange})
                </span>
              </h2>
              <p className="mt-1 text-sm text-zinc-300">{meta.subtitle}</p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end shrink-0">
              <div className="font-mono text-sm font-bold text-white tabular-nums">
                {sagaStats.watchedCount} / {sagaStats.totalCount} просмотрено (
                {sagaStats.percentage}%)
              </div>
              {sagaStats.isComplete ? (
                <div
                  className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold ${
                    isInfinity ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span>Ранг открыт: {meta.badgeTitle}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleQuickCompleteSaga(sagaId)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isInfinity
                      ? 'border-amber-500/35 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                      : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Отметить всю сагу</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vertical Timeline Spine & Cards */}
        <div className="relative pl-1 sm:pl-3">
          {/* Glowing Vertical Line connecting all nodes */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-7 bottom-10 left-[21px] sm:left-[29px] w-0.5 rounded-full ${
              isInfinity
                ? 'bg-gradient-to-b from-amber-500 via-[#ED1D24]/60 to-zinc-800 shadow-[0_0_12px_rgba(237,29,36,0.45)]'
                : 'bg-gradient-to-b from-emerald-400 via-purple-500/60 to-zinc-800 shadow-[0_0_12px_rgba(16,185,129,0.45)]'
            }`}
          />

          <div>
            {entries.map((entry) => (
              <TimelineCard
                key={entry.id}
                entry={entry}
                isWatched={watchedIds.has(entry.id)}
                isNextUp={summary.nextUpEntry?.id === entry.id}
                note={notes[entry.id] ?? ''}
                onToggleWatched={handleToggleWatched}
                onSaveNote={handleSaveNote}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-100 selection:bg-[#ED1D24]/30 selection:text-white">
      {/* Subtle Film Grain / Noise Texture */}
      <div
        aria-hidden="true"
        className="bg-noise pointer-events-none fixed inset-0 z-0"
      />

      {/* Dynamic Ambient Glow Spots that shift color between Infinity Saga (Amber/Crimson) and Multiverse Saga (Violet/Emerald) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div
          className={`absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full blur-[150px] transition-colors duration-1000 ${
            isMultiverseMood
              ? 'bg-emerald-500/16'
              : 'bg-[#ED1D24]/18'
          }`}
        />
        <div
          className={`absolute top-1/3 -right-24 h-[480px] w-[480px] rounded-full blur-[150px] transition-colors duration-1000 ${
            isMultiverseMood
              ? 'bg-purple-600/18'
              : 'bg-amber-500/15'
          }`}
        />
        <div
          className={`absolute -bottom-32 left-10 h-[420px] w-[420px] rounded-full blur-[140px] transition-colors duration-1000 ${
            isMultiverseMood
              ? 'bg-teal-500/12'
              : 'bg-orange-600/12'
          }`}
        />
      </div>

      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="relative z-20 border-b border-white/10 bg-[#09090B]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            MCU CHRONOS
          </a>

          {/* Zone 2: 4 concise single-line navigation links */}
          <nav
            aria-label="Основная навигация"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400"
          >
            <a
              href="#top"
              onClick={() => handleSelectSaga('all')}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Обзор
            </a>
            <a
              href="#saga-infinity"
              onClick={() => handleSelectSaga('all')}
              className="hover:text-amber-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Сага Бесконечности
            </a>
            <a
              href="#saga-multiverse"
              onClick={() => handleSelectSaga('all')}
              className="hover:text-emerald-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Сага Мультивселенной
            </a>
            <a
              href="#achievements"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Достижения
            </a>
          </nav>

          {/* Zone 3: 1 primary action button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsDataModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-100 hover:border-white/30 hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-amber-400" />
              <span>Экспорт и сброс</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="relative z-10 pb-20">
        {/* Interactive Hero Bento Section */}
        <HeroBento
          summary={summary}
          activeSaga={criteria.saga}
          onSelectSaga={handleSelectSaga}
          onMarkWatched={handleMarkWatched}
          onScrollToEntry={handleScrollToEntry}
          onQuickCompleteSaga={handleQuickCompleteSaga}
        />

        {/* Floating Filter Island Bar */}
        <FloatingFilterBar
          criteria={criteria}
          totalMatching={filteredEntries.length}
          onStatusChange={handleStatusChange}
          onMediaChange={handleMediaChange}
          onSearchChange={handleSearchChange}
          onResetFilters={handleResetFilters}
        />

        {/* Chronological Timeline Container */}
        <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
          {filteredEntries.length === 0 ? (
            <div
              data-testid="empty-filter-state"
              className="my-12 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/50 p-12 text-center backdrop-blur-xl"
            >
              <Sparkles className="h-8 w-8 text-amber-400 mb-3" />
              <h3 className="text-lg font-bold text-white">
                По вашему запросу глав не найдено
              </h3>
              <p className="mt-1 max-w-md text-sm text-zinc-400">
                Попробуйте изменить параметры фильтрации («Все», «Фильмы /
                Сериалы») или очистить поисковый запрос.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Показать все 26 глав хронологии</span>
              </button>
            </div>
          ) : (
            <>
              {renderSagaTimelineSection('infinity', infinityFiltered)}
              {renderSagaTimelineSection('multiverse', multiverseFiltered)}
            </>
          )}
        </div>

        {/* Achievements Showcase Anchor Section */}
        <section
          id="achievements"
          aria-label="Зал достижений хронологии"
          className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8"
        >
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="font-mono text-xs font-semibold text-zinc-400">
                  ЗАЛ ДОСТИЖЕНИЙ · АРХИВ УВИ
                </span>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Ранги Хранителя Хронологии
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Завершите 100% любой саги, чтобы разблокировать памятный
                  голографический знак отличия.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDataModalOpen(true)}
                className="self-start sm:self-center rounded-xl border border-white/15 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Резервная копия прогресса
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {(['infinity', 'multiverse'] as SagaId[]).map((sagaId) => {
                const meta = SAGA_METADATA[sagaId];
                const stats =
                  sagaId === 'infinity' ? summary.infinity : summary.multiverse;
                const isInfinity = sagaId === 'infinity';

                return (
                  <div
                    key={sagaId}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                      stats.isComplete
                        ? isInfinity
                          ? 'border-amber-500/40 bg-amber-500/10'
                          : 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-white/10 bg-zinc-950/60'
                    }`}
                  >
                    <img
                      src="/src/assets/images/badge_cosmic_chronicle_1795018604111.jpg"
                      alt={meta.badgeTitle}
                      referrerPolicy="no-referrer"
                      className={`h-14 w-14 shrink-0 rounded-xl object-cover border border-white/15 transition-all ${
                        stats.isComplete ? 'grayscale-0' : 'grayscale opacity-40'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[11px] text-zinc-400">
                        {meta.title} · {stats.watchedCount}/{stats.totalCount} (
                        {stats.percentage}%)
                      </div>
                      <div className="truncate text-sm font-bold text-white">
                        {meta.badgeTitle}
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-400">
                        {meta.badgeDescription}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Clean Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#09090B]/90 py-8 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div>
            MCU Chronos — Интерактивный хронологический трекер киновселенной Marvel
            (1942–2026)
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsDataModalOpen(true)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Экспорт / Импорт / Сброс
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="#top"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Наверх
            </a>
          </div>
        </div>
      </footer>

      {/* 100% Saga Completion Celebration Confetti & Badge Modal */}
      <CelebrationOverlay
        unlockedSaga={celebratingSaga}
        onDismiss={() => setCelebratingSaga(null)}
      />

      {/* Export / Import / Confirmed Reset Modal */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        exportedJson={exportedJson}
        watchedCount={summary.overall.watchedCount}
        onClose={() => setIsDataModalOpen(false)}
        onImportJson={handleImportJson}
        onResetAll={handleResetAll}
      />
    </div>
  );
}
