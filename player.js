// player.js

import { checkCollision } from './collision.js';
import { HealthBar } from './healthBar.js';

export class Player {
  /**
   * @param {number} x - initial x position
   * @param {number} y - initial y position
   * @param {number} width - player width
   * @param {number} height - player height
   * @param {string} spritePath - URL for player sprite
   * @param {Function} onDeath - callback when health <= 0
   */
  constructor(x, y, width, height, spritePath = '', onDeath = () => {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = new Image();
    this.sprite.src = spritePath;

    // Movement deltas (unit vector)
    this.dx = 0;
    this.dy = 0;
    // Speed in pixels per second
    this.speed = 200;    // Health
    this.maxHealth = 100;
    this.health    = this.maxHealth;
    this.onDeath   = onDeath;
    
    // Weather effects
    this.weatherSpeedMultiplier = 1.0;
    this.weatherVisibilityMultiplier = 1.0;// Health bar for player
    this.healthBar = new HealthBar();
    this.healthBar.width = 60; // Wider for player
    this.healthBar.height = 8; // Taller for player
    this.healthBar.isPlayerHealthBar = true; // Mark as player health bar
    this.healthBar.visible = true; // Always visible for player
  }

  /**
   * Set movement direction as a unit vector
   * @param {number} dx
   * @param {number} dy
   */
  setDirection(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }

  /**
   * Update position and check for collisions
   * @param {number} delta - ms since last frame
   * @param {World} world
   */  update(delta, world) {
    // Move with weather effects
    const effectiveSpeed = this.speed * (this.weatherSpeedMultiplier || 1.0);
    const dist = (effectiveSpeed * delta) / 1000;
    let newX = this.x + this.dx * dist;
    let newY = this.y + this.dy * dist;

    // Clamp to world bounds
    newX = Math.max(0, Math.min(world.width - this.width, newX));
    newY = Math.max(0, Math.min(world.height - this.height, newY));

    this.x = newX;
    this.y = newY;

    // Update health bar position
    this.healthBar.update(
      this.x + this.width / 2, 
      this.y + this.height + 10, // Below player
      this.health, 
      this.maxHealth, 
      delta
    );
  }

  /**
   * Draw the player sprite at current position
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (this.sprite.complete && this.sprite.naturalWidth) {
      ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    } else {
      // Placeholder box if sprite not loaded
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Draw health bar below player
    this.healthBar.draw(ctx);
  }

  /**
   * Apply damage and trigger death callback if needed
   * @param {number} amount
   */
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.onDeath();
    }
  }

  /**
   * Axis-aligned bounding box for collision
   */
  getAABB() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height
    };
  }

  /**
   * Serialize player state
   */
  serialize() {
    return {
      x: this.x,
      y: this.y,
      health: this.health
    };
  }

  /**
   * Load serialized state
   * @param {{x:number,y:number,health:number}} data
   */
  load(data) {
    this.x = data.x ?? this.x;
    this.y = data.y ?? this.y;
    this.health = data.health ?? this.health;
  }
}
