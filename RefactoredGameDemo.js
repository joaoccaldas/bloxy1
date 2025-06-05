// RefactoredGameDemo.js
// Demonstration of how to use the refactored game system

import { GameRefactored } from './GameRefactored.js';
import { GameConfig } from './config/GameConfig.js';

// Example of how to initialize and use the refactored game system

class RefactoredGameDemo {
  constructor() {
    this.game = null;
    this.isUsingRefactoredSystem = false;
  }

  /**
   * Initialize the refactored game system
   * @param {string} canvasId - Canvas element ID
   * @param {number} characterId - Selected character ID
   */
  initRefactoredGame(canvasId, characterId = 0) {
    try {
      console.log('Initializing refactored game system...');

      // Create the refactored game instance
      this.game = new GameRefactored(
        canvasId,
        characterId,
        (charId) => this.onGamePaused(charId),
        (charId) => this.onGameOver(charId)
      );

      // Enable debug mode for demonstration
      this.game.setDebugMode(true);

      // Initialize the game
      this.game.init(false); // false = new game, true = load existing

      this.isUsingRefactoredSystem = true;
      console.log('Refactored game system initialized successfully!');

      // Log current configuration
      this.logGameConfiguration();

    } catch (error) {
      console.error('Failed to initialize refactored game system:', error);
    }
  }

  /**
   * Initialize and load an existing save
   * @param {string} canvasId - Canvas element ID
   * @param {number} characterId - Selected character ID
   */
  loadRefactoredGame(canvasId, characterId = 0) {
    try {
      console.log('Loading refactored game system...');

      this.game = new GameRefactored(
        canvasId,
        characterId,
        (charId) => this.onGamePaused(charId),
        (charId) => this.onGameOver(charId)
      );

      // Check if save data exists
      const saveMetadata = this.game.getSaveMetadata();
      if (saveMetadata) {
        console.log('Found existing save data:', saveMetadata);
        this.game.init(true); // Load existing save
      } else {
        console.log('No save data found, starting new game');
        this.game.init(false); // Start new game
      }

      this.isUsingRefactoredSystem = true;

    } catch (error) {
      console.error('Failed to load refactored game system:', error);
    }
  }

  /**
   * Handle game pause event
   * @param {number} characterId - Current character ID
   */
  onGamePaused(characterId) {
    console.log('Game paused, character ID:', characterId);
    
    // Show pause menu or handle pause logic
    this.showPauseMenu();
  }

  /**
   * Handle game over event
   * @param {number} characterId - Current character ID
   */
  onGameOver(characterId) {
    console.log('Game over, character ID:', characterId);
    
    // Get final statistics
    const stats = this.game.getStats();
    console.log('Final game statistics:', stats);
    
    // Show game over screen or return to menu
    this.showGameOverScreen(stats);
  }

  /**
   * Show pause menu (placeholder implementation)
   */
  showPauseMenu() {
    console.log('Showing pause menu...');
    
    // Create a simple pause overlay
    const pauseOverlay = document.createElement('div');
    pauseOverlay.id = 'pauseOverlay';
    pauseOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      color: white;
      font-family: Arial, sans-serif;
    `;

    const pauseContent = document.createElement('div');
    pauseContent.style.textAlign = 'center';
    pauseContent.innerHTML = `
      <h2>Game Paused</h2>
      <p>Press ESC to resume</p>
      <button onclick="refactoredGameDemo.resumeGame()">Resume</button>
      <button onclick="refactoredGameDemo.saveAndExit()">Save & Exit</button>
    `;

    pauseOverlay.appendChild(pauseContent);
    document.body.appendChild(pauseOverlay);
  }

  /**
   * Show game over screen (placeholder implementation)
   * @param {Object} stats - Final game statistics
   */
  showGameOverScreen(stats) {
    console.log('Showing game over screen...');
    
    alert(`Game Over!\nFinal Score: ${stats.currentScore}\nKills: ${stats.currentKills}\nTime: ${stats.playTimeFormatted}`);
  }

  /**
   * Resume the game
   */
  resumeGame() {
    if (this.game) {
      this.game.resume();
      
      // Remove pause overlay
      const pauseOverlay = document.getElementById('pauseOverlay');
      if (pauseOverlay) {
        pauseOverlay.remove();
      }
    }
  }

  /**
   * Save and exit to menu
   */
  saveAndExit() {
    if (this.game) {
      const saved = this.game.save();
      console.log('Game saved:', saved);
      
      this.game.exitToMenu();
    }
  }

  /**
   * Get current game statistics
   * @returns {Object|null} Current statistics or null if no game
   */
  getGameStats() {
    return this.game ? this.game.getStats() : null;
  }

  /**
   * Log current game configuration
   */
  logGameConfiguration() {
    console.group('Game Configuration');
    console.log('Canvas Size:', GameConfig.CANVAS);
    console.log('Entity Settings:', GameConfig.ENTITIES);
    console.log('Score Settings:', GameConfig.SCORE);
    console.log('Performance Settings:', GameConfig.PERFORMANCE);
    console.groupEnd();
  }

  /**
   * Demonstrate manager usage
   */
  demonstrateManagers() {
    if (!this.game) {
      console.warn('No game instance available for demonstration');
      return;
    }

    console.group('Manager Demonstration');

    // State Manager
    console.log('Current Game State:', this.game.stateManager.getCurrentState());

    // Score Manager
    const stats = this.game.getStats();
    console.log('Current Score:', stats.currentScore);
    console.log('High Score:', stats.highScore);

    // Entity Manager
    console.log('Number of Mobs:', this.game.entityManager.getMobs().length);
    console.log('Number of Damage Numbers:', this.game.entityManager.getDamageNumbers().length);

    // Save Manager
    const saveMetadata = this.game.getSaveMetadata();
    console.log('Save Metadata:', saveMetadata);

    // Render Manager
    console.log('Current FPS:', this.game.renderManager.getFPS());

    console.groupEnd();
  }

  /**
   * Clean up the game instance
   */
  destroy() {
    if (this.game) {
      this.game.destroy();
      this.game = null;
      this.isUsingRefactoredSystem = false;
      console.log('Refactored game system destroyed');
    }
  }
}

// Create a global instance for easy testing
window.refactoredGameDemo = new RefactoredGameDemo();

// Example usage functions that can be called from the browser console
window.testRefactoredGame = {
  /**
   * Start a new refactored game
   */
  startNew() {
    window.refactoredGameDemo.initRefactoredGame('gameCanvas', 0);
  },

  /**
   * Load an existing refactored game
   */
  loadExisting() {
    window.refactoredGameDemo.loadRefactoredGame('gameCanvas', 0);
  },

  /**
   * Get current statistics
   */
  getStats() {
    return window.refactoredGameDemo.getGameStats();
  },

  /**
   * Show manager demonstration
   */
  showManagers() {
    window.refactoredGameDemo.demonstrateManagers();
  },

  /**
   * Pause the game
   */
  pause() {
    if (window.refactoredGameDemo.game) {
      window.refactoredGameDemo.game.pause();
    }
  },

  /**
   * Resume the game
   */
  resume() {
    window.refactoredGameDemo.resumeGame();
  },

  /**
   * Save the game
   */
  save() {
    if (window.refactoredGameDemo.game) {
      return window.refactoredGameDemo.game.save();
    }
  },

  /**
   * Clean up
   */
  destroy() {
    window.refactoredGameDemo.destroy();
  }
};

console.log('Refactored Game Demo loaded!');
console.log('Use window.testRefactoredGame.startNew() to test the refactored system');
console.log('Available commands:', Object.keys(window.testRefactoredGame));

export { RefactoredGameDemo };
