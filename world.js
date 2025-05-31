// world.js

const terrainImage = new Image();
terrainImage.src = 'assets/scene/scene1.png';

const shardImage = new Image();
shardImage.src = 'assets/items/shard.png'; // <- add this sprite to assets

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

    // Place 3 shards at fixed or random positions
    this.shards = [
      { id: 1, x: 200, y: 150, collected: false },
      { id: 2, x: 600, y: 300, collected: false },
      { id: 3, x: 900, y: 600, collected: false },
    ];
  }

  update(delta) {
    // Nothing dynamic in the world terrain yet
  }

  /**
   * @param {Player} player - check for shard pickup
   * @returns {number[]} - list of newly collected shard IDs
   */
  checkShardCollection(player) {
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    const collected = [];

    for (const shard of this.shards) {
      if (shard.collected) continue;
      const dx = shard.x - px;
      const dy = shard.y - py;
      const dist = Math.hypot(dx, dy);
      if (dist < 30) {
        shard.collected = true;
        collected.push(shard.id);
      }
    }

    return collected;
  }
  /**
   * Draw terrain and shards
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} [pulseTimer] - Timer for pulsing effect
   */
  draw(ctx, pulseTimer = 0) {
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

    // Draw shards with pulsing effect
    for (const shard of this.shards) {
      if (shard.collected) continue;
      
      ctx.save();
      // Add pulsing glow effect
      const pulse = Math.sin(pulseTimer / 300) * 0.3 + 0.7; // Oscillate between 0.4 and 1.0
      ctx.globalAlpha = pulse;
      
      if (shardImage.complete && shardImage.naturalWidth) {
        ctx.drawImage(shardImage, shard.x - 16, shard.y - 16, 32, 32);
      } else {
        // fallback with glow
        ctx.fillStyle = '#00FFFF';
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10 * pulse;
        ctx.beginPath();
        ctx.arc(shard.x, shard.y, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /** Serialize world state */
  serialize() {
    return {
      tileSize: this.tileSize,
      width: this.width,
      height: this.height,
      shards: this.shards.map(s => ({ ...s }))
    };
  }

  /** Load world state */
  load(data) {
    this.tileSize = data.tileSize ?? this.tileSize;
    this.width = data.width ?? this.width;
    this.height = data.height ?? this.height;

    if (Array.isArray(data.shards)) {
      this.shards = data.shards.map(s => ({ ...s }));
    }
  }
}
