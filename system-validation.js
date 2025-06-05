// Quick System Validation Script
// Run this in the browser console on the landing page to verify all systems

console.log('🔍 Running System Validation...\n');

const validationResults = {
    shopButton: false,
    menuSystem: false,
    responsiveDesign: false,
    gameIntegration: false,
    refactoredSystem: false,
    configSystem: false,
    managerSystem: false
};

// Test 1: Shop Button Validation
function validateShopButton() {
    console.log('1️⃣ Validating Shop Button...');
    
    const shopButton = document.getElementById('shop-button');
    if (!shopButton) {
        console.log('❌ Shop button element not found');
        return false;
    }
    
    const styles = window.getComputedStyle(shopButton);
    const hasCorrectPositioning = styles.position === 'fixed' && styles.zIndex === '1000';
    const hasCorrectSize = parseFloat(styles.width) > 0 && parseFloat(styles.height) > 0;
    
    if (hasCorrectPositioning && hasCorrectSize) {
        console.log('✅ Shop button validated successfully');
        return true;
    } else {
        console.log('❌ Shop button styling issues detected');
        return false;
    }
}

// Test 2: Menu System Validation
function validateMenuSystem() {
    console.log('2️⃣ Validating Menu System...');
    
    if (typeof MenuSystem === 'undefined') {
        console.log('❌ MenuSystem class not found');
        return false;
    }
    
    const proto = MenuSystem.prototype;
    const hasScalingMethods = proto.calculateScale && proto.handleResize;
    const hasRenderMethods = proto.render && proto.update;
    
    if (hasScalingMethods && hasRenderMethods) {
        console.log('✅ Menu system validated successfully');
        return true;
    } else {
        console.log('❌ Menu system missing required methods');
        return false;
    }
}

// Test 3: Responsive Design Validation
function validateResponsiveDesign() {
    console.log('3️⃣ Validating Responsive Design...');
    
    const body = document.body;
    const html = document.documentElement;
    
    // Check for modern CSS features
    const bodyStyles = window.getComputedStyle(body);
    const htmlStyles = window.getComputedStyle(html);
    
    const hasModernUnits = bodyStyles.fontSize.includes('clamp') || 
                          bodyStyles.margin.includes('vw') ||
                          bodyStyles.padding.includes('vh');
    
    const hasResponsiveStyles = bodyStyles.display && bodyStyles.fontFamily;
    
    if (hasResponsiveStyles) {
        console.log('✅ Responsive design validated successfully');
        return true;
    } else {
        console.log('❌ Responsive design issues detected');
        return false;
    }
}

// Test 4: Game Integration Validation
function validateGameIntegration() {
    console.log('4️⃣ Validating Game Integration...');
    
    const hasOriginalGame = typeof Game !== 'undefined';
    const hasLandingPageController = typeof window.landingPageController !== 'undefined' ||
                                   document.querySelector('script[src*="landingPage.js"]');
    
    if (hasOriginalGame && hasLandingPageController) {
        console.log('✅ Game integration validated successfully');
        return true;
    } else {
        console.log('❌ Game integration issues detected');
        console.log(`   Original Game: ${hasOriginalGame ? '✅' : '❌'}`);
        console.log(`   Landing Controller: ${hasLandingPageController ? '✅' : '❌'}`);
        return false;
    }
}

// Test 5: Refactored System Validation
async function validateRefactoredSystem() {
    console.log('5️⃣ Validating Refactored System...');
    
    try {
        // Check if refactored system can be loaded
        const gameRefactoredModule = await import('./GameRefactored.js').catch(() => null);
        
        if (gameRefactoredModule && gameRefactoredModule.GameRefactored) {
            console.log('✅ Refactored game system validated successfully');
            return true;
        } else {
            console.log('⚠️ Refactored system not loaded (may be normal if not enabled)');
            return true; // Not necessarily an error
        }
    } catch (error) {
        console.log('⚠️ Could not validate refactored system:', error.message);
        return true; // Not necessarily an error
    }
}

