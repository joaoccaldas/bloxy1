// game.js (Final version with glowing shard effect, mini-map, boss, cutscene)

import { characters } from './characterData.js';
import { Player } from './player.js';
import { Controls } from './controls.js';
import { World } from './world.js';
import { Camera } from './camera.js';
import { Storage } from './storage.js';
import { Mob } from './mobs.js';
import { DamageNumber } from './damageNumber.js';

export class Game {
  constructor(canvasId, selectedCharacterId = 0, pauseCallback = () => {}, gameOverCallback = () => {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`Canvas "${canvasId}" not found.`);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 1000;
    this.canvas.height = 800;

    const character = characters.find(c => c.id === selectedCharacterId) || characters[0];
    this.selectedCharacterId = character.id;    this.player = new Player(100, 100, 64, 64, character.sprite, () => this.triggerGameOver());
    this.world = new World();
    this.mobs = [];
    this.camera = new Camera(this.canvas, this.world.width, this.world.height, this.player);
    this.controls = new Controls(this.player, this.canvas, this.mobs, (mob, damage, x, y) => this.onMobDamaged(mob, damage, x, y), this.camera);
    this.storage = new Storage();

    this.pauseCallback = pauseCallback;
    this.gameOverCallback = gameOverCallback;    this.kills = 0;
    this.score = 0;
    this.lowHealthPulse = 0;
    this.damageNumbers = [];

    this.lastTime = 0;
    this.state = 'loading';
    this.loop = this.loop.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);

