// Colour themes, named after glazes. The choice is remembered on this device.
export const themes = [
  { id: 'stoneware', name: 'Stoneware', swatch: ['#ece5d9', '#f7f3ec', '#a0573a'] },
  { id: 'celadon', name: 'Celadon', swatch: ['#e3e9e0', '#f6f8f3', '#5d7a63'] },
  { id: 'cobalt', name: 'Cobalt', swatch: ['#eceae4', '#fbfaf7', '#2f4f8f'] },
  { id: 'tenmoku', name: 'Tenmoku', swatch: ['#2a201b', '#3a2e27', '#d9a46b'] },
];

const KEY = 'mise-theme';

export function getTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return themes.some((t) => t.id === saved) ? saved : 'stoneware';
  } catch {
    return 'stoneware';
  }
}

export function applyTheme(id) {
  document.documentElement.dataset.theme = id;
  const bar = { stoneware: '#ece5d9', celadon: '#e3e9e0', cobalt: '#eceae4', tenmoku: '#2a201b' }[id];
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bar);
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // private browsing: the theme just won't be remembered
  }
}
