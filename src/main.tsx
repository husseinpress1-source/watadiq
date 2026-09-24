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

window.addEventListener('error', (event) => {
  console.error('Uncaught error', event.error ?? event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection', event.reason);
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root element');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
