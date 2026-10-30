import { ingredientName, covers } from './ingredients.js';

// assumed to be in every kitchen, so never counted as missing
const STAPLES = ['salt', 'pepper', 'water'];

// The ingredients of a recipe that aren't in the larder, as full lines.
export function missingFor(recipe, larder) {
  return recipe.ingredients.filter((line) => {
    const name = ingredientName(line);
    if (!name || STAPLES.some((staple) => covers(staple, name))) return false;
    return !larder.some((item) => covers(item.name, name));
  });
}

// Recipes you can make (or almost make) with what's in the larder, fewest missing first.
export function canMake(recipes, larder, maxMissing = 1) {
  if (larder.length === 0) return [];
  return recipes
    .map((recipe) => ({ recipe, missing: missingFor(recipe, larder) }))
    .filter(({ missing }) => missing.length <= maxMissing)
    .sort((a, b) => a.missing.length - b.missing.length);
}

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
