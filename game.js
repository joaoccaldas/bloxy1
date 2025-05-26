// game.js

import { Player }   from './player.js';
import { Controls } from './controls.js';
import { World }    from './world.js';
import { Camera }   from './camera.js';
import { Storage }  from './storage.js';
import { EscUI }    from './escUi.js';

export class Game {
  /**
   * @param {string} canvasId – the ID of your <canvas> element
   */
  constructor(canvasId) {
    // Canvas & context
    this.canvas = document.getElementById(canvasId);
    this.ctx    = this.canvas.getContext('2d');

    // Game subsystems
    this.player   = new Player(100, 100, 64, 64);
    this.controls = new Controls(this.player);
    this.world    = new World();
    this.camera   = new Camera(this.player, this.canvas);
    this.storage  = new Storage();

    // Pause-screen UI (EscUI) will live here when paused
    this.escUI = null;

    // Game loop state
    this.lastTime = 0;
    this.state    = 'playing'; // 'playing' or 'paused'
    this.loop     = this.loop.bind(this);
  }

  /** Start the game: load state, set bounds, bind Esc, and kick off the loop */
  init() {
    // Attempt to load saved world+player
    const saved = this.storage.load();
    if (saved) {
      this.world.load(saved.world);
      this.player.load(saved.player);
    }

    // Prevent camera from going outside the world
    this.camera.setBounds(this.world.width, this.world.height);

    // Toggle pause on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.togglePause();
      }
    });

    requestAnimationFrame(this.loop);
  }

  /** Toggle between playing ↔ paused */
  togglePause() {
    if (this.state === 'playing') {
      this.pauseGame();
    } else {
      this.resumeGame();
    }
  }

  /** Enter paused state and show EscUI */
  pauseGame() {
    this.state = 'paused';

    this.escUI = new EscUI(
      this.canvas,
      /* onResume */ () => this.togglePause(),
      /* onSave   */ () => this.save(),
      /* onExit   */ () => this.exitToMenu()
    );
  }

  /** Leave paused state and tear down EscUI */
  resumeGame() {
    this.state = 'playing';
    if (this.escUI) {
      this.escUI.destroy();
      this.escUI = null;
    }
  }

  /** The main update+render loop */
  loop(timestamp) {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (this.state === 'playing') {
      // Only update game logic when not paused
      this.controls.update();
      this.player.update(delta, this.world);
      this.world.update(delta);
      this.camera.update();
    }

    this.draw();
    requestAnimationFrame(this.loop);
  }

  /** Draw either the game world or the pause UI */
  draw() {
    // Clear screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'playing') {
      // Game world render under camera
      this.camera.begin(this.ctx);
      this.world.draw(this.ctx);
      this.player.draw(this.ctx);
      this.camera.end(this.ctx);
    } else if (this.state === 'paused' && this.escUI) {
      // Draw your full-screen pause UI
      this.escUI.draw();
    }
  }

  /** Serialize & persist the current world + player */
  save() {
    try {
      const data = {
        world:  this.world.serialize(),
        player: this.player.serialize()
      };
      this.storage.save(data);
    } catch (err) {
      console.error('Error saving game state:', err);
    }
  }

  /** Clean up and return to your landing page */
  exitToMenu() {
    this.save();
    if (this.escUI) {
      this.escUI.destroy();
      this.escUI = null;
    }
    window.location.reload(); // or navigate back to your landing HTML
  }
}
