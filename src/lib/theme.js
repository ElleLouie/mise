// Cream, ice blue and orange by default, deep plum for dark, or follow the device. Remembered on this device.
export const themes = [
  { id: 'cream', name: 'Cream', swatch: ['#f7f2e8', '#e7f0f4', '#e8692c'] },
  { id: 'plum', name: 'Plum', swatch: ['#2a0f1a', '#a7b23a'] },
  { id: 'auto', name: 'Automatic', swatch: ['#f7f2e8', '#2a0f1a'] },
];

const KEY = 'mise-theme';

export function getTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return themes.some((t) => t.id === saved) ? saved : 'cream';
  } catch {
    return 'cream';
  }
}

export function applyTheme(id) {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // private browsing: the theme just won't be remembered
  }
}
