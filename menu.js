// menu.js

export class Menu {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Function} onResume  – called to unpause the game
   * @param {Function} onExit    – called to exit back to landing/menu
   */
  constructor(canvas, onResume, onExit) {
    this.canvas       = canvas;
    this.onResume     = onResume;
    this.onExit       = onExit;
    this.buttonWidth  = 200;
    this.buttonHeight = 50;
    this.spacing      = 20;
    this._clickHandler = this.handleClick.bind(this);
    this.canvas.addEventListener('click', this._clickHandler);
  }

  /** Draw the translucent overlay + buttons */
  draw(ctx) {
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Dim entire screen
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, W, H);

    // Prepare text style
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';

    // Compute button positions centered vertically
    const totalH = 2 * this.buttonHeight + this.spacing;
    const startY = (H - totalH) / 2;
    const centerX = W / 2;

    // Resume button
    ctx.fillStyle = '#333';
    ctx.fillRect(centerX - this.buttonWidth/2, startY, this.buttonWidth, this.buttonHeight);
    ctx.fillStyle = '#fff';
    ctx.fillText('Resume', centerX, startY + this.buttonHeight/2 + 8);

    // Exit button
    const exitY = startY + this.buttonHeight + this.spacing;
    ctx.fillStyle = '#333';
    ctx.fillRect(centerX - this.buttonWidth/2, exitY, this.buttonWidth, this.buttonHeight);
    ctx.fillStyle = '#fff';
    ctx.fillText('Exit to Menu', centerX, exitY + this.buttonHeight/2 + 8);

    ctx.restore();
  }

  /** Handle click events to trigger resume or exit */
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const W = this.canvas.width;
    const H = this.canvas.height;
    const centerX = W / 2;
    const totalH = 2 * this.buttonHeight + this.spacing;
    const startY = (H - totalH) / 2;

    // Check Resume
    const rx0 = centerX - this.buttonWidth/2;
    const ry0 = startY;
    if (x >= rx0 && x <= rx0 + this.buttonWidth
     && y >= ry0 && y <= ry0 + this.buttonHeight) {
      this.onResume();
      return;
    }

    // Check Exit
    const ex0 = rx0;
    const ey0 = startY + this.buttonHeight + this.spacing;
    if (x >= ex0 && x <= ex0 + this.buttonWidth
     && y >= ey0 && y <= ey0 + this.buttonHeight) {
      this.onExit();
    }
  }

  /** Call when destroying the menu to remove event listeners */
  destroy() {
    this.canvas.removeEventListener('click', this._clickHandler);
  }
}
