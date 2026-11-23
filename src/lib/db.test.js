// The v6 upgrade on a real (in-memory) IndexedDB: a v5 database with parties opens as vibes.
import 'fake-indexeddb/auto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Dexie from 'dexie';

const recipe = {
  id: 'r1', title: 'Herb roast chicken', servings: 4, minutes: 90, tags: ['main'], ingredients: ['1 whole chicken'], steps: ['Roast for 1 hour.'],
  createdAt: 1, updatedAt: 1, lastCookedAt: null,
};
const parties = [
  {
    id: 'p1', name: 'Saturday supper', date: '2026-12-05', time: '19:30', guests: 6, mood: 'candlelight',
    names: ['Elle'], dishes: [{ recipeId: 'r1', course: 'main' }, { text: 'Baguette', course: 'starter' }],
    bought: ['chicken'], have: ['olive oil'], extras: [{ id: 'x', text: 'Wine' }], serve: { main: 15 },
    stepsDone: ['r1:0'], createdAt: 100, updatedAt: 200,
  },
  {
    id: 'p2', name: '', date: '2026-01-10', time: '20:00', guests: 2, mood: 'gingham', dishes: [], bought: [], createdAt: 300, updatedAt: 300,
  },
];

// the v5 schema, as the last release wrote it
async function seedVersion5() {
  const old = new Dexie('mise');
  old.version(5).stores({
    recipes: 'id, title, createdAt, updatedAt, lastCookedAt, *tags',
    parties: 'id, date, updatedAt',
  });
  await old.open();
  await old.recipes.add(recipe);
  await old.parties.bulkAdd(parties);
  old.close();
}

test('every party becomes a vibe with its plan, and nothing is lost', async () => {
  await seedVersion5();
  const { db } = await import('./db.js');
  await db.open();

  assert.equal(db.verno, 6);
  assert.deepEqual(db.tables.map((t) => t.name).sort(), ['recipes', 'vibes']);
  assert.equal(await db.recipes.count(), 1);

  const vibes = await db.vibes.toArray();
  assert.equal(vibes.length, 2);
  const supper = vibes.find((v) => v.id === 'p1');
  assert.equal(supper.name, 'Saturday supper');
  assert.equal(supper.palette.id, 'candlelight');
  assert.deepEqual(supper.menu, ['Herb roast chicken', 'Baguette']);
  assert.equal(supper.savedAt, 100);
  // the whole party, apart from what moved to the vibe itself, is in the plan
  const {
    id, name, mood, createdAt, ...plan
  } = parties[0];
  assert.deepEqual(supper.plan, plan);
  assert.equal(vibes.find((v) => v.id === 'p2').plan.date, '2026-01-10');

  // no sample data is added when upgrading
  assert.equal(await db.recipes.count(), 1);
  db.close();
});
