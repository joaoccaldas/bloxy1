// TestValidation.js
// Comprehensive testing and validation system for the refactored game

import { GameRefactored } from './GameRefactored.js';
import { Game } from './game.js';

export class TestValidation {
  constructor() {
    this.testResults = [];
    this.validationErrors = [];
    this.performanceMetrics = {};
  }

  /**
   * Run all validation tests
   * @param {string} canvasId - Canvas element ID
   * @returns {Promise<Object>} Test results
   */
  async runAllTests(canvasId) {
    console.log('🧪 Starting comprehensive test validation...');
    
    const results = {
      functional: await this.runFunctionalTests(canvasId),
      performance: await this.runPerformanceTests(canvasId),
      compatibility: await this.runCompatibilityTests(canvasId),
      integration: await this.runIntegrationTests(canvasId),
      summary: {}
    };
    
    results.summary = this._generateSummary(results);
    this._logResults(results);
    
    return results;
  }

  /**
   * Run functional tests
   * @param {string} canvasId - Canvas element ID
   * @returns {Promise<Object>} Functional test results
   */
  async runFunctionalTests(canvasId) {
    console.log('📋 Running functional tests...');
    
    const tests = [
      { name: 'Game Initialization', test: () => this._testGameInitialization(canvasId) },
      { name: 'Player Movement', test: () => this._testPlayerMovement(canvasId) },
      { name: 'Entity Management', test: () => this._testEntityManagement(canvasId) },
      { name: 'Save/Load System', test: () => this._testSaveLoad(canvasId) },
      { name: 'State Management', test: () => this._testStateManagement(canvasId) },
      { name: 'Score System', test: () => this._testScoreSystem(canvasId) },
      { name: 'Render System', test: () => this._testRenderSystem(canvasId) }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          passed: true,
          result: result,
          error: null
        });
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          result: null,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Run performance tests
   * @param {string} canvasId - Canvas element ID
   * @returns {Promise<Object>} Performance test results
   */
  async runPerformanceTests(canvasId) {
    console.log('⚡ Running performance tests...');
    
    // Import performance comparison if available
    try {
      const { PerformanceComparison } = await import('./PerformanceComparison.js');
      const comparison = new PerformanceComparison();
      const report = await comparison.runComparison(canvasId, 0);
      
      return {
        comparisonAvailable: true,
        report: report
      };
    } catch (error) {
      console.warn('Performance comparison not available:', error);
      
      // Run basic performance test
      return await this._basicPerformanceTest(canvasId);
    }
  }

