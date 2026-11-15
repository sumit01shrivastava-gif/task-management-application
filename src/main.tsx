import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/site.css';
import App from './App';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
// The production build prerenders the page into #root (scripts/prerender.mjs) so the
// first paint never waits for JavaScript; hydrate it when present.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
