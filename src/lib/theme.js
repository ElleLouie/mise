// Cream, ice blue and orange by default, deep plum for dark, or follow the device. Remembered on this device.
export const themes = [
  { id: 'cream', name: 'Cream', swatch: ['#f7f2e8', '#cfe5f2', '#e8692c'] },
  { id: 'plum', name: 'Plum', swatch: ['#2a0f1a', '#a7b23a'] },
  { id: 'auto', name: 'Automatic', swatch: ['#f7f2e8', '#2a0f1a'] },
];

// v1 saved its plum default on every visit, so v2 keeps choices under a new key
const KEY = 'mise-theme-v2';

export function getTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return themes.some((t) => t.id === saved) ? saved : 'cream';
  } catch {
    return 'cream';
  }
}

export function showTheme(id) {
  document.documentElement.dataset.theme = id;
}

// only a choice made in Settings is remembered
export function applyTheme(id) {
  showTheme(id);
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // private browsing: the theme just won't be remembered
  }
}
