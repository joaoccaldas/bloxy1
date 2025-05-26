// camera.js

export class Camera {
  /**
   * @param {Player} player   – the player instance to follow
   * @param {HTMLCanvasElement} canvas
   * @param {Object} [options]
   *        options.lerp      – smoothing factor (0–1), default 0.1
   *        options.zoom      – initial zoom level, default 1
   */
  constructor(player, canvas, options = {}) {
    this.player    = player;
    this.canvas    = canvas;
    this.lerp      = options.lerp ?? 0.1;
    this.zoom      = options.zoom ?? 1;
    this.x         = 0;
    this.y         = 0;
    this.boundsW   = Infinity;
    this.boundsH   = Infinity;
  }

  /** Define world dimensions so camera doesn’t pan outside them */
  setBounds(worldWidth, worldHeight) {
    this.boundsW = worldWidth;
    this.boundsH = worldHeight;
  }

  /** Call each frame to recalculate camera position */
  update() {
    // target center so player stays centered
    const targetX = this.player.x + this.player.width  / 2 - (this.canvas.width  / 2) / this.zoom;
    const targetY = this.player.y + this.player.height / 2 - (this.canvas.height / 2) / this.zoom;

    // smooth interpolation
    this.x += (targetX - this.x) * this.lerp;
    this.y += (targetY - this.y) * this.lerp;

    // clamp to world edges
    this.x = Math.max(0, Math.min(this.x, this.boundsW - this.canvas.width  / this.zoom));
    this.y = Math.max(0, Math.min(this.y, this.boundsH - this.canvas.height / this.zoom));
  }

  /** Before drawing world+entities, apply transform */
  begin(ctx) {
    ctx.save();
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  /** After drawing, restore context */
  end(ctx) {
    ctx.restore();
  }

  /** Convert screen coords (e.g. mouse) to world coords */
  screenToWorld(sx, sy) {
    return {
      x: sx / this.zoom + this.x,
      y: sy / this.zoom + this.y,
    };
  }

  /** Convert world coords to screen coords (rarely needed if using begin/end) */
  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.zoom,
      y: (wy - this.y) * this.zoom,
    };
  }

  /** Optional: trigger a screen shake effect */
  shake(intensity = 5, duration = 300) {
    // You could implement shake state here (omitted for brevity)
  }
}
