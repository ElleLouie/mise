// Handmade vessels for each recipe: a glaze for the bowl or plate, and colours for what's in it.

export const glazes = {
  celadon: { name: 'Celadon bowl', inner: '#e9efe6', outer: '#b9cbb6', rim: '#93a893', speckle: 0.5, bowl: true },
  stoneware: { name: 'Speckled stoneware', inner: '#f6f1e7', outer: '#e6ddcc', rim: '#c9bba3', speckle: 1, bowl: false },
  cobalt: { name: 'Cobalt-rim plate', inner: '#f7f5f0', outer: '#eceae3', rim: '#2f4f8f', speckle: 0.2, bowl: false },
  tenmoku: { name: 'Tenmoku bowl', inner: '#5a3a2a', outer: '#3a241a', rim: '#21140e', speckle: 0.35, bowl: true },
  ochre: { name: 'Ochre ash glaze', inner: '#ecd9a8', outer: '#c99b4a', rim: '#9a6a2a', speckle: 0.6, bowl: true },
  shino: { name: 'Shino plate', inner: '#f3e6d6', outer: '#e2bfa0', rim: '#c48a62', speckle: 0.7, bowl: false },
};

export const foods = {
  tomato: ['#b5442c', '#d9724a', '#6f8f47'],
  salmon: ['#d9724a', '#f2a77e', '#6f8f47'],
  golden: ['#e6cf8e', '#f5e6b8', '#5e7d3c'],
  greens: ['#7d9a52', '#a9c27a', '#c99a52'],
  roast: ['#8e3a2a', '#b45a3c', '#f2d38a'],
  bake: ['#b9773f', '#d9a46b', '#4a2a1a'],
  berry: ['#7a2e4f', '#a9527a', '#e9c46a'],
};

const hash = (text) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function glazeFor(recipe) {
  const keys = Object.keys(glazes);
  return recipe.vessel && glazes[recipe.vessel] ? recipe.vessel : keys[hash(recipe.id) % keys.length];
}

export function foodFor(recipe) {
  const keys = Object.keys(foods);
  return recipe.food && foods[recipe.food] ? recipe.food : keys[hash(`${recipe.id}food`) % keys.length];
}
