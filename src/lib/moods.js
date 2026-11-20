// Table settings to pick from: the colours of the cloth, plates, napkins, flowers and metal.
export const moods = [
  {
    id: 'candlelight',
    wood: '#4a2f22',
    name: 'Candlelight',
    cloth: '#5a1424', plate: '#efe6d6', charger: '#b08a4a', napkin: '#5f6420', flowers: ['#7a0f2b', '#a3264a', '#3d0a17'],
    leaves: '#3e4a22', metal: '#c49a52', candle: '#f2e8d5', glass: '#f3e1c8', backdrop: '#2a0f1a',
  },
  {
    id: 'garden',
    wood: '#a08466',
    name: 'Garden',
    cloth: '#eee8da', plate: '#fbf8f1', charger: '#c9cfb6', napkin: '#a6b38c', flowers: ['#f1b8b0', '#f7d9c4', '#fffaf2'],
    leaves: '#7d8f5c', metal: '#c9ccd1', candle: '#fffaf2', glass: '#e9f0ea', backdrop: '#e7e2d3',
  },
  {
    id: 'citrus',
    wood: '#9a7b5c',
    name: 'Citrus',
    cloth: '#f4ecd9', plate: '#ffffff', charger: '#2f4f9e', napkin: '#3a5cad', flowers: ['#f2c53d', '#f7dc6f', '#ffffff'],
    leaves: '#56743a', metal: '#cfd2d6', candle: '#fffaf2', glass: '#eef3f8', backdrop: '#ebe4d2',
  },
  {
    id: 'plum',
    wood: '#3a2419',
    name: 'Plum & olive',
    cloth: '#3a1625', plate: '#f4ead9', charger: '#4b1d31', napkin: '#8f9a2e', flowers: ['#8e1f45', '#c25a7a', '#efe2d2'],
    leaves: '#5d6b14', metal: '#c49a52', candle: '#f4ead9', glass: '#f0dfe4', backdrop: '#2a0f1a',
  },
  {
    id: 'linen',
    wood: '#7d6450',
    name: 'Linen',
    cloth: '#d9cdb6', plate: '#cbbca4', charger: '#8a7a63', napkin: '#a4502f', flowers: ['#c9a27a', '#e6d3b3', '#a4502f'],
    leaves: '#8a8a5c', metal: '#2b2622', candle: '#f2e8d5', glass: '#efe8dc', backdrop: '#cfc3ab',
  },
];

export const moodFor = (id) => moods.find((mood) => mood.id === id) ?? moods[0];
