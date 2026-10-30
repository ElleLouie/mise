// Turns a recipe into a flat, cut-paper illustration: its main ingredients as pieces,
// laid out on a platter, a tray or in a bowl. The same recipe always gets the same picture.
import { ingredientName } from './ingredients.js';

// [words, kind of piece, colours (main, light, accent)]
const PIECES = [
  [['blood orange'], 'slice', ['#9f1d2a', '#c9303c', '#e46a6a']],
  [['grapefruit'], 'slice', ['#d9573e', '#f08a6e', '#f8c0a8']],
  [['orange', 'clementine', 'mandarin'], 'slice', ['#e8722a', '#f39a3b', '#fbc677']],
  [['lemon'], 'slice', ['#e0b220', '#f5d64a', '#fbe9a0']],
  [['lime'], 'slice', ['#4f8a2b', '#8cc152', '#cde59a']],
  [['cucumber', 'zucchini'], 'slice', ['#3f6b2a', '#a9c27a', '#dbe9b0']],
  [['spinach', 'kale', 'basil', 'mint', 'cilantro', 'parsley', 'arugula', 'rocket', 'lettuce', 'herb', 'greens', 'scallion', 'chive', 'dill'], 'leaf', ['#5b7f2e', '#7da23f', '#3f6b2a']],
  [['salmon', 'trout'], 'fillet', ['#ef7d58', '#f6a98a']],
  [['tuna'], 'fillet', ['#c9303c', '#e46a6a']],
  [['shrimp', 'prawn'], 'fillet', ['#f39a7a', '#fbc6b0']],
  [['cod', 'fish', 'halibut', 'scallop'], 'fillet', ['#efe8db', '#ffffff']],
  [['beef', 'steak', 'short rib', 'lamb'], 'chunk', ['#7a2e24', '#9b4a3a']],
  [['chicken', 'turkey'], 'chunk', ['#e2b77a', '#f0d3a3']],
  [['pork', 'bacon', 'sausage', 'ham'], 'chunk', ['#c96a55', '#e7a98f']],
  [['tofu'], 'chunk', ['#f3ead2', '#fffaf0']],
  [['burrata', 'mozzarella', 'ricotta', 'feta', 'goat cheese', 'cream cheese', 'labneh', 'yogurt'], 'chunk', ['#fbf8f1', '#ffffff']],
  [['parmesan', 'cheddar', 'cheese'], 'dots', ['#f2dc9b', '#fbeec4']],
  [['avocado'], 'chunk', ['#6f9a3a', '#c8dd8a']],
  [['beet'], 'chunk', ['#7b1f4a', '#a8336a']],
  [['carrot', 'sweet potato', 'squash', 'pumpkin'], 'chunk', ['#e8722a', '#f39a3b']],
  [['potato'], 'chunk', ['#e3c57f', '#f2dca8']],
  [['mushroom'], 'round', ['#a68a6d', '#c9b08f']],
  [['tomato'], 'round', ['#d9404a', '#ee7a6a']],
  [['fig'], 'round', ['#5a1f4a', '#d9577f']],
  [['egg'], 'egg', ['#fbf6ec', '#f2b134']],
  [['pasta', 'noodle', 'spaghetti', 'linguine', 'udon', 'ramen'], 'noodle', ['#ecd18e', '#f5e3b0']],
  [['rice', 'quinoa', 'couscous', 'barley', 'oat'], 'dots', ['#f6f1e4', '#ffffff']],
  [['white bean', 'chickpea', 'cannellini'], 'dots', ['#efe2c6', '#fbf3e0']],
  [['bean', 'lentil'], 'dots', ['#8a4a2e', '#b06a45']],
  [['pomegranate', 'cherr', 'raspberr', 'strawberr', 'cranberr'], 'dots', ['#a51d36', '#d9404a']],
  [['blueberr', 'blackberr'], 'dots', ['#3a3f8f', '#5a5fb0']],
  [['pistachio', 'pea', 'edamame'], 'dots', ['#93b34a', '#b5d27a']],
  [['peanut', 'almond', 'walnut', 'pecan', 'hazelnut', 'nut', 'seed', 'sesame'], 'dots', ['#c99a52', '#e0bd82']],
  [['chocolate', 'cocoa'], 'dots', ['#4a2a1f', '#6b3e2d']],
  [['bread', 'toast', 'sourdough', 'baguette', 'tortilla', 'pita'], 'chunk', ['#d9a35b', '#ecc488']],
  [['onion', 'shallot', 'garlic', 'ginger'], 'ring', ['#e9d6e4', '#c98fb2']],
];

// pantry basics that don't show up on the plate
const HIDDEN = ['oil', 'salt', 'pepper', 'sugar', 'flour', 'butter', 'miso', 'soy', 'honey', 'vinegar', 'water', 'stock', 'broth',
  'vanilla', 'baking', 'sauce', 'paste', 'spice', 'cumin', 'paprika', 'syrup', 'wine', 'milk', 'cream'];

