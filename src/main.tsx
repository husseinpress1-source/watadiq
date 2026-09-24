import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'core-js/stable';
import 'lazysizes';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import './styles/fonts.scss';
import './i18n';
import App from './App';
import { initHeroViewportLock } from './lib/hero-viewport';

initHeroViewportLock();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
