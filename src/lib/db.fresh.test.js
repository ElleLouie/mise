// A brand-new install: sample recipes and one hosted sample vibe.
import 'fake-indexeddb/auto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db } from './db.js';

test('a new install starts with the sample dinner as a hosted vibe', async () => {
  await db.open();
  const [vibe] = await db.vibes.toArray();
  assert.equal(vibe.name, 'Saturday supper');
  assert.equal(vibe.plan.guests, 6);
  assert.equal(vibe.plan.dishes.length, 5);
  assert.equal(vibe.menu.length, 5);
  assert.ok(await db.recipes.count() > 5);
  db.close();
});
