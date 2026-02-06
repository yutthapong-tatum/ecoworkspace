import './style.css'

// Simple Router and State Management
const app = document.querySelector('#app');

// We will build the Shell here
const renderShell = () => {
  app.innerHTML = `
    <div class="container" style="min-height: 100vh; display: flex; flex-direction: column;">
      
      <!-- Top Navigation (Shell) -->
      <nav class="glass-panel" style="padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: 800; font-size: 1.2rem; letter-spacing: -0.5px;">
           ✨ Krungthai CO-Working Space
        </div>

      </nav>

      <!-- View Container -->
      <main id="view-container" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <!-- CONTENT INJECTED HERE -->
      </main>

    </div>
  `;
}

const renderWelcome = () => {
  const container = document.querySelector('#view-container');
  container.innerHTML = `
    <div class="glass-panel" style="padding: 4rem; text-align: center; max-width: 600px;">
      <h1 class="text-h1">Krungthai CO-Working Space</h1>
      <p class="text-body" style="margin-bottom: 2rem;">
        Experience the seamless integration of our new coworking platform.
        Select a prototype view to begin.
      </p>
      <div class="flex-row gap-md flex-center">
        <button class="glass-btn" onclick="window.location.hash='#employee'">Launch Mobile App</button>
      </div>
    </div>
  `;
}

import { renderEmployeeApp } from './components/EmployeeApp.js';
import { renderTabletApp } from './components/TabletApp.js';
import { renderAdminDashboard } from './components/AdminDashboard.js';

// Router Logic
const handleRoute = () => {
  const hash = window.location.hash;
  const container = document.querySelector('#view-container');

  if (!container) return; // Shell not ready

  // Clear previous content
  container.innerHTML = '';

  if (hash === '#employee') {
    renderEmployeeApp(container);
  } else if (hash === '#tablet') {
    renderTabletApp(container);
  } else if (hash === '#admin') {
    renderAdminDashboard(container);
  } else {
    renderWelcome();
  }
}


// Initialize
renderShell();
handleRoute();
window.addEventListener('hashchange', handleRoute);
