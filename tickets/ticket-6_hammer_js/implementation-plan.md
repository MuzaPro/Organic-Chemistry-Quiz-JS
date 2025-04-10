# Hammer.js Implementation Plan

## Overview
This document provides a detailed implementation plan for adding touch support to the Organic Chemistry Quiz Game using Hammer.js. This implementation should maintain the existing drag-and-drop functionality while making it work properly on touch devices.

## Prerequisites
- Understanding of the current drag-drop.js implementation
- Basic familiarity with touch events and gesture handling
- Access to the main branch of the repository

## Implementation Steps

### 1. Set Up the Project

Start by creating a new branch from main:

```bash
git checkout main
git checkout -b feature/hammer.js
```

### 2. Add Hammer.js Library

Add the Hammer.js library to the project by adding this script tag to `index.html` just before your closing `</body>` tag but before your own script files:

```html
<!-- Add Hammer.js for touch support -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>
```

Verify the library loads correctly by opening the browser console and typing `Hammer`. It should return a function, not undefined.

### 3. Add Device Detection

At the top of your `drag-drop.js` file, add device detection code:

```javascript
/**
 * Drag and Drop Handler with Hammer.js support
 * Manages the drag and drop functionality for the quiz
 */

const DragDrop = (() => {
    // Private variables
    let draggingEnabled = true;
    let currentDragElement = null;
    let dropZones = [];
    let reagentCards = [];
    
    // Detect if we're on a touch device
    let isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    
    // Rest of your code...
});
```

### 4. Modify the Initialize Method

Update the `initialize` method to call appropriate setup methods:

```javascript
/**
 * Initialize drag and drop functionality
 */
const initialize = () => {
    // Store references to drop zones
    dropZones = [
        { element: document.getElementById('drop-zone-1'), zone: 1, content: null },
        { element: document.getElementById('drop-zone-2'), zone: 2, content: null }
    ];
    
    // Set up reagent cards
    setupReagentCards();
    
    // Set up drop zones
    setupDropZones();
};
```

### 5. Create New Setup Methods for Mouse and Touch

Refactor the `setupReagentCards` method to handle both mouse and touch:

```javascript
/**
 * Set up event listeners for reagent cards
 */
const setupReagentCards = () => {
    // Get all reagent cards
    reagentCards = document.querySelectorAll('.reagent-card');
    
    reagentCards.forEach(card => {
        // Store original position for later use with Hammer.js
        const rect = card.getBoundingClientRect();
        card.setAttribute('data-original-x', rect.left);
        card.setAttribute('data-original-y', rect.top);
        
        if (isTouchDevice) {
            // For touch devices, use Hammer.js
            setupTouchEvents(card);
        } else {
            // For desktop, use standard drag/drop
            setupMouseEvents(card);
        }
    });
};
```

### 6. Implement Mouse and Touch Setup Functions

Add these two new functions:

```javascript
/**
 * Set up standard mouse drag events
 */
const setupMouseEvents = (card) => {
    // Drag start
    card.addEventListener('dragstart', (e) => {
        if (!draggingEnabled) return;
        
        currentDragElement = card;
        card.classList.add('dragging');
        
        // Store reagent data in the drag event
        e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
        e.dataTransfer.effectAllowed = 'move';
        
        // If this card was already in a drop zone, clear that drop zone
        dropZones.forEach(zone => {
            if (zone.content && zone.content.element === card) {
                removeFromDropZone(zone);
            }
        });
    });
    
    // Drag end
    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        currentDragElement = null;
    });
};

/**
 * Set up Hammer.js touch events
 */
const setupTouchEvents = (card) => {
    const hammer = new Hammer(card);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    
    // Variables to track original position
    let startPosition = { x: 0, y: 0 };
    let originalTransform = '';
    
    hammer.on('panstart', (e) => {
        if (!draggingEnabled) return;
        
        // Save original state
        originalTransform = card.style.transform || '';
        startPosition = {
            x: e.center.x,
            y: e.center.y
        };
        
        currentDragElement = card;
        card.classList.add('touch-dragging');
        
        // If this card was already in a drop zone, clear that drop zone
        dropZones.forEach(zone => {
            if (zone.content && zone.content.element === card) {
                removeFromDropZone(zone);
            }
        });
        
        // Prevent default behavior
        e.srcEvent.preventDefault();
    });
    
    hammer.on('pan', (e) => {
        if (!draggingEnabled || !currentDragElement) return;
        
        // Move the element
        card.style.position = 'fixed';
        card.style.zIndex = '1000';
        card.style.left = `${e.center.x - (card.offsetWidth / 2)}px`;
        card.style.top = `${e.center.y - (card.offsetHeight / 2)}px`;
        
        // Prevent default to stop scrolling
        e.srcEvent.preventDefault();
    });
    
    hammer.on('panend', (e) => {
        if (!draggingEnabled || !currentDragElement) return;
        
        // Check if we're over a drop zone
        const elementsAtPoint = document.elementsFromPoint(e.center.x, e.center.y);
        let foundDropZone = null;
        
        // Find if one of the elements is a drop zone
        for (let i = 0; i < elementsAtPoint.length; i++) {
            const el = elementsAtPoint[i];
            if (el.classList.contains('drop-zone')) {
                const zoneNumber = parseInt(el.getAttribute('data-zone'), 10);
                foundDropZone = dropZones.find(z => z.zone === zoneNumber);
                break;
            }
        }
        
        // Handle drop
        if (foundDropZone) {
            // Reset position before adding to drop zone
            card.style.position = '';
            card.style.zIndex = '';
            card.style.left = '';
            card.style.top = '';
            card.style.transform = originalTransform;
            
            // Add to drop zone
            addToDropZone(foundDropZone, card);
        } else {
            // Return to original position
            card.style.position = '';
            card.style.zIndex = '';
            card.style.left = '';
            card.style.top = '';
            card.style.transform = originalTransform;
            
            // Make the card visible again if it was being dragged
            card.style.visibility = 'visible';
        }
        
        card.classList.remove('touch-dragging');
        currentDragElement = null;
    });
    
    // Store a reference to disable later if needed
    card.hammerInstance = hammer;
};
```

