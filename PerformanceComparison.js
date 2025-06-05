// PerformanceComparison.js
// Tool to compare performance between original and refactored game systems

import { Game } from './game.js';
import { GameRefactored } from './GameRefactored.js';

export class PerformanceComparison {
  constructor() {
    this.metrics = {
      original: {
        initTime: 0,
        averageFPS: 0,
        memoryUsage: 0,
        updateTime: 0,
        renderTime: 0
      },
      refactored: {
        initTime: 0,
        averageFPS: 0,
        memoryUsage: 0,
        updateTime: 0,
        renderTime: 0
      }
    };
    
    this.testDuration = 30000; // 30 seconds
    this.fpsHistory = { original: [], refactored: [] };
  }

  /**
   * Run performance comparison between both systems
   * @param {string} canvasId - Canvas element ID
   * @param {number} characterId - Character to use for testing
   * @returns {Promise<Object>} Comparison results
   */
  async runComparison(canvasId, characterId = 0) {
    console.log('🔄 Starting performance comparison...');
    
    try {
      // Test original system
      console.log('📊 Testing original system...');
      this.metrics.original = await this._testSystem('original', canvasId, characterId);
      
      // Short break between tests
      await this._wait(2000);
      
      // Test refactored system
      console.log('📊 Testing refactored system...');
      this.metrics.refactored = await this._testSystem('refactored', canvasId, characterId);
      
      // Generate comparison report
      const report = this._generateReport();
      console.log('✅ Performance comparison complete!');
      return report;
      
    } catch (error) {
      console.error('❌ Performance comparison failed:', error);
      throw error;
    }
  }

