/**
 * Theme Manager
 * Handles dark/light theme switching
 */
const ThemeManager = (() => {
    // Track current theme
    let darkMode = false;

    // Check for saved user preference or system preference
    const initializeTheme = () => {
        // Check localStorage first
        const savedTheme = localStorage.getItem('quizDarkMode');
        
        if (savedTheme !== null) {
            // Use saved preference
            darkMode = savedTheme === 'true';
        } else {
            // Default to light mode regardless of system preference
            darkMode = false;
        }
        
        // Apply initial theme
        applyTheme();
        
        // Setup button
        setupThemeToggle();
        
        // Listen for system theme changes but don't automatically apply them
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Only react to system changes if no preference is saved
            if (localStorage.getItem('quizDarkMode') === null) {
                darkMode = false; // Keep light mode as default
                applyTheme();
                updateToggleButton();
            }
        });
    };
    
    // Apply the current theme to the document
    const applyTheme = () => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        
        // Update meta theme-color for browser UI
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', darkMode ? '#1a1a1a' : '#ffffff');
        }
        
        // Update toggle button appearance
        updateToggleButton();

        // Adjust SVG colors for dark mode
        document.querySelectorAll('.molecule-image').forEach(img => {
            img.style.filter = darkMode ? 'brightness(1.2)' : 'none';
        });
    };
    
    // Set up the theme toggle button
    const setupThemeToggle = () => {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        // Update initial button state
        updateToggleButton();
        
        // Add click handler
        themeToggle.addEventListener('click', toggleTheme);
    };
    
    // Update toggle button appearance
    const updateToggleButton = () => {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        const lightIcon = themeToggle.querySelector('.theme-light-icon');
        const darkIcon = themeToggle.querySelector('.theme-dark-icon');
        
        if (darkMode) {
            lightIcon.style.display = 'block';
            darkIcon.style.display = 'none';
            themeToggle.setAttribute('title', 'Switch to light mode');
        } else {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'block';
            themeToggle.setAttribute('title', 'Switch to dark mode');
        }
    };
    
    // Toggle between light and dark themes
    const toggleTheme = () => {
        darkMode = !darkMode;
        localStorage.setItem('quizDarkMode', darkMode);
        
        // Apply the new theme with transition
        document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease');
        applyTheme();
        
        // Remove transition after it's complete
        setTimeout(() => {
            document.documentElement.style.removeProperty('--theme-transition');
        }, 300);
    };
    
    // Public API
    return {
        initialize: initializeTheme,
        toggleTheme
    };
})();