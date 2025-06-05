// world.js

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
    this.width = cols * tileSize;
    this.height = rows * tileSize;
  }
  update(delta) {
    // Nothing dynamic in the world terrain yet
  }

  /**
   * Draw terrain
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    // Background terrain
    if (terrainImage.complete && terrainImage.naturalWidth) {
      const pattern = ctx.createPattern(terrainImage, 'repeat');
      if (pattern) {
        ctx.save();
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();
      }
    }
  }
  /** Serialize world state */
  serialize() {
    return {
      tileSize: this.tileSize,
      width: this.width,
      height: this.height
    };
  }

  /** Load world state */
  load(data) {
    this.tileSize = data.tileSize ?? this.tileSize;
    this.width = data.width ?? this.width;
    this.height = data.height ?? this.height;
  }
}
