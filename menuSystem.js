// menuSystem.js

import { characters } from './characterData.js';

/**
 * Draws a rounded rectangle path on the given context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - corner radius
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

export class MenuSystem {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} options
   * @param {string} options.playerName        - Name to display top-right
   * @param {number} options.currentCharId     - Character ID for sprite
   * @param {Function} options.onResumeGame    - Callback when Resume clicked or ESC
   * @param {Function} options.onSaveGame      - Callback when Save clicked
   * @param {Function} options.onExitGame      - Callback when Quit clicked
   */
  constructor(canvas, {
    playerName    = 'Player',
    currentCharId = 0,
    onResumeGame  = () => {},
    onSaveGame    = () => {},
    onExitGame    = () => {}
  }) {
    this.canvas       = canvas;
    if (!canvas) throw new Error('MenuSystem requires a valid canvas element');
    this.ctx          = canvas.getContext('2d');
    this.playerName  = playerName;
    this.currentCharId = currentCharId;
    this.callbacks    = { onResumeGame, onSaveGame, onExitGame };
    this.buttons      = [];

    // Preload sprites
    this.spriteMap = new Map();
    characters.forEach(ch => {
      const img = new Image();
      img.src = ch.sprite;
      this.spriteMap.set(ch.id, img);
    });

    this._clickHandler = this.handleClick.bind(this);
    this._keyHandler   = this.handleKey.bind(this);
    canvas.addEventListener('click', this._clickHandler);
    window.addEventListener('keydown', this._keyHandler);

    this.animate = this.animate.bind(this);
    this._frame = requestAnimationFrame(this.animate);
  }

  /** Main loop */
  animate() {
    this.draw();
    this._frame = requestAnimationFrame(this.animate);
  }

  /** Draw pause menu */
  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.buttons = [];

    // Background
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(0, 0, W, H);

    // Light panel behind sprite
    const baseSize = Math.min(W, H) * 0.4;
    const panelW = baseSize + 40;
    const panelH = baseSize + 40;
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2 - 20;

    ctx.fillStyle = '#3B82F6';
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 20);
    ctx.fill();

    // Sprite - FIX STRETCHING HERE
    const sprite = this.spriteMap.get(this.currentCharId) || new Image();
    if (sprite.complete && sprite.naturalWidth) {
      const { naturalWidth: nw, naturalHeight: nh } = sprite;
      
      // Calculate scale to fit within baseSize while maintaining aspect ratio
      const scaleX = baseSize / nw;
      const scaleY = baseSize / nh;
      const scale = Math.min(scaleX, scaleY); // Use minimum to prevent stretching
      
      const drawW = nw * scale;
      const drawH = nh * scale;
      const drawX = (W - drawW) / 2;
      const drawY = (H - drawH) / 2 - 20;
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
    }

    // Player name top-right
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(this.playerName, W - 20, 20);

    // Buttons top-left
    const btnW = 160;
    const btnH = 40;
    const margin = 20;
    let x = margin;
    let y = margin;

    this._addButton('Resume Game', x, y, btnW, btnH, 'resume');
    y += btnH + 10;
    this._addButton('Save Game',   x, y, btnW, btnH, 'save');
    y += btnH + 10;
    this._addButton('Quit Game',   x, y, btnW, btnH, 'quit');
  }

  /** Draws and registers a button */
  _addButton(label, x, y, w, h, action) {
    const ctx = this.ctx;
    ctx.fillStyle = '#2563EB';
    drawRoundedRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, x, y, w, h, 8);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
    this.buttons.push({ x, y, w, h, action });
  }

  /** Click handler */
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const my = (e.clientY - rect.top)  * (this.canvas.height / rect.height);

    for (const btn of this.buttons) {
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        if (btn.action === 'resume') this.callbacks.onResumeGame();
        else if (btn.action === 'save') this.callbacks.onSaveGame();
        else if (btn.action === 'quit') this.callbacks.onExitGame();
        return;
      }
    }
  }

  /** ESC resumes */
  handleKey(e) {
    if (e.key === 'Escape') this.callbacks.onResumeGame();
  }

  /** Cleanup */
  destroy() {
    cancelAnimationFrame(this._frame);
    this.canvas.removeEventListener('click', this._clickHandler);
    window.removeEventListener('keydown', this._keyHandler);
  }
}
