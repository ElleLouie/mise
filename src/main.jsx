import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fraunces with its soft axis for titles, Figtree for everything you read and tap
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/figtree';
import './styles.css';
import App from './App';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
