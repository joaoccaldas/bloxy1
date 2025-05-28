export class HealthBar {
  constructor() {
    this.width = 40;
    this.height = 6;
    this.visible = false;
    this.fadeTimer = 0;
  }

  update(mobX, mobY, currentHealth, maxHealth, deltaTime) {
    this.x = mobX - this.width / 2;
    this.y = mobY - 25;
    this.currentHealth = currentHealth;
    this.maxHealth = maxHealth;
    
    if (currentHealth < maxHealth) {
      this.visible = true;
      this.fadeTimer = 3000;
    }
    
    if (this.fadeTimer > 0) {
      this.fadeTimer -= deltaTime;
      if (this.fadeTimer <= 0) this.visible = false;
    }
  }

  draw(ctx) {
    if (!this.visible) return;
    
    const healthPercent = this.currentHealth / this.maxHealth;
    
    // Background
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Health
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ffff00';
    ctx.fillRect(this.x, this.y, this.width * healthPercent, this.height);
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}