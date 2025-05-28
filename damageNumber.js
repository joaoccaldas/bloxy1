export class DamageNumber {
  constructor(x, y, damage, color = '#ff0000') {
    this.x = x;
    this.y = y;
    this.startY = y;
    this.damage = damage;
    this.color = color;
    this.life = 1000; // 1 second
    this.maxLife = 1000;
    this.fontSize = 16;
  }

  update(deltaTime) {
    this.life -= deltaTime;
    this.y = this.startY - (1 - this.life / this.maxLife) * 30; // Float upward
    return this.life > 0;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    
    const alpha = this.life / this.maxLife;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${this.fontSize}px Arial`;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    const text = `-${this.damage}`;
    const textWidth = ctx.measureText(text).width;
    
    // Draw outline
    ctx.strokeText(text, this.x - textWidth / 2, this.y);
    // Draw text
    ctx.fillText(text, this.x - textWidth / 2, this.y);
    
    ctx.restore();
  }
}