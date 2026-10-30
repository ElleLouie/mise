// Deep plum by default, a cream light theme, or follow the device. Remembered on this device.
export const themes = [
  { id: 'plum', name: 'Plum', swatch: ['#2a0f1a', '#a7b23a'] },
  { id: 'light', name: 'Light', swatch: ['#f6f1e7', '#5e2140'] },
  { id: 'auto', name: 'Automatic', swatch: ['#f6f1e7', '#2a0f1a'] },
];

const KEY = 'mise-theme';

export function getTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return themes.some((t) => t.id === saved) ? saved : 'plum';
  } catch {
    return 'plum';
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
