// Table moods are the seed library's palettes; the original seven ids (gingham, ice, candlelight,
// garden, citrus, plum, linen) are its first seven.
import { PALETTES } from './seeds.js';

export const moods = PALETTES;

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
  cherry: {
    cloth: 'Red gingham tablecloth', napkins: 'cherry red napkins', flowers: 'bunches of red and pink sweet peas',
    candles: 'white taper candles', extra: 'Cake stands',
  },
  bistro: {
    cloth: 'Navy check tablecloth', napkins: 'navy napkins', flowers: 'bunches of apricot roses',
    candles: 'white taper candles', extra: 'Apricot chargers',
  },
  midnight: {
    cloth: 'Midnight blue tablecloth', napkins: 'rust napkins', flowers: 'bunches of cream ranunculus',
    candles: 'cream taper candles', extra: 'Brass candlesticks',
  },
  pistachio: {
    cloth: 'Pistachio linen tablecloth', napkins: 'blush napkins', flowers: 'bunches of peach roses',
    candles: 'white taper candles', extra: 'Gold cutlery',
  },
  tomato: {
    cloth: 'Red check tablecloth', napkins: 'basil green napkins', flowers: 'bunches of orange zinnias',
    candles: 'white taper candles', extra: 'A bowl of heirloom tomatoes',
  },
  alpine: {
    cloth: 'Red check tablecloth', napkins: 'red napkins', flowers: 'pine branches',
    candles: 'white pillar candles', extra: 'Wooden boards',
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
