import Dexie from 'dexie';
import sampleRecipes from './samples';
import { ingredientName } from './ingredients';

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

// fill a brand-new recipe box with a few samples so it isn't empty
db.on('populate', (tx) => tx.table('recipes').bulkAdd(sampleRecipes()));

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

export const deleteRecipe = (id) => db.recipes.delete(id);

// "Last time" notes; saving one also marks the recipe as cooked today.
export async function addNote(recipe, { text, rating }) {
  const date = Date.now();
  const note = { id: newId(), date, text, rating };
  await saveRecipe({ ...recipe, notes: [note, ...recipe.notes], lastCookedAt: date });
}

const DAY = 24 * 60 * 60 * 1000;

// Favorites and well-rated recipes you haven't made in two weeks or more.
export function cookAgain(recipes) {
  const rating = (recipe) => recipe.notes[0]?.rating ?? 0;
  return recipes
    .filter((recipe) => (recipe.favorite || rating(recipe) >= 4)
      && (!recipe.lastCookedAt || Date.now() - recipe.lastCookedAt > 14 * DAY))
    .sort((a, b) => (a.lastCookedAt ?? 0) - (b.lastCookedAt ?? 0));
}

// The larder: names of things you have, like "lemons" or "white miso".
export async function addToLarder(names) {
  const now = Date.now();
  const items = names.map((name) => name.trim().toLowerCase()).filter(Boolean);
  await db.larder.bulkPut(items.map((name) => ({ name, addedAt: now })));
}

export const removeFromLarder = (name) => db.larder.delete(name);

// The shopping list. Items are full lines like "2 lemons"; names are kept for the larder.
export async function addToList(lines, recipeTitle = null) {
  const now = Date.now();
  const existing = new Set((await db.list.where('done').equals(0).toArray()).map((item) => item.text.toLowerCase()));
  const fresh = lines.map((line) => line.trim()).filter((line) => line && !existing.has(line.toLowerCase()));
  await db.list.bulkAdd(fresh.map((text) => ({
    text, name: ingredientName(text) || text.toLowerCase(), recipe: recipeTitle, done: 0, addedAt: now,
  })));
  return fresh.length;
}

export const toggleListItem = (item) => db.list.update(item.id, { done: item.done ? 0 : 1 });

export const removeListItem = (id) => db.list.delete(id);

// Checked-off items go into the larder and leave the list.
export async function putAway() {
  const done = await db.list.where('done').equals(1).toArray();
  await addToLarder(done.map((item) => item.name));
  await db.list.bulkDelete(done.map((item) => item.id));
  return done.length;
}

// Backups: everything as one JSON file, and back again.
export async function exportRecipes() {
  const [recipes, larder, list] = await Promise.all([db.recipes.toArray(), db.larder.toArray(), db.list.toArray()]);
  return JSON.stringify({ app: 'mise', version: 2, exportedAt: new Date().toISOString(), recipes, larder, list }, null, 2);
}

export async function importRecipes(json) {
  const data = JSON.parse(json);
  if (data.app !== 'mise' || !Array.isArray(data.recipes)) throw new Error('This file is not a mise backup.');
  await db.recipes.bulkPut(data.recipes);
  if (Array.isArray(data.larder)) await db.larder.bulkPut(data.larder);
  if (Array.isArray(data.list)) await db.list.bulkPut(data.list);
  return data.recipes.length;
}
