import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PALETTES, THEMES, SLOTS, ALL, paletteFor, themeFor,
} from './seeds.js';
import { moods, moodFor, decorFor } from './moods.js';

test('keeps the original table moods as palette ids', () => {
  ['gingham', 'ice', 'candlelight', 'garden', 'citrus', 'plum', 'linen'].forEach((id) => {
    assert.equal(moodFor(id).id, id);
    assert.equal(paletteFor(id).id, id);
  });
  assert.equal(moods, PALETTES);
  assert.equal(moodFor('nope').id, 'gingham');
});

test('every palette has the colours the table needs', () => {
  const keys = ['wood', 'cloth', 'plate', 'charger', 'napkin', 'leaves', 'metal', 'candle', 'glass', 'backdrop'];
  PALETTES.forEach((p) => {
    keys.forEach((key) => assert.match(p[key], /^#[0-9a-f]{6}$/, `${p.id}.${key}`));
    assert.equal(p.flowers.length, 3, p.id);
    assert.equal(new Set(PALETTES.map((x) => x.id)).size, PALETTES.length);
  });
});

test('every theme points at real palettes and has something in each pool', () => {
  THEMES.forEach((t) => {
    t.palettes.forEach((id) => assert.ok(paletteFor(id), `${t.id} → ${id}`));
    ['menus', 'tables', 'sounds', 'moments'].forEach((pool) => assert.ok(t[pool].length > 0, `${t.id}.${pool}`));
  });
  assert.equal(themeFor('pie').name, 'Pie party');
  assert.equal(themeFor('nope'), null);
  assert.equal(ALL.menu.length, THEMES.reduce((n, t) => n + t.menus.length, 0));
  assert.deepEqual(SLOTS.map((s) => s.key), ['theme', 'palette', 'menu', 'table', 'sound', 'moment']);
});

test('every palette has its own decor list', () => {
  PALETTES.forEach((p) => {
    const decor = decorFor(p.id, 6);
    assert.equal(decor.length, 5);
    assert.equal(decor[1].startsWith('6 '), true);
  });
  assert.notEqual(decorFor('cherry', 6)[0], decorFor('gingham', 6)[0]);
});
