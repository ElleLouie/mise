// A dinner party: the menu, one shopping list for it, and a cooking timeline that works back from dinner time.
import {
  parseIngredient, formatQuantity, scaleIngredient, ingredientName, sameName, UNITS,
} from './ingredients.js';
import { findTimers } from './timers.js';
import { aisleFor } from './aisles.js';
import { decorFor } from './moods.js';

// when each course reaches the table, in minutes after sitting down
export const COURSES = [
  { id: 'starter', name: 'Starters', offset: 0 },
  { id: 'main', name: 'Mains', offset: 30 },
  { id: 'side', name: 'Sides', offset: 30 },
  { id: 'dessert', name: 'Dessert', offset: 90 },
];

// a first guess at the course from the recipe's tags
export function courseFor(recipe) {
  const tags = recipe.tags.map((tag) => tag.toLowerCase());
  if (tags.some((tag) => ['starter', 'appetizer', 'snack'].includes(tag))) return 'starter';
  if (tags.some((tag) => ['dessert', 'sweet', 'baking'].includes(tag))) return 'dessert';
  if (tags.some((tag) => ['side', 'salad'].includes(tag))) return 'side';
  return 'main';
}

const courseOf = (id) => COURSES.find((course) => course.id === id) ?? COURSES[1];

// "19:30" on "2026-12-05" as a local Date
export function partyTime(date, time) {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
}

// Guests: the number you set, or more if you've named more people than that
export const seatsFor = (party) => Math.max(party.guests, party.names?.length ?? 0);

// The menu's recipes, with how much to scale each one for the guests.
export function menuDishes(party, recipes) {
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  return party.dishes
    .filter((dish) => byId.has(dish.recipeId))
    .map((dish) => {
      const recipe = byId.get(dish.recipeId);
      return { ...dish, recipe, factor: seatsFor(party) / recipe.servings };
    });
}

const SEASONING = /^(?:salt|pepper|salt and pepper|water)$/;

// One list for the whole menu: the same ingredient from different dishes becomes one line,
// with amounts added up when they're written the same way ("2 lemons" + "1 lemon" = "3 lemons").
export function shoppingList(dishes) {
  const items = new Map();
  dishes.forEach(({ recipe, factor }) => {
    recipe.ingredients.forEach((line) => {
      const name = ingredientName(line) || line.trim().toLowerCase();
      if (SEASONING.test(name)) return;
      const key = sameName(name);
      const item = items.get(key) ?? { key, name, lines: [], dishes: [] };
      item.lines.push(scaleIngredient(line, factor));
      if (!item.dishes.includes(recipe.title)) item.dishes.push(recipe.title);
      items.set(key, item);
    });
  });
  return [...items.values()].map((item) => ({ ...item, text: combine(item.lines, item.name) }));
}

// Everything to get for the party, each with an aisle: the menu's ingredients, simple menu items
// ("Baguette"), things you added yourself ("Wine") and what goes on the table.
export function partyShopping(party, dishes) {
  const items = shoppingList(dishes).map((item) => ({ ...item, aisle: aisleFor(item.name) }));
  party.dishes.filter((dish) => dish.text).forEach((dish) => {
    items.push({ key: `menu:${dish.text.toLowerCase()}`, text: dish.text, aisle: aisleFor(dish.text), dishes: [] });
  });
  (party.extras ?? []).forEach((extra) => {
    items.push({ key: `extra:${extra.id}`, text: extra.text, aisle: aisleFor(extra.text), extra: extra.id, dishes: [] });
  });
  decorFor(party.mood, seatsFor(party)).forEach((text, i) => {
    items.push({ key: `table:${party.mood}:${i}`, text, aisle: 'For the table', dishes: [] });
  });
  return items;
}

