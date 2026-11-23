/* mise: lock & reroll prototype */
(() => {
const THREE = window.__THREE;

// ---------- palettes (the first seven are mise's current table moods) ----------
const PALETTES = [
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
const PAL = Object.fromEntries(PALETTES.map((p) => [p.id, p]));

// ---------- seed library: each theme brings its own pools; slots can also borrow from any theme ----------
const THEMES = [
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
const ALL = {
  menu: THEMES.flatMap((t) => t.menus), table: THEMES.flatMap((t) => t.tables),
  sound: THEMES.flatMap((t) => t.sounds), moment: THEMES.flatMap((t) => t.moments),
};
const POOL = { menu: 'menus', table: 'tables', sound: 'sounds', moment: 'moments' };
const SLOTS = [
  { key: 'theme', label: 'Theme' }, { key: 'palette', label: 'Palette' }, { key: 'menu', label: 'Menu' },
  { key: 'table', label: 'On the table' }, { key: 'sound', label: 'Sound' }, { key: 'moment', label: 'The moment' },
];

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
function pickFrom(primary, global, current, chance) {
  let options = (Math.random() < chance ? primary : global).filter((x) => x !== current);
  if (!options.length) options = global.filter((x) => x !== current);
  return rnd(options);
}

const state = {};
const locks = new Set();
function rollSlot(key) {
  const theme = state.theme;
  if (key === 'theme') state.theme = pickFrom(THEMES, THEMES, state.theme, 1);
  else if (key === 'palette') state.palette = pickFrom(theme.palettes.map((id) => PAL[id]), PALETTES, state.palette, 0.75);
  else state[key] = pickFrom(theme[POOL[key]], ALL[key], state[key], key === 'menu' ? 0.85 : 0.75);
}
function roll(keys) {
  const todo = keys.filter((k) => !locks.has(k));
  if (todo.includes('theme')) rollSlot('theme');
  todo.filter((k) => k !== 'theme').forEach(rollSlot);
  return todo;
}

// ---------- UI ----------
const $ = (s) => document.querySelector(s);
const ICON = {
  locked: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  open: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>',
  reroll: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
};
const dots = (p) => `<span class="dots">${[p.check ?? p.cloth, p.napkin, p.flowers[0], p.charger].map((c) => `<i style="background:${c}"></i>`).join('')}</span>`;
function valueOf(key) {
  const v = state[key];
  if (key === 'theme') return `<span class="emoji">${v.emoji}</span> ${v.name}`;
  if (key === 'palette') return `${dots(v)} ${v.name}`;
  if (key === 'menu') return `<ul class="menu">${v.map((d) => `<li>${d}</li>`).join('')}</ul>`;
  return v;
}
function render(changed = SLOTS.map((s) => s.key)) {
  $('#emoji').textContent = state.theme.emoji;
  $('#title').textContent = state.theme.name;
  $('#blurb').textContent = state.theme.blurb;
  const remix = state.theme.palettes.includes(state.palette.id) ? '' : ' · remixed';
  $('#kicker').textContent = `Tonight${remix}`;
  $('#slots').innerHTML = SLOTS.map(({ key, label }) => {
    const on = locks.has(key);
    return `<div class="slot${on ? ' locked' : ''}" data-key="${key}">
      <div class="slot_label">${label}</div>
      <div class="slot_value${changed.includes(key) ? ' flip' : ''}">${valueOf(key)}</div>
      <div class="slot_btns">
        <button class="mini" data-roll="${key}" aria-label="Reroll ${label}" title="Reroll just this" ${on ? 'disabled' : ''}>${ICON.reroll}</button>
        <button class="mini lock" data-lock="${key}" aria-pressed="${on}" aria-label="${on ? 'Unlock' : 'Lock'} ${label}" title="${on ? 'Unlock' : 'Keep this'}">${on ? ICON.locked : ICON.open}</button>
      </div></div>`;
  }).join('');
  $('#save').setAttribute('aria-pressed', String(saved.some((s) => same(s, state))));
  tint(state.palette);
  scene.setPalette(state.palette, changed.includes('palette'));
}
function tint(p) {
  const r = document.documentElement.style;
  r.setProperty('--bg', p.backdrop);
  r.setProperty('--ink', p.dark ? '#f4ede1' : '#2a211b');
  r.setProperty('--card', p.dark ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.5)');
  r.setProperty('--line', p.dark ? 'rgba(255,255,255,.14)' : 'rgba(40,30,20,.1)');
  document.querySelector('meta[name=theme-color]').content = p.backdrop;
}

const saved = [];
const same = (a, b) => SLOTS.every(({ key }) => a[key] === b[key]);
function renderSaved() {
  $('#saved_wrap').hidden = !saved.length;
  $('#saved').innerHTML = saved.map((s, i) => `<button class="chip" data-saved="${i}">${dots(s.palette)}<span>${s.theme.emoji} ${s.theme.name}</span></button>`).join('');
}
let toastTimer;
function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

function rollAll() {
  const changed = roll(SLOTS.map((s) => s.key));
  if (!changed.length) return toast('Everything is locked. Unlock something to reroll it.');
  const btn = $('#roll');
  btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin');
  render(changed);
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('button');
  if (!el) return;
  if (el.dataset.lock) {
    const k = el.dataset.lock;
    if (locks.has(k)) locks.delete(k); else locks.add(k);
    render([]);
  } else if (el.dataset.roll) {
    rollSlot(el.dataset.roll);
    render([el.dataset.roll]);
  } else if (el.id === 'roll') rollAll();
  else if (el.id === 'save') {
    const i = saved.findIndex((s) => same(s, state));
    if (i >= 0) saved.splice(i, 1); else { saved.unshift({ ...state }); toast(`Saved "${state.theme.name}"`); }
    renderSaved(); render([]);
  } else if (el.dataset.saved) {
    Object.assign(state, saved[+el.dataset.saved]);
    render();
  } else if (el.id === 'host') {
    toast('Planning is the add-on: this would fill in your menu, shopping list and cooking timeline.');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat) { e.preventDefault(); rollAll(); }
});

// ---------- the table (adapted from mise's TableScene) ----------
const scene = (() => {
  const TOP = 0.75, DEPTH = 0.95, GUESTS = 6;
  const host = $('#scene');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);

  const world = new THREE.Scene();
  world.fog = new THREE.Fog('#ffffff', 6, 13);
  world.background = new THREE.Color();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  const sky = new THREE.HemisphereLight('#fff2e0', '#3a2a24', 0.9);
  const sun = new THREE.DirectionalLight('#ffe6c8', 2.2);
  sun.position.set(2.5, 4, 1.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 6;
  sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 });
  const ambient = new THREE.AmbientLight('#ffffff', 0.25);
  world.add(sky, sun, ambient);
  const floorMat = new THREE.MeshStandardMaterial({ roughness: 1 });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  world.add(floor);

  // cloth: a canvas we repaint while the colours blend, so a check can fade in and out
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const clothTex = new THREE.CanvasTexture(canvas);
  clothTex.wrapS = clothTex.wrapT = THREE.RepeatWrapping;
  clothTex.repeat.set(12, 12);
  clothTex.colorSpace = THREE.SRGBColorSpace;
  clothTex.magFilter = THREE.NearestFilter;

  const std = (o = {}) => new THREE.MeshStandardMaterial({ roughness: 0.6, ...o });
  const M = {
    cloth: new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: clothTex, roughness: 0.92, sheen: 0.3, sheenRoughness: 0.7 }),
    wood: std({ roughness: 0.7 }), plate: std({ roughness: 0.35, side: THREE.DoubleSide }), charger: std({ roughness: 0.5 }),
    napkin: std({ roughness: 0.95 }), metal: std({ metalness: 0.7, roughness: 0.3 }), leaves: std({ roughness: 0.8 }),
    candle: std({ roughness: 0.8 }),
    glass: new THREE.MeshPhysicalMaterial({ roughness: 0.05, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 }),
    f0: std({ roughness: 0.9, flatShading: true }), f1: std({ roughness: 0.9, flatShading: true }), f2: std({ roughness: 0.9, flatShading: true }),
  };

  const lathe = (pts) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 40);
  const PLATE = lathe([[0, 0.002], [0.09, 0.002], [0.1, 0.005], [0.126, 0.015], [0.13, 0.014], [0.104, 0], [0, 0]]);
  const GLASS = lathe([[0, 0], [0.034, 0], [0.034, 0.004], [0.006, 0.01], [0.004, 0.09], [0.02, 0.1], [0.036, 0.13], [0.039, 0.17], [0.034, 0.2]]);
  const TUMBLER = lathe([[0, 0], [0.03, 0], [0.033, 0.09]]);
  const STICK = lathe([[0, 0], [0.034, 0], [0.034, 0.008], [0.012, 0.02], [0.009, 0.1], [0.017, 0.11], [0.017, 0.12], [0, 0.12]]);
  const VASE = lathe([[0, 0], [0.032, 0], [0.042, 0.04], [0.036, 0.1], [0.018, 0.14], [0.022, 0.15]]);

  let s = 1234;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const table = new THREE.Group();
  const add = (geo, mat, x, y, z, parent = table) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const perSide = GUESTS / 2;
  const length = perSide * 0.62 + 0.3;
  add(new THREE.BoxGeometry(length + 0.14, 0.26, DEPTH + 0.14), M.cloth, 0, TOP - 0.12, 0);
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => add(new THREE.BoxGeometry(0.06, TOP - 0.25, 0.06), M.wood, sx * (length / 2 - 0.08), (TOP - 0.25) / 2, sz * (DEPTH / 2 - 0.08))));
  for (let i = 0; i < GUESTS; i += 1) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = (Math.floor(i / 2) - (perSide - 1) / 2) * ((length - 0.3) / perSide);
    const place = new THREE.Group();
    place.position.set(x, TOP + 0.01, side * (DEPTH / 2 - 0.2));
    place.rotation.y = side === 1 ? 0 : Math.PI;
    table.add(place);
    add(new THREE.CylinderGeometry(0.155, 0.155, 0.008, 40), M.charger, 0, 0.004, 0, place);
    add(PLATE, M.plate, 0, 0.008, 0, place);
    add(new THREE.BoxGeometry(0.075, 0.012, 0.22), M.napkin, 0, 0.026, 0, place).rotation.y = 0.5 + (rand() - 0.5) * 0.15;
    add(new THREE.BoxGeometry(0.012, 0.004, 0.19), M.metal, -0.19, 0.003, 0.01, place);
    add(new THREE.BoxGeometry(0.012, 0.004, 0.2), M.metal, 0.19, 0.003, 0.01, place);
    add(new THREE.BoxGeometry(0.012, 0.004, 0.19), M.metal, 0.215, 0.003, 0.01, place);
    add(GLASS, M.glass, 0.17, 0, -0.17, place).castShadow = false;
    add(TUMBLER, M.glass, 0.08, 0, -0.2, place).castShadow = false;
    const chair = new THREE.Group();
    chair.position.set(x, 0, side * (DEPTH / 2 + 0.32));
    chair.rotation.y = side === 1 ? 0 : Math.PI;
    table.add(chair);
    add(new THREE.BoxGeometry(0.42, 0.03, 0.4), M.wood, 0, 0.45, 0, chair);
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => add(new THREE.CylinderGeometry(0.012, 0.01, 0.45, 10), M.wood, sx * 0.18, 0.225, sz * 0.17, chair)));
    [-1, 1].forEach((sx) => add(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 10), M.wood, sx * 0.18, 0.64, 0.18, chair));
    add(new THREE.BoxGeometry(0.4, 0.07, 0.022), M.wood, 0, 0.8, 0.18, chair);
  }
  const blooms = [];
  const glows = [];
  const middle = perSide * 2 - 1;
  const flame = new THREE.MeshBasicMaterial({ color: '#ffd8a0' });
  for (let i = 0; i < middle; i += 1) {
    const x = (i - (middle - 1) / 2) * ((length - 0.4) / (middle - 1));
    if (i % 2 === 1) {
      add(STICK, M.metal, x, TOP + 0.01, 0);
      add(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 16), M.candle, x, TOP + 0.23, 0);
      add(new THREE.ConeGeometry(0.008, 0.03, 10), flame, x, TOP + 0.35, 0).castShadow = false;
      const light = new THREE.PointLight('#ffb870', 0.2, 1.8, 2);
      light.position.set(x, TOP + 0.38, 0);
      table.add(light);
      glows.push(light);
    } else {
      add(VASE, M.plate, x, TOP + 0.01, 0);
      const bunch = new THREE.Group();
      bunch.position.set(x, TOP + 0.12, 0);
      table.add(bunch);
      for (let f = 0; f < 16; f += 1) {
        const a = rand() * Math.PI * 2, reach = rand() * 0.07, h = 0.03 + rand() * 0.09;
        const bloom = add(new THREE.IcosahedronGeometry(0.012 + rand() * 0.012, 1), M[`f${f % 3}`], Math.cos(a) * reach, h, Math.sin(a) * reach, bunch);
        bloom.scale.y = 0.7;
        bloom.rotation.set(rand(), rand(), rand());
      }
      for (let l = 0; l < 9; l += 1) {
        const a = (l / 9) * Math.PI * 2 + rand();
        const leaf = add(new THREE.SphereGeometry(0.02, 10, 6), M.leaves, Math.cos(a) * 0.075, 0.02 + rand() * 0.05, Math.sin(a) * 0.075, bunch);
        leaf.scale.set(2, 0.2, 0.7);
        leaf.rotation.set(0, -a, 0.5);
      }
      blooms.push(bunch);
    }
  }
  world.add(table);

  // colours: current values blend toward the target palette
  const KEYS = ['cloth', 'check', 'plate', 'charger', 'napkin', 'metal', 'leaves', 'candle', 'glass', 'wood', 'backdrop', 'f0', 'f1', 'f2'];
  const targetOf = (p) => ({
    cloth: p.cloth, check: p.check ?? p.cloth, plate: p.plate, charger: p.charger, napkin: p.napkin, metal: p.metal, leaves: p.leaves,
    candle: p.candle, glass: p.glass, wood: p.wood, backdrop: p.backdrop, f0: p.flowers[0], f1: p.flowers[1], f2: p.flowers[2],
  });
  const cur = Object.fromEntries(KEYS.map((k) => [k, new THREE.Color()]));
  cur.checkA = 0; cur.dark = 0;
  let tween = null;

  function apply() {
    ctx.fillStyle = `#${cur.cloth.getHexString()}`;
    ctx.fillRect(0, 0, 64, 64);
    if (cur.checkA > 0.01) {
      ctx.globalAlpha = cur.checkA;
      ctx.fillStyle = `#${cur.check.getHexString()}`;
      ctx.fillRect(0, 0, 32, 64);
      ctx.fillRect(0, 0, 64, 32);
      ctx.globalAlpha = 1;
    }
    clothTex.needsUpdate = true;
    ['plate', 'charger', 'napkin', 'metal', 'leaves', 'candle', 'glass', 'wood', 'f0', 'f1', 'f2'].forEach((k) => M[k].color.copy(cur[k]));
    M.cloth.sheenColor.copy(cur.cloth).offsetHSL(0, 0, 0.12);
    world.background.copy(cur.backdrop);
    world.fog.color.copy(cur.backdrop);
    floorMat.color.copy(cur.backdrop);
    sky.groundColor.copy(cur.backdrop);
    const d = cur.dark;
    sun.intensity = 2.2 - 1.5 * d;
    sky.intensity = 0.9 - 0.5 * d;
    ambient.intensity = 0.25 - 0.12 * d;
    glows.forEach((g) => { g.intensity = 0.15 + 1.1 * d; });
  }

  function setPalette(p, animate) {
    const to = Object.fromEntries(KEYS.map((k) => [k, new THREE.Color(targetOf(p)[k])]));
    to.checkA = p.check ? 0.45 : 0;
    to.dark = p.dark ? 1 : 0;
    if (!animate || reduce || tween === undefined) {
      KEYS.forEach((k) => cur[k].copy(to[k]));
      cur.checkA = to.checkA; cur.dark = to.dark;
      apply();
      return;
    }
    const from = Object.fromEntries(KEYS.map((k) => [k, cur[k].clone()]));
    from.checkA = cur.checkA; from.dark = cur.dark;
    tween = { from, to, t0: performance.now(), dur: 750 };
  }

  // camera: drag to look around, slow drift otherwise
  let theta = 0.75, phi = 0.92, drag = null, idleAt = 0, dist = 4.4;
  host.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; host.setPointerCapture(e.pointerId); host.classList.add('dragging'); });
  host.addEventListener('pointermove', (e) => {
    if (!drag) return;
    theta += (e.clientX - drag.x) * 0.008;
    phi = Math.min(1.3, Math.max(0.42, phi - (e.clientY - drag.y) * 0.005));
    drag = { x: e.clientX, y: e.clientY };
  });
  const end = () => { drag = null; idleAt = performance.now(); host.classList.remove('dragging'); };
  host.addEventListener('pointerup', end);
  host.addEventListener('pointercancel', end);

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    dist = camera.aspect < 1 ? 5.6 : camera.aspect < 1.3 ? 4.9 : 4.4;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const ease = (t) => 1 - (1 - t) ** 3;
  const back = (t) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;
  renderer.setAnimationLoop((now) => {
    if (tween) {
      const t = Math.min(1, (now - tween.t0) / tween.dur);
      const e = ease(t);
      KEYS.forEach((k) => cur[k].lerpColors(tween.from[k], tween.to[k], e));
      cur.checkA = tween.from.checkA + (tween.to.checkA - tween.from.checkA) * e;
      cur.dark = tween.from.dark + (tween.to.dark - tween.from.dark) * e;
      blooms.forEach((b, i) => b.scale.setScalar(0.55 + 0.45 * back(Math.min(1, Math.max(0, t * 1.4 - i * 0.12)))));
      apply();
      if (t === 1) { tween = null; blooms.forEach((b) => b.scale.setScalar(1)); }
    }
    if (!drag && !reduce && now - idleAt > 2500) theta += 0.0015;
    camera.position.set(dist * Math.sin(phi) * Math.cos(theta), TOP + dist * Math.cos(phi), dist * Math.sin(phi) * Math.sin(theta));
    camera.lookAt(0, TOP - 0.05, 0);
    renderer.render(world, camera);
  });
  tween = undefined; // first setPalette snaps
  return { setPalette: (p, animate) => { setPalette(p, animate); if (tween === undefined) tween = null; } };
})();

// start somewhere nice
state.theme = THEMES[0];
state.palette = PAL.cherry;
state.menu = THEMES[0].menus[0];
state.table = THEMES[0].tables[0];
state.sound = THEMES[0].sounds[0];
state.moment = THEMES[0].moments[0];
render();
renderSaved();
})();
