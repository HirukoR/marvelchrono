import React from 'react';
import { Film, RotateCcw, Search, Tv, X } from 'lucide-react';
import {
  FilterCriteria,
  MediaFilter,
  StatusFilter,
} from '../utils/trackerLogic';

interface FloatingFilterBarProps {
  criteria: FilterCriteria;
  totalMatching: number;
  onStatusChange: (status: StatusFilter) => void;
  onMediaChange: (media: MediaFilter) => void;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

export const FloatingFilterBar: React.FC<FloatingFilterBarProps> = ({
  criteria,
  totalMatching,
  onStatusChange,
  onMediaChange,
  onSearchChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    criteria.status !== 'all' ||
    criteria.media !== 'all' ||
    criteria.saga !== 'all' ||
    criteria.searchQuery.trim().length > 0;

  return (
    <div className="sm:sticky sm:top-3 z-30 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        role="region"
        aria-label="Панель фильтрации и поиска по хронологии"
        className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-zinc-950/85 p-3 shadow-2xl shadow-black/60 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between"
      >
        {/* Left: Status segmented filter ("Все", "Осталось посмотреть", "Просмотрено") */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Фильтр по статусу просмотра"
            className="inline-flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 border border-white/5"
          >
            <button
              type="button"
              onClick={() => onStatusChange('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                criteria.status === 'all'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Все
            </button>
            <button
              type="button"
              onClick={() => onStatusChange('unwatched')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                criteria.status === 'unwatched'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Осталось посмотреть
            </button>
            <button
              type="button"
              onClick={() => onStatusChange('watched')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                criteria.status === 'watched'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Просмотрено
            </button>
          </div>

          {/* Media Type Switcher ("Фильмы / Сериалы") */}
          <div
            role="group"
            aria-label="Фильтр по формату: Фильмы или Сериалы"
            className="inline-flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 border border-white/5"
          >
            <button
              type="button"
              onClick={() => onMediaChange('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                criteria.media === 'all'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Фильмы и сериалы
            </button>
            <button
              type="button"
              onClick={() => onMediaChange('movie')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                criteria.media === 'movie'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="h-3.5 w-3.5 shrink-0" />
              <span>Фильмы</span>
            </button>
            <button
              type="button"
              onClick={() => onMediaChange('series')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                criteria.media === 'series'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Tv className="h-3.5 w-3.5 shrink-0" />
              <span>Сериалы</span>
            </button>
          </div>
        </div>

        {/* Right: Instant Search + Counter + Clear */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={criteria.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Поиск фильма, года, события..."
              aria-label="Поиск фильма, года или события"
              className="w-full rounded-xl border border-white/10 bg-zinc-900/90 py-2 pl-9 pr-8 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
            />
            {criteria.searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Очистить поиск"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <span
            data-testid="filtered-count"
            className="hidden sm:inline-block font-mono text-xs text-zinc-400 whitespace-nowrap shrink-0 tabular-nums"
          >
            Найдено: <strong className="text-zinc-100">{totalMatching}</strong>
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              aria-label="Сбросить активные фильтры"
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Сбросить</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