  /**
   * Test a specific system (original or refactored)
   * @private
   * @param {string} systemType - 'original' or 'refactored'
   * @param {string} canvasId - Canvas element ID
   * @param {number} characterId - Character ID
   * @returns {Promise<Object>} Performance metrics
   */
  async _testSystem(systemType, canvasId, characterId) {
    const metrics = {
      initTime: 0,
      averageFPS: 0,
      memoryUsage: 0,
      updateTime: 0,
      renderTime: 0,
      minFPS: Infinity,
      maxFPS: 0
    };

    // Measure initialization time
    const initStart = performance.now();
    
    let game;
    if (systemType === 'original') {
      game = new Game(canvasId, characterId, () => {}, () => {});
    } else {
      game = new GameRefactored(canvasId, characterId, () => {}, () => {});
    }
    
    game.init(false);
    metrics.initTime = performance.now() - initStart;

    // Measure runtime performance
    const fpsReadings = [];
    const updateTimes = [];
    const renderTimes = [];
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    const testStartTime = performance.now();
    
    return new Promise((resolve) => {
      const measureFrame = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > 0) {
          const fps = 1000 / deltaTime;
          fpsReadings.push(fps);
          
          metrics.minFPS = Math.min(metrics.minFPS, fps);
          metrics.maxFPS = Math.max(metrics.maxFPS, fps);
        }
        
        // Measure update time (if available)
        if (game.renderManager && typeof game.renderManager.getLastUpdateTime === 'function') {
          updateTimes.push(game.renderManager.getLastUpdateTime());
        }
        
        // Measure render time (if available)
        if (game.renderManager && typeof game.renderManager.getLastRenderTime === 'function') {
          renderTimes.push(game.renderManager.getLastRenderTime());
        }
        
        frameCount++;
        lastTime = currentTime;
        
        // Continue test or finish
        if (currentTime - testStartTime < this.testDuration) {
          requestAnimationFrame(measureFrame);
        } else {
          // Calculate averages
          metrics.averageFPS = fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length;
          metrics.updateTime = updateTimes.length > 0 
            ? updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length 
            : 0;
          metrics.renderTime = renderTimes.length > 0
            ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
            : 0;
          
          // Measure memory usage
          if (performance.memory) {
            metrics.memoryUsage = performance.memory.usedJSHeapSize;
          }
          
          // Store FPS history
          this.fpsHistory[systemType] = fpsReadings;
          
          // Clean up
          game.destroy();
          
          resolve(metrics);
        }
      };
      
      // Start measuring
      requestAnimationFrame(measureFrame);
    });
  }

  /**
   * Generate comparison report
   * @private
   * @returns {Object} Formatted comparison report
   */
  _generateReport() {
    const original = this.metrics.original;
    const refactored = this.metrics.refactored;
    
    const report = {
      summary: {
        fasterInitialization: original.initTime < refactored.initTime ? 'Original' : 'Refactored',
        higherAverageFPS: original.averageFPS > refactored.averageFPS ? 'Original' : 'Refactored',
        lowerMemoryUsage: original.memoryUsage < refactored.memoryUsage ? 'Original' : 'Refactored',
        fasterUpdate: original.updateTime < refactored.updateTime ? 'Original' : 'Refactored',
        fasterRender: original.renderTime < refactored.renderTime ? 'Original' : 'Refactored'
      },
      detailed: {
        initialization: {
          original: `${original.initTime.toFixed(2)}ms`,
          refactored: `${refactored.initTime.toFixed(2)}ms`,
          difference: `${Math.abs(original.initTime - refactored.initTime).toFixed(2)}ms`,
          winner: original.initTime < refactored.initTime ? 'Original' : 'Refactored'
        },
        averageFPS: {
          original: original.averageFPS.toFixed(1),
          refactored: refactored.averageFPS.toFixed(1),
          difference: Math.abs(original.averageFPS - refactored.averageFPS).toFixed(1),
          winner: original.averageFPS > refactored.averageFPS ? 'Original' : 'Refactored'
        },
        memoryUsage: {
          original: this._formatBytes(original.memoryUsage),
          refactored: this._formatBytes(refactored.memoryUsage),
          difference: this._formatBytes(Math.abs(original.memoryUsage - refactored.memoryUsage)),
          winner: original.memoryUsage < refactored.memoryUsage ? 'Original' : 'Refactored'
        },
        updateTime: {
          original: `${original.updateTime.toFixed(2)}ms`,
          refactored: `${refactored.updateTime.toFixed(2)}ms`,
          difference: `${Math.abs(original.updateTime - refactored.updateTime).toFixed(2)}ms`,
          winner: original.updateTime < refactored.updateTime ? 'Original' : 'Refactored'
        },
        renderTime: {
          original: `${original.renderTime.toFixed(2)}ms`,
          refactored: `${refactored.renderTime.toFixed(2)}ms`,
          difference: `${Math.abs(original.renderTime - refactored.renderTime).toFixed(2)}ms`,
          winner: original.renderTime < refactored.renderTime ? 'Original' : 'Refactored'
        },
        fpsRange: {
          original: `${original.minFPS.toFixed(1)} - ${original.maxFPS.toFixed(1)}`,
          refactored: `${refactored.minFPS.toFixed(1)} - ${refactored.maxFPS.toFixed(1)}`
        }
      },
      recommendations: this._generateRecommendations()
    };
    
    return report;
  }

  /**
   * Generate performance recommendations
   * @private
   * @returns {Array<string>} List of recommendations
   */
  _generateRecommendations() {
    const recommendations = [];
    const original = this.metrics.original;
    const refactored = this.metrics.refactored;
    
    if (refactored.averageFPS > original.averageFPS) {
      recommendations.push('✅ Refactored system shows better frame rate performance');
    } else if (original.averageFPS > refactored.averageFPS) {
      recommendations.push('⚠️ Original system has higher FPS - consider optimizing managers');
    }
    
    if (refactored.initTime > original.initTime * 1.5) {
      recommendations.push('⚠️ Refactored system has slower initialization - consider lazy loading');
    }
    
    if (refactored.memoryUsage > original.memoryUsage * 1.2) {
      recommendations.push('⚠️ Refactored system uses more memory - monitor for leaks');
    }
    
    if (refactored.averageFPS > 55 && original.averageFPS > 55) {
      recommendations.push('✅ Both systems maintain good performance (>55 FPS)');
    }
    
    recommendations.push('💡 Consider refactored system for better maintainability and features');
    recommendations.push('💡 Use original system if maximum performance is critical');
    
    return recommendations;
  }

  /**
   * Format bytes to human readable format
   * @private
   * @param {number} bytes - Bytes to format
   * @returns {string} Formatted string
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Wait for specified milliseconds
   * @private
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log detailed performance report to console
   * @param {Object} report - Performance report
   */
  logReport(report) {
    console.group('🔬 Performance Comparison Report');
    
    console.group('📋 Summary');
    Object.entries(report.summary).forEach(([metric, winner]) => {
      console.log(`${metric}: ${winner}`);
    });
    console.groupEnd();
    
    console.group('📊 Detailed Metrics');
    Object.entries(report.detailed).forEach(([metric, data]) => {
      console.group(`${metric}:`);
      console.log(`Original: ${data.original}`);
      console.log(`Refactored: ${data.refactored}`);
      console.log(`Difference: ${data.difference}`);
      console.log(`Winner: ${data.winner}`);
      console.groupEnd();
    });
    console.groupEnd();
    
    console.group('💡 Recommendations');
    report.recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
    
    console.groupEnd();
  }

  /**
   * Export performance data for further analysis
   * @returns {Object} Raw performance data
   */
  exportData() {
    return {
      metrics: this.metrics,
      fpsHistory: this.fpsHistory,
      timestamp: new Date().toISOString(),
      testDuration: this.testDuration
    };
  }
}

// Global instance for easy access
window.performanceComparison = new PerformanceComparison();

// Example usage functions
window.testPerformance = {
  /**
   * Run full performance comparison
   */
  async run() {
    const comparison = window.performanceComparison;
    try {
      const report = await comparison.runComparison('gameCanvas', 0);
      comparison.logReport(report);
      return report;
    } catch (error) {
      console.error('Performance test failed:', error);
    }
  },

  /**
   * Export performance data
   */
  export() {
    return window.performanceComparison.exportData();
  }
};
