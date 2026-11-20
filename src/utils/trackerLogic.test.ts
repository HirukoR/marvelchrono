import test from 'node:test';
import assert from 'node:assert/strict';
import { MCU_TIMELINE } from '../data/mcuTimeline';
import {
  computeTrackerSummary,
  filterTimelineEntries,
  formatRuntimeHours,
  parseImportedProgress,
  serializeProgress,
} from './trackerLogic';

test('MCU_TIMELINE contains strictly 26 ordered entries (18 Infinity + 8 Multiverse)', () => {
  assert.equal(MCU_TIMELINE.length, 26);
  const infinity = MCU_TIMELINE.filter((e) => e.saga === 'infinity');
  const multiverse = MCU_TIMELINE.filter((e) => e.saga === 'multiverse');
  assert.equal(infinity.length, 18);
  assert.equal(multiverse.length, 8);
  assert.equal(MCU_TIMELINE[0].title, 'Первый мститель');
  assert.equal(MCU_TIMELINE[17].title, 'Мстители: Финал');
  assert.equal(MCU_TIMELINE[18].title, 'Локи');
  assert.equal(MCU_TIMELINE[25].title, 'Стражи Галактики. Часть 3');
});

test('computeTrackerSummary finds first unwatched chronological item and calculates stats', () => {
  const watched = new Set<number>([1, 2]);
  const summary = computeTrackerSummary(MCU_TIMELINE, watched);

  assert.equal(summary.overall.watchedCount, 2);
  assert.equal(summary.overall.totalCount, 26);
  assert.equal(summary.infinity.watchedCount, 2);
  assert.equal(summary.multiverse.watchedCount, 0);
  assert.equal(summary.nextUpEntry?.id, 3);
  assert.equal(summary.nextUpEntry?.title, 'Железный человек');
});

test('computeTrackerSummary unlocks saga completion when all saga items are watched', () => {
  const infinityIds = new Set<number>(
    MCU_TIMELINE.filter((e) => e.saga === 'infinity').map((e) => e.id)
  );
  const summary = computeTrackerSummary(MCU_TIMELINE, infinityIds);

  assert.equal(summary.infinity.isComplete, true);
  assert.equal(summary.infinity.percentage, 100);
  assert.equal(summary.multiverse.isComplete, false);
  assert.equal(summary.nextUpEntry?.id, 19);
  assert.equal(summary.nextUpEntry?.title, 'Локи');
});

test('filterTimelineEntries filters by status, media kind, saga, and search query', () => {
  const watched = new Set<number>([1, 19]);

  const seriesOnly = filterTimelineEntries(MCU_TIMELINE, watched, {
    status: 'all',
    media: 'series',
    saga: 'all',
    searchQuery: '',
  });
  assert.equal(seriesOnly.length, 2);
  assert.equal(seriesOnly[0].title, 'Локи');
  assert.equal(seriesOnly[1].title, 'Ванда/Вижн');

  const watchedInMultiverse = filterTimelineEntries(MCU_TIMELINE, watched, {
    status: 'watched',
    media: 'all',
    saga: 'multiverse',
    searchQuery: '',
  });
  assert.equal(watchedInMultiverse.length, 1);
  assert.equal(watchedInMultiverse[0].id, 19);

  const searchTesseract = filterTimelineEntries(MCU_TIMELINE, watched, {
    status: 'all',
    media: 'all',
    saga: 'all',
    searchQuery: 'Тессеракт',
  });
  assert.equal(searchTesseract.length, 1);
  assert.equal(searchTesseract[0].id, 1);
});

test('formatRuntimeHours formats total minutes into Russian hours and minutes', () => {
  const res = formatRuntimeHours(125);
  assert.equal(res.hours, 2);
  assert.equal(res.mins, 5);
  assert.equal(res.formatted, '2 ч 05 мин');
});

test('serializeProgress and parseImportedProgress round-trip valid IDs and notes', () => {
  const validIds = new Set(MCU_TIMELINE.map((e) => e.id));
  const originalWatched = new Set<number>([1, 6, 18]);
  const originalNotes = { 6: 'Сбор в Нью-Йорке!' };

  const json = serializeProgress(originalWatched, originalNotes);
  const parsed = parseImportedProgress(json, validIds);

  assert.ok(parsed);
  assert.deepEqual(parsed.watchedIds, [1, 6, 18]);
  assert.equal(parsed.notes[6], 'Сбор в Нью-Йорке!');
});
