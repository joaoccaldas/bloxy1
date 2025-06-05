# buttons.py - Button assets management and fallback UI system

import os
from typing import Dict, Optional, Tuple

class ButtonAssets:
    """
    Manages button assets and provides fallback rendering for UI buttons.
    This class handles loading button images and provides fallback styling
    when assets are not available.
    """
    
    def __init__(self, assets_path: str = "assets/buttons/"):
        self.assets_path = assets_path
        self.button_assets: Dict[str, str] = {}
        self.fallback_styles: Dict[str, Dict] = {}
        
        # Initialize button asset mappings
        self._init_button_assets()
        
        # Initialize fallback styles
        self._init_fallback_styles()
    
    def _init_button_assets(self):
        """Initialize the mapping of button names to asset file paths."""
        self.button_assets = {
            'shop': os.path.join(self.assets_path, 'shop.png'),
            'start': os.path.join(self.assets_path, 'start.png'),
            'load': os.path.join(self.assets_path, 'load.png'),
            'save': os.path.join(self.assets_path, 'save.png'),
            'resume': os.path.join(self.assets_path, 'resume.png'),
            'quit': os.path.join(self.assets_path, 'quit.png'),
            'rivals': os.path.join(self.assets_path, 'rivals.png'),
            'settings': os.path.join(self.assets_path, 'settings.png'),
            'back': os.path.join(self.assets_path, 'back.png'),
            'close': os.path.join(self.assets_path, 'close.png'),
        }
    
    def _init_fallback_styles(self):
        """Initialize fallback styling for buttons when assets are not available."""
        self.fallback_styles = {
            'shop': {
                'bg_color': '#FFD700',  # Gold
                'text_color': '#000000',
                'border_color': '#FFA500',
                'hover_bg_color': '#FFC107',
                'text': 'SHOP',
                'font_size': 16,
                'border_width': 2,
                'border_radius': 8
            },
            'start': {
                'bg_color': '#28A745',  # Green
                'text_color': '#FFFFFF',
                'border_color': '#1E7E34',
                'hover_bg_color': '#218838',
                'text': 'START',
                'font_size': 16,
                'border_width': 2,
                'border_radius': 8
            },
            'load': {
                'bg_color': '#17A2B8',  # Cyan
                'text_color': '#FFFFFF',
                'border_color': '#138496',
                'hover_bg_color': '#148A9C',
                'text': 'LOAD',
                'font_size': 16,
                'border_width': 2,
                'border_radius': 8
            },
            'save': {
                'bg_color': '#6F42C1',  # Purple
                'text_color': '#FFFFFF',
                'border_color': '#5A2D91',
                'hover_bg_color': '#5D2E8B',
                'text': 'SAVE',
                'font_size': 16,
                'border_width': 2,
                'border_radius': 8
            },
            'resume': {
                'bg_color': '#2563EB',  # Blue
                'text_color': '#FFFFFF',
                'border_color': '#1E40AF',
                'hover_bg_color': '#1D4ED8',
                'text': 'RESUME',
                'font_size': 16,
                'border_width': 2,
                'border_radius': 8
            },
            'quit': {
                'bg_color': '#DC3545',  # Red
                'text_color': '#FFFFFF',
                'border_color': '#C82333',
                'hover_bg_color': '#BD2130',
                'text': 'QUIT',
                'font_size': 16,
                'border_width': 2,
                'border_radius': 8
            },
            'rivals': {
                'bg_color': '#FD7E14',  # Orange
                'text_color': '#FFFFFF',
                'border_color': '#DC6A00',
                'hover_bg_color': '#E8681F',
                'text': 'RIVALS',
                'font_size': 16,
                'border_width': 2,
                'border_radius': 8
            },
            'settings': {
                'bg_color': '#6C757D',  # Gray
                'text_color': '#FFFFFF',
                'border_color': '#5A6268',
                'hover_bg_color': '#5A6268',
                'text': 'SETTINGS',
                'font_size': 16,
                'border_width': 2,
                'border_radius': 8
            },
            'back': {
                'bg_color': '#6C757D',  # Gray
                'text_color': '#FFFFFF',
                'border_color': '#5A6268',
                'hover_bg_color': '#5A6268',
                'text': 'BACK',
                'font_size': 16,
                'border_width': 2,
                'border_radius': 8
            },
            'close': {
                'bg_color': '#DC3545',  # Red
                'text_color': '#FFFFFF',
                'border_color': '#C82333',
                'hover_bg_color': '#BD2130',
                'text': 'X',
                'font_size': 18,
                'border_width': 2,
                'border_radius': 4
            }
        }
    
    def get_button_asset_path(self, button_name: str) -> Optional[str]:
        """
        Get the file path for a button asset.
        
        Args:
            button_name: Name of the button (e.g., 'shop', 'start', 'load')
            
        Returns:
            File path to the button asset, or None if not found
        """
        return self.button_assets.get(button_name.lower())
    
    def has_asset(self, button_name: str) -> bool:
        """
        Check if a button asset file exists.
        
        Args:
            button_name: Name of the button
            
        Returns:
            True if the asset file exists, False otherwise
        """
        asset_path = self.get_button_asset_path(button_name)
        return asset_path is not None and os.path.exists(asset_path)
    
    def get_fallback_style(self, button_name: str) -> Dict:
        """
        Get fallback styling for a button.
        
        Args:
            button_name: Name of the button
            
        Returns:
            Dictionary containing fallback style properties
        """
        return self.fallback_styles.get(button_name.lower(), {
            'bg_color': '#2563EB',
            'text_color': '#FFFFFF',
            'border_color': '#1E40AF',
            'hover_bg_color': '#1D4ED8',
            'text': button_name.upper(),
            'font_size': 16,
            'border_width': 2,
            'border_radius': 8
        })
    
    def get_button_config(self, button_name: str) -> Dict:
        """
        Get complete button configuration including asset path and fallback.
        
        Args:
            button_name: Name of the button
            
        Returns:
            Dictionary containing asset path (if available) and fallback style
        """
        config = {
            'name': button_name,
            'asset_path': self.get_button_asset_path(button_name),
            'has_asset': self.has_asset(button_name),
            'fallback_style': self.get_fallback_style(button_name)
        }
        return config
    
    def add_custom_button(self, button_name: str, asset_path: str = None, fallback_style: Dict = None):
        """
        Add a custom button configuration.
        
        Args:
            button_name: Name of the button
            asset_path: Path to the button asset (optional)
            fallback_style: Fallback style dictionary (optional)
        """
        if asset_path:
            self.button_assets[button_name.lower()] = asset_path
        
        if fallback_style:
            self.fallback_styles[button_name.lower()] = fallback_style
    
    def list_available_buttons(self) -> list:
        """
        Get a list of all available button names.
        
        Returns:
            List of button names
        """
        return list(self.button_assets.keys())
    
    def get_asset_dimensions(self, button_name: str) -> Optional[Tuple[int, int]]:
        """
        Get the dimensions of a button asset (if available).
        This is a placeholder - actual implementation would require image processing.
        
        Args:
            button_name: Name of the button
            
        Returns:
            Tuple of (width, height) or None if asset not available
        """
        # This would require PIL or similar library to actually read image dimensions
        # For now, return standard button dimensions
        if self.has_asset(button_name):
            return (160, 40)  # Standard button size
        return None


# Global instance for easy access
button_assets = ButtonAssets()

# Export main functionality
__all__ = ['ButtonAssets', 'button_assets']


# Example usage:
if __name__ == "__main__":
    # Example of how to use the ButtonAssets class
    assets = ButtonAssets()
    
    # Check if shop button asset exists
    shop_config = assets.get_button_config('shop')
    print(f"Shop button config: {shop_config}")
    
    # List all available buttons
    print(f"Available buttons: {assets.list_available_buttons()}")
    
    # Add a custom button
    assets.add_custom_button('inventory', 'assets/buttons/inventory.png', {
        'bg_color': '#8B4513',
        'text_color': '#FFFFFF',
        'text': 'INVENTORY'
    })
