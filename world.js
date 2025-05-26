// world.js

import { Block } from './block.js';

export class World {
  /**
   * @param {number} tileSize – size of one block in pixels
   * @param {number} cols     – number of columns (width = cols * tileSize)
   * @param {number} rows     – number of rows (height = rows * tileSize)
   */
  constructor(tileSize = 32, cols = 100, rows = 100) {
    this.tileSize = tileSize;
    this.width    = cols * tileSize;
    this.height   = rows * tileSize;
    this.blocks   = new Map();
    this.generate();
  }

  // Populate initial world: border stones + random trees
  generate() {
    const cols = this.width / this.tileSize;
    const rows = this.height / this.tileSize;

    // Border stones
    for (let x = 0; x < cols; x++) {
      this.addBlock(x * this.tileSize, 0, 'stone');
      this.addBlock(x * this.tileSize, (rows - 1) * this.tileSize, 'stone');
    }
    for (let y = 0; y < rows; y++) {
      this.addBlock(0, y * this.tileSize, 'stone');
      this.addBlock((cols - 1) * this.tileSize, y * this.tileSize, 'stone');
    }

    // Random trees (~5% coverage)
    const total = Math.floor(cols * rows * 0.05);
    for (let i = 0; i < total; i++) {
      const rx = Math.floor(Math.random() * cols) * this.tileSize;
      const ry = Math.floor(Math.random() * rows) * this.tileSize;
      this.addBlock(rx, ry, 'tree');
    }
  }

  addBlock(x, y, type) {
    const key = `${x},${y}`;
    this.blocks.set(key, new Block(x, y, this.tileSize, this.tileSize, type));
  }

  removeBlock(x, y) {
    this.blocks.delete(`${x},${y}`);
  }

  update(delta) {
    // Hook for animated blocks or dynamic world logic
  }

  draw(ctx) {
    for (const block of this.blocks.values()) {
      block.draw(ctx);
    }
  }

  serialize() {
    return {
      tileSize: this.tileSize,
      width:    this.width,
      height:   this.height,
      blocks:   Array.from(this.blocks.values()).map(b => ({
        x:    b.x,
        y:    b.y,
        type: b.type,
      })),
    };
  }

  load(data) {
    this.tileSize = data.tileSize;
    this.width    = data.width;
    this.height   = data.height;
    this.blocks.clear();
    for (const { x, y, type } of data.blocks) {
      this.addBlock(x, y, type);
    }
  }
}
