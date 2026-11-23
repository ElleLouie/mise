// A brand-new install: sample recipes and one hosted sample vibe.
import 'fake-indexeddb/auto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db, hostVibe, stopHosting } from './db.js';
import { firstVibe } from './reroll.js';

test('a new install starts with the sample dinner as a hosted vibe', async () => {
  await db.open();
  const [vibe] = await db.vibes.toArray();
  assert.equal(vibe.name, 'Saturday supper');
  assert.equal(vibe.plan.guests, 6);
  assert.equal(vibe.plan.dishes.length, 5);
  assert.equal(vibe.menu.length, 5);
  assert.ok(await db.recipes.count() > 5);
});

test('hosting a vibe starts a plan named after its theme; stopping keeps the vibe', async () => {
  const vibe = { ...firstVibe(), id: 'v1', name: '', savedAt: 1, plan: null };
  const hosted = await hostVibe(vibe);
  assert.equal(hosted.name, 'Pie party');
  assert.deepEqual(hosted.plan.dishes.map((d) => d.text), vibe.menu);
  assert.deepEqual(await db.vibes.get('v1'), hosted);
  // hosting again keeps the plan you already have
  const again = await hostVibe({ ...hosted, plan: { ...hosted.plan, guests: 9 } });
  assert.equal(again.plan.guests, 9);
  await stopHosting('v1');
  const kept = await db.vibes.get('v1');
  assert.equal(kept.plan, null);
  assert.equal(kept.name, 'Pie party');
  db.close();
});
