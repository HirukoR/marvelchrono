import React, { useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Film,
  MessageSquarePlus,
  Sparkles,
  Tv,
} from 'lucide-react';
import { McuEntry } from '../data/mcuTimeline';
import { formatRuntimeHours } from '../utils/trackerLogic';

interface TimelineCardProps {
  entry: McuEntry;
  isWatched: boolean;
  isNextUp: boolean;
  note: string;
  onToggleWatched: (id: number) => void;
  onSaveNote: (id: number, note: string) => void;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  entry,
  isWatched,
  isNextUp,
  note,
  onToggleWatched,
  onSaveNote,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftNote, setDraftNote] = useState(note);

  const isInfinity = entry.saga === 'infinity';
  const runtime = formatRuntimeHours(entry.runtimeMinutes);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--spot-x', `${x}px`);
    el.style.setProperty('--spot-y', `${y}px`);
  };

  const handleNoteBlur = () => {
    if (draftNote !== note) {
      onSaveNote(entry.id, draftNote);
    }
  };

  return (
    <div
      id={`timeline-entry-${entry.id}`}
      data-testid={`timeline-card-${entry.id}`}
      className="relative flex gap-4 sm:gap-6"
    >
      {/* Left Vertical Timeline Node Indicator */}
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={() => onToggleWatched(entry.id)}
          aria-label={
            isWatched
              ? `Отметить «${entry.title}» как непросмотренное`
              : `Отметить «${entry.title}» как просмотренное`
          }
          className={`relative z-10 mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${
            isWatched
              ? isInfinity
                ? 'border-amber-400 bg-gradient-to-br from-amber-500 to-[#ED1D24] text-white shadow-[0_0_18px_rgba(237,29,36,0.65)] scale-105'
                : 'border-emerald-400 bg-gradient-to-br from-emerald-500 to-purple-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.65)] scale-105'
              : isNextUp
                ? isInfinity
                  ? 'border-amber-400 bg-zinc-950 text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)]'
                  : 'border-emerald-400 bg-zinc-950 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                : 'border-white/20 bg-zinc-950 text-zinc-500 hover:border-white/40 hover:text-zinc-300'
          }`}
        >
          {/* Current Next-Up node rings softly */}
          {isNextUp && !isWatched && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute -inset-1.5 rounded-full border-2 opacity-75 animate-ping ${
                isInfinity ? 'border-amber-400/60' : 'border-emerald-400/60'
              }`}
            />
          )}
          {isWatched ? (
            <Check className="h-4 w-4 stroke-[2.5]" />
          ) : (
            <span className="font-mono text-xs font-bold tabular-nums">
              {String(entry.order).padStart(2, '0')}
            </span>
          )}
        </button>
      </div>

      {/* Right Glassmorphic Card with Spotlight Hover Effect */}
      <article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className={`group relative mb-5 flex-1 overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
          isWatched
            ? isInfinity
              ? 'border-amber-500/25 bg-zinc-900/45'
              : 'border-emerald-500/25 bg-zinc-900/45'
            : isNextUp
              ? isInfinity
                ? 'border-amber-500/50 bg-zinc-900/80 shadow-xl shadow-[#ED1D24]/10'
                : 'border-emerald-500/50 bg-zinc-900/80 shadow-xl shadow-emerald-500/10'
              : 'border-white/10 bg-zinc-900/55 hover:border-white/25'
        }`}
      >
        {/* Dynamic Spotlight Hover Layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: isInfinity
              ? 'radial-gradient(480px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(245, 158, 11, 0.13), rgba(237, 29, 36, 0.05), transparent 70%)'
              : 'radial-gradient(480px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(16, 185, 129, 0.14), rgba(168, 85, 247, 0.06), transparent 70%)',
          }}
        />

        <div className="relative z-10 p-5 sm:p-6">
          {/* Top Metadata Line (Clean unboxed text with · separators) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-400 tabular-nums">
              <span
                className={`font-bold ${
                  isInfinity ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                #{String(entry.order).padStart(2, '0')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-zinc-200">
                Хронология: {entry.timelineEra}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-zinc-300">
                {entry.mediaKind === 'movie' ? (
                  <Film className="h-3.5 w-3.5 text-zinc-400" />
                ) : (
                  <Tv className="h-3.5 w-3.5 text-zinc-400" />
                )}
                {entry.formatLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>Выход: {entry.releaseYear}</span>
              <span aria-hidden="true">·</span>
              <span>{runtime.formatted}</span>
            </div>

            {isNextUp && !isWatched && (
              <span
                className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${
                  isInfinity ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Следующий по хронологии</span>
              </span>
            )}
          </div>

          {/* Main Content Row: Title + Description + Tactile Watch Toggle Button */}
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <h3
                className={`text-lg font-bold tracking-tight sm:text-xl transition-colors ${
                  isWatched ? 'text-zinc-300' : 'text-white'
                }`}
              >
                {entry.title}{' '}
                <span className="font-mono text-sm font-normal text-zinc-400">
                  ({entry.releaseYear})
                </span>
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                {entry.synopsis}
              </p>
            </div>

            {/* Tactile Checkbox Button */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => onToggleWatched(entry.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-150 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                  isWatched
                    ? isInfinity
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
                      : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                    : 'border-white/15 bg-zinc-800/90 text-zinc-100 hover:border-white/30 hover:bg-zinc-700/90'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    isWatched
                      ? isInfinity
                        ? 'border-amber-400 bg-amber-500 text-zinc-950'
                        : 'border-emerald-400 bg-emerald-500 text-zinc-950'
                      : 'border-zinc-500 bg-transparent'
                  }`}
                >
                  {isWatched && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
                <span>{isWatched ? 'Просмотрено' : 'Отметить'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                aria-label={`Подробности и заметка к «${entry.title}»`}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 p-2.5 text-zinc-400 hover:border-white/25 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Note preview if note exists and collapsed */}
          {note && !isExpanded && (
            <div className="mt-3 border-t border-white/5 pt-2.5 font-mono text-xs text-zinc-400">
              Заметка архангела УВИ: <span className="text-zinc-200">{note}</span>
            </div>
          )}

          {/* Expandable Details & Personal Chronicle Note */}
          {isExpanded && (
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-xs text-zinc-300">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono">
                <div>
                  <span className="text-zinc-500">Ключевой элемент: </span>
                  <span className="text-zinc-200">{entry.keyArtifact}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Сцены после титров: </span>
                  <span className="text-zinc-200">
                    {entry.postCreditsCount > 0
                      ? `${entry.postCreditsCount} сц.`
                      : 'Нет (звук молота в титрах)'}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`note-input-${entry.id}`}
                  className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] text-zinc-400"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  <span>Личная заметка или впечатление о просмотре</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id={`note-input-${entry.id}`}
                    type="text"
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    onBlur={handleNoteBlur}
                    placeholder="Добавьте любимую цитату, оценку или момент..."
                    className="flex-1 rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onSaveNote(entry.id, draftNote)}
                    className="rounded-xl border border-white/15 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};
