import assert from 'node:assert/strict';
import { test } from 'node:test';
import { breathAt, dotAt, scaleAt, SESSION_MS } from '../src/lib/breath.ts';
import { toJson, toMarkdown } from '../src/lib/krok.ts';
import { average, MAX_DELAY_MS, MIN_DELAY_MS, randomDelay } from '../src/lib/reaction.ts';

test('box breathing walks 4 phases of 4 s for 2 minutes', () => {
  assert.deepEqual([0, 4000, 8000, 12000, 16000].map((t) => breathAt(t).label), ['Wdech', 'Zatrzymaj', 'Wydech', 'Zatrzymaj', 'Wdech']);
  assert.equal(breathAt(0).secondsLeft, 120);
  assert.equal(breathAt(16000).cycles, 1);
  assert.equal(breathAt(SESSION_MS - 1).done, false);
  const end = breathAt(SESSION_MS + 5000);
  assert.equal(end.done, true);
  assert.equal(end.secondsLeft, 0);
  assert.equal(end.cycles, 7);
  assert.equal(breathAt(-50).phase, 0);
});

test('the dot travels the square and the fill grows on the inhale', () => {
  assert.deepEqual(dotAt(0, 0, 100), [0, 100]);
  assert.deepEqual(dotAt(0, 1, 100), [0, 0]);
  assert.deepEqual(dotAt(1, 1, 100), [100, 0]);
  assert.deepEqual(dotAt(2, 1, 100), [100, 100]);
  assert.deepEqual(dotAt(3, 1, 100), [0, 100]);
  assert.equal(scaleAt(0, 0), 0.6);
  assert.equal(scaleAt(0, 1), 1);
  assert.equal(scaleAt(2, 1), 0.6);
});

test('reaction delay stays in range and the average is rounded', () => {
  assert.equal(randomDelay(() => 0), MIN_DELAY_MS);
  assert.ok(randomDelay(() => 0.9999) < MAX_DELAY_MS);
  assert.equal(average([300, 301, 302]), 301);
  assert.equal(average([250, 251]), 251);
  assert.equal(average([]), null);
});

test('export holds the schema marker and every result', () => {
  const session = { date: '2026-11-14T10:00:00.000Z', breathing: { completed: true, seconds: 120, cycles: 7 }, reaction: { trials: [300, 310, 320], averageMs: 310 } };
  const md = toMarkdown(session);
  assert.match(md, /^## Szybki reset · 2026-11-14$/m);
  assert.match(md, /\| Oddech 4-4-4-4 \| 120 s, 7 cykli, ukończone \|/);
  assert.match(md, /\| Czas reakcji \| śr\. 310 ms \(300, 310, 320\) \|/);
  assert.match(md, /<!-- krok\.session\/v1 source=satori-quick-reset date=2026-11-14T10:00:00\.000Z -->$/);
  assert.deepEqual(toJson(session), { schema: 'krok.session/v1', source: 'satori-quick-reset', ...session });
  const partial = (n: number) => toMarkdown({ ...session, breathing: { completed: false, seconds: 30, cycles: n } });
  assert.deepEqual([0, 1, 2, 5, 12, 22].map((n) => /30 s, (\d+ \S+),/.exec(partial(n))?.[1]), ['0 cykli', '1 cykl', '2 cykle', '5 cykli', '12 cykli', '22 cykle']);
  assert.match(toMarkdown({ ...session, breathing: null, reaction: null }), /\| Oddech 4-4-4-4 \| nie wykonano \|\n\| Czas reakcji \| nie wykonano \|/);
});
