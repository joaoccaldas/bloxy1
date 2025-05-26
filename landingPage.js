// landingPage.js

import { Game } from './game.js';

// Grab DOM elements
const landing   = document.getElementById('landing-page');
const canvas    = document.getElementById('gameCanvas');
const startBtn  = document.getElementById('start-button');
const loadBtn   = document.getElementById('load-button');
const exitBtn   = document.getElementById('exit-button');

// Common launch logic
function launchGame(loadExisting = false) {
  landing.style.display = 'none';
  canvas.style.display  = 'block';

  const game = new Game('gameCanvas');
  game.init();           // init() already loads saved state if present
}

// Start New Game
startBtn.addEventListener('click', () => {
  console.log('Start Game clicked');
  launchGame(false);
});

// Load Saved Game
loadBtn.addEventListener('click', () => {
  console.log('Load Game clicked');
  launchGame(true);
});

// Exit (back to landing or close)
exitBtn.addEventListener('click', () => {
  console.log('Exit Game clicked');
  window.location.reload();
});
