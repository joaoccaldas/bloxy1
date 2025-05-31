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
    
    // Always show health bar when mob is damaged (persistent)
    if (currentHealth < maxHealth && currentHealth > 0) {
      this.visible = true;
      // Reset fade timer to keep it visible
      this.fadeTimer = 1000; // Keep visible for 1 second after last damage
    }
    
    // Only start fading if mob is at full health
    if (currentHealth >= maxHealth && this.fadeTimer > 0) {
      this.fadeTimer -= deltaTime;
      if (this.fadeTimer <= 0) this.visible = false;
    }
  }
  draw(ctx) {
    if (!this.visible || this.currentHealth <= 0) return;
    
    const healthPercent = this.currentHealth / this.maxHealth;
    
    // Background (red)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Health bar (color based on health percentage)
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#00ff00'; // Green
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#ffff00'; // Yellow
    } else {
      ctx.fillStyle = '#ff6600'; // Orange
    }
    
    ctx.fillRect(this.x, this.y, this.width * healthPercent, this.height);
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}