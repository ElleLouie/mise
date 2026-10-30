// Light, dark, or follow the device. The choice is remembered on this device.
export const themes = [
  { id: 'auto', name: 'Automatic', swatch: ['#eef0e6', '#141712'] },
  { id: 'light', name: 'Light', swatch: ['#eef0e6', '#5e2140'] },
  { id: 'dark', name: 'Dark', swatch: ['#141712', '#6e2a4b'] },
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