const FALLBACK = [['#c2410c', '#e8722a'], ['#7c2d5b', '#a8336a'], ['#4d7c0f', '#7da23f'], ['#b45309', '#e0a33a'], ['#9f1239', '#d9404a']];

// colours for tags and solid tiles, from the same jewel palette
export const JEWELS = ['#c2410c', '#7c2d5b', '#4d7c0f', '#b45309', '#9f1239', '#1e5a8a', '#0f766e'];

export function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const jewelFor = (text) => JEWELS[hash(text) % JEWELS.length];

function random(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// What a single ingredient looks like, or null if it stays off the plate.
export function pieceFor(name) {
  const text = name.toLowerCase();
  const match = PIECES.find(([words]) => words.some((word) => text.includes(word)));
  if (match) return { kind: match[1], colors: match[2] };
  if (HIDDEN.some((word) => text.includes(word))) return null;
  return { kind: 'chunk', colors: FALLBACK[hash(text) % FALLBACK.length] };
}

export function vesselFor(recipe) {
  const tags = recipe.tags.join(' ');
  if (/baking|sweet|dessert|cookie|cake/.test(tags)) return 'tray';
  if (/salad|fresh|raw/.test(tags)) return 'platter';
  return 'bowl';
}

const BACKGROUNDS = { tray: '#d7b98f', platter: '#d6d0c6', bowl: '#cfc8bc' };

// The full picture for a recipe: where each piece goes, at 400 × 400.
export function compose(recipe) {
  const rand = random(hash(recipe.id || recipe.title));
  const vessel = vesselFor(recipe);
  const seen = new Set();
  const ingredients = recipe.ingredients
    .map((line) => ingredientName(line))
    .filter((name) => name && !seen.has(name) && seen.add(name))
    .map((name) => ({ name, piece: pieceFor(name) }))
    .filter(({ piece }) => piece)
    .slice(0, 5);
  const pieces = [];
  const add = (piece, x, y, size) => pieces.push({
    ...piece, x, y, size, rot: Math.round(rand() * 360), delay: Math.round(pieces.length * 35),
  });

  if (vessel === 'tray') {
    // rows of the bake, with the toppings scattered over each one
    const toppings = ingredients.filter(({ piece }) => piece.kind === 'dots').map(({ piece }) => piece);
    const bake = { kind: 'round', colors: ['#c98b54', '#dba36c'] };
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const x = 95 + col * 105;
        const y = 95 + row * 105;
        add(bake, x, y, 38);
        (toppings.length ? toppings : [{ kind: 'dots', colors: ['#4a2a1f', '#6b3e2d'] }]).forEach((topping) => add(topping, x, y, 12));
      }
    }
  } else if (vessel === 'platter') {
    // everything scattered across the platter, larger pieces first
    const list = ingredients.length ? ingredients : [{ piece: { kind: 'leaf', colors: ['#5b7f2e', '#7da23f'] } }];
    list.forEach(({ piece }, i) => {
      const count = piece.kind === 'dots' ? 6 : 9 - i;
      for (let n = 0; n < count; n += 1) {
        const angle = rand() * Math.PI * 2;
        const radius = Math.sqrt(rand()) * 120;
        add(piece, 200 + Math.cos(angle) * radius * 1.15, 205 + Math.sin(angle) * radius * 0.85, piece.kind === 'dots' ? 16 : 26 + rand() * 10);
      }
    });
  } else {
    // a bowl: each ingredient in its own section around the middle, packed generously
    const list = ingredients.length ? ingredients : [{ piece: { kind: 'dots', colors: ['#f6f1e4', '#ffffff'] } }];
    const sections = list.slice(0, 5);
    sections.forEach(({ piece }, i) => {
      const angle = (i / sections.length) * Math.PI * 2 - Math.PI / 2;
      const single = sections.length === 1;
      const cx = single ? 200 : 200 + Math.cos(angle) * 66;
      const cy = single ? 200 : 200 + Math.sin(angle) * 66;
      const spread = single ? 150 : 70;
      const count = single ? 12 : 7;
      for (let n = 0; n < count; n += 1) {
        const big = piece.kind === 'dots' ? 18 : 30 + rand() * 10;
        add(piece, cx + (rand() - 0.5) * spread, cy + (rand() - 0.5) * spread, big);
      }
    });
  }

  // bowls get a base layer (rice, broth, greens…) in the colour of their first ingredient
  const base = vessel === 'bowl' ? (ingredients[0]?.piece.colors[1] ?? '#efe6d2') : null;
  return { vessel, background: BACKGROUNDS[vessel], base, pieces };
}
