import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './lib/theme';
import { PomodoroProvider } from './lib/pomodoro';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PomodoroProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PomodoroProvider>
    </ThemeProvider>
  </StrictMode>
);
