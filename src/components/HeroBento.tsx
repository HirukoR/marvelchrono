import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Film,
  Layers,
  Lock,
  Play,
  Sparkles,
  Tv,
} from 'lucide-react';
import { McuEntry, SagaId, SAGA_METADATA } from '../data/mcuTimeline';
import {
  formatRuntimeHours,
  SagaFilter,
  TrackerSummary,
} from '../utils/trackerLogic';

interface HeroBentoProps {
  summary: TrackerSummary;
  activeSaga: SagaFilter;
  onSelectSaga: (saga: SagaFilter) => void;
  onMarkWatched: (id: number) => void;
  onScrollToEntry: (id: number) => void;
  onQuickCompleteSaga: (saga: SagaId) => void;
}

export const HeroBento: React.FC<HeroBentoProps> = ({
  summary,
  activeSaga,
  onSelectSaga,
  onMarkWatched,
  onScrollToEntry,
  onQuickCompleteSaga,
}) => {
  const { overall, infinity, multiverse, nextUpEntry } = summary;
  const totalTime = formatRuntimeHours(overall.totalMinutes);
  const watchedTime = formatRuntimeHours(overall.watchedMinutes);

  // SVG Radial progress math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (overall.percentage / 100) * circumference;

  const isMultiverseFocus =
    activeSaga === 'multiverse' ||
    (activeSaga === 'all' && nextUpEntry?.saga === 'multiverse');

  const activeBackdrop = isMultiverseFocus
    ? SAGA_METADATA.multiverse.backdropImage
    : SAGA_METADATA.infinity.backdropImage;

  return (
    <section
      aria-label="Сводка хронологии и текущий прогресс"
      className="relative mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6 lg:px-8"
    >
      {/* Hero Headline & Saga Mood Switcher */}
      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span>STARK CHRONOS</span>
            <span aria-hidden="true">·</span>
            <span>АРХИВ УВИ</span>
            <span aria-hidden="true">·</span>
            <span>1942 — 2026</span>
            <span aria-hidden="true">·</span>
            <span>26 КЛЮЧЕВЫХ СОБЫТИЙ</span>
          </div>
          <h1
            style={{ textWrap: 'balance' }}
            className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
          >
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Хронология киновселенной{' '}
            </span>
            <span
              className={
                isMultiverseFocus
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-amber-400 via-orange-400 to-[#ED1D24] bg-clip-text text-transparent'
              }
            >
              Marvel
            </span>
          </h1>
          <p className="mt-3 text-base text-zinc-400 sm:text-lg">
            Интерактивный навигатор по Священному таймлайну в строгом порядке
            хронологии событий: от создания Тессеракта в 1942 году до разветвления
            Мультивселенной.
          </p>
        </div>

        {/* Saga Segmented Switcher (changes ambient glow palette) */}
        <div
          role="group"
          aria-label="Выбор саги"
          className="inline-flex flex-wrap items-center gap-1.5 self-start rounded-xl border border-white/10 bg-zinc-900/80 p-1.5 backdrop-blur-md lg:self-auto"
        >
          <button
            type="button"
            onClick={() => onSelectSaga('all')}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeSaga === 'all'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            Все саги (26)
          </button>
          <button
            type="button"
            onClick={() => onSelectSaga('infinity')}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeSaga === 'infinity'
                ? 'bg-gradient-to-r from-[#ED1D24] to-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-amber-300'
            }`}
          >
            Сага Бесконечности (18)
          </button>
          <button
            type="button"
            onClick={() => onSelectSaga('multiverse')}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeSaga === 'multiverse'
                ? 'bg-gradient-to-r from-emerald-600 to-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            Сага Мультивселенной (8)
          </button>
        </div>
      </div>

      {/* Bento Grid: 12 columns on lg */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
        {/* Card 1: "Следующий по хронологии" (7 cols) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl lg:col-span-7">
          {/* Background generated artwork with measured dark scrim */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={activeBackdrop}
              alt="Хронологический фон саги"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-[#09090B]/40" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-amber-400">
                <Compass className="h-4 w-4 shrink-0" />
                <span>СЛЕДУЮЩИЙ ПО ХРОНОЛОГИИ</span>
              </div>
              {nextUpEntry && (
                <span className="font-mono text-xs text-zinc-400 tabular-nums">
                  ГЛАВА #{String(nextUpEntry.order).padStart(2, '0')} ИЗ 26
                </span>
              )}
            </div>

            {nextUpEntry ? (
              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-300">
                  <span
                    className={
                      nextUpEntry.saga === 'infinity'
                        ? 'text-amber-400 font-semibold'
                        : 'text-emerald-400 font-semibold'
                    }
                  >
                    {SAGA_METADATA[nextUpEntry.saga].title}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>События: {nextUpEntry.timelineEra}</span>
                  <span aria-hidden="true">·</span>
                  <span>{nextUpEntry.formatLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>Выход: {nextUpEntry.releaseYear}</span>
                </div>

                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {nextUpEntry.title}{' '}
                  <span className="font-mono text-lg font-normal text-zinc-400 sm:text-2xl">
                    ({nextUpEntry.releaseYear})
                  </span>
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                  {nextUpEntry.synopsis}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-400">
                  <span>
                    Хронометраж:{' '}
                    <strong className="text-zinc-200">
                      {formatRuntimeHours(nextUpEntry.runtimeMinutes).formatted}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Артефакт:{' '}
                    <strong className="text-zinc-200">
                      {nextUpEntry.keyArtifact}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Сцены после титров:{' '}
                    <strong className="text-zinc-200">
                      {nextUpEntry.postCreditsCount}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6 py-4">
                <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  <span>ВСЕ 26 ГЛАВ ПРОСМОТРЕНЫ</span>
                </div>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Священный таймлайн полностью пройден!
                </h2>
                <p className="mt-2 max-w-xl text-sm text-zinc-300">
                  Вы прошли весь хронологический маршрут от Второй мировой войны
                  (1942) до финала Стражей Галактики (2026) и открыли оба высших
                  звания.
                </p>
              </div>
            )}
          </div>

          {nextUpEntry && (
            <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => onMarkWatched(nextUpEntry.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  nextUpEntry.saga === 'infinity'
                    ? 'bg-gradient-to-r from-[#ED1D24] to-amber-600 hover:brightness-110 shadow-[#ED1D24]/20'
                    : 'bg-gradient-to-r from-emerald-600 to-purple-600 hover:brightness-110 shadow-emerald-600/20'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Отметить просмотренным</span>
              </button>

              <button
                type="button"
                onClick={() => onScrollToEntry(nextUpEntry.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-zinc-900/80 px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 shrink-0" />
                <span>К карточке в таймлайне</span>
              </button>
            </div>
          )}
        </div>

        {/* Card 2: Radial Progress + Saga Breakdown + Badges (5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl lg:col-span-5">
          {/* Top row: Radial Gauge + Hours Counter */}
          <div className="flex items-center gap-5">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
              <svg
                className="h-32 w-32 -rotate-90 transform"
                viewBox="0 0 128 128"
                aria-label={`Общий прогресс: ${overall.percentage}%`}
              >
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="transparent"
                  stroke="url(#progressGradient)"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient
                    id="progressGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    {isMultiverseFocus ? (
                      <>
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#A855F7" />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#ED1D24" />
                      </>
                    )}
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  data-testid="overall-percentage"
                  className="font-mono text-2xl font-bold text-white tabular-nums"
                >
                  {overall.percentage}%
                </span>
                <span
                  data-testid="overall-count"
                  className="font-mono text-[11px] text-zinc-400 tabular-nums"
                >
                  {overall.watchedCount}/{overall.totalCount}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="font-mono text-xs font-medium text-zinc-400">
                ХРОНОМЕТРАЖ ПРОСМОТРА
              </span>
              <div
                data-testid="watched-runtime"
                className="mt-1 font-mono text-xl font-bold text-white tabular-nums sm:text-2xl"
              >
                {watchedTime.formatted}
              </div>
              <div className="mt-0.5 font-mono text-xs text-zinc-400 tabular-nums">
                из {totalTime.formatted} общего времени
              </div>
              <div className="mt-3 flex items-center gap-3 font-mono text-xs text-zinc-300">
                <span className="inline-flex items-center gap-1">
                  <Film className="h-3.5 w-3.5 text-amber-400" />
                  24 фильма
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Tv className="h-3.5 w-3.5 text-emerald-400" />2 сериала
                </span>
              </div>
            </div>
          </div>

          {/* Separate Progress Bars per Saga */}
          <div className="mt-6 space-y-4 border-t border-white/10 pt-4">
            {/* Infinity Saga Bar */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onSelectSaga('infinity')}
                  className="font-semibold text-zinc-200 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Сага Бесконечности (1942–2023)
                </button>
                <span
                  data-testid="infinity-progress-text"
                  className="font-mono text-zinc-300 tabular-nums"
                >
                  {infinity.watchedCount}/{infinity.totalCount} ({infinity.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#ED1D24] transition-all duration-500"
                  style={{ width: `${infinity.percentage}%` }}
                />
              </div>
            </div>

            {/* Multiverse Saga Bar */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onSelectSaga('multiverse')}
                  className="font-semibold text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Сага Мультивселенной (2023–2026)
                </button>
                <span
                  data-testid="multiverse-progress-text"
                  className="font-mono text-zinc-300 tabular-nums"
                >
                  {multiverse.watchedCount}/{multiverse.totalCount} ({multiverse.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${multiverse.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gamification Badges Status */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium text-zinc-400">
                РАНГОВЫЕ ДОСТИЖЕНИЯ САГ
              </span>
              <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                {(infinity.isComplete ? 1 : 0) + (multiverse.isComplete ? 1 : 0)}/2 ОТКРЫТО
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Badge 1: Infinity Stones Keeper */}
              <div
                data-testid="badge-infinity"
                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all ${
                  infinity.isComplete
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                    : 'border-white/5 bg-zinc-950/50 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {infinity.isComplete ? (
                    <Award className="h-4 w-4 shrink-0 text-amber-400" />
                  ) : (
                    <Lock className="h-4 w-4 shrink-0 text-zinc-500" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200">
                      Хранитель Камней Бесконечности
                    </div>
                    <div className="font-mono text-[10px] opacity-80">
                      {infinity.isComplete ? 'Разблокировано (100%)' : 'Требуется 18/18 глав'}
                    </div>
                  </div>
                </div>
                {!infinity.isComplete && (
                  <button
                    type="button"
                    onClick={() => onQuickCompleteSaga('infinity')}
                    title="Отметить всю Сагу Бесконечности просмотренной"
                    className="ml-2 rounded-md border border-white/10 bg-zinc-900 px-2.5 py-1 font-mono text-[10px] text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    100%
                  </button>
                )}
              </div>

              {/* Badge 2: TVA Agent */}
              <div
                data-testid="badge-multiverse"
                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all ${
                  multiverse.isComplete
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-white/5 bg-zinc-950/50 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {multiverse.isComplete ? (
                    <Award className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <Lock className="h-4 w-4 shrink-0 text-zinc-500" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200">
                      Агент УВИ
                    </div>
                    <div className="font-mono text-[10px] opacity-80">
                      {multiverse.isComplete ? 'Разблокировано (100%)' : 'Требуется 8/8 глав'}
                    </div>
                  </div>
                </div>
                {!multiverse.isComplete && (
                  <button
                    type="button"
                    onClick={() => onQuickCompleteSaga('multiverse')}
                    title="Отметить всю Сагу Мультивселенной просмотренной"
                    className="ml-2 rounded-md border border-white/10 bg-zinc-900 px-2.5 py-1 font-mono text-[10px] text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    100%
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