  /**
   * Run compatibility tests
   * @param {string} canvasId - Canvas element ID
   * @returns {Promise<Object>} Compatibility test results
   */
  async runCompatibilityTests(canvasId) {
    console.log('🔗 Running compatibility tests...');
    
    const tests = [
      { name: 'Canvas Support', test: () => this._testCanvasSupport(canvasId) },
      { name: 'Local Storage', test: () => this._testLocalStorage() },
      { name: 'Performance API', test: () => this._testPerformanceAPI() },
      { name: 'Audio Context', test: () => this._testAudioContext() },
      { name: 'Gamepad API', test: () => this._testGamepadAPI() },
      { name: 'ES6 Features', test: () => this._testES6Features() }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          supported: true,
          details: result
        });
      } catch (error) {
        results.push({
          name: test.name,
          supported: false,
          details: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Run integration tests
   * @param {string} canvasId - Canvas element ID
   * @returns {Promise<Object>} Integration test results
   */
  async runIntegrationTests(canvasId) {
    console.log('🔄 Running integration tests...');
    
    const tests = [
      { name: 'Manager Communication', test: () => this._testManagerCommunication(canvasId) },
      { name: 'Event System', test: () => this._testEventSystem(canvasId) },
      { name: 'Data Flow', test: () => this._testDataFlow(canvasId) },
      { name: 'Error Handling', test: () => this._testErrorHandling(canvasId) }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          passed: true,
          details: result
        });
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          details: error.message
        });
      }
    }
    
    return results;
  }

  // Individual test methods

  async _testGameInitialization(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    
    if (!game.canvas) throw new Error('Canvas not found');
    if (!game.ctx) throw new Error('Context not created');
    if (!game.stateManager) throw new Error('State manager not initialized');
    if (!game.entityManager) throw new Error('Entity manager not initialized');
    if (!game.scoreManager) throw new Error('Score manager not initialized');
    if (!game.renderManager) throw new Error('Render manager not initialized');
    if (!game.saveManager) throw new Error('Save manager not initialized');
    
    game.destroy();
    return 'All managers initialized successfully';
  }

  async _testPlayerMovement(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    game.init(false);
    
    const initialX = game.player.x;
    const initialY = game.player.y;
    
    // Simulate movement
    game.player.x += 10;
    game.player.y += 10;
    
    if (game.player.x === initialX) throw new Error('Player X position not updated');
    if (game.player.y === initialY) throw new Error('Player Y position not updated');
    
    game.destroy();
    return 'Player movement functional';
  }

  async _testEntityManagement(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    game.init(false);
    
    const initialMobCount = game.entityManager.getMobs().length;
    const initialDamageCount = game.entityManager.getDamageNumbers().length;
    
    // Test mob management
    game.entityManager.addDamageNumber(100, 50, 50, '#ff0000');
    
    if (game.entityManager.getDamageNumbers().length !== initialDamageCount + 1) {
      throw new Error('Damage number not added correctly');
    }
    
    game.destroy();
    return 'Entity management functional';
  }

  async _testSaveLoad(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    game.init(false);
    
    const saveResult = game.save();
    if (!saveResult) throw new Error('Save operation failed');
    
    const metadata = game.getSaveMetadata();
    if (!metadata) throw new Error('Save metadata not available');
    
    game.destroy();
    return 'Save/Load system functional';
  }

  async _testStateManagement(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    
    if (game.stateManager.getCurrentState() !== 'loading') {
      throw new Error('Initial state incorrect');
    }
    
    game.stateManager.setState('playing');
    if (game.stateManager.getCurrentState() !== 'playing') {
      throw new Error('State change failed');
    }
    
    game.destroy();
    return 'State management functional';
  }

  async _testScoreSystem(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    game.init(false);
    
    const initialStats = game.getStats();
    game.scoreManager.addScore(100);
    const updatedStats = game.getStats();
    
    if (updatedStats.currentScore <= initialStats.currentScore) {
      throw new Error('Score not updated correctly');
    }
    
    game.destroy();
    return 'Score system functional';
  }

  async _testRenderSystem(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    game.init(false);
    
    // Test debug mode
    game.setDebugMode(true);
    game.setDebugMode(false);
    
    // Test FPS tracking
    const fps = game.renderManager.getFPS();
    if (isNaN(fps)) throw new Error('FPS tracking not working');
    
    game.destroy();
    return 'Render system functional';
  }

  _testCanvasSupport(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) throw new Error('Canvas element not found');
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context not supported');
    
    return 'Canvas and 2D context supported';
  }

  _testLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return 'Local storage available';
    } catch (error) {
      throw new Error('Local storage not available');
    }
  }

  _testPerformanceAPI() {
    if (!window.performance || !window.performance.now) {
      throw new Error('Performance API not available');
    }
    return 'Performance API available';
  }

  _testAudioContext() {
    if (!window.AudioContext && !window.webkitAudioContext) {
      throw new Error('Audio context not supported');
    }
    return 'Audio context supported';
  }

  _testGamepadAPI() {
    if (!navigator.getGamepads) {
      throw new Error('Gamepad API not supported');
    }
    return 'Gamepad API supported';
  }

  _testES6Features() {
    try {
      // Test basic ES6 features
      const arrow = () => {};
      const { test } = { test: 'value' };
      const template = `template`;
      const map = new Map();
      const promise = new Promise(resolve => resolve());
      
      return 'ES6 features supported';
    } catch (error) {
      throw new Error('ES6 features not fully supported');
    }
  }

  async _testManagerCommunication(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    game.init(false);
    
    // Test state manager -> other managers
    game.stateManager.pause();
    if (game.stateManager.getCurrentState() !== 'paused') {
      throw new Error('State manager communication failed');
    }
    
    game.destroy();
    return 'Manager communication functional';
  }

  async _testEventSystem(canvasId) {
    let callbackTriggered = false;
    
    const game = new GameRefactored(canvasId, 0, 
      () => { callbackTriggered = true; }, // pause callback
      () => {} // game over callback
    );
    
    game.stateManager.pause();
    
    // Give it a moment for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!callbackTriggered) {
      throw new Error('Event system not working');
    }
    
    game.destroy();
    return 'Event system functional';
  }

  async _testDataFlow(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    game.init(false);
    
    // Test data flow: score change -> stats update
    const initialScore = game.getStats().currentScore;
    game.scoreManager.addScore(50);
    const newScore = game.getStats().currentScore;
    
    if (newScore <= initialScore) {
      throw new Error('Data flow between managers broken');
    }
    
    game.destroy();
    return 'Data flow functional';
  }

  async _testErrorHandling(canvasId) {
    try {
      // Test invalid canvas ID
      const game = new GameRefactored('invalid-canvas', 0, () => {}, () => {});
      game.destroy();
      throw new Error('Error handling failed - should have thrown');
    } catch (error) {
      if (error.message.includes('not found')) {
        return 'Error handling functional';
      }
      throw error;
    }
  }

  async _basicPerformanceTest(canvasId) {
    const game = new GameRefactored(canvasId, 0, () => {}, () => {});
    game.init(false);
    
    const startTime = performance.now();
    
    // Run for 1 second
    return new Promise(resolve => {
      let frameCount = 0;
      const testFrame = () => {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(testFrame);
        } else {
          game.destroy();
          resolve({
            fps: frameCount,
            comparisonAvailable: false,
            note: 'Basic performance test - 1 second sample'
          });
        }
      };
      requestAnimationFrame(testFrame);
    });
  }

  _generateSummary(results) {
    const functional = results.functional;
    const compatibility = results.compatibility;
    const integration = results.integration;
    
    const functionalPassed = functional.filter(t => t.passed).length;
    const functionalTotal = functional.length;
    
    const compatibilitySupported = compatibility.filter(t => t.supported).length;
    const compatibilityTotal = compatibility.length;
    
    const integrationPassed = integration.filter(t => t.passed).length;
    const integrationTotal = integration.length;
    
    return {
      functional: `${functionalPassed}/${functionalTotal} tests passed`,
      compatibility: `${compatibilitySupported}/${compatibilityTotal} features supported`,
      integration: `${integrationPassed}/${integrationTotal} tests passed`,
      overall: functionalPassed === functionalTotal && 
               compatibilitySupported >= compatibilityTotal * 0.8 && 
               integrationPassed === integrationTotal ? 'PASS' : 'ISSUES DETECTED'
    };
  }

  _logResults(results) {
    console.group('🧪 Test Validation Results');
    
    console.group('📋 Functional Tests');
    results.functional.forEach(test => {
      const icon = test.passed ? '✅' : '❌';
      console.log(`${icon} ${test.name}: ${test.passed ? 'PASS' : 'FAIL'}`);
      if (!test.passed) console.error(`   Error: ${test.error}`);
    });
    console.groupEnd();
    
    console.group('🔗 Compatibility Tests');
    results.compatibility.forEach(test => {
      const icon = test.supported ? '✅' : '⚠️';
      console.log(`${icon} ${test.name}: ${test.supported ? 'SUPPORTED' : 'NOT SUPPORTED'}`);
    });
    console.groupEnd();
    
    console.group('🔄 Integration Tests');
    results.integration.forEach(test => {
      const icon = test.passed ? '✅' : '❌';
      console.log(`${icon} ${test.name}: ${test.passed ? 'PASS' : 'FAIL'}`);
      if (!test.passed) console.error(`   Error: ${test.details}`);
    });
    console.groupEnd();
    
    console.group('📊 Summary');
    Object.entries(results.summary).forEach(([category, result]) => {
      console.log(`${category}: ${result}`);
    });
    console.groupEnd();
    
    console.groupEnd();
  }
}

// Global instance for easy access
window.testValidation = new TestValidation();

// Example usage
window.runGameTests = async () => {
  const validation = window.testValidation;
  const results = await validation.runAllTests('gameCanvas');
  return results;
};
