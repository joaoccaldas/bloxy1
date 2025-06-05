// buttons.js - Button assets management and fallback UI system

/**
 * Manages button assets and provides fallback rendering for UI buttons.
 * This class handles loading button images and provides fallback styling
 * when assets are not available.
 */
export class ButtonAssets {
  constructor(assetsPath = 'assets/buttons/') {
    this.assetsPath = assetsPath;
    this.buttonAssets = new Map();
    this.fallbackStyles = new Map();
    this.loadedImages = new Map();
    
    // Initialize button asset mappings
    this._initButtonAssets();
    
    // Initialize fallback styles
    this._initFallbackStyles();
  }
  
  _initButtonAssets() {
    // Initialize the mapping of button names to asset file paths
    this.buttonAssets.set('shop', `${this.assetsPath}shop.png`);
    this.buttonAssets.set('start', `${this.assetsPath}start.png`);
    this.buttonAssets.set('load', `${this.assetsPath}load.png`);
    this.buttonAssets.set('save', `${this.assetsPath}save.png`);
    this.buttonAssets.set('resume', `${this.assetsPath}resume.png`);
    this.buttonAssets.set('quit', `${this.assetsPath}quit.png`);
    this.buttonAssets.set('rivals', `${this.assetsPath}rivals.png`);
    this.buttonAssets.set('settings', `${this.assetsPath}settings.png`);
    this.buttonAssets.set('back', `${this.assetsPath}back.png`);
    this.buttonAssets.set('close', `${this.assetsPath}close.png`);
  }
  
  _initFallbackStyles() {
    // Initialize fallback styling for buttons when assets are not available
    this.fallbackStyles.set('shop', {
      bgColor: '#FFD700',        // Gold
      textColor: '#000000',
      borderColor: '#FFA500',
      hoverBgColor: '#FFC107',
      text: 'SHOP',
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    });
    
    this.fallbackStyles.set('start', {
      bgColor: '#28A745',        // Green
      textColor: '#FFFFFF',
      borderColor: '#1E7E34',
      hoverBgColor: '#218838',
      text: 'START',
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    });
    
    this.fallbackStyles.set('load', {
      bgColor: '#17A2B8',        // Cyan
      textColor: '#FFFFFF',
      borderColor: '#138496',
      hoverBgColor: '#148A9C',
      text: 'LOAD',
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    });
    
    this.fallbackStyles.set('save', {
      bgColor: '#6F42C1',        // Purple
      textColor: '#FFFFFF',
      borderColor: '#5A2D91',
      hoverBgColor: '#5D2E8B',
      text: 'SAVE',
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    });
    
    this.fallbackStyles.set('resume', {
      bgColor: '#2563EB',        // Blue
      textColor: '#FFFFFF',
      borderColor: '#1E40AF',
      hoverBgColor: '#1D4ED8',
      text: 'RESUME',
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    });
    
    this.fallbackStyles.set('quit', {
      bgColor: '#DC3545',        // Red
      textColor: '#FFFFFF',
      borderColor: '#C82333',
      hoverBgColor: '#BD2130',
      text: 'QUIT',
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    });
    
    this.fallbackStyles.set('rivals', {
      bgColor: '#FD7E14',        // Orange
      textColor: '#FFFFFF',
      borderColor: '#DC6A00',
      hoverBgColor: '#E8681F',
      text: 'RIVALS',
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    });
    
    this.fallbackStyles.set('settings', {
      bgColor: '#6C757D',        // Gray
      textColor: '#FFFFFF',
      borderColor: '#5A6268',
      hoverBgColor: '#5A6268',
      text: 'SETTINGS',
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    });
    
    this.fallbackStyles.set('back', {
      bgColor: '#6C757D',        // Gray
      textColor: '#FFFFFF',
      borderColor: '#5A6268',
      hoverBgColor: '#5A6268',
      text: 'BACK',
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    });
    
    this.fallbackStyles.set('close', {
      bgColor: '#DC3545',        // Red
      textColor: '#FFFFFF',
      borderColor: '#C82333',
      hoverBgColor: '#BD2130',
      text: 'X',
      fontSize: 18,
      borderWidth: 2,
      borderRadius: 4
    });
  }
  
  /**
   * Get the file path for a button asset
   * @param {string} buttonName - Name of the button (e.g., 'shop', 'start', 'load')
   * @returns {string|null} File path to the button asset, or null if not found
   */
  getButtonAssetPath(buttonName) {
    return this.buttonAssets.get(buttonName.toLowerCase()) || null;
  }
  
