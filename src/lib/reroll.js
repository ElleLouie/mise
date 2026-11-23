// Lock & reroll: pick a theme, then fill each slot, mostly from the theme's own pools and sometimes
// from any theme (a "remix"). Pure functions; pass `random` (0 <= n < 1) to make results repeatable.
import {
  THEMES, PALETTES, SLOTS, POOL, ALL, paletteFor, themeFor,
} from './seeds.js';

// how often a slot sticks to its theme's own pool
export const STAY = { palette: 0.75, menu: 0.85, table: 0.75, sound: 0.75, moment: 0.75 };

// slot values compare by what they show: a theme or palette by id, a menu by its dishes
const keyOf = (value) => {
  if (value == null) return null;
  if (Array.isArray(value)) return value.join('\n');
  if (typeof value === 'object') return value.id;
  return value;
};
export const sameValue = (a, b) => keyOf(a) === keyOf(b);

const any = (list, random) => list[Math.floor(random() * list.length)];

// one option from the primary pool (with the given chance) or the global one, never the current value
export function pickFrom(primary, global, current, chance, random = Math.random) {
  let options = (random() < chance ? primary : global).filter((x) => !sameValue(x, current));
  if (!options.length) options = global.filter((x) => !sameValue(x, current));
  if (!options.length) return current;
  return any(options, random);
}

// a new value for one slot; the other slots stay as they are
export function rollSlot(vibe, key, random = Math.random) {
  if (key === 'theme') {
    return { ...vibe, themeId: pickFrom(THEMES, THEMES, themeFor(vibe.themeId), 1, random).id };
  }
  const theme = themeFor(vibe.themeId);
  if (key === 'palette') {
    const own = theme ? theme.palettes.map(paletteFor) : PALETTES;
    return { ...vibe, palette: pickFrom(own, PALETTES, vibe.palette, STAY.palette, random) };
  }
  const global = ALL[key];
  const own = theme ? theme[POOL[key]] : global;
  return { ...vibe, [key]: pickFrom(own, global, vibe[key], STAY[key], random) };
}

// reroll every unlocked slot of `keys`; the theme goes first so the other slots follow it
export function roll(vibe, keys = SLOTS.map((s) => s.key), locks = [], random = Math.random) {
  const changed = keys.filter((key) => !locks.includes(key));
  let next = vibe;
  if (changed.includes('theme')) next = rollSlot(next, 'theme', random);
  changed.filter((key) => key !== 'theme').forEach((key) => { next = rollSlot(next, key, random); });
  return { vibe: next, changed };
}

// a palette from outside the theme's own set
export const isRemix = (vibe) => {
  const theme = themeFor(vibe.themeId);
  return Boolean(theme && vibe.palette && !theme.palettes.includes(vibe.palette.id));
};

// the same six slots
export const sameVibe = (a, b) => sameValue(a.themeId, b.themeId) && SLOTS.slice(1).every(({ key }) => sameValue(a[key], b[key]));

// where Discover starts: the first theme in its own colours
export function firstVibe() {
  const theme = THEMES[0];
  return {
    themeId: theme.id,
    palette: paletteFor(theme.palettes[0]),
    menu: theme.menus[0],
    table: theme.tables[0],
    sound: theme.sounds[0],
    moment: theme.moments[0],
    locks: [],
  };
}