### 7. Update Drop Zone Setup

Modify the `setupDropZones` method to only apply mouse events on desktop:

```javascript
/**
 * Set up event listeners for drop zones
 */
const setupDropZones = () => {
    dropZones.forEach(zone => {
        const element = zone.element;
        
        if (!isTouchDevice) {
            // Only set up these events for desktop
            
            // Drag over
            element.addEventListener('dragover', (e) => {
                if (!draggingEnabled) return;
                
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                element.classList.add('highlight');
            });
            
            // Drag enter
            element.addEventListener('dragenter', (e) => {
                if (!draggingEnabled) return;
                
                e.preventDefault();
                element.classList.add('highlight');
            });
            
            // Drag leave
            element.addEventListener('dragleave', () => {
                element.classList.remove('highlight');
            });
            
            // Drop
            element.addEventListener('drop', (e) => {
                e.preventDefault();
                element.classList.remove('highlight');
                
                if (!draggingEnabled) return;
                
                const reagentId = e.dataTransfer.getData('text/plain');
                const reagentCard = document.querySelector(`.reagent-card[data-id="${reagentId}"]`);
                
                if (!reagentCard) return;
                
                // Check if another reagent is already in this drop zone
                if (zone.content) {
                    // Return the current reagent to the bank
                    returnToBank(zone.content.element);
                }
                
                // Put the new reagent in the drop zone
                addToDropZone(zone, reagentCard);
            });
        }
    });
};
```

### 8. Create Touch-Specific Clone Events

Add a new method for touch events on clones:

```javascript
/**
 * Set up touch events for the clone in a drop zone
 * @param {Element} clone - The clone element in the drop zone
 * @param {Object} zone - The drop zone object
 * @param {Element} original - The original reagent card
 */
const setupCloneTouchEvents = (clone, zone, original) => {
    const hammer = new Hammer(clone);
    hammer.get('tap').set({ enable: true });
    
    // Tap to remove
    hammer.on('tap', () => {
        if (!draggingEnabled) return;
        
        removeFromDropZone(zone);
        returnToBank(original);
        
        // Hide the next button if it's visible
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn && !nextBtn.classList.contains('hidden')) {
            nextBtn.classList.add('hidden');
        }
    });
};
```

### 9. Update the addToDropZone Method

Modify the `addToDropZone` method to use the appropriate event setup:

```javascript
/**
 * Add a reagent card to a drop zone
 * @param {Object} zone - The drop zone object
 * @param {Element} reagentCard - The reagent card element
 */
const addToDropZone = (zone, reagentCard) => {
    // Create a clone to place in the drop zone
    const cardClone = reagentCard.cloneNode(true);
    cardClone.classList.add('reagent-in-dropzone');
    
    // Make the clone draggable
    cardClone.setAttribute('draggable', 'true');
    cardClone.setAttribute('data-original-id', reagentCard.getAttribute('data-id'));
    
    // Add appropriate events to the clone
    if (isTouchDevice) {
        setupCloneTouchEvents(cardClone, zone, reagentCard);
    } else {
        setupCloneDragEvents(cardClone, zone, reagentCard);
    }
    
    // Clear the drop zone
    while (zone.element.firstChild) {
        zone.element.removeChild(zone.element.firstChild);
    }
    
    // Add the clone to the drop zone
    zone.element.appendChild(cardClone);
    zone.element.classList.add('filled');
    
    // Hide the original card (it's now in the drop zone)
    reagentCard.style.visibility = 'hidden';
    
    // Update drop zone content
    zone.content = {
        element: reagentCard,
        clone: cardClone,
        id: reagentCard.getAttribute('data-id'),
        name: reagentCard.getAttribute('data-name')
    };
};
```

