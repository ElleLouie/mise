// Read, scale and print ingredient quantities like "1 1/2 cups flour", "½ lemon" or "2-3 cloves garlic".

const UNICODE_FRACTIONS = {
  '½': 1 / 2, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 1 / 4, '¾': 3 / 4, '⅛': 1 / 8, '⅜': 3 / 8, '⅝': 5 / 8, '⅞': 7 / 8,
};
const FRACTION_CHARS = '½⅓⅔¼¾⅛⅜⅝⅞';
const NUMBER = `(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d*[${FRACTION_CHARS}]|\\d+(?:\\.\\d+)?)`;
const LEADING_QUANTITY = new RegExp(`^(${NUMBER})(?:\\s*(?:-|–|to)\\s*(${NUMBER}))?(\\s*)(.*)$`);

function toNumber(text) {
  const value = text.trim();
  const mixed = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = value.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const unicode = value.match(new RegExp(`^(\\d*)([${FRACTION_CHARS}])$`));
  if (unicode) return Number(unicode[1] || 0) + UNICODE_FRACTIONS[unicode[2]];
  return Number(value);
}

export function parseIngredient(line) {
  const text = line.trim();
  const match = text.match(LEADING_QUANTITY);
  if (!match) return { quantity: null, quantityMax: null, rest: text, gap: '' };
  return {
    quantity: toNumber(match[1]),
    quantityMax: match[2] ? toNumber(match[2]) : null,
    rest: match[4],
    // keep "200g" and "200 g" written the way they were
    gap: match[3] ? ' ' : '',
  };
}

const NICE_FRACTIONS = [[0, ''], [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'], [1 / 2, '½'], [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'], [1, '']];

// Prints a quantity the way a cook would write it: 1½, ⅓, 12, or 0.3 when no fraction fits.
export function formatQuantity(value) {
  if (value >= 10) return String(Math.round(value));
  let whole = Math.floor(value);
  const remainder = value - whole;
  const [fraction, symbol] = NICE_FRACTIONS.reduce((best, candidate) => (
    Math.abs(candidate[0] - remainder) < Math.abs(best[0] - remainder) ? candidate : best
  ));
  if (Math.abs(fraction - remainder) > 0.04) return String(Math.round(value * 10) / 10);
  if (fraction === 1) whole += 1;
  if (whole === 0 && symbol === '') return '0';
  return `${whole || ''}${symbol}`;
}

export function scaleIngredient(line, factor) {
  const { quantity, quantityMax, rest, gap } = parseIngredient(line);
  if (quantity === null || factor === 1) return line.trim();
  const amount = formatQuantity(quantity * factor);
  const range = quantityMax === null ? '' : `–${formatQuantity(quantityMax * factor)}`;
  return `${amount}${range}${gap}${rest}`.trim();
}
