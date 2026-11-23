import Dexie from 'dexie';
import sampleRecipes, { samplePartyFor } from './samples.js';
import {
  partyToVibe, applyPlanView, newPlan,
} from './vibes.js';

// Everything is stored in the browser (IndexedDB), on the device you use.
export const db = new Dexie('mise');

db.version(1).stores({
  recipes: 'id, title, updatedAt, lastCookedAt, *tags',
});

// v2: index creation date
db.version(2).stores({
  recipes: 'id, title, createdAt, updatedAt, lastCookedAt, *tags',
});

// v3: what's in the kitchen, and the shopping list
db.version(3).stores({
  recipes: 'id, title, createdAt, updatedAt, lastCookedAt, *tags',
  larder: 'name, addedAt',
  list: '++id, done, addedAt',
});

// v4: the weekly plan, one row per recipe on a day ("2026-11-02")
db.version(4).stores({
  recipes: 'id, title, createdAt, updatedAt, lastCookedAt, *tags',
  larder: 'name, addedAt',
  list: '++id, done, addedAt',
  plan: '++id, date, recipeId',
});

// v5: mise becomes a dinner party planner; the weekly plan and groceries make way for parties
db.version(5).stores({
  recipes: 'id, title, createdAt, updatedAt, lastCookedAt, *tags',
  larder: null,
  list: null,
  plan: null,
  parties: 'id, date, updatedAt',
});

// v6: mise becomes a vibe app with planning as an add-on. Every party becomes a saved vibe with its plan.
db.version(6).stores({
  recipes: 'id, title, createdAt, updatedAt, lastCookedAt, *tags',
  parties: null,
  vibes: 'id, savedAt, themeId',
}).upgrade(async (tx) => {
  const [parties, recipes] = await Promise.all([tx.table('parties').toArray(), tx.table('recipes').toArray()]);
  await tx.table('vibes').bulkAdd(parties.map((party) => partyToVibe(party, recipes)));
});

// start with a few recipes and one hosted vibe so it isn't empty
db.on('populate', async (tx) => {
  const recipes = sampleRecipes();
  await tx.table('recipes').bulkAdd(recipes);
  await tx.table('vibes').add(partyToVibe(samplePartyFor(recipes), recipes));
});

export const newId = () => crypto.randomUUID();

export function blankRecipe() {
  const now = Date.now();
  return {
    id: newId(),
    title: '',
    servings: 2,
    minutes: 30,
    tags: [],
    ingredients: [],
    steps: [],
    source: '',
    image: null,
    favorite: false,
    notes: [],
    createdAt: now,
    updatedAt: now,
    lastCookedAt: null,
  };
}

export const saveRecipe = (recipe) => db.recipes.put({ ...recipe, updatedAt: Date.now() });

// also takes the recipe off any planned menus
export async function deleteRecipe(id) {
  await db.vibes.toCollection().modify((vibe) => {
    if (vibe.plan) vibe.plan.dishes = vibe.plan.dishes.filter((dish) => dish.recipeId !== id);
  });
  await db.recipes.delete(id);
}

// Vibes
export const saveVibe = (vibe) => db.vibes.put(vibe);

export const deleteVibe = (id) => db.vibes.delete(id);

// "Host this": the vibe gets a plan (if it doesn't have one yet)
export async function hostVibe(vibe) {
  const hosted = { ...vibe, plan: vibe.plan ?? newPlan(vibe) };
  await db.vibes.put(hosted);
  return hosted;
}

export const stopHosting = (id) => db.vibes.update(id, { plan: null });

// A new dinner from the planning form: the party-shaped details it fills in, with today's date.
export function blankParty() {
  const now = Date.now();
  const date = new Date(now + 7 * 24 * 60 * 60 * 1000);
  return {
    id: newId(),
    name: '',
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    time: '19:30',
    guests: 6,
    mood: 'gingham',
    dishes: [],
    bought: [],
    createdAt: now,
    updatedAt: now,
  };
}

// The planning pages edit a party-shaped view of a hosted vibe (vibes.js planView); this writes it back.
export async function saveParty(view) {
  await db.transaction('rw', db.vibes, async () => {
    const vibe = await db.vibes.get(view.id);
    await db.vibes.put(vibe
      ? applyPlanView(vibe, { ...view, updatedAt: Date.now() })
      : partyToVibe({ ...view, updatedAt: Date.now() }));
  });
}

// Plan a dinner idea: its recipes join your box (unless you already have them by name) and go on the menu
// of a new hosted vibe.
export async function partyFromIdea(party, idea, titles) {
  await db.transaction('rw', db.recipes, db.vibes, async () => {
    const existing = await db.recipes.toArray();
    const dishes = [];
    for (const { course, recipe } of idea.dishes.filter((dish) => titles.includes(dish.recipe.title))) {
      let saved = existing.find((other) => other.title.toLowerCase() === recipe.title.toLowerCase());
      if (!saved) {
        saved = { ...blankRecipe(), ...recipe };
        await db.recipes.add(saved);
        existing.push(saved);
      }
      dishes.push({ recipeId: saved.id, course });
    }
    await db.vibes.put(partyToVibe({ ...party, mood: idea.mood, dishes }, existing));
  });
}

// Backups: everything as one JSON file, and back again.
export async function exportRecipes() {
  const [recipes, vibes] = await Promise.all([db.recipes.toArray(), db.vibes.toArray()]);
  return JSON.stringify({ app: 'mise', version: 5, exportedAt: new Date().toISOString(), recipes, vibes }, null, 2);
}

export async function importRecipes(json) {
  const data = JSON.parse(json);
  if (data.app !== 'mise' || !Array.isArray(data.recipes)) throw new Error('This file is not a mise backup.');
  await db.recipes.bulkPut(data.recipes);
  if (Array.isArray(data.vibes)) await db.vibes.bulkPut(data.vibes);
  // backups from before vibes
  if (Array.isArray(data.parties)) await db.vibes.bulkPut(data.parties.map((party) => partyToVibe(party, data.recipes)));
  return data.recipes.length;
}