### 10. Update the setDraggingEnabled Method

Update the method to handle Hammer instances:

```javascript
/**
 * Enable or disable dragging functionality
 * @param {boolean} enabled - Whether dragging should be enabled
 */
const setDraggingEnabled = (enabled) => {
    draggingEnabled = enabled;
    
    reagentCards.forEach(card => {
        if (enabled) {
            card.setAttribute('draggable', 'true');
            card.classList.remove('disabled');
        } else {
            card.setAttribute('draggable', 'false');
            card.classList.add('disabled');
            
            // If using Hammer.js, also disable it
            if (isTouchDevice && card.hammerInstance) {
                // No need to completely destroy, just update options
                card.hammerInstance.set({ enable: enabled });
            }
        }
    });
};
```

### 11. Add CSS Styles

Add these new styles to your `styles.css` file:

```css
/* Touch dragging styles */
.touch-dragging {
  opacity: 0.8;
  transform: scale(1.05) !important;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
  z-index: 1000;
  touch-action: none;
}

/* Prevent text/element selection during touch */
.reagent-card {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: none; /* Prevents browser handling of touches */
}
```

### 12. Update Viewport Meta Tag

In your `index.html` file, update the viewport meta tag to prevent unwanted zooming:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

## Testing Instructions

After implementation, follow these testing steps:

### Desktop Testing
1. Verify that mouse drag-and-drop still works correctly in Chrome, Firefox, and Safari
2. Confirm that all existing functionality (reset, submit, etc.) works as before
3. Test all drag operations: bank to zone, zone to zone, zone to bank

### Mobile Device Testing
1. Test on iOS Safari:
   - Drag molecules from bank to drop zones
   - Verify no context menu appears during drag
   - Verify visual feedback during drag operations
   - Test removing molecules from drop zones by tapping

2. Test on Android Chrome:
   - Repeat the same tests as on iOS
   - Verify performance is acceptable
   - Check that scrolling still works when not dragging

### Edge Cases
1. Try rapid tapping on reagent cards
2. Test with multiple fingers
3. Test with different drag speeds
4. Try dragging when a question is already answered correctly

## Common Issues and Solutions

### Issue: Dragging starts but element doesn't follow finger
Solution: Check that the position calculations in the `pan` event handler are correct. Make sure the element's position is set to 'fixed' during dragging.

### Issue: Element jumps to a different position when dragging starts
Solution: Ensure you're calculating the initial position correctly. You may need to adjust the offset calculations.

### Issue: Browser still shows context menu on long press
Solution: Make sure you're calling `preventDefault()` on the original event: `e.srcEvent.preventDefault()`.

### Issue: Scrolling doesn't work after implementing touch events
Solution: Only prevent default behaviors during drag operations, not on all touch events.

## Fallback Strategy

If specific issues persist on certain devices, implement a user-selectable interaction mode:

```javascript
// At the top of app.js
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// In initializeQuiz()
if (isTouchDevice) {
  // Add a button that lets the user choose:
  const modeSelector = document.createElement('div');
  modeSelector.className = 'mode-selector';
  modeSelector.innerHTML = `
    <p>Choose interaction style:</p>
    <button id="drag-mode">Drag & Drop</button>
    <button id="tap-mode">Tap to Select</button>
  `;
  document.querySelector('.question-container').prepend(modeSelector);
  
  // Add event listeners for the buttons
  document.getElementById('drag-mode').addEventListener('click', () => {
    document.body.classList.remove('tap-mode');
    document.body.classList.add('drag-mode');
    localStorage.setItem('interactionMode', 'drag');
    location.reload();
  });
  
  document.getElementById('tap-mode').addEventListener('click', () => {
    document.body.classList.remove('drag-mode');
    document.body.classList.add('tap-mode');
    localStorage.setItem('interactionMode', 'tap');
    location.reload();
  });
}
```

## Submission

When submitting your pull request, include:
1. A clear description of the changes made
2. Notes about any challenges encountered
3. Testing performed and results
4. Any known limitations

## Resources

- [Hammer.js Documentation](https://hammerjs.github.io/)
- [Hammer.js GitHub Repository](https://github.com/hammerjs/hammer.js/)
- [Touch Events MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Element.elementsFromPoint() Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint)
