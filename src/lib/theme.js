// Light, dark, or follow the device. The choice is remembered on this device.
export const themes = [
  { id: 'auto', name: 'Automatic', swatch: ['#eeeae3', '#1c1719'] },
  { id: 'light', name: 'Light', swatch: ['#eeeae3', '#f7f4ef'] },
  { id: 'dark', name: 'Dark', swatch: ['#1c1719', '#282124'] },
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
