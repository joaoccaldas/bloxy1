// mobs.js

import { checkCollision } from './collision.js';

// Add this health bar class at the top
class HealthBar {
  constructor() {
    this.width = 40;
    this.height = 6;
    this.visible = false;
    this.fadeTimer = 0;
  }

  update(mobX, mobY, currentHealth, maxHealth, deltaTime) {
    this.x = mobX + 4; // Center over mob
    this.y = mobY - 15; // Above mob
    this.currentHealth = currentHealth;
    this.maxHealth = maxHealth;
    
    // Show when damaged
    if (currentHealth < maxHealth) {
      this.visible = true;
      this.fadeTimer = 3000; // Show for 3 seconds
    }
    
    // Fade out
    if (this.fadeTimer > 0) {
      this.fadeTimer -= deltaTime;
      if (this.fadeTimer <= 0) this.visible = false;
    }
  }

  draw(ctx) {
    if (!this.visible || this.currentHealth <= 0) return;
    
    const healthPercent = this.currentHealth / this.maxHealth;
    
    ctx.save();
    
    // Background (red)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Health (green to red gradient)
    if (healthPercent > 0.6) ctx.fillStyle = '#00ff00';
    else if (healthPercent > 0.3) ctx.fillStyle = '#ffff00';
    else ctx.fillStyle = '#ff6600';
    
    ctx.fillRect(this.x, this.y, this.width * healthPercent, this.height);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    ctx.restore();
  }
}

export class Mob {
  /**
   * @param {number} x         - Initial X position
   * @param {number} y         - Initial Y position
   * @param {string[]} sprites - Array of sprite URLs to choose from
   * @param {{health?: number, speed?: number, width?: number, height?: number}} options
   */
  constructor(x, y, sprites, options = {}) {
    this.x = x;
    this.y = y;
    this.width  = options.width  || 48;
    this.height = options.height || 48;

    this.speed = options.speed || 60;          // pixels per second
    this.health = options.health || 100;
    this.maxHealth = this.health; // Add this line
    this.damage = options.damage || 10;

    // Add health bar
    this.healthBar = new HealthBar();

    // Movement state
    this.dx = 0;
    this.dy = 0;
    this.changeDirCooldown = 0;
    this.hitCooldown       = 0;

    // Choose random sprite
    const spritePath = Array.isArray(sprites) && sprites.length
      ? sprites[Math.floor(Math.random() * sprites.length)]
      : sprites;
    this.sprite = new Image();
    this.sprite.src = spritePath;
  }

  /**
   * Update mob position and handle collisions with the player.
   * @param {number} delta   - Time since last frame (ms)
   * @param {Player} player  - Player instance for collision
   */
  update(delta, player) {
    // Change direction occasionally
    this.changeDirCooldown -= delta;
    if (this.changeDirCooldown <= 0) {
      const dirs = [-1, 0, 1];
      this.dx = dirs[Math.floor(Math.random() * 3)];
      this.dy = dirs[Math.floor(Math.random() * 3)];
      this.changeDirCooldown = 1000 + Math.random() * 2000;
    }

    // Move
    const distance = (this.speed * delta) / 1000;
    this.x += this.dx * distance;
    this.y += this.dy * distance;

    // Cooldown for damaging the player
    this.hitCooldown -= delta;

    // Collision with player
    if (this.hitCooldown <= 0 && checkCollision(this.getAABB(), player.getAABB())) {
      player.takeDamage(this.damage);
      this.hitCooldown = 1000; // 1 second before next hit
    }

    // Update health bar
    this.healthBar.update(this.x, this.y, this.health, this.maxHealth, delta);
  }

  /**
   * Draw the mob sprite.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (this.sprite.complete && this.sprite.naturalWidth) {
      ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    } else {
      // Fallback box
      ctx.fillStyle = '#AA0000';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Draw health bar
    this.healthBar.draw(ctx);
  }

  /**
   * Axis-aligned bounding box for collision.
   * @returns {{left:number, top:number, right:number, bottom:number}}
   */
  getAABB() {
    return {
      left:   this.x,
      top:    this.y,
      right:  this.x + this.width,
      bottom: this.y + this.height
    };
  }

  /**
   * Apply damage to this mob.
   * @param {number} amount
   */
  takeDamage(amount) {
    this.health -= amount;
    // Health bar will automatically show when health < maxHealth
  }

  /**
   * Serialize mob state for saving.
   * @returns {{x:number,y:number,width:number,height:number,sprite:string,options:{health:number,speed:number,damage:number}}}
   */
  serialize() {
    return {
      x:      this.x,
      y:      this.y,
      width:  this.width,
      height: this.height,
      sprite: this.sprite.src,
      options: {
        health: this.health,
        speed:  this.speed,
        damage: this.damage
      }
    };
  }
}
