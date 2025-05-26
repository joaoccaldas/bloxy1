// player.js

import { checkAABB } from './collision.js';

const SPRITE_PATH = 'assets/player/joao.png';  // <-- your sprite file

// Preload a single Image instance
const joaoImage = new Image();
joaoImage.src = SPRITE_PATH;

export class Player {
  /**
   * @param {number} x      – initial world X
   * @param {number} y      – initial world Y
   * @param {number} width  – hitbox width (px) & sprite draw width
   * @param {number} height – hitbox height (px) & sprite draw height
   */
  constructor(x = 100, y = 100, width = 32, height = 100) {
    this.x      = x;
    this.y      = y;
    this.width  = width;
    this.height = height;

    this.dirX  = 0;
    this.dirY  = 0;
    this.speed = 200;     // px/sec

    // Use the preloaded image
    this.sprite = joaoImage;

    // Fallback color while loading
    this.color = '#ff4444';
  }

  update(delta, world) {
    const dt = delta / 1000;
    let newX = this.x + this.dirX * this.speed * dt;
    let newY = this.y + this.dirY * this.speed * dt;

    for (const block of world.blocks.values()) {
      const b = block.getBounds();
      // Horizontal
      if (checkAABB(
        { left: newX, top: this.y, right: newX + this.width, bottom: this.y + this.height },
        b
      )) newX = this.x;
      // Vertical
      if (checkAABB(
        { left: this.x, top: newY, right: this.x + this.width, bottom: newY + this.height },
        b
      )) newY = this.y;
    }

    this.x = newX;
    this.y = newY;
  }

  setDirection(dx, dy) {
    this.dirX = dx;
    this.dirY = dy;
  }

  draw(ctx) {
    ctx.save();
    if (this.sprite.complete && this.sprite.naturalWidth !== 0) {
      // Draw the sprite scaled to width×height
      ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    } else {
      // Fallback rectangle
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    ctx.restore();
  }

  serialize() {
    return { x: this.x, y: this.y, color: this.color };
  }

  load(data) {
    this.x     = data.x;
    this.y     = data.y;
    this.color = data.color;
  }
}
