// rivals.js

import { characters } from './characterData.js';

/**
 * Draws a rounded rectangle path on the given context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 */
function drawRoundedRect(ctx, x, y, w, h, r) {
  if (r > w / 2) r = w / 2;
  if (r > h / 2) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

/**
 * Rivals selection UI: displays all characters in a grid.
 * Calls onSelect(id) when a character is clicked.
 * Optionally onCancel() when Escape is pressed.
 */
export class Rivals {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Function} onSelect - callback(charId)
   * @param {Function} [onCancel] - optional callback for cancel
   */
  constructor(canvas, onSelect, onCancel = () => {}) {
    this.canvas     = canvas;
    if (!canvas) throw new Error('Rivals requires a canvas element');
    this.ctx        = canvas.getContext('2d');
    this.onSelect   = onSelect;
    this.onCancel   = onCancel;
    this.buttons    = [];

    // Preload character sprites
    this.spriteMap = new Map();
    characters.forEach(ch => {
      const img = new Image();
      img.src = ch.sprite;
      this.spriteMap.set(ch.id, img);
    });

    // Bind handlers
    this._clickHandler = this.handleClick.bind(this);
    this._keyHandler   = this.handleKey.bind(this);
    canvas.addEventListener('click', this._clickHandler);
    window.addEventListener('keydown', this._keyHandler);

    this.animate = this.animate.bind(this);
    this._frame = requestAnimationFrame(this.animate);
  }

  /** Main animation loop */
  animate() {
    this.draw();
    this._frame = requestAnimationFrame(this.animate);
  }

  /** Draw the character grid */
  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Choose Your Rival', W / 2, 20);

    // Grid layout
    const count = characters.length;
    const cols = Math.min(count, 4);
    const rows = Math.ceil(count / cols);
    const boxW = 120;
    const boxH = 160; // Includes space for name
    const spacingX = (W - cols * boxW) / (cols + 1);
    const spacingY = 20;
    const startY = 100;

    this.buttons = [];

    characters.forEach((ch, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = spacingX + col * (boxW + spacingX);
      const y = startY + row * (boxH + spacingY);

      // Panel
      ctx.fillStyle = '#3B82F6';
      drawRoundedRect(ctx, x, y, boxW, boxW, 12);
      ctx.fill();
      ctx.strokeStyle = '#2563EB'; ctx.lineWidth = 2;
      drawRoundedRect(ctx, x, y, boxW, boxW, 12);
      ctx.stroke();

      // Sprite
      const img = this.spriteMap.get(ch.id);
      if (img.complete && img.naturalWidth) {
        const scale = boxW / Math.max(img.naturalWidth, img.naturalHeight);
        const imgW = img.naturalWidth * scale;
        const imgH = img.naturalHeight * scale;
        const imgX = x + (boxW - imgW) / 2;
        const imgY = y + (boxW - imgH) / 2;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading...', x + boxW/2, y + boxW/2);
      }

      // Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(ch.name, x + boxW/2, y + boxW + 8);

      // Register click area
      this.buttons.push({ x, y, w: boxW, h: boxW, id: ch.id });
    });
  }

  /** Handle click to select character */
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    for (const btn of this.buttons) {
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        this.onSelect(btn.id);
        this.cleanup();
        return;
      }
    }
  }

  /** Handle Escape to cancel */
  handleKey(e) {
    if (e.key === 'Escape') {
      this.onCancel();
      this.cleanup();
    }
  }

  /** Remove listeners and stop animation */
  cleanup() {
    cancelAnimationFrame(this._frame);
    this.canvas.removeEventListener('click', this._clickHandler);
    window.removeEventListener('keydown', this._keyHandler);
  }
}