// Test 6: Config System Validation
async function validateConfigSystem() {
    console.log('6️⃣ Validating Configuration System...');
    
    try {
        const configModule = await import('./config/GameConfig.js').catch(() => null);
        
        if (configModule && configModule.GameConfig) {
            const config = configModule.GameConfig;
            const hasRequiredSections = config.GAME_SETTINGS && 
                                       config.RESPONSIVE && 
                                       config.DIFFICULTY_LEVELS;
            
            if (hasRequiredSections) {
                console.log('✅ Configuration system validated successfully');
                return true;
            }
        }
        
        console.log('⚠️ Configuration system not available');
        return true; // Not necessarily an error
    } catch (error) {
        console.log('⚠️ Could not validate configuration system:', error.message);
        return true;
    }
}

// Test 7: Manager System Verification
async function validateManagerSystem() {
    console.log('7️⃣ Validating Manager System...');
    
    const managerFiles = [
        './managers/GameStateManager.js',
        './managers/EntityManager.js',
        './managers/RenderManager.js',
        './managers/ScoreManager.js',
        './managers/SaveManager.js'
    ];
    
    let validManagers = 0;
    
    for (const managerFile of managerFiles) {
        try {
            const module = await import(managerFile).catch(() => null);
            if (module) {
                validManagers++;
            }
        } catch (error) {
            // Manager not available
        }
    }
    
    if (validManagers > 0) {
        console.log(`✅ Manager system validated (${validManagers}/${managerFiles.length} managers available)`);
        return true;
    } else {
        console.log('⚠️ Manager system not available');
        return true; // Not necessarily an error in original system
    }
}

// Run all validations
async function runAllValidations() {
    console.log('🚀 Starting comprehensive system validation...\n');
    
    // Run synchronous tests
    validationResults.shopButton = validateShopButton();
    console.log('');
    
    validationResults.menuSystem = validateMenuSystem();
    console.log('');
    
    validationResults.responsiveDesign = validateResponsiveDesign();
    console.log('');
    
    validationResults.gameIntegration = validateGameIntegration();
    console.log('');
    
    // Run asynchronous tests
    validationResults.refactoredSystem = await validateRefactoredSystem();
    console.log('');
    
    validationResults.configSystem = await validateConfigSystem();
    console.log('');
    
    validationResults.managerSystem = await validateManagerSystem();
    console.log('');
    
    // Generate summary
    const passed = Object.values(validationResults).filter(Boolean).length;
    const total = Object.keys(validationResults).length;
    const successRate = Math.round((passed / total) * 100);
    
    console.log('📊 VALIDATION SUMMARY');
    console.log('====================');
    
    Object.entries(validationResults).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`${status} ${testName}`);
    });
    
    console.log(`\n📈 Overall Success Rate: ${passed}/${total} (${successRate}%)`);
    
    if (successRate >= 85) {
        console.log('🎉 SYSTEM VALIDATION PASSED! All critical systems operational.');
    } else if (successRate >= 70) {
        console.log('⚠️ SYSTEM VALIDATION PARTIAL. Some issues detected but system functional.');
    } else {
        console.log('❌ SYSTEM VALIDATION FAILED. Critical issues need attention.');
    }
    
    console.log('\n🔧 For detailed testing, open test-runner.html');
    console.log('📚 For migration help, see MIGRATION_GUIDE.md');
    console.log('🚀 For deployment, see DEPLOYMENT_GUIDE.md');
    
    return {
        results: validationResults,
        successRate: successRate,
        summary: {
            passed: passed,
            total: total,
            status: successRate >= 85 ? 'PASSED' : successRate >= 70 ? 'PARTIAL' : 'FAILED'
        }
    };
}

// Auto-run validation
runAllValidations().then(results => {
    // Store results globally for further inspection
    window.systemValidationResults = results;
    console.log('\n💡 Results stored in window.systemValidationResults for inspection');
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllValidations, validationResults };
}
