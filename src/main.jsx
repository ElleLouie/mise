import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/newsreader';
import './styles.css';
import { applyTheme, getTheme } from './lib/theme';
import App from './App';

applyTheme(getTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
