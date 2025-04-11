# Ticket #18: Add Decorative Chemistry-Themed Artwork

## Description
Enhance the visual appeal of the quiz by adding decorative chemistry-themed artwork such as flasks, distillation setups, and lab tools. These should be tastefully integrated into the interface without cluttering or distracting from the quiz content.

## Priority
**Could Have** - Visual enhancement

## Tasks
1. Source or create appropriate chemistry-themed artwork (flasks, beakers, lab equipment)
2. Add decorative elements to strategic locations in the interface
3. Ensure artwork is properly positioned and sized on different screens
4. Make sure decorations don't interfere with the quiz functionality
5. Maintain the clean, academic aesthetic

## Acceptance Criteria
- [ ] Chemistry-themed decorative elements are integrated into the interface
- [ ] Artwork is tasteful and enhances the chemistry theme without being distracting
- [ ] Decorations are responsive and scale appropriately on different devices
- [ ] Elements don't interfere with quiz functionality or readability
- [ ] Visual design maintains a professional, educational appearance
- [ ] Artwork performance is optimized (proper file formats, sizes)

## Implementation Notes
Add decorative elements to `index.html`:

```html
<!-- Add to appropriate locations in index.html -->
<div class="decoration decoration-flask decoration-top-right"></div>
<div class="decoration decoration-beaker decoration-bottom-left"></div>
<div class="decoration decoration-molecule decoration-bottom-right"></div>
```

Add corresponding CSS to `styles.css`:

```css
/* Decorative Chemistry Elements */
.decoration {
    position: absolute;
    pointer-events: none; /* Ensure clicks pass through */
    z-index: -1;
    opacity: 0.1;
    background-size: contain;
    background-repeat: no-repeat;
}

.decoration-top-right {
    top: 20px;
    right: -40px;
}

.decoration-bottom-left {
    bottom: 20px;
    left: -30px;
}

.decoration-bottom-right {
    bottom: -50px;
    right: 30px;
}

.decoration-flask {
    background-image: url('assets/images/decorations/flask.svg');
    width: 150px;
    height: 200px;
    transform: rotate(15deg);
}

.decoration-beaker {
    background-image: url('assets/images/decorations/beaker.svg');
    width: 120px;
    height: 150px;
    transform: rotate(-10deg);
}

.decoration-molecule {
    background-image: url('assets/images/decorations/molecule.svg');
    width: 180px;
    height: 180px;
    opacity: 0.07;
}

/* Add more decorative elements as needed */
.decoration-distillation {
    background-image: url('assets/images/decorations/distillation.svg');
    width: 200px;
    height: 250px;
}

.decoration-test-tubes {
    background-image: url('assets/images/decorations/test-tubes.svg');
    width: 100px;
    height: 120px;
}

/* Hide decorations on very small screens to prevent clutter */
@media (max-width: 767px) {
    .decoration {
        opacity: 0.05;
        transform: scale(0.7);
    }
}

@media (max-width: 480px) {
    .decoration {
        display: none;
    }
}
```

Create SVG files for decorative elements:
- `assets/images/decorations/flask.svg`
- `assets/images/decorations/beaker.svg`
- `assets/images/decorations/molecule.svg`
- `assets/images/decorations/distillation.svg`
- `assets/images/decorations/test-tubes.svg`

These should be simple, line-art style chemistry equipment illustrations.

For dynamically placed decorations, add to `app.js`:

```javascript
function addDecorativeElements() {
    // Only add on larger screens
    if (window.innerWidth < 768) return;
    
    const decorations = [
        { class: 'decoration-flask', position: 'top-right' },
        { class: 'decoration-beaker', position: 'bottom-left' },
        { class: 'decoration-molecule', position: 'bottom-right' },
        { class: 'decoration-test-tubes', position: 'top-left' }
    ];
    
    const container = document.querySelector('.app-container');
    
    decorations.forEach(decoration => {
        const element = document.createElement('div');
        element.className = `decoration ${decoration.class} decoration-${decoration.position}`;
        container.appendChild(element);
    });
}

// Call during initialization
document.addEventListener('DOMContentLoaded', addDecorativeElements);
```

## Testing Steps
1. Verify decorative elements appear properly in the interface
2. Check that they scale appropriately on different screen sizes
3. Ensure the decorations don't interfere with quiz functionality
4. Test on multiple browsers to verify appearance
5. Verify performance is not impacted by the decorative elements

## Related Files
- `index.html` - For static decoration elements
- `css/styles.css` - For decoration styling
- `js/app.js` - For dynamic decoration placement
- `assets/images/decorations/` - SVG files for decorative elements

## Estimated Effort
Medium (1 day)
