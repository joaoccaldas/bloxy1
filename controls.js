// controls.js

export class Controls {
  /**
   * @param {Player} player – expects player.setDirection(dx, dy), x, y, width, height
   * @param {HTMLCanvasElement} canvas – game canvas for input capture
   * @param {Array} mobs – array of mob objects with {x, y, width, height, takeDamage, health}
   * @param {Function} onDamageDealt – callback when damage is dealt to a mob
   * @param {Camera} camera – camera for coordinate transformation
   */
  constructor(player, canvas, mobs = [], onDamageDealt = null, camera = null) {
    if (!canvas) throw new Error('Controls requires a canvas element');
    this.player = player;
    this.canvas = canvas;
    this.mobs = mobs;
    this.onDamageDealt = onDamageDealt;
    this.camera = camera; // Add camera reference

    // Movement state
    this.keys = {};
    this.joystickActive = false;
    this.joystickStart  = null;
    this.dragOffset     = { x: 0, y: 0 };
    this.joystickRadius = 50;    // max travel from start
    this.joystickDeadZone = 10;  // pixels    // Attack parameters
    this.attackRange = 100;      // pixels
    this.attackDamage = 25;
    this.showAttackRange = false; // For debugging/visual feedback
    this.lastAttackTime = 0;
    this.attackCooldown = 200; // 200ms cooldown between attacks

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
    
    // Handle spacebar attack
    if (e.key === ' ') {
      e.preventDefault();
      // Attack at player's current position + some range
      const centerX = this.player.x + this.player.width / 2;
      const centerY = this.player.y + this.player.height / 2;
      this.handleAttack(centerX, centerY);
    }
  }

  onKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }  onMouseDown(e) {
    e.preventDefault();
    const { x, y } = this.normalizeCoords(e.clientX, e.clientY);
    
    // Convert screen coordinates to world coordinates if camera exists
    let worldX = x;
    let worldY = y;
    
    if (this.camera && typeof this.camera.screenToWorld === 'function') {
      const worldCoords = this.camera.screenToWorld(x, y);
      worldX = worldCoords.x;
      worldY = worldCoords.y;
    }
    
    this.handleAttack(worldX, worldY);
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
    
    // If this was a quick tap (not a drag), treat it as an attack
    if (this.joystickActive) {
      const touch = e.changedTouches[0];
      const { x, y } = this.normalizeCoords(touch.clientX, touch.clientY);
      const tapDistance = Math.hypot(x - this.joystickStart.x, y - this.joystickStart.y);
      
      // If the drag distance was very small, treat as tap/attack
      if (tapDistance < 20) {
        // Convert screen coordinates to world coordinates if camera exists
        let worldX = x;
        let worldY = y;
        
        if (this.camera && typeof this.camera.screenToWorld === 'function') {
          const worldCoords = this.camera.screenToWorld(x, y);
          worldX = worldCoords.x;
          worldY = worldCoords.y;
        }
        
        this.handleAttack(worldX, worldY);
      }
    }
    
    // End joystick on any changed touch
    this.joystickActive = false;
    this.dragOffset     = { x: 0, y: 0 };
  }  /** Attack logic: damage mobs within range */
  handleAttack(targetX, targetY) {
    // Check attack cooldown
    const now = Date.now();
    if (now - this.lastAttackTime < this.attackCooldown) {
      return;
    }
    this.lastAttackTime = now;
    
    const originX = (this.player.x || 0) + ((this.player.width  || 0) / 2);
    const originY = (this.player.y || 0) + ((this.player.height || 0) / 2);
    const dx = targetX - originX;
    const dy = targetY - originY;
    const attackDistance = Math.hypot(dx, dy);
    
    console.log(`Attack attempted at world coords (${targetX.toFixed(1)}, ${targetY.toFixed(1)})`);
    console.log(`Player center: (${originX.toFixed(1)}, ${originY.toFixed(1)})`);
    console.log(`Attack distance: ${attackDistance.toFixed(1)}, max range: ${this.attackRange}`);
    
    // Show attack range temporarily for visual feedback
    this.showAttackRange = true;
    setTimeout(() => { this.showAttackRange = false; }, 300);
    
    if (attackDistance > this.attackRange) {
      console.log('Attack out of range');
      return;
    }

    let mobsHit = 0;
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      if (!mob) continue;
      const mx = (mob.x || 0) + ((mob.width  || 0) / 2);
      const my = (mob.y || 0) + ((mob.height || 0) / 2);
      const distToMob = Math.hypot(mx - originX, my - originY);
      
      if (distToMob <= this.attackRange) {
        let actualDamage = 0;
        
        if (typeof mob.takeDamage === 'function') {
          const prevHealth = mob.health || 0;
          actualDamage = mob.takeDamage(this.attackDamage);
          
          // Call damage callback if provided
          if (this.onDamageDealt && actualDamage > 0) {
            this.onDamageDealt(mob, actualDamage, mx, my);
          }
        } else if (mob.health !== undefined) {
          const prevHealth = mob.health;
          mob.health = Math.max(0, mob.health - this.attackDamage);
          actualDamage = prevHealth - mob.health;
          
          // Call damage callback if provided
          if (this.onDamageDealt && actualDamage > 0) {
            this.onDamageDealt(mob, actualDamage, mx, my);
          }
        }
        
        if (mob.health !== undefined && mob.health <= 0) {
          this.mobs.splice(i, 1);
        }
        
        if (actualDamage > 0) {
          mobsHit++;
          console.log(`Mob at (${mx.toFixed(0)},${my.toFixed(0)}) took ${actualDamage} damage. Health: ${mob.health}/${mob.maxHealth || 'unknown'}`);
        }
      }
    }
    
    if (mobsHit === 0) {
      console.log('No mobs in range to attack');
    } else {
      console.log(`Hit ${mobsHit} mob(s)`);
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

  /** Draw attack range indicator (call from game's draw method with world coordinates) */
  drawAttackRange(ctx) {
    if (!this.showAttackRange) return;
    
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.attackRange, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
