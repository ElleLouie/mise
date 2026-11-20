# mise

A small dinner party planner. Pick a menu, and mise builds the shopping list, a cooking timeline that works back from dinner time, and a 3D table setting for inspiration.

## Features

- **Parties:** a date, a dinner time and your guests
- **Ideas:** six themed dinners with a full menu; plan one in a tap
- **Menu:** starters, mains, sides and dessert from your recipes, or simple items like "Baguette"
- **Shopping:** one list for the whole party, scaled for your guests and sorted by aisle, with your own extras, "Have it" for what's already at home, and what goes on the table
- **Timeline:** every step on one clock, ending as each course is served
- **Table:** a 3D table in one of seven styles, with your guests' names on place cards
- **Installable and offline,** with a JSON backup

## Running locally

```bash
npm install
npm run dev
```

- `npm run build` builds the app into `dist/`
- `npm run preview` serves the production build
- `npm run lint` checks the code
- `npm test` runs the unit tests for ingredients, the shopping list, the timeline, aisles and timers

Built with React, Vite, Fraunces and Figtree, three.js, Dexie (IndexedDB) and vite-plugin-pwa. Hosted on Netlify (settings in `netlify.toml`).
