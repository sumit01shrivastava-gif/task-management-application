import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';

const RenderStudio = lazy(() => import('./three/RenderStudio'));

// `?render=<pose>` renders a single transparent still of the 3D model
// (used to generate the supporting imagery in /public/media).
const pose = new URLSearchParams(location.search).get('render');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {pose ? (
      <Suspense fallback={null}>
        <RenderStudio pose={pose} />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
