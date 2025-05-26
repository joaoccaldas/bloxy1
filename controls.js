// controls.js

export class Controls {
  /**
   * @param {Player} player – the Player instance
   */
  constructor(player) {
    this.player = player;
    this.keys   = {};
    this.bindEvents();
  }

  bindEvents() {
    // Track key presses
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // (Optional) log mouse clicks
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) console.log('Left mouse button clicked');
      if (e.button === 2) console.log('Right mouse button clicked');
    });
  }

  /**
   * Called each frame from Game.loop()
   */
  update() {
    // Determine direction from keys
    let dx = 0, dy = 0;
    if (this.keys['ArrowUp']   || this.keys['w']) dy -= 1;
    if (this.keys['ArrowDown'] || this.keys['s']) dy += 1;
    if (this.keys['ArrowLeft'] || this.keys['a']) dx -= 1;
    if (this.keys['ArrowRight']|| this.keys['d']) dx += 1;

    // Tell the player which way to move
    this.player.setDirection(dx, dy);
  }
}
