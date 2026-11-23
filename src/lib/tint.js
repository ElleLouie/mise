// The app takes on a vibe's palette: its backdrop becomes the page, its napkin colour the accent,
// with ink, cards and lines that stay readable on it, light or dark.
import { useEffect } from 'react';

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const luminance = (hex) => {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const alpha = (hex, a) => `rgba(${rgb(hex).map((c) => Math.round(c * 255)).join(', ')}, ${a})`;

const LIGHT_INK = '#f4ede1';
const DARK_INK = '#2a211b';

// the CSS variables for a palette
export function paletteVars(p) {
  const dark = Boolean(p.dark);
  const ink = dark ? LIGHT_INK : DARK_INK;
  const veil = dark ? '#ffffff' : DARK_INK;
  // the napkin is the accent; on the page it's used for text only where it's readable
  const accent = p.napkin;
  return {
    '--bg': p.backdrop,
    '--ink': ink,
    '--muted': alpha(ink, 0.72),
    '--card': dark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.55)',
    '--card-line': alpha(veil, dark ? 0.12 : 0.1),
    '--line': alpha(veil, dark ? 0.22 : 0.2),
    '--rule': alpha(veil, 0.14),
    '--hover': alpha(veil, dark ? 0.1 : 0.06),
    '--surface': alpha(veil, dark ? 0.08 : 0.07),
    '--surface-strong': alpha(veil, dark ? 0.16 : 0.13),
    '--chip': dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.7)',
    '--gingham': alpha(p.check ?? p.charger, 0.17),
    '--accent': accent,
    '--accent-ink': contrast(accent, DARK_INK) >= contrast(accent, '#ffffff') ? DARK_INK : '#ffffff',
    '--accent-text': contrast(accent, p.backdrop) >= 4.5 ? accent : ink,
    '--china': contrast(p.charger, p.backdrop) >= 3 ? p.charger : ink,
    '--shadow': dark ? 'none' : '0 1px 0 rgba(42, 33, 27, 0.05), 0 6px 18px -8px rgba(42, 33, 27, 0.16)',
    'color-scheme': dark ? 'dark' : 'light',
  };
}

// While mounted, the page wears this palette; it goes back to the app's own colours when it unmounts.
export function usePaletteTint(palette) {
  useEffect(() => {
    if (!palette) return undefined;
    const root = document.documentElement.style;
    const vars = paletteVars(palette);
    Object.entries(vars).forEach(([name, value]) => root.setProperty(name, value));
    const meta = document.querySelector('meta[name=theme-color]');
    const before = meta?.content;
    if (meta) meta.content = palette.backdrop;
    return () => {
      Object.keys(vars).forEach((name) => root.removeProperty(name));
      if (meta) meta.content = before;
    };
  }, [palette]);
}
