import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pickFrom, rollSlot, roll, isRemix, sameVibe, sameValue, firstVibe,
} from './reroll.js';
import { THEMES, PALETTES, paletteFor, themeFor } from './seeds.js';

// a repeatable random source
function seeded(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
// a random source that returns these values in turn
const sequence = (...values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

test('picks from the primary pool, never the current value', () => {
  assert.equal(pickFrom(['a', 'b'], ['x', 'y'], 'a', 0.75, sequence(0.1, 0.99)), 'b');
  // over the chance: the global pool
  assert.equal(pickFrom(['a', 'b'], ['x', 'y'], 'a', 0.75, sequence(0.9, 0)), 'x');
  // the primary pool has nothing new: falls back to the global one
  assert.equal(pickFrom(['a'], ['a', 'z'], 'a', 1, sequence(0, 0)), 'z');
  // nothing new anywhere: keeps the current value
  assert.equal(pickFrom(['a'], ['a'], 'a', 1, Math.random), 'a');
});

test('compares slot values by what they show', () => {
  assert.ok(sameValue(paletteFor('cherry'), { ...paletteFor('cherry') }));
  assert.ok(sameValue(['a', 'b'], ['a', 'b']));
  assert.ok(!sameValue(['a', 'b'], ['b', 'a']));
  assert.ok(sameValue(null, undefined));
});

test('rolls one slot and leaves the rest', () => {
  const start = firstVibe();
  const next = rollSlot(start, 'sound', seeded(3));
  assert.notEqual(next.sound, start.sound);
  ['themeId', 'palette', 'menu', 'table', 'moment'].forEach((key) => assert.equal(next[key], start[key]));
});

test('a new theme always differs, and its slots follow it', () => {
  const random = seeded(7);
  let vibe = firstVibe();
  for (let i = 0; i < 40; i += 1) {
    const { vibe: next } = roll(vibe, undefined, [], random);
    assert.notEqual(next.themeId, vibe.themeId);
    assert.ok(themeFor(next.themeId));
    assert.ok(PALETTES.includes(next.palette));
    vibe = next;
  }
});

test('mostly stays within the theme, sometimes remixes', () => {
  const random = seeded(11);
  let own = 0;
  let vibe = firstVibe();
  for (let i = 0; i < 400; i += 1) {
    vibe = roll(vibe, undefined, [], random).vibe;
    if (!isRemix(vibe)) own += 1;
  }
  // 75% chance of the theme's own palettes, plus global picks that happen to be in the theme's set
  assert.ok(own > 280 && own < 380, `own palette ${own}/400`);
});

test('locked slots never change', () => {
  const random = seeded(5);
  const start = firstVibe();
  let vibe = start;
  for (let i = 0; i < 25; i += 1) {
    const result = roll(vibe, undefined, ['theme', 'palette', 'moment'], random);
    assert.deepEqual(result.changed, ['menu', 'table', 'sound']);
    vibe = result.vibe;
    assert.equal(vibe.themeId, start.themeId);
    assert.equal(vibe.palette, start.palette);
    assert.equal(vibe.moment, start.moment);
  }
});

test('everything locked: nothing changes', () => {
  const start = firstVibe();
  const keys = ['theme', 'palette', 'menu', 'table', 'sound', 'moment'];
  const { vibe, changed } = roll(start, keys, keys, seeded(2));
  assert.deepEqual(changed, []);
  assert.equal(vibe, start);
});

test('the same random source gives the same vibe', () => {
  const a = roll(firstVibe(), undefined, [], seeded(42)).vibe;
  const b = roll(firstVibe(), undefined, [], seeded(42)).vibe;
  assert.ok(sameVibe(a, b));
});

test('a vibe without a theme rolls from every theme', () => {
  const vibe = { ...firstVibe(), themeId: null };
  const next = rollSlot(vibe, 'menu', seeded(9));
  assert.ok(THEMES.some((t) => t.menus.includes(next.menu)));
  assert.equal(isRemix(vibe), false);
});
