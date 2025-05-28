// controls.js

export class Controls {
  /**
   * @param {Player} player – expects player.setDirection(dx, dy), x, y, width, height
   * @param {HTMLCanvasElement} canvas – game canvas for input capture
   * @param {Array} mobs – array of mob objects with {x, y, width, height, takeDamage, health}
   */
  constructor(player, canvas, mobs = []) {
    if (!canvas) throw new Error('Controls requires a canvas element');
    this.player = player;
    this.canvas = canvas;
    this.mobs = mobs;

    // Movement state
    this.keys = {};
    this.joystickActive = false;
    this.joystickStart  = null;
    this.dragOffset     = { x: 0, y: 0 };
    this.joystickRadius = 50;    // max travel from start
    this.joystickDeadZone = 10;  // pixels

    // Attack parameters
    this.attackRange = 100;      // pixels
    this.attackDamage = 25;

    // Bind methods
    this._onKeyDown   = this.onKeyDown.bind(this);
    this._onKeyUp     = this.onKeyUp.bind(this);
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseUp   = this.onMouseUp.bind(this);
    this._onTouchStart = this.onTouchStart.bind(this);
    this._onTouchMove  = this.onTouchMove.bind(this);
    this._onTouchEnd   = this.onTouchEnd.bind(this);

    this.attachListeners();
  }

  /** Attach all input listeners */
  attachListeners() {
    window.addEventListener('keydown',  this._onKeyDown);
    window.addEventListener('keyup',    this._onKeyUp);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup',  this._onMouseUp);
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    window.addEventListener('touchmove',  this._onTouchMove,  { passive: false });
    window.addEventListener('touchend',   this._onTouchEnd,   { passive: false });
    window.addEventListener('touchcancel',this._onTouchEnd,   { passive: false });
  }

  /** Remove all input listeners */
  detachListeners() {
    window.removeEventListener('keydown',  this._onKeyDown);
    window.removeEventListener('keyup',    this._onKeyUp);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup',  this._onMouseUp);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove',  this._onTouchMove);
    window.removeEventListener('touchend',   this._onTouchEnd);
    window.removeEventListener('touchcancel',this._onTouchEnd);
  }

  /** Cleanup when done */
  destroy() {
    this.detachListeners();
  }

  /** Convert window client coords → canvas pixel coords */
  normalizeCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY
    };
  }

  onKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
  }

  onKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  onMouseDown(e) {
    e.preventDefault();
    const { x, y } = this.normalizeCoords(e.clientX, e.clientY);
    this.handleAttack(x, y);
  }

  onMouseUp(/*e*/) {
    // No-op for now
  }

  onTouchStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const { x, y } = this.normalizeCoords(touch.clientX, touch.clientY);
    this.joystickActive = true;
    this.joystickStart  = { x, y };
    this.dragOffset     = { x: 0, y: 0 };
  }

  onTouchMove(e) {
    if (!this.joystickActive) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const { x, y } = this.normalizeCoords(touch.clientX, touch.clientY);
    let dx = x - this.joystickStart.x;
    let dy = y - this.joystickStart.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.joystickRadius) {
      dx = (dx / dist) * this.joystickRadius;
      dy = (dy / dist) * this.joystickRadius;
    }
    this.dragOffset = { x: dx, y: dy };
  }

  onTouchEnd(e) {
    e.preventDefault();
    // End joystick on any changed touch
    this.joystickActive = false;
    this.dragOffset     = { x: 0, y: 0 };
  }

  /** Attack logic: damage mobs within range */
  handleAttack(targetX, targetY) {
    const originX = (this.player.x || 0) + ((this.player.width  || 0) / 2);
    const originY = (this.player.y || 0) + ((this.player.height || 0) / 2);
    const dx = targetX - originX;
    const dy = targetY - originY;
    if (Math.hypot(dx, dy) > this.attackRange) return;

    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      if (!mob) continue;
      const mx = (mob.x || 0) + ((mob.width  || 0) / 2);
      const my = (mob.y || 0) + ((mob.height || 0) / 2);
      const distToMob = Math.hypot(mx - originX, my - originY);
      if (distToMob <= this.attackRange) {
        if (typeof mob.takeDamage === 'function') {
          mob.takeDamage(this.attackDamage);
        } else if (mob.health !== undefined) {
          mob.health -= this.attackDamage;
        }
        if (mob.health !== undefined && mob.health <= 0) {
          this.mobs.splice(i, 1);
        }
        console.log(`Mob at (${mx.toFixed(0)},${my.toFixed(0)}) took ${this.attackDamage} damage.`);
      }
    }
  }

  /** Call each frame to update movement */
  update() {
    let dx = 0, dy = 0;
    if (this.keys['w'] || this.keys['arrowup'])    dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown'])  dy += 1;
    if (this.keys['a'] || this.keys['arrowleft'])  dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    if (this.joystickActive) {
      const rawDx = this.dragOffset.x / this.joystickRadius;
      const rawDy = this.dragOffset.y / this.joystickRadius;
      const jlen = Math.hypot(rawDx, rawDy);
      if (jlen > this.joystickDeadZone / this.joystickRadius) {
        dx = rawDx / (jlen > 1 ? jlen : 1);
        dy = rawDy / (jlen > 1 ? jlen : 1);
      } else {
        dx = 0;
        dy = 0;
      }
    }

    this.player.setDirection(dx, dy);
  }

  /** Optional: visualize joystick on a given 2D context */
  drawJoystick(ctx) {
    if (!this.joystickActive || !this.joystickStart) return;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(this.joystickStart.x, this.joystickStart.y, this.joystickRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      this.joystickStart.x + this.dragOffset.x,
      this.joystickStart.y + this.dragOffset.y,
      this.joystickDeadZone,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
}