  /**
   * Load a button image asset
   * @param {string} buttonName - Name of the button
   * @returns {Promise<HTMLImageElement>} Promise that resolves to the loaded image
   */
  async loadButtonAsset(buttonName) {
    const key = buttonName.toLowerCase();
    
    // Return cached image if already loaded
    if (this.loadedImages.has(key)) {
      return this.loadedImages.get(key);
    }
    
    const assetPath = this.getButtonAssetPath(buttonName);
    if (!assetPath) {
      throw new Error(`No asset path found for button: ${buttonName}`);
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.set(key, img);
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load button asset: ${assetPath}`));
      };
      
      img.src = assetPath;
    });
  }
  
  /**
   * Check if a button image is already loaded
   * @param {string} buttonName - Name of the button
   * @returns {boolean} True if the image is loaded
   */
  isLoaded(buttonName) {
    return this.loadedImages.has(buttonName.toLowerCase());
  }
  
  /**
   * Get a loaded button image
   * @param {string} buttonName - Name of the button
   * @returns {HTMLImageElement|null} The loaded image or null if not loaded
   */
  getLoadedImage(buttonName) {
    return this.loadedImages.get(buttonName.toLowerCase()) || null;
  }
  
  /**
   * Get fallback styling for a button
   * @param {string} buttonName - Name of the button
   * @returns {Object} Fallback style properties
   */
  getFallbackStyle(buttonName) {
    return this.fallbackStyles.get(buttonName.toLowerCase()) || {
      bgColor: '#2563EB',
      textColor: '#FFFFFF',
      borderColor: '#1E40AF',
      hoverBgColor: '#1D4ED8',
      text: buttonName.toUpperCase(),
      fontSize: 16,
      borderWidth: 2,
      borderRadius: 8
    };
  }
  
  /**
   * Get complete button configuration including asset path and fallback
   * @param {string} buttonName - Name of the button
   * @returns {Object} Button configuration object
   */
  getButtonConfig(buttonName) {
    return {
      name: buttonName,
      assetPath: this.getButtonAssetPath(buttonName),
      isLoaded: this.isLoaded(buttonName),
      image: this.getLoadedImage(buttonName),
      fallbackStyle: this.getFallbackStyle(buttonName)
    };
  }
    /**
   * Draw a button using either the asset image or fallback styling
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} buttonName - Name of the button
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Button width
   * @param {number} height - Button height
   * @param {boolean} isHovered - Whether the button is being hovered
   * @param {number} scale - Scale factor for text and border elements (default: 1)
   * @returns {Object} Button bounds for click detection
   */  drawButton(ctx, buttonName, x, y, width, height, isHovered = false, scale = 1) {
    const config = this.getButtonConfig(buttonName);
    
    // Try to draw with image asset first
    if (config.image && config.image.complete && config.image.naturalWidth > 0) {
      // Draw the image asset
      ctx.drawImage(config.image, x, y, width, height);
    } else {
      // Fall back to styled button
      const style = config.fallbackStyle;
      const bgColor = isHovered ? style.hoverBgColor : style.bgColor;
      
      // Scale border radius and line width with better bounds
      const scaledBorderRadius = Math.max(2, Math.min(15, style.borderRadius * scale));
      const scaledBorderWidth = Math.max(1, Math.min(4, style.borderWidth * scale));
      
      // Draw button background
      ctx.fillStyle = bgColor;
      this._drawRoundedRect(ctx, x, y, width, height, scaledBorderRadius);
      ctx.fill();
      
      // Draw button border
      ctx.strokeStyle = style.borderColor;
      ctx.lineWidth = scaledBorderWidth;
      this._drawRoundedRect(ctx, x, y, width, height, scaledBorderRadius);
      ctx.stroke();
      
      // Draw button text with scaled font size and better bounds
      ctx.fillStyle = style.textColor;
      const baseFontSize = Math.min(style.fontSize, height * 0.5); // Don't exceed half button height
      const scaledFontSize = Math.max(8, Math.min(24, baseFontSize * scale));
      ctx.font = `bold ${scaledFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(style.text, x + width / 2, y + height / 2);
    }
    
    // Return button bounds for click detection
    return { x, y, w: width, h: height, action: buttonName };
  }
  
  /**
   * Helper method to draw rounded rectangles
   * @private
   */
  _drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  
  /**
   * Add a custom button configuration
   * @param {string} buttonName - Name of the button
   * @param {string} assetPath - Path to the button asset (optional)
   * @param {Object} fallbackStyle - Fallback style object (optional)
   */
  addCustomButton(buttonName, assetPath = null, fallbackStyle = null) {
    const key = buttonName.toLowerCase();
    
    if (assetPath) {
      this.buttonAssets.set(key, assetPath);
    }
    
    if (fallbackStyle) {
      this.fallbackStyles.set(key, fallbackStyle);
    }
  }
  
  /**
   * Preload all button assets
   * @returns {Promise<void>} Promise that resolves when all assets are loaded
   */
  async preloadAll() {
    const loadPromises = [];
    
    for (const buttonName of this.buttonAssets.keys()) {
      loadPromises.push(
        this.loadButtonAsset(buttonName).catch(err => {
          console.warn(`Failed to load button asset for ${buttonName}:`, err.message);
          return null; // Continue with fallback
        })
      );
    }
    
    await Promise.all(loadPromises);
  }
  
  /**
   * Get a list of all available button names
   * @returns {string[]} Array of button names
   */
  listAvailableButtons() {
    return Array.from(this.buttonAssets.keys());
  }
}

// Global instance for easy access
export const buttonAssets = new ButtonAssets();

// Preload button assets when module is imported
buttonAssets.preloadAll().catch(err => {
  console.warn('Some button assets failed to preload:', err);
});
