import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paletteVars, contrast } from './tint.js';
import { PALETTES, paletteFor } from './seeds.js';

const solid = (value) => /^#/.test(value);

test('every palette keeps text, buttons and links readable', () => {
  PALETTES.forEach((p) => {
    const v = paletteVars(p);
    assert.equal(v['--bg'], p.backdrop);
    assert.ok(contrast(v['--ink'], p.backdrop) >= 7, `${p.id} ink`);
    assert.ok(contrast(v['--accent-ink'], v['--accent']) >= 3, `${p.id} button text ${contrast(v['--accent-ink'], v['--accent']).toFixed(2)}`);
    if (solid(v['--accent-text'])) assert.ok(contrast(v['--accent-text'], p.backdrop) >= 4.5, `${p.id} link`);
  });
});

test('dark palettes get light ink', () => {
  assert.equal(paletteVars(paletteFor('midnight'))['--ink'], '#f4ede1');
  assert.equal(paletteVars(paletteFor('midnight'))['color-scheme'], 'dark');
  assert.equal(paletteVars(paletteFor('cherry'))['--ink'], '#2a211b');
});
