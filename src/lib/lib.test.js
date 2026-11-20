import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseIngredient, formatQuantity, scaleIngredient, keyIngredients, ingredientName, covers,
} from './ingredients.js';
import { aisleFor } from './aisles.js';
import {
  shoppingList, stepMinutes, timeline, courseFor, menuDishes, partyShopping, seatsFor, ovenClashes, nowAndNext,
} from './party.js';
import { ideas } from './ideas.js';
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

test('sorts items into aisles', () => {
  assert.equal(aisleFor('limes'), 'Produce');
  assert.equal(aisleFor('salmon fillets'), 'Meat & fish');
  assert.equal(aisleFor('parmesan'), 'Dairy & eggs');
  assert.equal(aisleFor('white miso'), 'Pantry');
  assert.equal(aisleFor('paper towels'), 'Other');
});

const chicken = {
  id: 'c', title: 'Roast chicken', servings: 4, minutes: 90, tags: ['main'],
  ingredients: ['1 chicken', '2 lemons', 'Salt and pepper'],
  steps: ['Heat the oven.', 'Roast for 1 hour.', 'Rest for 15 minutes.'],
};
const salad = {
  id: 's', title: 'Salad', servings: 2, minutes: 10, tags: ['side'],
  ingredients: ['1 lemon', '1 head lettuce'],
  steps: ['Toss everything together.'],
};
const party = { date: '2026-12-05', time: '19:30', guests: 8, dishes: [{ recipeId: 'c', course: 'main' }, { recipeId: 's', course: 'side' }, { recipeId: 'gone', course: 'dessert' }] };

test('scales the menu for the guests', () => {
  const dishes = menuDishes(party, [chicken, salad]);
  assert.deepEqual(dishes.map((d) => d.factor), [2, 4]);
});

test('builds one shopping list for the menu', () => {
  const items = shoppingList(menuDishes(party, [chicken, salad]));
  const lemons = items.find((item) => item.key === 'lemon');
  assert.equal(lemons.text, '8 lemons');
  assert.deepEqual(lemons.dishes, ['Roast chicken', 'Salad']);
  assert.ok(!items.some((item) => item.name.includes('salt')));
  assert.equal(items.find((item) => item.key === 'chicken').text, '2 chickens');
  const more = shoppingList([{ recipe: { title: 'A', ingredients: ['3 tbsp olive oil', '1 blood orange', 'Flaky salt'] }, factor: 1.5 },
    { recipe: { title: 'B', ingredients: ['½ cup olive oil', 'Flaky salt', '1 whole chicken (about 1.8kg)'] }, factor: 1.5 }]);
  const text = (key) => more.find((item) => item.key === key).text;
  assert.equal(text('olive oil'), 'Olive oil');
  assert.equal(text('blood orange'), '2 blood oranges');
  assert.equal(text('flaky salt'), 'Flaky salt');
  assert.equal(text('whole chicken'), '2 whole chicken (about 1.8kg)');
});

test('times each step', () => {
  assert.deepEqual(stepMinutes(chicken), [15, 60, 15]);
  assert.deepEqual(stepMinutes(salad), [10]);
});

test('works back from dinner time', () => {
  const events = timeline(party, menuDishes(party, [chicken, salad]));
  const at = (text) => events.find((e) => e.text === text).at;
  // mains go out 30 minutes after sitting down at 7:30
  assert.equal(at('Rest for 15 minutes.').getHours() * 60 + at('Rest for 15 minutes.').getMinutes(), 19 * 60 + 45);
  assert.equal(at('Heat the oven.').getHours() * 60 + at('Heat the oven.').getMinutes(), 18 * 60 + 30);
  assert.equal(at('Serve the mains').getMinutes(), 0);
  assert.equal(events.filter((e) => e.serve).length, 2);
  assert.equal(events[0].text, 'Heat the oven.');
});

