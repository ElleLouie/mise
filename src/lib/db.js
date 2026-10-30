import Dexie from 'dexie';
import sampleRecipes from './samples';

// Everything is stored in the browser (IndexedDB), on the device you use.
export const db = new Dexie('mise');

db.version(1).stores({
  recipes: 'id, title, updatedAt, lastCookedAt, *tags',
});

// v2: index creation date
db.version(2).stores({
  recipes: 'id, title, createdAt, updatedAt, lastCookedAt, *tags',
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

// Backups: everything as one JSON file, and back again.
export async function exportRecipes() {
  const recipes = await db.recipes.toArray();
  return JSON.stringify({ app: 'mise', version: 1, exportedAt: new Date().toISOString(), recipes }, null, 2);
}

export async function importRecipes(json) {
  const data = JSON.parse(json);
  if (data.app !== 'mise' || !Array.isArray(data.recipes)) throw new Error('This file is not a mise backup.');
  await db.recipes.bulkPut(data.recipes);
  return data.recipes.length;
}
