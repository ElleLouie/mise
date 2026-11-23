/* eslint-disable max-len -- seed content: one palette or theme pool per line reads best */
// The seed library for vibes: palettes for the table, and themes that bring their own menus,
// table ideas, music and a moment. From the lock & reroll prototype (docs/prototype/reroll.js).

// Table palettes. The first seven are the original table moods, so their ids stay valid.
// `dark` palettes dim the room and let the candles glow.
export const PALETTES = [
  { id: 'gingham', name: 'Summer gingham', wood: '#a07b58', cloth: '#f7f1e3', check: '#5d86b3', plate: '#fffaf0', charger: '#d5e5ee', napkin: '#e9b949', flowers: ['#f2c14e', '#fffaf2', '#e9893f'], leaves: '#6f8a4e', metal: '#cfcfc8', candle: '#fffaf2', glass: '#e8f1f5', backdrop: '#f4ead6' },
  { id: 'ice', name: 'Ice & orange', wood: '#b59a7c', cloth: '#f4eee2', plate: '#ffffff', charger: '#8fc0dc', napkin: '#e8692c', flowers: ['#f08a4b', '#f6c39a', '#fffaf2'], leaves: '#6f8a6a', metal: '#cfd5da', candle: '#fffaf2', glass: '#d6eaf5', backdrop: '#f7f2e8' },
  { id: 'candlelight', name: 'Candlelight', dark: true, wood: '#4a2f22', cloth: '#5a1424', plate: '#efe6d6', charger: '#b08a4a', napkin: '#5f6420', flowers: ['#7a0f2b', '#a3264a', '#3d0a17'], leaves: '#3e4a22', metal: '#c49a52', candle: '#f2e8d5', glass: '#f3e1c8', backdrop: '#2a0f1a' },
  { id: 'garden', name: 'Garden', wood: '#a08466', cloth: '#eee8da', plate: '#fbf8f1', charger: '#c9cfb6', napkin: '#a6b38c', flowers: ['#f1b8b0', '#f7d9c4', '#fffaf2'], leaves: '#7d8f5c', metal: '#c9ccd1', candle: '#fffaf2', glass: '#e9f0ea', backdrop: '#e7e2d3' },
  { id: 'citrus', name: 'Citrus', wood: '#9a7b5c', cloth: '#f4ecd9', plate: '#ffffff', charger: '#2f4f9e', napkin: '#3a5cad', flowers: ['#f2c53d', '#f7dc6f', '#ffffff'], leaves: '#56743a', metal: '#cfd2d6', candle: '#fffaf2', glass: '#eef3f8', backdrop: '#ebe4d2' },
  { id: 'plum', name: 'Plum & olive', dark: true, wood: '#3a2419', cloth: '#3a1625', plate: '#f4ead9', charger: '#4b1d31', napkin: '#8f9a2e', flowers: ['#8e1f45', '#c25a7a', '#efe2d2'], leaves: '#5d6b14', metal: '#c49a52', candle: '#f4ead9', glass: '#f0dfe4', backdrop: '#2a0f1a' },
  { id: 'linen', name: 'Linen', wood: '#7d6450', cloth: '#d9cdb6', plate: '#cbbca4', charger: '#8a7a63', napkin: '#a4502f', flowers: ['#c9a27a', '#e6d3b3', '#a4502f'], leaves: '#8a8a5c', metal: '#2b2622', candle: '#f2e8d5', glass: '#efe8dc', backdrop: '#cfc3ab' },
  { id: 'cherry', name: 'Cherry pie', wood: '#a5764f', cloth: '#f6efe4', check: '#c8323c', plate: '#fffaf2', charger: '#f0d9a8', napkin: '#c8323c', flowers: ['#d6334a', '#ffffff', '#f4b6c2'], leaves: '#5f7d43', metal: '#d0cdc6', candle: '#fffaf2', glass: '#f3e7e7', backdrop: '#f6e6d4' },
  { id: 'bistro', name: 'Bistro navy & apricot', wood: '#8a6446', cloth: '#f8f2e6', check: '#26365e', plate: '#ffffff', charger: '#f1b07a', napkin: '#26365e', flowers: ['#f4a259', '#fbe3c4', '#ffffff'], leaves: '#6a7d4a', metal: '#c49a52', candle: '#fffaf2', glass: '#eef0f4', backdrop: '#f3e8d8' },
  { id: 'midnight', name: 'Midnight & rust', dark: true, wood: '#2b1f1a', cloth: '#1d2333', plate: '#e9e4da', charger: '#2f3a55', napkin: '#b8562f', flowers: ['#e8d3b0', '#b8562f', '#f4ede1'], leaves: '#3f4d3a', metal: '#c49a52', candle: '#f2e8d5', glass: '#dfe5f0', backdrop: '#141826' },
  { id: 'pistachio', name: 'Pistachio & blush', wood: '#a08466', cloth: '#e4ead2', plate: '#fffdf6', charger: '#b9c79a', napkin: '#f2b5a8', flowers: ['#f2b5a8', '#fff7e6', '#e7836f'], leaves: '#7b8f52', metal: '#d6c38f', candle: '#fffaf2', glass: '#eef3e8', backdrop: '#eef0e0' },
  { id: 'tomato', name: 'Tomato & basil', wood: '#9a6f4c', cloth: '#f5ecdc', check: '#d9432b', plate: '#fffaf2', charger: '#e9d9b8', napkin: '#3f6b3a', flowers: ['#e4572e', '#f6b042', '#fffaf2'], leaves: '#4f7a36', metal: '#cfcfc8', candle: '#fffaf2', glass: '#f5ebe3', backdrop: '#f3e6d0' },
  { id: 'alpine', name: 'Alpine check', wood: '#6b4a35', cloth: '#f2efe8', check: '#a3242c', plate: '#fffefb', charger: '#6b4a35', napkin: '#a3242c', flowers: ['#ffffff', '#e7e2d6', '#a3242c'], leaves: '#3d5a3a', metal: '#bfc4c8', candle: '#fffaf2', glass: '#eef2f4', backdrop: '#dfe6ea' },
];

