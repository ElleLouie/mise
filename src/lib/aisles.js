// Groups shopping list items by where they usually are in the shop.

const words = (list) => new RegExp(`\\b(?:${list.join('|')})`);

const AISLES = [
  ['Produce', words([
    'apple', 'avocado', 'basil', 'berr', 'cabbage', 'carrot', 'celery', 'chive', 'cilantro', 'cucumber', 'garlic', 'ginger',
    'herb', 'kale', 'leek', 'lemon', 'lettuce', 'lime', 'mint', 'mushroom', 'onion', 'orange', 'parsley', 'pea', 'pepper',
    'potato', 'scallion', 'shallot', 'spinach', 'squash', 'tomato', 'zucchini', 'fruit', 'vegetable', 'greens',
  ])],
  ['Meat & fish', words([
    'beef', 'chicken', 'pork', 'lamb', 'turkey', 'bacon', 'sausage', 'salmon', 'fish', 'shrimp', 'prawn', 'tuna', 'cod',
    'rib', 'steak', 'mince',
  ])],
  ['Dairy & eggs', words(['butter', 'cheese', 'parmesan', 'mozzarella', 'feta', 'milk', 'cream', 'yogurt', 'yoghurt', 'egg'])],
  ['Bakery', words(['bread', 'bun', 'baguette', 'tortilla', 'pita', 'sourdough'])],
  ['Pantry', words([
    'flour', 'sugar', 'rice', 'pasta', 'noodle', 'bean', 'lentil', 'chickpea', 'oil', 'vinegar', 'sauce', 'miso', 'honey',
    'stock', 'broth', 'spice', 'salt', 'vanilla', 'baking', 'chocolate', 'nut', 'peanut', 'oat', 'can', 'tin', 'paste',
    'mustard', 'cumin', 'paprika',
  ])],
];

export function aisleFor(name) {
  const text = name.toLowerCase();
  return AISLES.find(([, pattern]) => pattern.test(text))?.[0] ?? 'Other';
}

export const aisleOrder = [...AISLES.map(([aisle]) => aisle), 'Other'];
