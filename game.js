// game.js

import { characters } from './characterData.js';
import { Player } from './player.js';
import { Controls } from './controls.js';
import { World } from './world.js';
import { Camera } from './camera.js';
import { Storage } from './storage.js';
import { Mob } from './mobs.js';

export class Game {
  /**
   * @param {string} canvasId            - ID of the <canvas> element
   * @param {number} selectedCharacterId - Character ID to load
   * @param {Function} pauseCallback     - Called when game is paused
   * @param {Function} gameOverCallback  - Called when game over
   */
  constructor(
    canvasId,
    selectedCharacterId = 0,
    pauseCallback = () => {},
    gameOverCallback = () => {}
  ) {
    // Canvas setup
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`Canvas "${canvasId}" not found.`);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 1000;
    this.canvas.height = 800;

    // Character selection
    const character = characters.find(c => c.id === selectedCharacterId) || characters[0];
    this.selectedCharacterId = character.id;

    // Systems
    this.player = new Player(
      100,
      100,
      64,
      64,
      character.sprite,
      () => this.triggerGameOver()
    );
    this.world = new World();
    this.mobs = [];
    this.controls = new Controls(this.player, this.canvas, this.mobs);
    this.camera = new Camera(
      this.canvas,
      this.world.width,
      this.world.height,
      this.player
    );
    this.storage = new Storage();

    // Callbacks & stats
    this.pauseCallback = pauseCallback;
    this.gameOverCallback = gameOverCallback;
    this.kills = 0;
    this.score = 0;
    this.lowHealthPulse = 0;

    // Loop control
    this.lastTime = 0;
    this.state = 'loading';
    this.loop = this.loop.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);

    // Damage flash
    this.prevHealth = this.player.health;
    this.damageFlash = 0;
  }

  /** Initialize or load save data */
  init(loadExisting = false) {
    this.state = 'initializing';

    if (loadExisting) {
      const saved = this.storage.load();
      if (saved) {
        try {
          if (saved.world) this.world.load(saved.world);
          if (saved.player) this.player.load(saved.player);
          if (saved.mobs) {
            this.mobs = saved.mobs.map(data =>
              new Mob(data.x, data.y, data.sprite, data.options)
            );
          }
          this.kills = saved.kills || 0;
          this.score = saved.score || 0;
        } catch (e) {
          console.error('Error loading save:', e);
        }
      }
    }

    // If no mobs loaded, spawn 5 with random character sprites
    if (!this.mobs.length) {
      const spritePool = characters.map(c => c.sprite);
      this.mobs = Array.from({ length: 5 }, () => {
        const x = Math.random() * (this.world.width - 50);
        const y = Math.random() * (this.world.height - 50);
        return new Mob(x, y, spritePool, {
          health: 50,
          speed: 60,
          damage: 10,
          width: 48,
          height: 48
        });
      });
    }

    // Sync systems
    this.controls.mobs = this.mobs;
    this.camera.worldWidth = this.world.width;
    this.camera.worldHeight = this.world.height;

    // Start loop
    window.addEventListener('keydown', this._handleKeyDown);
    this.lastTime = performance.now();
    this.state = 'playing';
    requestAnimationFrame(this.loop);
  }

  /** Resume after pause */
  resume() {
    if (this.state !== 'paused') return;
    this.controls = new Controls(this.player, this.canvas, this.mobs);
    window.addEventListener('keydown', this._handleKeyDown);
    this.lastTime = performance.now();
    this.state = 'playing';
    requestAnimationFrame(this.loop);
  }

  /** Handle Escape to pause */
  _handleKeyDown(e) {
    if (e.key === 'Escape' && this.state === 'playing') {
      this.pause();
    }
  }

  /** Pause the game */
  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.controls.destroy();
    this.pauseCallback(this.selectedCharacterId);
  }

  /** Trigger game over */
  triggerGameOver() {
    if (this.state === 'gameover') return;
    this.state = 'gameover';
    this.controls.destroy();
    this.gameOverCallback(this.selectedCharacterId);
  }

  /** Main game loop */
  loop(timestamp) {
    if (this.state !== 'playing') return;
    const delta = Math.min(timestamp - this.lastTime, 50);
    this.lastTime = timestamp;

    // Damage flash detection
    if (this.player.health < this.prevHealth) {
      this.damageFlash = 200;
    }
    this.prevHealth = this.player.health;

    // Update
    this.controls.update();
    this.player.update(delta, this.world);
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      mob.update(delta, this.player);
      if (mob.health <= 0) {
        this.mobs.splice(i, 1);
        this.kills++;
        this.score += 100;
      }
    }
    this.world.update(delta);

    // Render
    this.ctx.fillStyle = '#1C7ED6';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.camera.begin(this.ctx);
    this.world.draw(this.ctx);
    this.mobs.forEach(mob => mob.draw(this.ctx));
    this.player.draw(this.ctx);
    this.camera.end(this.ctx);

    // UI and overlays
    this._drawUI(delta);

    requestAnimationFrame(this.loop);
  }

  /** Draw health bar, stats, joystick, and damage flash */
  _drawUI(delta) {
    // Health bar
    const ctx = this.ctx;
    const max = this.player.maxHealth;
    const hp = Math.max(0, this.player.health);
    const pct = hp / max;
    const x = 20, y = 20, w = 200, h = 20;
    ctx.fillStyle = '#333'; ctx.fillRect(x, y, w, h);
    if (pct > 0.6) ctx.fillStyle = '#2ecc71';
    else if (pct > 0.3) ctx.fillStyle = '#f1c40f';
    else ctx.fillStyle = '#e74c3c';
    ctx.fillRect(x, y, w * pct, h);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(hp)} / ${max}`, x + w / 2, y + h / 2);

    // Stats
    ctx.fillStyle = '#fff'; ctx.font = '14px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`Mobs: ${this.mobs.length}`, x, y + 30);
    ctx.fillText(`Kills: ${this.kills}`,    x, y + 50);
    ctx.fillText(`Score: ${this.score}`,    x, y + 70);

    // Joystick
    if (this.controls.drawJoystick) this.controls.drawJoystick(ctx);

    // Damage flash
    if (this.damageFlash > 0) {
      const alpha = Math.min(this.damageFlash / 200, 0.5);
      ctx.save(); ctx.fillStyle = `rgba(255,0,0,${alpha})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
      this.damageFlash -= delta;
    }
  }

  /** Save game state */
  save() {
    const mobs = this.mobs.filter(m => typeof m.serialize === 'function')
                           .map(m => m.serialize());
    const data = {
      world:  this.world.serialize(),
      player: this.player.serialize(),
      mobs,
      kills:  this.kills,
      score:  this.score
    };
    this.storage.save(data);
  }

  /** Exit to main menu */
  exitToMenu() {
    this.save();
    this.destroy();
    window.location.reload();
  }

  /** Cleanup resources */
  destroy() {
    this.state = 'destroyed';
    this.controls.destroy();
    window.removeEventListener('keydown', this._handleKeyDown);
  }
}
