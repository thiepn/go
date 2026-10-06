import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { AccountProvider } from './account';
import {
  initializePreferences,
  registerServiceWorker,
} from './platform';
import './styles/tokens.css';
import './styles/global.css';

initializePreferences();
void registerServiceWorker();

const root = document.getElementById('root');

if (!root) {
  throw new Error('Application root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <AccountProvider>
      <App />
    </AccountProvider>
  </StrictMode>,
);
