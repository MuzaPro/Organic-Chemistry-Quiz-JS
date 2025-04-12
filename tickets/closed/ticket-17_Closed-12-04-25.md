# Ticket #17: Implement Dynamic Background

**STATUS: CLOSED - April 12, 2025**
**Implemented by:** VS Code AI Agent
**Original Estimate:** Medium (1 day)
**Actual Time:** 1 day
**Files Modified:**
- `css/styles.css`
- `js/app.js`
- `assets/images/backgrounds/hexagon.svg`
- `assets/images/backgrounds/benzene.svg`
- `assets/images/backgrounds/molecule.svg`

## Description
Add a subtle dynamic background to the quiz interface to enhance visual interest without distracting from the educational content. This will make the application feel more polished and engaging.

## Priority
**Could Have** - Visual enhancement

## Tasks
1. Design a subtle animated background effect with chemistry-themed elements
2. Ensure the animation is lightweight and doesn't impact performance
3. Make sure the background doesn't distract from the quiz content
4. Implement responsive behavior for different screen sizes
5. Add accessibility considerations for users with motion sensitivity

## Acceptance Criteria
- [ ] Background has subtle animation that adds visual interest
- [ ] Animation doesn't distract from or interfere with the quiz content
- [ ] Performance remains smooth on both desktop and mobile devices
- [ ] Animation respects "prefers-reduced-motion" settings for accessibility
- [ ] Background is responsive to different screen sizes
- [ ] Chemistry theme is maintained in the visual design

## Implementation Notes
Add to `styles.css`:

```css
body {
    background-color: var(--secondary-color);
    position: relative;
    overflow-x: hidden;
}

body::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('assets/images/chemistry-pattern.svg') repeat;
    opacity: 0.03;
    z-index: -1;
    animation: backgroundScroll 60s linear infinite;
}

@keyframes backgroundScroll {
    0% { background-position: 0 0; }
    100% { background-position: 100% 100%; }
}

/* Respect user preferences for reduced motion */
@media (prefers-reduced-motion: reduce) {
    body::before {
        animation: none;
    }
}
```

Create a JavaScript implementation for more dynamic elements:

```javascript
// Add to app.js
function createDynamicBackground() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const container = document.querySelector('body');
    const background = document.createElement('div');
    background.className = 'dynamic-background';
    
    // Create bubbles/molecules
    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bg-element';
        
        // Random size
        const size = Math.random() * 80 + 40;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Random position
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay and duration
        bubble.style.animationDelay = `${Math.random() * 20}s`;
        bubble.style.animationDuration = `${Math.random() * 10 + 15}s`;
        
        // Add random shape - alternating between molecule shapes
        const shapeType = Math.floor(Math.random() * 3);
        if (shapeType === 0) {
            bubble.classList.add('bg-hexagon');
        } else if (shapeType === 1) {
            bubble.classList.add('bg-benzene');
        } else {
            bubble.classList.add('bg-molecule');
        }
        
        background.appendChild(bubble);
    }
    
    container.appendChild(background);
}

// Call during initialization
document.addEventListener('DOMContentLoaded', createDynamicBackground);
```

Add corresponding CSS:

```css
.dynamic-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
}

.bg-element {
    position: absolute;
    border-radius: 50%;
    opacity: 0.04;
    animation: float 20s infinite ease-in-out;
}

.bg-hexagon {
    background-image: url('assets/images/backgrounds/hexagon.svg');
    background-size: contain;
    background-repeat: no-repeat;
}

.bg-benzene {
    background-image: url('assets/images/backgrounds/benzene.svg');
    background-size: contain;
    background-repeat: no-repeat;
}

.bg-molecule {
    background-image: url('assets/images/backgrounds/molecule.svg');
    background-size: contain;
    background-repeat: no-repeat;
}

@keyframes float {
    0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.04; }
    50% { transform: translateY(-40px) translateX(20px) rotate(180deg); opacity: 0.06; }
    100% { transform: translateY(0) translateX(0) rotate(360deg); opacity: 0.04; }
}

@media (prefers-reduced-motion: reduce) {
    .bg-element {
        animation: none;
    }
}
```

Create simple SVG files for background elements:
- `assets/images/backgrounds/hexagon.svg`
- `assets/images/backgrounds/benzene.svg`
- `assets/images/backgrounds/molecule.svg`

These should be simple, monochromatic chemistry-themed shapes.

## Testing Steps
1. Verify the background animation is subtle and non-distracting
2. Test performance on various devices including lower-end mobile devices
3. Check that animations respect the "prefers-reduced-motion" setting
4. Verify the background scales appropriately on different screen sizes
5. Test across multiple browsers

## Related Files
- `css/styles.css` - For background styling
- `js/app.js` - For dynamic background implementation
- `assets/images/backgrounds/` - SVG files for background elements

## Estimated Effort
Medium (1 day)
