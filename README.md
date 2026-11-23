# mise

Dinner party inspiration. Reroll a vibe (a theme, a palette, a menu, what's on the table, the music and one small moment) and watch a 3D table change with it. Lock what you like, save the ones you love, and when you want to host one, mise plans it for you.

## Features

- **Discover:** reroll everything with the button or the space bar, or one slot at a time; lock a slot to keep it. The app takes on the palette.
- **Saved:** the vibes you've kept, and the dinners you're hosting soon
- **Ideas:** six themed dinners with a full menu; plan one in a tap

### Planning (optional, per vibe)

"Host this" adds a plan to a vibe: a date, a dinner time and your guests, with its menu as a starting point.

- **Menu:** starters, mains, sides and dessert from your recipes, or simple items like "Baguette"
- **Shopping:** one list for the whole party, scaled for your guests and sorted by aisle, with your own extras, "Have it" for what's already at home, and what goes on the table
- **Timeline:** every step on one clock, ending as each course is served
- **Table:** the 3D table in the vibe's palette, with your guests' names on place cards

Everything stays on your device: installable, offline, with a JSON backup.

## Running locally

```bash
npm install
npm run dev
```

- `npm run build` builds the app into `dist/`
- `npm run preview` serves the production build
- `npm run lint` checks the code
- `docs/prototype/reroll.js` is the original prototype the reroll board is based on
- `npm test` runs the unit tests: the reroll logic, the seed library, palette contrast, the database migration, ingredients, the shopping list, the timeline, aisles and timers

Built with React, Vite, Fraunces and Figtree, three.js, Dexie (IndexedDB) and vite-plugin-pwa. Hosted on Netlify (settings in `netlify.toml`).
