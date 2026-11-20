import React, { useEffect, useState } from 'react';
import { Award, Sparkles, X } from 'lucide-react';
import { SagaId, SAGA_METADATA } from '../data/mcuTimeline';

interface CelebrationOverlayProps {
  unlockedSaga: SagaId | null;
  onDismiss: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  unlockedSaga,
  onDismiss,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!unlockedSaga) return;

    const palette =
      unlockedSaga === 'infinity'
        ? ['#F59E0B', '#ED1D24', '#FBBF24', '#FEF08A', '#FB7185']
        : ['#10B981', '#A855F7', '#34D399', '#C084FC', '#F59E0B'];

    const generated: Particle[] = Array.from({ length: 44 }, (_, idx) => ({
      id: idx,
      x: 50 + (Math.random() - 0.5) * 30,
      y: 45 + (Math.random() - 0.5) * 20,
      angle: Math.random() * Math.PI * 2,
      distance: 100 + Math.random() * 260,
      size: 5 + Math.random() * 7,
      color: palette[idx % palette.length],
      delay: Math.random() * 0.25,
    }));

    setParticles(generated);

    const timer = window.setTimeout(() => {
      onDismiss();
    }, 6500);

    return () => window.clearTimeout(timer);
  }, [unlockedSaga, onDismiss]);

  if (!unlockedSaga) return null;

  const meta = SAGA_METADATA[unlockedSaga];
  const isInfinity = unlockedSaga === 'infinity';

  return (
    <div
      role="dialog"
      aria-label={`Разблокирован ранг: ${meta.badgeTitle}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      {/* Confetti / Energy Flash Particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {particles.map((p) => {
          const tx = Math.cos(p.angle) * p.distance;
          const ty = Math.sin(p.angle) * p.distance;
          return (
            <span
              key={p.id}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 14px ${p.color}`,
                transform: `translate(${tx}px, ${ty}px)`,
                transition: `transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${p.delay}s, opacity 1.1s ease-out ${p.delay}s`,
              }}
              className="absolute rounded-sm opacity-90"
            />
          );
        })}
      </div>

      {/* Badge Modal Card */}
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border bg-zinc-950/95 p-6 shadow-2xl transition-all ${
          isInfinity
            ? 'border-amber-500/40 shadow-amber-500/15'
            : 'border-emerald-500/40 shadow-emerald-500/15'
        }`}
      >
        <div
          className={`pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full blur-3xl opacity-35 ${
            isInfinity
              ? 'bg-gradient-to-r from-amber-500 to-[#ED1D24]'
              : 'bg-gradient-to-r from-emerald-500 to-purple-600'
          }`}
        />

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Закрыть уведомление о награде"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-inner">
            <img
              src="/src/assets/images/badge_cosmic_chronicle_1795018604111.jpg"
              alt={meta.badgeTitle}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mb-1 flex items-center gap-1.5 font-mono text-xs font-medium text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% САГИ ЗАВЕРШЕНО</span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-white">
            {meta.badgeTitle}
          </h3>

          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            {meta.badgeDescription}. Ваш хронологический архив синхронизирован.
          </p>

          <div className="mt-6 flex w-full items-center justify-center">
            <button
              type="button"
              onClick={onDismiss}
              className={`w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all ${
                isInfinity
                  ? 'bg-gradient-to-r from-[#ED1D24] to-amber-600 hover:brightness-110'
                  : 'bg-gradient-to-r from-emerald-600 to-purple-600 hover:brightness-110'
              }`}
            >
              Продолжить хронологию
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
