export class HealthBar {
  constructor() {
    this.width = 40;
    this.height = 6;
    this.visible = false;
    this.fadeTimer = 0;
    this.isPlayerHealthBar = false; // Flag to identify player health bars
  }
  update(mobX, mobY, currentHealth, maxHealth, deltaTime) {
    this.x = mobX - this.width / 2;
    this.y = mobY - 25;
    this.currentHealth = currentHealth;
    this.maxHealth = maxHealth;
    
    // Always show player health bar, show mob health bar when damaged
    if (this.isPlayerHealthBar || (currentHealth < maxHealth && currentHealth > 0)) {
      this.visible = true;
      // Reset fade timer to keep it visible
      this.fadeTimer = 1000; // Keep visible for 1 second after last damage
    }
    
    // Only start fading if mob is at full health (not applicable to player)
    if (!this.isPlayerHealthBar && currentHealth >= maxHealth && this.fadeTimer > 0) {
      this.fadeTimer -= deltaTime;
      if (this.fadeTimer <= 0) this.visible = false;
    }
  }  draw(ctx) {
    if (!this.visible || this.currentHealth <= 0) return;
    
    const healthPercent = this.currentHealth / this.maxHealth;
    
    // Enhanced styling with shadow and gradient effect
    ctx.save();
    
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(this.x + 1, this.y + 1, this.width, this.height);
    
    // Background (dark red)
    ctx.fillStyle = '#4a0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Health bar (color based on health percentage)
    let healthColor;
    if (healthPercent > 0.6) {
      healthColor = '#22c55e'; // Green
    } else if (healthPercent > 0.3) {
      healthColor = '#eab308'; // Yellow
    } else {
      healthColor = '#ef4444'; // Red
    }
    
    ctx.fillStyle = healthColor;
    ctx.fillRect(this.x, this.y, this.width * healthPercent, this.height);
    
    // Glossy effect - top highlight
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width * healthPercent, this.height);
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Health text for player health bars
    if (this.isPlayerHealthBar && this.width > 50) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText(`${Math.round(this.currentHealth)}`, this.x + this.width / 2, this.y + this.height + 12);
      ctx.fillText(`${Math.round(this.currentHealth)}`, this.x + this.width / 2, this.y + this.height + 12);
    }
    
    ctx.restore();
  }
}