const unitOf = (rest) => sameName(rest.replace(/,.*$/, ''));
const capital = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// "lemon" after a number becomes "lemons", "blood orange" becomes "blood oranges"; longer names are left alone
function plural(rest, amount) {
  const words = rest.trim().split(/\s+/);
  if (amount <= 1 || words.length > 2 || /[(s]$/i.test(rest) || words.some((word) => /s$/i.test(word))) return rest;
  return /(?:o|ch|sh|x)$/i.test(rest) ? `${rest}es` : `${rest}s`;
}

// You can't buy half a chicken or a quarter of an egg: things counted without a unit round up.
function tidy({ quantity, rest, gap }) {
  const counted = !UNITS.test(rest);
  const amount = counted ? Math.ceil(quantity - 0.01) : quantity;
  const name = counted ? plural(rest.replace(/,.*$/, ''), amount) : rest;
  return `${formatQuantity(amount)}${gap}${name}`;
}

function combine(lines, name) {
  const parsed = lines.map(parseIngredient);
  // no amounts at all ("Flaky salt"): just the name, once
  if (parsed.every((p) => p.quantity === null)) return capital(parsed[0].rest);
  const sameUnit = parsed.every((p) => p.quantity !== null && p.quantityMax === null && unitOf(p.rest) === unitOf(parsed[0].rest));
  if (lines.length === 1 && sameUnit) return tidy(parsed[0]);
  if (lines.length === 1) return lines[0];
  // different units ("3 tbsp" and "½ cup" of olive oil): the name is all you need at the shop
  if (!sameUnit) return capital(name);
  const total = parsed.reduce((sum, p) => sum + p.quantity, 0);
  // keep the plural spelling if any line had it
  const rest = parsed.map((p) => p.rest.replace(/,.*$/, '')).sort((a, b) => b.length - a.length)[0];
  return tidy({ quantity: total, rest, gap: parsed[0].gap });
}

const MIN_STEP = 5;

// How long each step takes: the time written in the step ("bake for 25 minutes"),
// with the rest of the recipe's time shared between the steps that don't say.
// Everything rounds up to 5 minutes so the clock reads 6:45, not 6:47.
const toFive = (minutes) => Math.max(MIN_STEP, Math.ceil(minutes / 5) * 5);

export function stepMinutes(recipe) {
  const written = recipe.steps.map((step) => {
    const timers = findTimers(step);
    return timers.length ? toFive(timers.reduce((sum, t) => sum + t.seconds, 0) / 60) : null;
  });
  const untimed = written.filter((m) => m === null).length;
  const known = written.reduce((sum, m) => sum + (m ?? 0), 0);
  const share = untimed ? toFive((recipe.minutes - known) / untimed) : 0;
  return written.map((m) => m ?? share);
}

// desserts and make-ahead dishes are ready before guests arrive; only the last step happens at serving time
const makeAhead = (recipe, course) => course === 'dessert' || recipe.tags.some((tag) => /make.?ahead/i.test(tag));
const ARRIVE = 30;

// Every step of every dish on one clock, ending as each course is served.
export function timeline(party, dishes) {
  const sitDown = partyTime(party.date, party.time);
  const events = [];
  dishes.forEach(({ recipe, course }) => {
    const serve = new Date(sitDown.getTime() + courseOf(course).offset * 60000);
    const minutes = stepMinutes(recipe);
    let end = serve.getTime();
    for (let i = recipe.steps.length - 1; i >= 0; i -= 1) {
      // the steps before the last one finish before guests arrive
      if (i === recipe.steps.length - 2 && recipe.steps.length > 1 && makeAhead(recipe, course)) {
        end = Math.min(end, sitDown.getTime() - (ARRIVE + 15) * 60000);
      }
      const start = end - minutes[i] * 60000;
      events.push({ at: new Date(start), minutes: minutes[i], text: recipe.steps[i], dish: recipe.title, recipeId: recipe.id });
      end = start;
    }
  });
  // one "serve" moment per course time (mains and sides go out together)
  const served = new Set();
  COURSES.filter((course) => dishes.some((dish) => dish.course === course.id)).forEach((course) => {
    if (served.has(course.offset)) return;
    served.add(course.offset);
    events.push({ at: new Date(sitDown.getTime() + course.offset * 60000), text: `Serve the ${course.name.toLowerCase()}`, serve: true });
  });
  if (dishes.length) {
    events.push({ at: new Date(sitDown.getTime() - (ARRIVE + 15) * 60000), minutes: 15, text: 'Set the table', host: true });
    events.push({ at: new Date(sitDown.getTime() - ARRIVE * 60000), text: 'Guests arrive', serve: true });
  }
  return events.sort((a, b) => a.at - b.at || (a.serve ? 1 : 0) - (b.serve ? 1 : 0));
}

// "6:45 PM", with the day when it isn't the party day ("Fri 4:00 PM")
export function clockLabel(at, partyDate) {
  const time = at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const sameDay = at.toDateString() === partyTime(partyDate, '00:00').toDateString();
  return sameDay ? time : `${at.toLocaleDateString('en-US', { weekday: 'short' })} ${time}`;
}

// a party stays "coming up" until the next morning
export const isUpcoming = (party, now) => partyTime(party.date, party.time).getTime() > now - 12 * 60 * 60 * 1000;

export function partyDateLabel(party) {
  return partyTime(party.date, party.time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