    this.prevHealth = this.player.health;
    this.damageFlash = 0;
  }

  init(loadExisting = false) {
    this.state = 'initializing';

    if (loadExisting) {
      const saved = this.storage.load();
      if (saved) {
        try {
          if (saved.world) this.world.load(saved.world);
          if (saved.player) this.player.load(saved.player);
          if (saved.mobs) {
            this.mobs = saved.mobs.map(data => new Mob(data.x, data.y, data.sprite, data.options));          }
          this.kills = saved.kills || 0;
          this.score = saved.score || 0;
        } catch (e) {
          console.error('Error loading save:', e);
        }
      }
    }

    if (!this.mobs.length) {
      const spritePool = characters.map(c => c.sprite);
      this.mobs = Array.from({ length: 5 }, () => {
        const x = Math.random() * (this.world.width - 50);
        const y = Math.random() * (this.world.height - 50);
        return new Mob(x, y, spritePool, { health: 50, speed: 60, damage: 10, width: 48, height: 48 });
      });
    }

    this.controls.mobs = this.mobs;
    this.camera.worldWidth = this.world.width;
    this.camera.worldHeight = this.world.height;

    window.addEventListener('keydown', this._handleKeyDown);
    this.lastTime = performance.now();
    this.state = 'playing';
    requestAnimationFrame(this.loop);
  }
  resume() {
    if (this.state !== 'paused') return;
    this.controls = new Controls(this.player, this.canvas, this.mobs, (mob, damage, x, y) => this.onMobDamaged(mob, damage, x, y), this.camera);
    window.addEventListener('keydown', this._handleKeyDown);
    this.lastTime = performance.now();
    this.state = 'playing';
    requestAnimationFrame(this.loop);
  }

  onMobDamaged(mob, damage, x, y) {
    this.damageNumbers.push(new DamageNumber(x, y - 10, damage, '#ff0000'));
  }

  _handleKeyDown(e) {
    if (e.key === 'Escape' && this.state === 'playing') {
      this.pause();
    }
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.controls.destroy();
    this.pauseCallback(this.selectedCharacterId);
  }

  triggerGameOver() {
    if (this.state === 'gameover') return;
    this.state = 'gameover';
    this.controls.destroy();
    this.gameOverCallback(this.selectedCharacterId);
  }
  loop(timestamp) {
    if (this.state !== 'playing' && this.state !== 'cutscene') return;
    const delta = Math.min(timestamp - this.lastTime, 50);
    this.lastTime = timestamp;

    if (this.player.health < this.prevHealth) this.damageFlash = 200;
    this.prevHealth = this.player.health;

    if (this.state === 'playing') this.controls.update();
    this.player.update(delta, this.world);
    this.damageNumbers = this.damageNumbers.filter(d => d.update(delta));

    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      const prevHealth = mob.health;
      mob.update(delta, this.player);
      if (mob.health <= 0 && prevHealth > 0) {
        const points = 100;
        this.mobs.splice(i, 1);
        this.kills++;
        this.score += points;
        this.damageNumbers.push(new DamageNumber(mob.x + mob.width / 2, mob.y - 10, `+${points}`, '#00ff00'));
      }
    }

    this.world.update(delta);    this.ctx.fillStyle = '#1C7ED6';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.camera.begin(this.ctx);
    this.world.draw(this.ctx);
    this.mobs.forEach(mob => mob.draw(this.ctx));
    this.player.draw(this.ctx);
    this.damageNumbers.forEach(d => d.draw(this.ctx));
    // Draw attack range indicator in world coordinates
    if (this.controls && this.controls.drawAttackRange) {
      this.controls.drawAttackRange(this.ctx);
    }
    this.camera.end(this.ctx);

    this._drawUI(delta);
    requestAnimationFrame(this.loop);
  }

  _startCutscene() {
    this.state = 'cutscene';
    this.controls.destroy();
    this.damageNumbers.push(new DamageNumber(this.player.x, this.player.y - 40, 'THE GROUND TREMBLES...', '#FF00FF'));
    setTimeout(() => {
      this.damageNumbers.push(new DamageNumber(this.player.x, this.player.y - 60, 'SOMETHING AWAKENS...', '#FF00FF'));
    }, 1000);    setTimeout(() => {
      this.spawnBoss();
      this.state = 'playing';
      this.controls = new Controls(this.player, this.canvas, this.mobs, (mob, damage, x, y) => this.onMobDamaged(mob, damage, x, y), this.camera);
    }, 2500);
  }

  spawnBoss() {
    const x = this.world.width / 2 - 64;
    const y = this.world.height / 2 - 64;
    const boss = new Mob(x, y, 'assets/mobs/boss.png', { health: 300, speed: 80, width: 96, height: 96, damage: 25 });
    this.mobs.push(boss);
    this.bossSpawned = true;
    this.damageNumbers.push(new DamageNumber(x + 48, y - 40, 'BOSS SPAWNED!', '#FF00FF'));
  }

  onBossDefeated() {
    this.damageNumbers.push(new DamageNumber(this.player.x, this.player.y - 40, 'BOSS DEFEATED!', '#FFD700'));
    this.damageNumbers.push(new DamageNumber(this.player.x, this.player.y - 60, 'VICTORY!', '#FFD700'));
    
    // Start restart after a short delay to show victory message
    setTimeout(() => {
      this.restartGame();
    }, 2000);
  }
  restartGame() {
    // Reset game state
    this.kills = 0;
    this.score = 0;
    this.shardsCollected.clear();
    this.bossSpawned = false;
    this.cutsceneStarted = false;
    this.damageNumbers = [];
    
    // Reset player health and position
    this.player.health = this.player.maxHealth;
    this.player.x = 100;
    this.player.y = 100;
    
    // Reset world shards
    this.world.shards.forEach(shard => {
      shard.collected = false;
    });
    
    // Clear existing mobs
    this.mobs.length = 0;
    
    // Spawn new mobs
    const spritePool = characters.map(c => c.sprite);
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * (this.world.width - 64);
      const y = Math.random() * (this.world.height - 64);
      const sprite = spritePool[Math.floor(Math.random() * spritePool.length)];
      this.mobs.push(new Mob(x, y, sprite));
    }
      // Update controls with new mobs array
    if (this.controls) {
      this.controls.destroy();
    }
    this.controls = new Controls(this.player, this.canvas, this.mobs, (mob, damage, x, y) => this.onMobDamaged(mob, damage, x, y), this.camera);
    
    this.damageNumbers.push(new DamageNumber(this.player.x, this.player.y - 40, 'NEW ADVENTURE BEGINS!', '#00FF00'));
    
    // Ensure we're in playing state
    this.state = 'playing';
  }
  _drawUI(delta) {
    const ctx = this.ctx;    if (this.controls.drawJoystick) this.controls.drawJoystick(ctx);
    if (this.damageFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255,0,0,${Math.min(this.damageFlash / 200, 0.5)})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
      this.damageFlash -= delta;    }
  }
  save() {
    const mobs = this.mobs.filter(m => typeof m.serialize === 'function').map(m => m.serialize());
    const data = {
      world: this.world.serialize(),
      player: this.player.serialize(),
      mobs,
      kills: this.kills,
      score: this.score,
      shards: [...this.shardsCollected],
      bossSpawned: this.bossSpawned
    };
    this.storage.save(data);
  }

  exitToMenu() {
    this.save();
    this.destroy();
    window.location.reload();
  }

  destroy() {
    this.state = 'destroyed';
    this.controls.destroy();
    window.removeEventListener('keydown', this._handleKeyDown);
  }
}