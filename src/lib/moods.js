// Table settings to pick from: the colours of the cloth, plates, napkins, flowers and metal.
export const moods = [
  {
    id: 'gingham',
    wood: '#a07b58',
    name: 'Summer gingham',
    // the cloth gets a blue and white check (see TableScene)
    cloth: '#f7f1e3', check: '#5d86b3', plate: '#fffaf0', charger: '#d5e5ee', napkin: '#e9b949', flowers: ['#f2c14e', '#fffaf2', '#e9893f'],
    leaves: '#6f8a4e', metal: '#cfcfc8', candle: '#fffaf2', glass: '#e8f1f5', backdrop: '#f4ead6',
  },
  {
    id: 'ice',
    wood: '#b59a7c',
    name: 'Ice & orange',
    cloth: '#f4eee2', plate: '#ffffff', charger: '#8fc0dc', napkin: '#e8692c', flowers: ['#f08a4b', '#f6c39a', '#fffaf2'],
    leaves: '#6f8a6a', metal: '#cfd5da', candle: '#fffaf2', glass: '#d6eaf5', backdrop: '#f7f2e8',
  },
  {
    id: 'candlelight',
    wood: '#4a2f22',
    name: 'Candlelight',
    cloth: '#5a1424', plate: '#efe6d6', charger: '#b08a4a', napkin: '#5f6420', flowers: ['#7a0f2b', '#a3264a', '#3d0a17'],
    leaves: '#3e4a22', metal: '#c49a52', candle: '#f2e8d5', glass: '#f3e1c8', backdrop: '#2a0f1a',
  },
  {
    id: 'garden',
    wood: '#a08466',
    name: 'Garden',
    cloth: '#eee8da', plate: '#fbf8f1', charger: '#c9cfb6', napkin: '#a6b38c', flowers: ['#f1b8b0', '#f7d9c4', '#fffaf2'],
    leaves: '#7d8f5c', metal: '#c9ccd1', candle: '#fffaf2', glass: '#e9f0ea', backdrop: '#e7e2d3',
  },
  {
    id: 'citrus',
    wood: '#9a7b5c',
    name: 'Citrus',
    cloth: '#f4ecd9', plate: '#ffffff', charger: '#2f4f9e', napkin: '#3a5cad', flowers: ['#f2c53d', '#f7dc6f', '#ffffff'],
    leaves: '#56743a', metal: '#cfd2d6', candle: '#fffaf2', glass: '#eef3f8', backdrop: '#ebe4d2',
  },
  {
    id: 'plum',
    wood: '#3a2419',
    name: 'Plum & olive',
    cloth: '#3a1625', plate: '#f4ead9', charger: '#4b1d31', napkin: '#8f9a2e', flowers: ['#8e1f45', '#c25a7a', '#efe2d2'],
    leaves: '#5d6b14', metal: '#c49a52', candle: '#f4ead9', glass: '#f0dfe4', backdrop: '#2a0f1a',
  },
  {
    id: 'linen',
    wood: '#7d6450',
    name: 'Linen',
    cloth: '#d9cdb6', plate: '#cbbca4', charger: '#8a7a63', napkin: '#a4502f', flowers: ['#c9a27a', '#e6d3b3', '#a4502f'],
    leaves: '#8a8a5c', metal: '#2b2622', candle: '#f2e8d5', glass: '#efe8dc', backdrop: '#cfc3ab',
  },
];

export const moodFor = (id) => moods.find((mood) => mood.id === id) ?? moods[0];

// What to put on the table for each style
const DECOR = {
  gingham: {
    cloth: 'Blue gingham tablecloth', napkins: 'butter yellow napkins', flowers: 'small bunches of daisies',
    candles: 'white taper candles', extra: 'Jam jars for the flowers',
  },
  ice: {
    cloth: 'Cream linen tablecloth', napkins: 'orange napkins', flowers: 'bunches of orange ranunculus',
    candles: 'white taper candles', extra: 'Pale blue chargers',
  },
  candlelight: {
    cloth: 'Oxblood tablecloth', napkins: 'olive linen napkins', flowers: 'bunches of dark red roses',
    candles: 'cream taper candles', extra: 'Brass candlesticks',
  },
  garden: {
    cloth: 'White linen tablecloth', napkins: 'sage napkins', flowers: 'bunches of garden roses',
    candles: 'white pillar candles', extra: 'Bud vases',
  },
  citrus: {
    cloth: 'Cream tablecloth', napkins: 'cobalt napkins', flowers: 'bunches of yellow tulips',
    candles: 'white taper candles', extra: 'A bowl of lemons',
  },
  plum: {
    cloth: 'Plum tablecloth', napkins: 'olive napkins', flowers: 'bunches of raspberry dahlias',
    candles: 'cream taper candles', extra: 'Brass candlesticks',
  },
  linen: {
    cloth: 'Oatmeal linen tablecloth', napkins: 'rust napkins', flowers: 'bunches of dried grasses',
    candles: 'beeswax candles', extra: 'Stoneware plates',
  },
};

// "6 butter yellow napkins", "3 white taper candles"… scaled to the guests
export function decorFor(id, guests) {
  const d = DECOR[id] ?? DECOR.gingham;
  return [
    d.cloth,
    `${guests} ${d.napkins}`,
    `${Math.max(2, Math.ceil(guests / 2))} ${d.candles}`,
    `${Math.max(1, Math.ceil(guests / 4))} ${d.flowers}`,
    d.extra,
  ];
}
