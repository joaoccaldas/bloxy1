// EntityManager.js
// Manages all game entities including player, mobs, and damage numbers

import { Mob } from '../mobs.js';
import { DamageNumber } from '../damageNumber.js';
import { characters } from '../characterData.js';

export class EntityManager {
  constructor(world, player) {
    this.world = world;
    this.player = player;
    this.mobs = [];
    this.damageNumbers = [];
    this.maxMobs = 14;
    
    // Callbacks for entity events
    this.callbacks = {
      onMobKilled: () => {},
      onPlayerDamaged: () => {},
      onMobDamaged: () => {}
    };
  }

  /**
   * Set event callbacks
   * @param {Object} callbacks - Object containing callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Initialize entities
   * @param {Array} savedMobs - Optional saved mob data
   */
  initialize(savedMobs = null) {
    if (savedMobs && savedMobs.length > 0) {
      this.mobs = savedMobs.map(data => 
        new Mob(data.x, data.y, data.sprite, data.options)
      );
    } else {
      this.spawnInitialMobs();
    }
  }

  /**
   * Spawn initial set of mobs
   */
  spawnInitialMobs() {
    const spritePool = characters.map(c => c.sprite);
    this.mobs = Array.from({ length: this.maxMobs }, () => {
      const { x, y } = this._findValidSpawnPosition();
      return new Mob(x, y, spritePool, { 
        health: 50, 
        speed: 60, 
        damage: 10, 
        width: 48, 
        height: 48 
      });
    });
  }

  /**
   * Update all entities
   * @param {number} delta - Time delta in milliseconds
   */
  update(delta) {
    // Update player
    this.player.update(delta, this.world);

    // Update damage numbers
    this.damageNumbers = this.damageNumbers.filter(d => d.update(delta));

    // Update mobs and handle mob deaths
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      const prevHealth = mob.health;
      
      mob.update(delta, this.player);
      
      // Check if mob was killed
      if (mob.health <= 0 && prevHealth > 0) {
        this._handleMobKilled(mob, i);
      }
    }

    // Maintain mob count
    this._maintainMobCount();
  }

  /**
   * Handle mob death
   * @private
   */
  _handleMobKilled(mob, index) {
    const points = 100;
    this.mobs.splice(index, 1);
    
    // Add score damage number
    this.addDamageNumber(
      mob.x + mob.width / 2, 
      mob.y - 10, 
      `+${points}`, 
      '#00ff00'
    );

    // Trigger callback
    this.callbacks.onMobKilled(mob, points);
  }

  /**
   * Maintain the target number of mobs by spawning new ones
   * @private
   */
  _maintainMobCount() {
    while (this.mobs.length < this.maxMobs) {
      const { x, y } = this._findValidSpawnPosition();
      const spritePool = characters.map(c => c.sprite);
      const newMob = new Mob(x, y, spritePool, { 
        health: 50, 
        speed: 60, 
        damage: 10, 
        width: 48, 
        height: 48 
      });
      this.mobs.push(newMob);
    }
  }

  /**
   * Find a valid spawn position for new mobs
   * @private
   * @returns {{x: number, y: number}} Valid spawn coordinates
   */
  _findValidSpawnPosition() {
    let x, y, attempts = 0;
    
    do {
      x = Math.random() * (this.world.width - 100) + 50;
      y = Math.random() * (this.world.height - 100) + 50;
      attempts++;
    } while (attempts < 10 && (
      Math.hypot(x - this.player.x, y - this.player.y) < 150 // Not too close to player
    ));
    
    return { x, y };
  }

  /**
   * Add a damage number to display
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string|number} text - Text to display
   * @param {string} color - Color of the text
   */
  addDamageNumber(x, y, text, color) {
    this.damageNumbers.push(new DamageNumber(x, y, text, color));
  }

  /**
   * Handle mob taking damage
   * @param {Mob} mob - The mob that took damage
   * @param {number} damage - Amount of damage
   * @param {number} x - X coordinate of damage
   * @param {number} y - Y coordinate of damage
   */
  onMobDamaged(mob, damage, x, y) {
    this.addDamageNumber(x, y - 10, damage, '#ff0000');
    this.callbacks.onMobDamaged(mob, damage, x, y);
  }

  /**
   * Get all mobs
   * @returns {Array} Array of mobs
   */
  getMobs() {
    return this.mobs;
  }

  /**
   * Get all damage numbers
   * @returns {Array} Array of damage numbers
   */
  getDamageNumbers() {
    return this.damageNumbers;
  }

  /**
   * Get player reference
   * @returns {Player} Player instance
   */
  getPlayer() {
    return this.player;
  }

  /**
   * Set maximum number of mobs
   * @param {number} maxMobs - Maximum number of mobs to maintain
   */
  setMaxMobs(maxMobs) {
    this.maxMobs = maxMobs;
  }

  /**
   * Clear all entities
   */
  clear() {
    this.mobs = [];
    this.damageNumbers = [];
  }

  /**
   * Serialize entities for saving
   * @returns {Object} Serialized entity data
   */
  serialize() {
    return {
      mobs: this.mobs.filter(m => typeof m.serialize === 'function')
                     .map(m => m.serialize()),
      player: this.player.serialize()
    };
  }

  /**
   * Load entities from serialized data
   * @param {Object} data - Serialized entity data
   */
  load(data) {
    if (data.player) {
      this.player.load(data.player);
    }
    
    if (data.mobs) {
      this.mobs = data.mobs.map(mobData => 
        new Mob(mobData.x, mobData.y, mobData.sprite, mobData.options)
      );
    }
  }
}
