// Light, dark, or follow the device. The choice is remembered on this device.
export const themes = [
  { id: 'auto', name: 'Automatic', swatch: ['#ffffff', '#1c1c1e'] },
  { id: 'light', name: 'Light', swatch: ['#ffffff', '#f2f2f4'] },
  { id: 'dark', name: 'Dark', swatch: ['#1c1c1e', '#000000'] },
];

const KEY = 'mise-theme';

export function getTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return themes.some((t) => t.id === saved) ? saved : 'auto';
  } catch {
    return 'auto';
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
