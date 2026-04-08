import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { I18nProvider } from './i18n/index.ts';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { AppStateProvider } from './contexts/AppStateContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <NavigationProvider>
          <AppStateProvider>
            <App />
          </AppStateProvider>
        </NavigationProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);
