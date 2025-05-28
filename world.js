// world.js

// Terrain background image
const terrainImage = new Image();
terrainImage.src = 'assets/scene/scene1.png';

export class World {
  /**
   * @param {number} tileSize - Size of one tile in pixels (unused for drawing but preserved for layout)
   * @param {number} cols     - Number of columns (defines world width)
   * @param {number} rows     - Number of rows (defines world height)
   */
  constructor(tileSize = 64, cols = 20, rows = 15) {
    this.tileSize = tileSize;
    this.width    = cols * tileSize;
    this.height   = rows * tileSize;
  }

  /** Placeholder for future dynamic updates; no blocks to update */
  update(delta) {
    // Intentionally empty
  }

  /** Draws only the repeating terrain background */
  draw(ctx) {
    if (!terrainImage.complete || !terrainImage.naturalWidth) return;
    const pattern = ctx.createPattern(terrainImage, 'repeat');
    if (!pattern) return;

    ctx.save();
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  /** Serialize world state (no blocks to save) */
  serialize() {
    return {
      tileSize: this.tileSize,
      width:    this.width,
      height:   this.height,
      // No block data
      blocks: []
    };
  }

  /** Load world state (ignores block data) */
  load(data) {
    this.tileSize = data.tileSize;
    this.width    = data.width;
    this.height   = data.height;
    // blocks ignored
  }
}
