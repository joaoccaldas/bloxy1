// escUi.js

// Preload Joao’s sprite from the correct folder
const joaoSprite = new Image();
joaoSprite.src = 'assets/player/joao.png';

/**
 * Draw a rounded rectangle.
 */
function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

export class EscUI {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Function} onResume – callback to unpause
   * @param {Function} onSave   – callback to save game
   * @param {Function} onExit   – callback to return to main menu
   */
  constructor(canvas, onResume, onSave, onExit) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.onResume = onResume;
    this.onSave   = onSave;
    this.onExit   = onExit;

    // Buttons definition
    this.buttons = [
      { label: 'Resume',    action: this.onResume },
      { label: 'Save Game', action: this.onSave },
      { label: 'Main Menu', action: this.onExit }
    ];

    // Button sizing to match your screenshot
    this.btnW     = 160;
    this.btnH     = 40;
    this.radius   = 6;
    this.spacing  = 12;

    this._clickHandler = this.handleClick.bind(this);
    this.canvas.addEventListener('click', this._clickHandler);
  }

  draw() {
    const { ctx, canvas: C } = this;
    const W = C.width, H = C.height;

    // 1) Solid blue background (use the same teal-ish tone)
    ctx.fillStyle = '#367F92';
    ctx.fillRect(0, 0, W, H);

    // 2) Joao sprite centered at top
    const spriteSize = 320;
    const imgX = (W - spriteSize) / 2;
    const imgY = H * 0.1;
    if (joaoSprite.complete && joaoSprite.naturalWidth) {
      ctx.drawImage(joaoSprite, imgX, imgY, spriteSize, spriteSize);
    }

    // 3) Buttons
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // compute start Y so that all buttons are vertically centered below sprite
    const totalBtnsH = this.buttons.length * this.btnH
                     + (this.buttons.length - 1) * this.spacing;
    let startY = imgY + spriteSize + 30;

    this.buttons.forEach((btn, i) => {
      const bx = (W - this.btnW) / 2;
      const by = startY + i * (this.btnH + this.spacing);

      // draw button background
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(ctx, bx, by, this.btnW, this.btnH, this.radius);

      // draw label
      ctx.fillStyle = '#333333';
      ctx.fillText(btn.label, bx + this.btnW / 2, by + this.btnH / 2);

      // save for hit-testing
      btn.rect = { x: bx, y: by, w: this.btnW, h: this.btnH };
    });
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const btn of this.buttons) {
      const r = btn.rect;
      if (
        mx >= r.x && mx <= r.x + r.w &&
        my >= r.y && my <= r.y + r.h
      ) {
        btn.action();
        return;
      }
    }
  }

  destroy() {
    this.canvas.removeEventListener('click', this._clickHandler);
  }
}
