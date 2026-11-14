import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ContactadosProvider } from './lib/contactados';
import { IdiomaProvider, useIdioma } from './lib/idioma';
import { TemaProvider } from './lib/tema';
import './index.css';

/** Al cambiar de idioma se vuelven a pintar todas las pantallas con los textos y formatos nuevos. */
function AppConIdioma() {
  const { idioma } = useIdioma();
  return <App key={idioma} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IdiomaProvider>
      <TemaProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ContactadosProvider>
            <AppConIdioma />
          </ContactadosProvider>
        </BrowserRouter>
      </TemaProvider>
    </IdiomaProvider>
  </StrictMode>,
);