test('makes dessert ahead', () => {
  const cake = { id: 'k', title: 'Cake', servings: 8, minutes: 60, tags: [], ingredients: [], steps: ['Mix.', 'Bake for 40 minutes.', 'Slice and serve.'] };
  const dinner = { ...party, dishes: [{ recipeId: 'k', course: 'dessert' }] };
  const events = timeline(dinner, menuDishes(dinner, [cake]));
  const at = (text) => events.find((e) => e.text === text).at;
  assert.equal(at('Bake for 40 minutes.').getHours() * 60 + at('Bake for 40 minutes.').getMinutes(), 18 * 60 + 5);
  assert.equal(at('Slice and serve.').getHours() * 60 + at('Slice and serve.').getMinutes(), 20 * 60 + 50);
});

test('guesses the course from tags', () => {
  assert.equal(courseFor({ tags: ['Dessert'] }), 'dessert');
  assert.equal(courseFor({ tags: ['side'] }), 'side');
  assert.equal(courseFor({ tags: [] }), 'main');
});

test('every dinner idea builds a list and a timeline', () => {
  ideas.forEach((idea) => {
    const recipes = idea.dishes.map(({ recipe }, i) => ({ ...recipe, id: `${idea.id}-${i}` }));
    const dinner = { date: '2026-12-05', time: '19:30', guests: 6, dishes: idea.dishes.map(({ course }, i) => ({ recipeId: `${idea.id}-${i}`, course })) };
    const dishes = menuDishes(dinner, recipes);
    assert.ok(shoppingList(dishes).length > 5, idea.id);
    const events = timeline(dinner, dishes);
    assert.ok(events.every((e) => !Number.isNaN(e.at.getTime())), idea.id);
    // nothing starts before 9 in the morning
    assert.ok(events[0].at.getHours() >= 9, `${idea.id} starts at ${events[0].at}`);
  });
});

test('counts named guests as seats', () => {
  assert.equal(seatsFor({ guests: 6 }), 6);
  assert.equal(seatsFor({ guests: 2, names: ['A', 'B', 'C'] }), 3);
});

test('puts simple items, extras and the table on the list', () => {
  const dinner = { ...party, mood: 'gingham', dishes: [...party.dishes, { text: 'Baguette', course: 'starter' }], extras: [{ id: 'x', text: 'Wine' }] };
  const items = partyShopping(dinner, menuDishes(dinner, [chicken, salad]));
  assert.ok(items.some((item) => item.text === 'Baguette' && item.aisle === 'Bakery'));
  assert.ok(items.some((item) => item.text === 'Wine' && item.extra === 'x'));
  assert.ok(items.some((item) => item.aisle === 'For the table' && item.text === '8 butter yellow napkins'));
});

test('moves courses when you change serving times', () => {
  const dinner = { ...party, serve: { main: 0 } };
  const events = timeline(dinner, menuDishes(dinner, [chicken, salad]));
  const rest = events.find((e) => e.text === 'Rest for 15 minutes.').at;
  assert.equal(rest.getHours() * 60 + rest.getMinutes(), 19 * 60 + 15);
  assert.ok(events.some((e) => e.text === 'Serve the mains'));
});

test('flags two dishes needing the oven at different temperatures', () => {
  const roast = { ...chicken, steps: ['Heat the oven to 425°F.', 'Roast for 1 hour.', 'Rest for 15 minutes.'] };
  const cake = {
    id: 'k', title: 'Cake', servings: 8, minutes: 60, tags: ['main'], ingredients: [], steps: ['Heat the oven to 350°F.', 'Bake for 40 minutes.'],
  };
  const dinner = { ...party, dishes: [{ recipeId: 'c', course: 'main' }, { recipeId: 'k', course: 'main' }] };
  const clashes = ovenClashes(timeline(dinner, menuDishes(dinner, [roast, cake])));
  assert.equal(clashes.length, 1);
  assert.deepEqual([clashes[0].a.temperature, clashes[0].b.temperature].sort(), ['350', '425']);
});

test('knows what to do now and next', () => {
  const events = timeline(party, menuDishes(party, [chicken, salad]));
  const at = (h, m) => new Date(2026, 11, 5, h, m).getTime();
  const { current, next } = nowAndNext(events, new Set(), at(19, 0));
  assert.equal(current[0].text, 'Roast for 1 hour.');
  assert.equal(next.text, 'Rest for 15 minutes.');
  const later = nowAndNext(events, new Set([current[0].key]), at(19, 0));
  assert.equal(later.current.length, 0);
});
