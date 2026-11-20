import { ingredientName } from './ingredients.js';

// Recipes that share ingredients and tags with this one.
export function similar(recipe, recipes, count = 3) {
  const names = new Set(recipe.ingredients.map(ingredientName).filter(Boolean));
  return recipes
    .filter((other) => other.id !== recipe.id)
    .map((other) => {
      const shared = other.ingredients.map(ingredientName).filter((name) => names.has(name)).length;
      const tags = other.tags.filter((tag) => recipe.tags.includes(tag)).length;
      return { other, score: shared + tags * 1.5 };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ other }) => other);
}
