// Colour themes for the kitchen pass. The choice is remembered on this device.
export const themes = [
  { id: 'steel', name: 'Steel', swatch: ['#d4d8db', '#fffef9', '#e0312b'] },
  { id: 'tomato', name: 'Tomato', swatch: ['#f1e6d2', '#fffaf0', '#d6402c'] },
  { id: 'kraft', name: 'Kraft', swatch: ['#c8a97e', '#fffdf6', '#1b1b1b'] },
  { id: 'night', name: 'Night shift', swatch: ['#1e2431', '#f5efe2', '#f2b134'] },
];

const KEY = 'mise-theme';

export function getTheme() {
  try {
    return localStorage.getItem(KEY) || 'steel';
  } catch {
    return 'steel';
  }
}

export function applyTheme(id) {
  document.documentElement.dataset.theme = id;
  const bar = { steel: '#1b1b1b', tomato: '#2b2420', kraft: '#1b1b1b', night: '#12161f' }[id];
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bar);
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // private browsing: the theme just won't be remembered
  }
}
