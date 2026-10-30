import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseIngredient, formatQuantity, scaleIngredient, keyIngredients } from './ingredients.js';
import { findTimers, splitStep, formatClock } from './timers.js';

test('parses common quantity styles', () => {
  assert.deepEqual(parseIngredient('1 1/2 cups flour'), { quantity: 1.5, quantityMax: null, rest: 'cups flour', gap: ' ' });
  assert.equal(parseIngredient('½ lemon').quantity, 0.5);
  assert.equal(parseIngredient('1½ tsp salt').quantity, 1.5);
  assert.equal(parseIngredient('2.5 tbsp oil').quantity, 2.5);
  assert.deepEqual(parseIngredient('2-3 cloves garlic'), { quantity: 2, quantityMax: 3, rest: 'cloves garlic', gap: ' ' });
  assert.equal(parseIngredient('Salt and pepper').quantity, null);
  assert.equal(parseIngredient('200g pasta').rest, 'g pasta');
  assert.equal(parseIngredient('200g pasta').gap, '');
});

test('formats quantities like a cook', () => {
  assert.equal(formatQuantity(1.5), '1½');
  assert.equal(formatQuantity(0.333), '⅓');
  assert.equal(formatQuantity(2), '2');
  assert.equal(formatQuantity(0.98), '1');
  assert.equal(formatQuantity(12.4), '12');
  assert.equal(formatQuantity(0.3), '⅓');
  assert.equal(formatQuantity(0.2), '0.2');
});

test('scales ingredient lines', () => {
  assert.equal(scaleIngredient('1 1/2 cups flour', 2), '3 cups flour');
  assert.equal(scaleIngredient('3 tbsp olive oil', 0.5), '1½ tbsp olive oil');
  assert.equal(scaleIngredient('2-3 cloves garlic', 2), '4–6 cloves garlic');
  assert.equal(scaleIngredient('200g pasta', 1.5), '300g pasta');
  assert.equal(scaleIngredient('Salt and pepper', 2), 'Salt and pepper');
});

test('finds timers in steps', () => {
  const [bake] = findTimers('Bake at 350°F for 10-12 minutes, until golden.');
  assert.equal(bake.seconds, 600);
  assert.equal(bake.label, '10-12 minutes');
  assert.equal(findTimers('Rest 1 hour, then slice.')[0].seconds, 3600);
  assert.equal(findTimers('Cook 90 secs.')[0].seconds, 90);
  assert.equal(findTimers('Season to taste.').length, 0);
  assert.equal(findTimers('Preheat to 425°F').length, 0);
});

test('splits steps around timers', () => {
  const parts = splitStep('Simmer 5 minutes, then rest 2 min.');
  assert.deepEqual(parts.map((p) => p.text), ['Simmer ', '5 minutes', ', then rest ', '2 min', '.']);
});

test('formats clocks', () => {
  assert.equal(formatClock(65), '1:05');
  assert.equal(formatClock(3725), '1:02:05');
});

test('picks key ingredients by name', () => {
  assert.deepEqual(
    keyIngredients(['200g short pasta', '1 can (400g) white beans, drained', 'Salt and pepper', '3 tbsp olive oil', '1 lemon, zested']),
    ['short pasta', 'white beans', 'olive oil'],
  );
  assert.deepEqual(keyIngredients(['2 cloves garlic', '1 cup of rice'], 2), ['garlic', 'rice']);
});
