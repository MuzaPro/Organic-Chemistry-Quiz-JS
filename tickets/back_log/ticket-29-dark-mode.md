# Ticket #28: Add Dark Mode Support

**STATUS: OPEN**  
**Priority:** Medium  
**Type:** Enhancement  
**Estimate:** 8 hours  
**Assigned to:** Unassigned  

## Description
Implement a dark mode option for the Organic Chemistry Quiz Game to improve user experience in low-light environments, reduce eye strain during extended study sessions, and provide a modern aesthetic alternative. The feature should include a toggle mechanism, persist user preferences, and ensure all UI elements maintain proper contrast and readability in both light and dark themes.

## Background
Many students study during evening hours or in low-light conditions, and extended screen time with bright backgrounds can cause eye strain. Additionally, dark mode has become an expected feature in modern web applications. By implementing dark mode, we can:

1. Improve accessibility for users with light sensitivity
2. Reduce eye strain during extended study sessions
3. Potentially reduce device battery consumption on OLED screens
4. Align with modern UI/UX expectations
5. Provide visual variety that may increase engagement

## Requirements

### Functional Requirements
1. Add a clearly visible theme toggle button in the app header or footer
2. Implement smooth transition between light and dark themes
3. Persist user theme preference across sessions using localStorage
4. Respect user's system preference for dark/light mode as the initial default
5. Ensure all interactive elements remain clearly identifiable in dark mode
6. Maintain proper contrast ratios for text readability in accordance with WCAG AA standards

### Visual Requirements
1. Create a comprehensive dark color palette that:
   - Uses dark backgrounds (avoiding pure black) for main content areas
   - Maintains sufficient contrast for text and interactive elements
   - Ensures molecule SVGs and chemistry diagrams remain clearly visible
   - Uses softer colors to reduce eye strain while maintaining visual hierarchy

2. Design a theme toggle button with clear iconography that:
   - Indicates the current theme
   - Shows the theme that will be activated when clicked
   - Includes appropriate hover/focus states
   - Works well in both light and dark modes

### Technical Requirements
1. Implement theme switching using CSS variables or a similar approach
2. Ensure all existing animations and transitions work properly in dark mode
3. Add appropriate meta tags for browser theme-color support
4. Test and ensure compatibility across all supported browsers
5. Maintain responsive design integrity in both themes
6. Optimize SVG molecule diagrams for dark mode visibility

## Implementation Details

### CSS Structure
Implement dark mode using CSS variables defined in the `:root` selector with a `.dark-mode` class on the `html` or `body` element:

```css
:root {
  /* Light Theme (Default) */
  --background-primary: #ffffff;
  --background-secondary: #f5f7fa;
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent-color: #4a90e2;
  --border-color: #e1e4e8;
  --drop-zone-bg: #f0f4f8;
  --drop-zone-border: #d0d7de;
  --card-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  --feedback-success: #28a745;
  --feedback-error: #dc3545;
  /* Additional light theme variables... */
}

.dark-mode {
  /* Dark Theme */
  --background-primary: #1a1a1a;
  --background-secondary: #2d2d2d;
  --text-primary: #f0f0f0;
  --text-secondary: #b0b0b0;
  --accent-color: #5c9eed;
  --border-color: #444444;
  --drop-zone-bg: #2a2a2a;
  --drop-zone-border: #555555;
  --card-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  --feedback-success: #2db84d;
  --feedback-error: #e64c5c;
  /* Additional dark theme variables... */
}
```

Update existing CSS to use these variables instead of hard-coded color values.

### Theme Toggle Button
Add the theme toggle button to the footer near the mute button:

```html
<button id="theme-toggle" class="btn-icon-only" title="Toggle dark mode">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
      stroke-linecap="round" stroke-linejoin="round" width="16" height="16" class="theme-light-icon">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
      stroke-linecap="round" stroke-linejoin="round" width="16" height="16" class="theme-dark-icon">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
</button>
```

### Theme Manager Implementation
Create a new module `js/theme-manager.js` to handle theme switching logic:

```javascript
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
            // Otherwise check system preference
            darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        // Apply initial theme
        applyTheme();
        
        // Setup button
        setupThemeToggle();
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (localStorage.getItem('quizDarkMode') === null) {
                darkMode = e.matches;
                applyTheme();
                updateToggleButton();
            }
        });
    };
    
    // Apply the current theme to the document
    const applyTheme = () => {
        if (darkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        
        // Update meta theme-color for browser UI
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', darkMode ? '#1a1a1a' : '#ffffff');
        }
        
        // Update toggle button appearance
        updateToggleButton();
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
        
        // Apply the new theme
        applyTheme();
    };
    
    // Public API
    return {
        initialize: initializeTheme,
        toggleTheme
    };
})();

// Initialize theme system when DOM is loaded
document.addEventListener('DOMContentLoaded', ThemeManager.initialize);
```

### SVG Adjustments for Dark Mode
Add CSS to ensure SVGs are properly visible in dark mode:

```css
/* Ensure molecule SVGs are visible in dark mode */
.dark-mode .molecule-image {
    /* Invert colors and adjust brightness for SVGs that need it */
    filter: brightness(1.2);
}

/* For SVGs with black strokes that need to be visible in dark mode */
.dark-mode .molecule-image[data-needs-inversion="true"] {
    filter: invert(1) hue-rotate(180deg);
}
```

### Add Required Meta Tags
Add theme-color meta tag to the document head:

```html
<meta name="theme-color" content="#ffffff">
<meta name="color-scheme" content="light dark">
```

## Testing Criteria

### Functional Testing
1. Verify theme toggle works correctly
2. Verify theme preference is saved between sessions
3. Verify system preference is respected on first visit
4. Verify theme transition is smooth and non-disruptive
5. Test all interactive elements in both themes

### Visual Testing
1. Check all UI elements for proper contrast in both themes
2. Verify all text meets WCAG AA contrast standards
3. Ensure molecule SVGs are clearly visible in both themes
4. Test modals, dropdowns, and overlays in both themes
5. Verify active, hover, and focus states are clearly visible

### Cross-browser Testing
1. Test on Chrome, Firefox, Safari, and Edge
2. Test on iOS and Android mobile browsers
3. Verify theme works correctly on different screen sizes

### Performance Testing
1. Verify theme switching does not cause layout shifts
2. Ensure smooth transitions without performance issues

## Acceptance Criteria
- [ ] Theme toggle button is present and functional
- [ ] All UI elements are properly styled in dark mode
- [ ] User theme preference persists between sessions
- [ ] System theme preference is properly detected and applied
- [ ] All SVGs and molecule diagrams are clearly visible in both themes
- [ ] All text maintains WCAG AA contrast standards in both themes
- [ ] Theme transition is smooth and visually pleasing
- [ ] No visual bugs or inconsistencies in either theme

## Related Files
- `index.html` - Add theme toggle button and meta tags
- `css/styles.css` - Update color schemes with CSS variables
- `js/theme-manager.js` - New file for theme switching logic
- `js/app.js` - Initialize theme manager
- Various SVG files in `assets/molecules/` - May need adjustments for dark mode

## Estimated Effort
Medium (8 hours) - Requires comprehensive review of all UI elements and styling
