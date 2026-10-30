// Discover recipes from TheMealDB, a free recipe database with photos (https://www.themealdb.com).

const API = 'https://www.themealdb.com/api/json/v1/1';

async function get(path) {
  const response = await fetch(`${API}/${path}`);
  if (!response.ok) throw new Error('Could not reach the recipe database.');
  return response.json();
}

// Short results for an ingredient, e.g. "chicken": [{ id, title, image }]
export async function findByIngredient(ingredient) {
  const { meals } = await get(`filter.php?i=${encodeURIComponent(ingredient.trim().replace(/\s+/g, '_'))}`);
  return (meals || []).map((meal) => ({ id: meal.idMeal, title: meal.strMeal, image: meal.strMealThumb }));
}

export async function lookup(id) {
  const { meals } = await get(`lookup.php?i=${encodeURIComponent(id)}`);
  return meals?.[0] ?? null;
}

// Turns a TheMealDB meal into a mise recipe.
export function toRecipe(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (name) ingredients.push(measure ? `${measure} ${name}` : name);
  }
  const steps = (meal.strInstructions || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:step\s*)?\d+\s*[.):\-–]?\s*/i, '').trim())
    .filter((line) => line.length > 3);
  const tags = [meal.strCategory, meal.strArea, ...(meal.strTags || '').split(',')]
    .map((tag) => tag?.trim().toLowerCase())
    .filter((tag) => tag && tag !== 'unknown');
  return {
    title: meal.strMeal,
    image: meal.strMealThumb || null,
    servings: 4,
    minutes: 45,
    tags: [...new Set(tags)].slice(0, 4),
    ingredients,
    steps,
    source: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
  };
}
