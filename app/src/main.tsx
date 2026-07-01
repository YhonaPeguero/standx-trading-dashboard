import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const lang = (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App defaultLang={lang} />
  </StrictMode>,
);
