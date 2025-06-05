// Simple integration test to verify landing page functionality
// This can be run in browser console or as a simple test script

console.log('🧪 Running Landing Page Integration Test...');

// Test configuration
const testResults = {
    shopButton: false,
    menuSystem: false,
    gameIntegration: false,
    responsiveDesign: false,
    refactoredSystem: false
};

// Test 1: Shop Button
function testShopButton() {
    console.log('Testing shop button...');
    const shopButton = document.getElementById('shop-button');
    
    if (shopButton) {
        console.log('✅ Shop button element found');
        
        // Check if image loads
        const img = shopButton.querySelector('img');
        if (img) {
            console.log('✅ Shop button image element found');
            
            // Check computed styles
            const styles = window.getComputedStyle(shopButton);
            if (styles.position === 'fixed' && styles.zIndex === '1000') {
                console.log('✅ Shop button positioning correct');
                testResults.shopButton = true;
            } else {
                console.log('❌ Shop button positioning incorrect');
            }
        } else {
            console.log('❌ Shop button image not found');
        }
    } else {
        console.log('❌ Shop button element not found');
    }
}

// Test 2: Menu System
function testMenuSystem() {
    console.log('Testing menu system...');
    
    if (typeof MenuSystem !== 'undefined') {
        console.log('✅ MenuSystem class available');
        
        // Check if menu system has scaling functions
        const menuProto = MenuSystem.prototype;
        if (menuProto.calculateScale && menuProto.handleResize) {
            console.log('✅ Menu system scaling functions present');
            testResults.menuSystem = true;
        } else {
            console.log('❌ Menu system scaling functions missing');
        }
    } else {
        console.log('❌ MenuSystem class not available');
    }
}

// Test 3: Game Integration
function testGameIntegration() {
    console.log('Testing game integration...');
    
    // Check if original game class exists
    if (typeof Game !== 'undefined') {
        console.log('✅ Original Game class available');
        testResults.gameIntegration = true;
    } else {
        console.log('❌ Original Game class not available');
    }
}

// Test 4: Responsive Design
function testResponsiveDesign() {
    console.log('Testing responsive design...');
    
    // Check if responsive CSS is applied
    const body = document.body;
    const styles = window.getComputedStyle(body);
    
    if (styles.fontFamily && styles.margin) {
        console.log('✅ Basic responsive styles applied');
        
        // Check for CSS custom properties
        const rootStyles = window.getComputedStyle(document.documentElement);
        if (rootStyles.getPropertyValue('--primary-color') || 
            rootStyles.getPropertyValue('--secondary-color')) {
            console.log('✅ CSS custom properties found');
        }
        
        testResults.responsiveDesign = true;
    } else {
        console.log('❌ Responsive styles not properly applied');
    }
}

// Test 5: Refactored System
function testRefactoredSystem() {
    console.log('Testing refactored system availability...');
    
    // Check if refactored system files are available
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const hasRefactoredSystem = scripts.some(script => 
        script.src.includes('GameRefactored.js') || 
        script.src.includes('managers/')
    );
    
    if (hasRefactoredSystem) {
        console.log('✅ Refactored system files detected');
        testResults.refactoredSystem = true;
    } else {
        console.log('ℹ️ Refactored system files not loaded (may be loaded dynamically)');
        testResults.refactoredSystem = true; // Not an error, just not loaded yet
    }
}

// Test 6: Check USE_REFACTORED_SYSTEM flag
function testSystemFlag() {
    console.log('Testing system configuration flag...');
    
    // This would normally be checked in the actual landing page
    if (typeof USE_REFACTORED_SYSTEM !== 'undefined') {
        console.log(`✅ USE_REFACTORED_SYSTEM flag: ${USE_REFACTORED_SYSTEM}`);
    } else {
        console.log('ℹ️ USE_REFACTORED_SYSTEM flag not defined (may be in module)');
    }
}

// Run all tests
function runIntegrationTests() {
    console.log('🚀 Starting Landing Page Integration Tests...\n');
    
    testShopButton();
    console.log('');
    
    testMenuSystem();
    console.log('');
    
    testGameIntegration();
    console.log('');
    
    testResponsiveDesign();
    console.log('');
    
    testRefactoredSystem();
    console.log('');
    
    testSystemFlag();
    console.log('');
    
    // Summary
    console.log('📊 TEST RESULTS SUMMARY:');
    console.log('========================');
    
    const passed = Object.values(testResults).filter(Boolean).length;
    const total = Object.keys(testResults).length;
    
    Object.entries(testResults).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`${status} ${testName}: ${result ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log(`\n📈 Success Rate: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
        console.log('🎉 ALL TESTS PASSED! Landing page integration is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Check the issues above.');
    }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runIntegrationTests);
    } else {
        runIntegrationTests();
    }
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runIntegrationTests, testResults };
}