// Each theme brings its own pools; a slot can also borrow from any theme (see reroll.js).
export const THEMES = [
  { id: 'pie', emoji: '🥧', name: 'Pie party', blurb: 'Everyone brings a pie. You bring the ice cream.', palettes: ['cherry', 'gingham', 'garden'],
    menus: [['Chicken & leek pie', 'Sour cherry lattice pie', 'Vanilla ice cream, a whole tub', 'Cold milk & strong coffee'], ['Tomato galette', 'Salted honey pie', 'Bitter leaf salad', 'A big bowl of whipped cream']],
    tables: ['Mismatched cake stands down the middle', 'Little paper flags naming each pie', 'Forks standing in jam jars'],
    sounds: ['60s soul, low', 'Dolly Parton, front to back'], moments: ['Guests vote for a "best crust" ribbon', 'Everyone leaves with a slice wrapped in paper'] },
  { id: 'bakery', emoji: '🥐', name: 'Saturday French bakery', blurb: 'A late, slow breakfast that feels like Paris.', palettes: ['bistro', 'linen', 'ice'],
    menus: [['Croissants & pain au chocolat', 'Tartines with salted butter & apricot jam', 'A soft, herby omelette', 'Café au lait in bowls'], ['Quiche Lorraine', 'Radishes with butter & flaky salt', 'Warm madeleines', 'Fresh orange juice']],
    tables: ['A brown paper bag at every seat', 'Butter on a wooden board', 'One baguette laid down the length of the table'],
    sounds: ['Françoise Hardy', 'Jazz manouche'], moments: ['A chalkboard "menu du jour" by the door', 'Pastries served straight from the bag'] },
  { id: 'raclette', emoji: '🧀', name: 'Raclette night', blurb: 'Melted cheese, pickles and nowhere to be.', palettes: ['alpine', 'candlelight', 'linen'],
    menus: [['Raclette scraped over little potatoes', 'Cornichons & pickled onions', 'Air-dried ham', 'Poached pears']],
    tables: ['Wooden boards everywhere', 'Wool blankets over the chairs', 'Pine branches in place of flowers'],
    sounds: ['Bill Evans, quietly'], moments: ['Everyone in their coziest socks'] },
  { id: 'tins', emoji: '🐟', name: 'Tinned fish & spritz', blurb: 'Open some tins, call it dinner.', palettes: ['ice', 'citrus', 'tomato'],
    menus: [['Five tins with beautiful labels', 'Crusty bread & cultured butter', 'Lemony potato salad', 'Aperol spritz by the jug']],
    tables: ['Opened tins on one big platter', 'Little bowls of lemon wedges', 'Striped paper napkins'],
    sounds: ['Italian 60s pop'], moments: ['Guests rate the tins on a scorecard'] },
  { id: 'tomato', emoji: '🍅', name: 'Late-summer tomato supper', blurb: 'Every dish is tomatoes. Nobody complains.', palettes: ['tomato', 'gingham', 'garden'],
    menus: [['Tomato & peach salad', 'Pan con tomate', 'Slow-roast tomato pasta', 'Olive oil cake']],
    tables: ['Heirloom tomatoes as the centrepiece', 'Basil sprigs in water glasses'],
    sounds: ['Bossa nova'], moments: ['Eat outside until it gets dark'] },
  { id: 'midnight', emoji: '🍝', name: 'Midnight pasta', blurb: 'Dinner starts at ten. Dress up for spaghetti.', palettes: ['midnight', 'plum', 'candlelight'],
    menus: [['Spaghetti alle vongole', 'Burrata with good olive oil', 'Tiramisu in little glasses'], ['Cacio e pepe', 'Bitter leaves & anchovy', 'Affogato']],
    tables: ['Every candle you own', 'Wine bottles as candlesticks'],
    sounds: ['Paolo Conte', 'Late-night Italo disco'], moments: ['Pasta finished in the pan, at the table'] },
  { id: 'dumplings', emoji: '🥟', name: 'Dumpling folding party', blurb: 'Dinner is the activity.', palettes: ['pistachio', 'garden', 'ice'],
    menus: [['Pork & chive dumplings', 'Mushroom dumplings', 'Smashed cucumber salad', 'A chili crisp bar']],
    tables: ['A flour-dusted board at every place', 'Tiny dipping bowls everywhere'],
    sounds: ['City pop'], moments: ['The ugliest dumpling wins a prize'] },
  { id: 'tea', emoji: '🫖', name: 'Garden tea party', blurb: 'Cake at four. Nobody leaves until eight.', palettes: ['garden', 'pistachio', 'cherry'],
    menus: [['Cucumber sandwiches', 'Victoria sponge', 'Scones with jam & cream', 'Iced tea with mint']],
    tables: ['Mismatched vintage teacups', 'Flowers arranged in teapots'],
    sounds: ['Nick Drake'], moments: ['Hats strongly encouraged'] },
  { id: 'fondue', emoji: '🫕', name: 'Fondue après-ski', blurb: 'Pretend you skied today.', palettes: ['alpine', 'candlelight', 'midnight'],
    menus: [['Cheese fondue with crusty bread', 'Chocolate fondue with strawberries', 'Hot spiced cider']],
    tables: ['Long forks standing in a crock', 'Tartan blankets'],
    sounds: ['70s soft rock'], moments: ['Drop your bread, sing a song'] },
  { id: 'brinner', emoji: '🥞', name: 'Breakfast for dinner', blurb: 'Pancakes at 8pm. Pajamas optional.', palettes: ['citrus', 'gingham', 'cherry'],
    menus: [['Buttermilk pancakes', 'Crispy bacon', 'Big fruit salad', 'Mimosas']],
    tables: ['Syrup in little jugs', 'Diner-style mugs'],
    sounds: ['Motown'], moments: ['A pancake topping bar'] },
  { id: 'oysters', emoji: '🦪', name: 'Oysters & champagne', blurb: 'Small, loud and a little bit fancy.', palettes: ['ice', 'midnight', 'linen'],
    menus: [['Oysters with mignonette', 'Fries with aioli', 'Champagne, cold']],
    tables: ['A big bowl of crushed ice', 'Gold-rimmed coupes'],
    sounds: ['Disco'], moments: ['A toast for every dozen oysters'] },
  { id: 'mezze', emoji: '🫓', name: 'Mezze on the floor', blurb: 'Cushions, a low table and too many dips.', palettes: ['linen', 'plum', 'tomato'],
    menus: [['Hummus, baba ganoush & labneh', 'Warm flatbread', 'Lamb kofta', 'Pistachio baklava']],
    tables: ['Floor cushions around a low table', 'Brass trays'],
    sounds: ['Ethio-jazz'], moments: ['Eat with your hands'] },
  { id: 'lemon', emoji: '🍋', name: 'Lemon everything', blurb: 'One ingredient, five courses.', palettes: ['citrus', 'ice', 'pistachio'],
    menus: [['Lemon & ricotta pasta', 'Lemon roast chicken', 'Lemon tart', 'Limoncello']],
    tables: ['A bowl of lemons with their leaves', 'Yellow napkins knotted loosely'],
    sounds: ['Amalfi summer playlist'], moments: ['A limoncello toast to finish'] },
  { id: 'roast', emoji: '🍗', name: 'Long Sunday roast', blurb: 'Lunch that turns into dinner.', palettes: ['linen', 'candlelight', 'garden'],
    menus: [['Roast chicken with lemon & thyme', 'Very crispy potatoes', 'Greens with butter', 'Sticky toffee pudding']],
    tables: ['Gravy in pewter jugs', 'Wildflowers in old bottles'],
    sounds: ['Fleetwood Mac'], moments: ['Board games after pudding'] },
];

// The six slots of a vibe, in the order they're shown
export const SLOTS = [
  { key: 'theme', label: 'Theme' }, { key: 'palette', label: 'Palette' }, { key: 'menu', label: 'Menu' },
  { key: 'table', label: 'On the table' }, { key: 'sound', label: 'Sound' }, { key: 'moment', label: 'The moment' },
];

// which theme pool each slot draws from, and every theme's pools together
export const POOL = { menu: 'menus', table: 'tables', sound: 'sounds', moment: 'moments' };
export const ALL = Object.fromEntries(Object.entries(POOL).map(([key, pool]) => [key, THEMES.flatMap((theme) => theme[pool])]));

export const paletteFor = (id) => PALETTES.find((palette) => palette.id === id) ?? null;
export const themeFor = (id) => THEMES.find((theme) => theme.id === id) ?? null;
