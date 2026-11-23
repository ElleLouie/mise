// A vibe: a theme, a palette, a menu, what's on the table, the music and one moment, saved to come back to.
// Planning is optional: `plan` is null until you host it, then holds what a dinner party used to.
//
// { id, name, themeId, palette, menu[], table, sound, moment, locks[], savedAt,
//   plan: null | { date, time, guests, names, dishes, bought, ...the rest of the planning state } }
import { moodFor } from './moods.js';
import { themeFor } from './seeds.js';

const DAY = 24 * 60 * 60 * 1000;

// a copy of the palette, so a saved vibe keeps its colours even if the seeds change
const paletteCopy = (id) => ({ ...moodFor(id), flowers: [...moodFor(id).flowers] });

// A dinner party from before vibes, kept whole: its planning state moves into `plan`.
export function partyToVibe(party, recipes = []) {
  const {
    id, name, mood, createdAt, ...plan
  } = party;
  const titles = new Map(recipes.map((recipe) => [recipe.id, recipe.title]));
  const menu = (plan.dishes ?? []).map((dish) => dish.text ?? titles.get(dish.recipeId)).filter(Boolean);
  return {
    id,
    name: name ?? '',
    themeId: null,
    palette: paletteCopy(mood),
    menu,
    table: null,
    sound: plan.vibe?.music || null,
    moment: plan.vibe?.dress ? `Dress code: ${plan.vibe.dress}` : null,
    locks: [],
    savedAt: createdAt ?? plan.updatedAt ?? Date.now(),
    plan: {
      names: [], bought: [], dishes: [], ...plan,
    },
  };
}

// The planning pages (and party.js) work on a party: the plan, plus the vibe's id, name and palette.
export const planView = (vibe) => ({
  ...vibe.plan, id: vibe.id, name: vibe.name, mood: vibe.palette.id, palette: vibe.palette,
});

// …and their changes go back into the vibe. Picking another table style changes the vibe's palette.
export function applyPlanView(vibe, view) {
  // the id and palette belong to the vibe, not the plan
  const {
    id, name, mood, palette, ...plan
  } = view;
  return {
    ...vibe,
    name,
    palette: mood && mood !== vibe.palette.id ? paletteCopy(mood) : vibe.palette,
    plan,
  };
}

// a first guess at which course a menu line is
const SWEET = /\b(?:ice cream|cake|tart|pudding|tiramisu|affogato|baklava|madeleines?|scones?|sponge|crumble|lattice|honey pie|chocolate|strawberr|pears|whipped cream)/i;
const DRINK = /\b(?:coffee|juice|spritz|champagne|cider|tea|mimosas?|milk|limoncello|wine)\b/i;
const SIDE = /\b(?:salad|bread|potato(?:es)?|fries|greens|radishes|cornichons|pickled|flatbread|baguette|rice|leaves)\b/i;
export function guessCourse(text) {
  if (SWEET.test(text)) return 'dessert';
  if (DRINK.test(text)) return 'starter';
  if (SIDE.test(text)) return 'side';
  return 'main';
}

const iso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// "Host this": a plan for a week from now, with the vibe's menu as simple dishes
export function newPlan(vibe, now = Date.now()) {
  return {
    date: iso(new Date(now + 7 * DAY)),
    time: '19:30',
    guests: 6,
    names: [],
    dishes: (vibe.menu ?? []).map((text) => ({ text, course: guessCourse(text) })),
    bought: [],
    createdAt: now,
    updatedAt: now,
  };
}

// what to call a vibe: the name you gave it, else its theme
export const vibeTitle = (vibe) => vibe.name || themeFor(vibe.themeId)?.name || 'Dinner party';
export const vibeEmoji = (vibe) => themeFor(vibe.themeId)?.emoji ?? '🍽️';
