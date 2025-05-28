// landingPage.js

import { Game } from './game.js';
import { MenuSystem } from './menuSystem.js';
import { Rivals } from './rivals.js';

const canvasId   = 'gameCanvas';
const canvas     = document.getElementById(canvasId);
const landing    = document.getElementById('landingScreen');
const btnStart   = document.getElementById('btnStart');
const btnLoad    = document.getElementById('btnLoad');
const btnRivals  = document.getElementById('btnRivals');
const inputName  = document.getElementById('playerName');

if (!canvas || !landing || !btnStart || !btnLoad || !btnRivals || !inputName) {
  throw new Error('Required elements #gameCanvas, #landingScreen, #btnStart, #btnLoad, #btnRivals, or #playerName not found');
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
  game = new Game(
    canvasId,
    selectedCharacterId,
    startMenu,
    (charId) => {
      alert('Game Over');
      startMenu();
    }
  );
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

// Button event listeners
btnStart.addEventListener('click', () => startGame(false));
btnLoad.addEventListener('click',  () => startGame(true));
btnRivals.addEventListener('click', showRivals);

// Allow ESC to pause when playing
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && game && game.state === 'playing') {
    startMenu();
  }
});

// Initial setup
window.addEventListener('DOMContentLoaded', showLanding);
