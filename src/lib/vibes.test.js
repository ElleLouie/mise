import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  partyToVibe, planView, applyPlanView, newPlan, guessCourse, vibeTitle,
} from './vibes.js';
import { partyShopping, menuDishes, timeline } from './party.js';

// a party as the v5 app saved it, with every field it could have
const party = {
  id: 'p1',
  name: 'Saturday supper',
  date: '2026-12-05',
  time: '19:30',
  guests: 6,
  mood: 'plum',
  names: ['Elle', 'Maya'],
  dishes: [{ recipeId: 'r1', course: 'main' }, { text: 'Baguette', course: 'starter' }],
  bought: ['lemon'],
  have: ['olive oil'],
  extras: [{ id: 'x', text: 'Wine' }],
  serve: { main: 0 },
  stepsDone: ['r1:0'],
  decorDone: ['Plum tablecloth'],
  vibe: { words: ['moody'], dress: 'Linen', music: 'Old soul records' },
  createdAt: 1700000000000,
  updatedAt: 1700000500000,
};
const recipes = [{
  id: 'r1', title: 'Roast chicken', servings: 4, minutes: 90, tags: ['main'], ingredients: ['1 chicken', '2 lemons'], steps: ['Roast for 1 hour.'],
}];

test('turns a party into a vibe without losing anything', () => {
  const vibe = partyToVibe(party, recipes);
  assert.equal(vibe.id, 'p1');
  assert.equal(vibe.name, 'Saturday supper');
  assert.equal(vibe.palette.id, 'plum');
  assert.equal(vibe.palette.dark, true);
  assert.deepEqual(vibe.menu, ['Roast chicken', 'Baguette']);
  assert.equal(vibe.sound, 'Old soul records');
  assert.equal(vibe.moment, 'Dress code: Linen');
  assert.equal(vibe.savedAt, party.createdAt);
  assert.deepEqual(vibe.locks, []);
  // every field of the party is in the vibe, and the plan view gives the party back
  const { createdAt, ...rest } = party;
  const back = planView(vibe);
  Object.entries(rest).forEach(([key, value]) => assert.deepEqual(back[key], value, key));
  assert.equal(vibe.savedAt, createdAt);
});

test('fills in what an older party may not have', () => {
  const vibe = partyToVibe({ id: 'p2', date: '2026-01-01', time: '19:00', guests: 4, dishes: [], mood: 'gone', createdAt: 5 });
  assert.equal(vibe.name, '');
  assert.equal(vibe.palette.id, 'gingham');
  assert.deepEqual(vibe.plan.names, []);
  assert.deepEqual(vibe.plan.bought, []);
  assert.equal(vibe.sound, null);
  assert.equal(vibeTitle(vibe), 'Dinner party');
});

test('party.js works on a vibe through its plan view', () => {
  const view = planView(partyToVibe(party, recipes));
  const dishes = menuDishes(view, recipes);
  assert.equal(dishes[0].factor, 6 / 4);
  const items = partyShopping(view, dishes);
  assert.ok(items.some((item) => item.text === 'Baguette'));
  assert.ok(items.some((item) => item.aisle === 'For the table' && item.text === 'Plum tablecloth'));
  assert.ok(timeline(view, dishes).some((e) => e.text === 'Roast for 1 hour.'));
});

test('changes in the plan go back into the vibe', () => {
  const vibe = partyToVibe(party, recipes);
  const view = planView(vibe);
  const same = applyPlanView(vibe, view);
  assert.deepEqual(same, vibe);
  const changed = applyPlanView(vibe, { ...view, guests: 10, mood: 'cherry', name: 'Big supper' });
  assert.equal(changed.plan.guests, 10);
  assert.equal(changed.palette.id, 'cherry');
  assert.equal(changed.name, 'Big supper');
  assert.equal(changed.plan.mood, undefined);
  assert.equal(changed.plan.palette, undefined);
});

test('hosting a vibe starts a plan from its menu', () => {
  const now = new Date(2026, 10, 1, 12).getTime();
  const plan = newPlan({ menu: ['Chicken & leek pie', 'Sour cherry lattice pie', 'Bitter leaf salad', 'Cold milk & strong coffee'] }, now);
  assert.equal(plan.date, '2026-11-08');
  assert.deepEqual(plan.dishes.map((d) => d.course), ['main', 'dessert', 'side', 'starter']);
  assert.deepEqual(plan.dishes.map((d) => d.text)[0], 'Chicken & leek pie');
  assert.equal(guessCourse('Victoria sponge'), 'dessert');
});
