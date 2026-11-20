import Dexie from 'dexie';
import sampleRecipes, { samplePartyFor } from './samples';

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

// start with a few recipes and one party so it isn't empty
db.on('populate', async (tx) => {
  const recipes = sampleRecipes();
  await tx.table('recipes').bulkAdd(recipes);
  await tx.table('parties').add(samplePartyFor(recipes));
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

// also takes the recipe off any party menus
export async function deleteRecipe(id) {
  await db.parties.toCollection().modify((party) => {
    party.dishes = party.dishes.filter((dish) => dish.recipeId !== id);
  });
  await db.recipes.delete(id);
}

// "Last time" notes; saving one also marks the recipe as cooked today.
export async function addNote(recipe, { text, rating }) {
  const date = Date.now();
  const note = { id: newId(), date, text, rating };
  await saveRecipe({ ...recipe, notes: [note, ...recipe.notes], lastCookedAt: date });
}

// Dinner parties: when, how many, the menu (recipes by course), the table mood and what's been bought.
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

export const saveParty = (party) => db.parties.put({ ...party, updatedAt: Date.now() });

export const deleteParty = (id) => db.parties.delete(id);

// Plan a dinner idea: its recipes join your box (unless you already have them by name) and go on the menu.
export async function partyFromIdea(party, idea, titles) {
  const dishes = [];
  await db.transaction('rw', db.recipes, db.parties, async () => {
    const existing = await db.recipes.toArray();
    for (const { course, recipe } of idea.dishes.filter((dish) => titles.includes(dish.recipe.title))) {
      let saved = existing.find((other) => other.title.toLowerCase() === recipe.title.toLowerCase());
      if (!saved) {
        saved = { ...blankRecipe(), ...recipe };
        await db.recipes.add(saved);
      }
      dishes.push({ recipeId: saved.id, course });
    }
    await saveParty({ ...party, mood: idea.mood, dishes });
  });
}

// Backups: everything as one JSON file, and back again.
export async function exportRecipes() {
  const [recipes, parties] = await Promise.all([db.recipes.toArray(), db.parties.toArray()]);
  return JSON.stringify({ app: 'mise', version: 4, exportedAt: new Date().toISOString(), recipes, parties }, null, 2);
}

export async function importRecipes(json) {
  const data = JSON.parse(json);
  if (data.app !== 'mise' || !Array.isArray(data.recipes)) throw new Error('This file is not a mise backup.');
  await db.recipes.bulkPut(data.recipes);
  if (Array.isArray(data.parties)) await db.parties.bulkPut(data.parties);
  return data.recipes.length;
}
