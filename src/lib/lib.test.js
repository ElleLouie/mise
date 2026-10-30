import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseIngredient, formatQuantity, scaleIngredient, keyIngredients, ingredientName, covers,
} from './ingredients.js';
import { missingFor, canMake, similar } from './suggest.js';
import { aisleFor } from './aisles.js';
import { toRecipe } from './mealdb.js';
import { weekDays, isoDate } from './week.js';
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

test('names ingredients plainly', () => {
  assert.equal(ingredientName('2 cloves garlic, thinly sliced'), 'garlic');
  assert.equal(ingredientName('1 can (400g) white beans, drained'), 'white beans');
  assert.equal(ingredientName('3 cups cooked rice, cold'), 'rice');
  assert.equal(ingredientName('2 tbsp butter, softened'), 'butter');
  assert.equal(ingredientName('½ cup grated parmesan'), 'parmesan');
});

test('matches larder items to ingredients', () => {
  assert.ok(covers('lemons', 'lemon'));
  assert.ok(covers('beans', 'white beans'));
  assert.ok(covers('Tomato', 'tomatoes'));
  assert.ok(!covers('white beans', 'beans'));
  assert.ok(!covers('butter', 'peanut'));
});

test('finds missing ingredients and what you can make', () => {
  const recipe = { id: 'a', tags: ['quick'], ingredients: ['2 salmon fillets', '1 lemon', 'Salt and pepper'] };
  const larder = [{ name: 'salmon' }];
  assert.deepEqual(missingFor(recipe, larder), ['1 lemon']);
  assert.equal(canMake([recipe], larder).length, 1);
  assert.equal(canMake([recipe], [], 1).length, 0);
  assert.equal(canMake([recipe], [{ name: 'salmon' }, { name: 'lemons' }])[0].missing.length, 0);
});

test('finds similar recipes', () => {
  const a = { id: 'a', tags: ['quick'], ingredients: ['1 lemon', '2 tbsp butter'] };
  const b = { id: 'b', tags: ['quick'], ingredients: ['1 lemon', 'pasta'] };
  const c = { id: 'c', tags: ['baking'], ingredients: ['flour'] };
  assert.deepEqual(similar(a, [a, b, c]).map((r) => r.id), ['b']);
});

test('sorts items into aisles', () => {
  assert.equal(aisleFor('limes'), 'Produce');
  assert.equal(aisleFor('salmon fillets'), 'Meat & fish');
  assert.equal(aisleFor('parmesan'), 'Dairy & eggs');
  assert.equal(aisleFor('white miso'), 'Pantry');
  assert.equal(aisleFor('paper towels'), 'Other');
});

test('turns a TheMealDB meal into a recipe', () => {
  const meal = {
    idMeal: '52772',
    strMeal: 'Teriyaki Chicken Casserole',
    strCategory: 'Chicken',
    strArea: 'Japanese',
    strTags: 'Meat,Casserole',
    strMealThumb: 'https://example.com/photo.jpg',
    strSource: '',
    strInstructions: 'Preheat oven to 350.\r\nSTEP 2 - Combine soy sauce and honey.\r\n\r\n3. Bake for 30 minutes.',
    strIngredient1: 'soy sauce', strMeasure1: '3/4 cup',
    strIngredient2: 'chicken breasts', strMeasure2: '2',
    strIngredient3: '', strMeasure3: ' ',
  };
  const recipe = toRecipe(meal);
  assert.equal(recipe.title, 'Teriyaki Chicken Casserole');
  assert.deepEqual(recipe.ingredients, ['3/4 cup soy sauce', '2 chicken breasts']);
  assert.deepEqual(recipe.tags, ['chicken', 'japanese', 'meat', 'casserole']);
  assert.equal(recipe.steps.length, 3);
  assert.equal(recipe.steps[1], 'Combine soy sauce and honey.');
  assert.equal(recipe.steps[2], 'Bake for 30 minutes.');
  assert.equal(recipe.source, 'https://www.themealdb.com/meal/52772');
});

test('lists the days of a week, Monday first', () => {
  const thursday = new Date(2026, 9, 29);
  assert.deepEqual(weekDays(0, thursday), ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
  assert.equal(weekDays(1, thursday)[0], '2026-11-02');
  assert.equal(weekDays(0, new Date(2026, 10, 1))[0], '2026-10-26');
  assert.equal(isoDate(new Date(2026, 0, 5)), '2026-01-05');
});
