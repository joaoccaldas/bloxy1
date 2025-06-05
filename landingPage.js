// landingPage.js

import { Game } from './game.js';
import { GameRefactored } from './GameRefactored.js';
import { MenuSystem } from './menuSystem.js';
import { Rivals } from './rivals.js';

// Configuration to toggle between original and refactored systems
const USE_REFACTORED_SYSTEM = false; // Set to true to use the new modular system

const canvasId   = 'gameCanvas';
const canvas     = document.getElementById(canvasId);
const landing    = document.getElementById('landingScreen');
const btnStart   = document.getElementById('btnStart');
const btnLoad    = document.getElementById('btnLoad');
const btnRivals  = document.getElementById('btnRivals');
const btnShop    = document.getElementById('btnShop');
const inputName  = document.getElementById('playerName');

if (!canvas || !landing || !btnStart || !btnLoad || !btnRivals || !btnShop || !inputName) {
  throw new Error('Required elements #gameCanvas, #landingScreen, #btnStart, #btnLoad, #btnRivals, #btnShop, or #playerName not found');
}

let game = null;
let menu = null;
let rivalsUI = null;
let selectedCharacterId = 0;

/** Show landing screen */
function showLanding() {
  landing.style.display = 'flex';
  canvas.style.display  = 'none';
}

/** Show game canvas */
function showCanvas() {
  landing.style.display = 'none';
  canvas.style.display  = 'block';
}

/** Get player name or default */
function getPlayerName() {
  const name = inputName.value.trim();
  return name === '' ? 'Player' : name;
}

/** Pause menu overlay */
function startMenu() {
  if (menu) {
    menu.destroy();
    menu = null;
  }
  menu = new MenuSystem(canvas, {
    playerName: getPlayerName(),
    currentCharId: selectedCharacterId,
    onResumeGame: () => {
      menu.destroy();
      menu = null;
      if (game && typeof game.resume === 'function') {
        game.resume();
      }
    },
    onSaveGame: () => {
      if (game) game.save();
    },
    onShop: () => {
      console.log('Shop button clicked! Opening shop interface...');
      // TODO: Implement shop interface
      alert('Shop feature coming soon!');
    },
    onExitGame: () => {
      if (game) game.exitToMenu();
    }
  });
}

/** Start a new or load game */
function startGame(loadExisting = false) {
  if (rivalsUI)  { rivalsUI.cleanup();  rivalsUI = null; }
  if (menu)      { menu.destroy();      menu = null; }
  if (game)      { game.destroy();      game = null; }

  showCanvas();
  
  if (USE_REFACTORED_SYSTEM) {
    // Use the new refactored system
    game = new GameRefactored(
      canvasId,
      selectedCharacterId,
      startMenu, // pause callback
      (charId) => { // game over callback
        alert('Game Over');
        startMenu();
      }
    );
  } else {
    // Use the original system
    game = new Game(
      canvasId,
      selectedCharacterId,
      startMenu,
      (charId) => {
        alert('Game Over');
        startMenu();
      }
    );
  }
  
  game.init(loadExisting);
}

/** Show rivals (character selection) UI */
function showRivals() {
  if (menu)      { menu.destroy();      menu = null; }
  if (game)      { game.destroy();      game = null; }
  if (rivalsUI)  { rivalsUI.cleanup();  rivalsUI = null; }

  showCanvas();
  rivalsUI = new Rivals(
    canvas,
    (charId) => {
      selectedCharacterId = charId;
      rivalsUI.cleanup();
      rivalsUI = null;
      showLanding();
    },
    () => {
      rivalsUI.cleanup();
      rivalsUI = null;
      showLanding();
    }
  );
}

/** Show shop interface */
function showShop() {
  console.log('Shop button clicked! Opening shop interface...');
  // TODO: Implement shop interface
  alert('Welcome to the Shop!\n\nShop features coming soon:\n• Character skins\n• Weapons\n• Power-ups\n• Special abilities');
}

// Button event listeners
btnStart.addEventListener('click', () => startGame(false));
btnLoad.addEventListener('click',  () => startGame(true));
btnRivals.addEventListener('click', showRivals);
btnShop.addEventListener('click', showShop);

// Allow ESC to pause when playing
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && game && game.state === 'playing') {
    startMenu();
  }
});

// Initial setup
window.addEventListener('DOMContentLoaded', showLanding);
