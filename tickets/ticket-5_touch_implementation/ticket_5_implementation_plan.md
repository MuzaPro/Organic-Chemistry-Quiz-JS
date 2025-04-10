# Revised Implementation Plan: Custom Touch Event Handling for SVG Drag-and-Drop

## Background
- **Research Ticket**: #4 - Research Touch Event Handling for Drag-and-Drop SVGs
- **Implementation Ticket**: #5 - Implement Touch Support for Drag-and-Drop
- **Completed By**: Claude (AI Assistant)
- **Date**: April 10, 2025

## Problem Statement
Users on mobile devices are currently unable to drag and drop SVG molecule elements in the Organic Chemistry Quiz Game. When users attempt a long press on SVG elements, mobile browsers trigger their default context menu (offering options like "Download image") instead of initiating the drag-and-drop interaction. The previously recommended polyfill approach did not prevent this context menu from appearing, making it necessary to implement a more direct approach to touch handling.

## Revised Approach: Custom Touch Event Implementation

After discovering that the polyfill approach did not resolve the SVG context menu issue, we're switching to a custom touch event implementation that gives us complete control over the touch behavior. This approach completely bypasses the HTML5 drag and drop API for touch devices, while keeping it intact for desktop users.

**Rationale for revised approach:**
1. **Direct control**: Complete control over touch event handling without browser interference
2. **Prevention of browser defaults**: Can specifically prevent SVG context menus from appearing
3. **Custom visual feedback**: Can implement smoother visual feedback optimized for touch
4. **Device detection**: Can provide different experiences for mouse vs. touch devices
5. **No external dependencies**: Implementation without reliance on third-party libraries

## Implementation Steps

### 1. Update file: `js/drag-drop.js`
Create a custom touch event implementation alongside the existing drag-and-drop system.

```javascript
/**
 * Enhanced Drag and Drop Handler with custom touch implementation
 */

const DragDrop = (() => {
    // Private variables
    let draggingEnabled = true;
    let currentDragElement = null;
    let dropZones = [];
    let reagentCards = [];
    let touchDragging = false;
    let touchElement = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;
    let ghostElement = null;
    let originalPosition = { x: 0, y: 0 };
    let isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
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
    
    /**
     * Set up event listeners for reagent cards
     * Enhanced with custom touch handling
     */
    const setupReagentCards = () => {
        // Get all reagent cards
        reagentCards = document.querySelectorAll('.reagent-card');
        
        reagentCards.forEach(card => {
            // Standard drag-and-drop for desktop
            if (!isMobileDevice) {
                setupDragEvents(card);
            } else {
                // Custom touch handling for mobile
                setupTouchEvents(card);
                
                // Disable standard draggable for mobile to prevent conflicts
                card.setAttribute('draggable', 'false');
                
                // Prevent all default touch actions on the card and its contents
                card.style.touchAction = 'none';
                
                // Prevent context menu
                card.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                // Disable long-press context menu on all child elements, especially SVGs
                const allElements = card.querySelectorAll('*');
                allElements.forEach(el => {
                    el.style.webkitUserSelect = 'none';
                    el.style.userSelect = 'none';
                    el.style.webkitTouchCallout = 'none';
                    el.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        return false;
                    });
                });
            }
        });
    };
    
    /**
     * Set up standard drag events for desktop
     * @param {Element} card - The reagent card element
     */
    const setupDragEvents = (card) => {
        // Original drag event implementation
        card.setAttribute('draggable', 'true');
        
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
     * Set up custom touch events for mobile
     * @param {Element} card - The reagent card element
     */
    const setupTouchEvents = (card) => {
        // Touch start - begin potential drag operation
        card.addEventListener('touchstart', (e) => {
            if (!draggingEnabled) return;
            
            // Prevent default behavior to avoid context menu
            e.preventDefault();
            
            // Check if card is already in a drop zone
            let cardInDropZone = false;
            let cardDropZone = null;
            
            dropZones.forEach(zone => {
                if (zone.content && zone.content.element === card) {
                    cardInDropZone = true;
                    cardDropZone = zone;
                }
            });
            
            // Get the original position for later reference
            const rect = card.getBoundingClientRect();
            originalPosition = {
                x: rect.left,
                y: rect.top
            };
            
            // Calculate touch offset within the element
            const touch = e.touches[0];
            touchOffsetX = touch.clientX - rect.left;
            touchOffsetY = touch.clientY - rect.top;
            
            // Store the element being touched
            touchElement = card;
            
            // Start drag after a short delay (simulating long press)
            setTimeout(() => {
                if (touchElement === card) {
                    startTouchDrag(card, cardInDropZone, cardDropZone);
                }
            }, 150); // Shorter delay than typical long press for better user experience
            
            // Visual feedback
            card.classList.add('touch-active');
        }, { passive: false });
        
        // Touch move - update position during drag
        card.addEventListener('touchmove', (e) => {
            if (!draggingEnabled || !touchElement || touchElement !== card) return;
            
            // If we haven't started dragging yet, check if we've moved enough to cancel drag start
            if (!touchDragging) {
                const touch = e.touches[0];
                const rect = card.getBoundingClientRect();
                const moveX = Math.abs(touch.clientX - rect.left - touchOffsetX);
                const moveY = Math.abs(touch.clientY - rect.top - touchOffsetY);
                
                // If moved enough, cancel the potential drag start
                if (moveX > 10 || moveY > 10) {
                    touchElement = null;
                    card.classList.remove('touch-active');
                }
                return;
            }
            
            // Prevent scrolling
            e.preventDefault();
            
            // Move the ghost element
            const touch = e.touches[0];
            moveGhostElement(touch.clientX, touch.clientY);
            
            // Detect potential drop target
            checkTouchDropTarget(touch.clientX, touch.clientY);
        }, { passive: false });
        
        // Touch end - complete drag operation
        card.addEventListener('touchend', (e) => {
            card.classList.remove('touch-active');
            
            if (!touchDragging || !ghostElement) {
                touchElement = null;
                return;
            }
            
            e.preventDefault();
            
            // Find final drop target
            const touch = e.changedTouches[0];
            const dropTarget = findTouchDropTarget(touch.clientX, touch.clientY);
            
            finishTouchDrag(dropTarget);
        }, { passive: false });
        
        // Touch cancel - abort drag operation
        card.addEventListener('touchcancel', () => {
            card.classList.remove('touch-active');
            
            if (touchDragging && ghostElement) {
                // Return to original position or reagent bank
                finishTouchDrag(null);
            }
            
            touchElement = null;
            touchDragging = false;
        });
    };
    
    /**
     * Start a touch drag operation
     * @param {Element} card - The card element being dragged
     * @param {boolean} cardInDropZone - Whether the card is already in a drop zone
     * @param {Object} cardDropZone - The drop zone the card is in (if any)
     */
    const startTouchDrag = (card, cardInDropZone, cardDropZone) => {
        touchDragging = true;
        
        // Create a ghost element for dragging
        ghostElement = card.cloneNode(true);
        ghostElement.classList.add('touch-ghost');
        ghostElement.style.position = 'fixed';
        ghostElement.style.zIndex = '1000';
        ghostElement.style.opacity = '0.8';
        ghostElement.style.pointerEvents = 'none'; // Don't interfere with touch events
        ghostElement.style.width = card.offsetWidth + 'px';
        ghostElement.style.height = card.offsetHeight + 'px';
        document.body.appendChild(ghostElement);
        
        // Position the ghost at the original element position
        moveGhostElement(originalPosition.x + touchOffsetX, originalPosition.y + touchOffsetY);
        
        // If this card was in a drop zone, remove it
        if (cardInDropZone && cardDropZone) {
            removeFromDropZone(cardDropZone);
        }
        
        // Hide the original element while dragging
        card.style.visibility = 'hidden';
        
        // Add dragging class for visual feedback
        card.classList.add('dragging');
        
        // Provide haptic feedback if available
        if (window.navigator.vibrate) {
            window.navigator.vibrate(50); // Short vibration for feedback
        }
    };
    
    /**
     * Move the ghost element during touch drag
     * @param {number} clientX - The X coordinate
     * @param {number} clientY - The Y coordinate
     */
    const moveGhostElement = (clientX, clientY) => {
        if (!ghostElement) return;
        
        ghostElement.style.left = (clientX - touchOffsetX) + 'px';
        ghostElement.style.top = (clientY - touchOffsetY) + 'px';
    };
    
    /**
     * Check for a potential drop target during touch drag
     * @param {number} clientX - The X coordinate
     * @param {number} clientY - The Y coordinate
     */
    const checkTouchDropTarget = (clientX, clientY) => {
        // Remove highlighting from all drop zones
        dropZones.forEach(zone => {
            zone.element.classList.remove('highlight');
        });
        
        // Find drop target under the current position
        const target = findTouchDropTarget(clientX, clientY);
        
        // Highlight valid drop target
        if (target) {
            target.element.classList.add('highlight');
        }
    };
    
    /**
     * Find a drop target at the specified coordinates
     * @param {number} clientX - The X coordinate
     * @param {number} clientY - The Y coordinate
     * @returns {Object|null} The drop zone object or null
     */
    const findTouchDropTarget = (clientX, clientY) => {
        for (const zone of dropZones) {
            const rect = zone.element.getBoundingClientRect();
            if (
                clientX >= rect.left && 
                clientX <= rect.right && 
                clientY >= rect.top && 
                clientY <= rect.bottom
            ) {
                return zone;
            }
        }
        return null;
    };
    
    /**
     * Finish a touch drag operation
     * @param {Object|null} dropTarget - The drop zone object or null
     */
    const finishTouchDrag = (dropTarget) => {
        if (!touchElement || !ghostElement) return;
        
        // Remove ghost element
        document.body.removeChild(ghostElement);
        ghostElement = null;
        
        // Remove dragging class
        touchElement.classList.remove('dragging');
        
        // Handle drop
        if (dropTarget) {
            // If there's already an element in the drop zone, return it to the bank
            if (dropTarget.content) {
                returnToBank(dropTarget.content.element);
            }
            
            // Add the dragged element to the drop zone
            addToDropZone(dropTarget, touchElement);
            
            // Provide haptic feedback if available
            if (window.navigator.vibrate) {
                window.navigator.vibrate([50, 50, 50]); // Success pattern
            }
        } else {
            // No valid drop target, return to bank
            returnToBank(touchElement);
        }
        
        // Reset state
        touchElement = null;
        touchDragging = false;
        
        // Remove highlights from all drop zones
        dropZones.forEach(zone => {
            zone.element.classList.remove('highlight');
        });
    };
    
    /**
     * Set up event listeners for drop zones
     */
    const setupDropZones = () => {
        dropZones.forEach(zone => {
            const element = zone.element;
            
            if (!isMobileDevice) {
                // Standard desktop drag-and-drop events
                setupDropZoneDesktopEvents(zone);
            }
            
            // We don't need specific touch events for drop zones
            // They're handled in the touch drag implementation
        });
    };
    
    /**
     * Set up desktop drag-and-drop events for drop zones
     * @param {Object} zone - The drop zone object
     */
    const setupDropZoneDesktopEvents = (zone) => {
        const element = zone.element;
        
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
    };
    
    /**
     * Add a reagent card to a drop zone
     * @param {Object} zone - The drop zone object
     * @param {Element} reagentCard - The reagent card element
     */
    const addToDropZone = (zone, reagentCard) => {
        // Create a clone to place in the drop zone
        const cardClone = reagentCard.cloneNode(true);
        cardClone.classList.add('reagent-in-dropzone');
        
        // Set up the clone differently based on device type
        if (!isMobileDevice) {
            // Desktop: make the clone draggable
            cardClone.setAttribute('draggable', 'true');
            
            // Add drag events to the clone
            setupCloneDragEvents(cardClone, zone, reagentCard);
        } else {
            // Mobile: add touch events to the clone
            setupCloneTouchEvents(cardClone, zone, reagentCard);
        }
        
        cardClone.setAttribute('data-original-id', reagentCard.getAttribute('data-id'));
        
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
        
        // Add ARIA attributes for accessibility
        zone.element.setAttribute('aria-dropeffect', 'move');
        cardClone.setAttribute('aria-grabbed', 'true');
    };
    
    /**
     * Set up touch events for a clone in a drop zone
     * @param {Element} clone - The clone element
     * @param {Object} zone - The drop zone object
     * @param {Element} original - The original reagent card
     */
    const setupCloneTouchEvents = (clone, zone, original) => {
        // Prevent default touch behavior
        clone.style.touchAction = 'none';
        
        // Prevent context menu on all elements
        clone.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Prevent selection on all child elements
        const allElements = clone.querySelectorAll('*');
        allElements.forEach(el => {
            el.style.webkitUserSelect = 'none';
            el.style.userSelect = 'none';
            el.style.webkitTouchCallout = 'none';
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        });
        
        // Touch start - simple tap to remove
        clone.addEventListener('touchstart', (e) => {
            if (!draggingEnabled) return;
            
            // Prevent default to avoid context menu
            e.preventDefault();
            
            // Add active class for visual feedback
            clone.classList.add('touch-active');
        }, { passive: false });
        
        // Touch end - remove on tap
        clone.addEventListener('touchend', (e) => {
            if (!draggingEnabled) return;
            
            e.preventDefault();
            clone.classList.remove('touch-active');
            
            // Get touch end position
            const touch = e.changedTouches[0];
            const rect = clone.getBoundingClientRect();
            
            // Check if touch ended within the element (tap, not drag)
            if (
                touch.clientX >= rect.left && 
                touch.clientX <= rect.right && 
                touch.clientY >= rect.top && 
                touch.clientY <= rect.bottom
            ) {
                // Remove from drop zone
                removeFromDropZone(zone);
                returnToBank(original);
                
                // Hide the next button if it's visible
                const nextBtn = document.getElementById('next-btn');
                if (nextBtn && !nextBtn.classList.contains('hidden')) {
                    nextBtn.classList.add('hidden');
                }
                
                // Provide haptic feedback if available
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(50);
                }
            }
        }, { passive: false });
        
        // Touch cancel
        clone.addEventListener('touchcancel', () => {
            clone.classList.remove('touch-active');
        });
    };
     
    /**
     * Set up drag events for a clone in a drop zone (desktop)
     * @param {Element} clone - The clone element in the drop zone
     * @param {Object} zone - The drop zone object
     * @param {Element} original - The original reagent card
     */
    const setupCloneDragEvents = (clone, zone, original) => {
        // Drag start
        clone.addEventListener('dragstart', (e) => {
            if (!draggingEnabled) return;
            
            currentDragElement = original;
            clone.classList.add('dragging');
            
            // Store reagent data in the drag event
            e.dataTransfer.setData('text/plain', original.getAttribute('data-id'));
            e.dataTransfer.effectAllowed = 'move';
            
            // Clear the drop zone immediately
            setTimeout(() => {
                removeFromDropZone(zone);
                returnToBank(original);
            }, 10);
        });
        
        // Drag end
        clone.addEventListener('dragend', () => {
            clone.classList.remove('dragging');
            currentDragElement = null;
        });
        
        // Click to clear (for desktop)
        clone.addEventListener('click', () => {
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
    
    /**
     * Remove a reagent from a drop zone
     * @param {Object} zone - The drop zone object
     */
    const removeFromDropZone = (zone) => {
        if (!zone.content) return;
        
        // Clear the drop zone
        while (zone.element.firstChild) {
            zone.element.removeChild(zone.element.firstChild);
        }
        
        // Add the placeholder back
        const placeholder = document.createElement('div');
        placeholder.className = 'drop-zone-placeholder';
        placeholder.textContent = '?';
        zone.element.appendChild(placeholder);
        
        zone.element.classList.remove('filled');
        
        // Reset ARIA attributes
        zone.element.removeAttribute('aria-dropeffect');
        
        zone.content = null;
    };
    
    /**
     * Return a reagent card to the reagent bank
     * @param {Element} reagentCard - The reagent card element
     */
    const returnToBank = (reagentCard) => {
        // Check if the reagent card still exists in the DOM
        if (!reagentCard || !document.body.contains(reagentCard)) {
            // The original card is no longer in the DOM (likely from a previous question)
            // Try to find a card with the same ID in the current question
            const dataId = reagentCard ? reagentCard.getAttribute('data-id') : null;
            if (dataId) {
                const newCard = document.querySelector(`.reagent-card[data-id="${dataId}"]`);
                if (newCard) {
                    newCard.style.visibility = 'visible';
                    return;
                }
            }
            
            // If we couldn't find a matching card, refresh all cards to be safe
            document.querySelectorAll('.reagent-card').forEach(card => {
                card.style.visibility = 'visible';
            });
            return;
        }
        
        // Make the original card visible again
        reagentCard.style.visibility = 'visible';
        
        // Reset ARIA attributes
        reagentCard.setAttribute('aria-grabbed', 'false');
    };

    /**
     * Get the content of a specific drop zone
     * @param {number} zoneNumber - The zone number (1 or 2)
     * @returns {Object|null} The drop zone content or null if empty
     */
    const getDropZoneContent = (zoneNumber) => {
        const zone = dropZones.find(z => z.zone === zoneNumber);
        return zone ? zone.content : null;
    };
    
    /**
     * Clear all drop zones
     */
    const clearDropZones = () => {
        dropZones.forEach(zone => {
            if (zone.content) {
                const reagentCard = zone.content.element;
                removeFromDropZone(zone);
                returnToBank(reagentCard);
            }
        });
    };

    /**
     * Enable or disable dragging functionality
     * @param {boolean} enabled - Whether dragging should be enabled
     */
    const setDraggingEnabled = (enabled) => {
        draggingEnabled = enabled;
        
        reagentCards.forEach(card => {
            if (enabled) {
                if (!isMobileDevice) {
                    card.setAttribute('draggable', 'true');
                }
                card.classList.remove('disabled');
                card.setAttribute('aria-grabbed', 'false');
            } else {
                if (!isMobileDevice) {
                    card.setAttribute('draggable', 'false');
                }
                card.classList.add('disabled');
                card.removeAttribute('aria-grabbed');
            }
        });
    };
    
    // Public API
    return {
        initialize,
        setDraggingEnabled,
        getDropZoneContent,
        clearDropZones,
        removeFromDropZone,
        returnToBank
    };
})();
```

### 2. Update file: `css/styles.css`
Add custom styles for touch drag-and-drop handling and the ghost element.

```css
/* Custom Touch Drag-and-Drop Styling */

/* Prevent text selection and context menus on draggable elements */
.reagent-card, 
.reagent-card * {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
}

/* Disable all default touch actions on draggable elements */
.reagent-card, 
.reagent-card img {
    touch-action: none;
    -webkit-touch-callout: none;
}

/* Style for the ghost element during touch drag */
.touch-ghost {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    transform: scale(1.05);
    transition: transform 0.1s ease;
    border: 2px solid var(--primary-color);
}

/* Visual feedback for active touch */
.touch-active {
    transform: scale(1.05);
    border-color: var(--primary-color);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Enhance touch targets for mobile */
@media (max-width: 768px) {
    .reagent-card, 
    .drop-zone, 
    .product-container {
        width: 110px; /* Larger for better touch target */
        height: 110px;
    }
    
    .btn {
        padding: 12px 24px; /* Larger touch target for buttons */
        min-height: 44px; /* Minimum recommended touch target height */
    }
    
    /* More spacing between reagent cards */
    .reagent-bank {
        gap: 18px;
    }
    
    /* Enhance drop zone visual feedback */
    .drop-zone.highlight {
        background-color: rgba(67, 97, 238, 0.3);
        border-color: var(--primary-color);
        border-width: 3px;
        box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.2);
    }
}

/* Animation for elements when they're dropped into a drop zone */
.reagent-in-dropzone {
    animation: drop-in 0.2s ease-out;
}

@keyframes drop-in {
    from {
        opacity: 0.7;
        transform: scale(1.1);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Prevent scrolling during touch drag operations */
body.touch-dragging {
    overflow: hidden;
    touch-action: none;
}

/* Additional visual enhancements for dragging feedback */
.dragging {
    opacity: 0.8;
}

/* Loading indicator for devices where touch might be slow */
.loading-indicator {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 2000;
}

.loading-indicator.show {
    display: block;
}
```

### 3. Update file: `js/app.js`
Add a few enhancements to the main application to support the custom touch implementation.

```javascript
/**
 * Add to the DOMContentLoaded event handler
 */
document.addEventListener('DOMContentLoaded', () => {
    // Prevent page scrolling during touch drag operations
    document.addEventListener('touchmove', function(e) {
        const body = document.body;
        if (body.classList.contains('touch-dragging')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent zoom/scaling during interaction with the quiz
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault(); // Prevent pinch zoom
        }
    }, { passive: false });
    
    // Test for touch capability
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    // Add appropriate classes to body for CSS targeting
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
    
    // Initialize the quiz
    initializeQuiz();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Modify the handleSubmit function to disable touch events when answer is correct
 */
function handleSubmit() {
    // Original code...
    
    if (isCorrect) {
        showFeedback(QuizEngine.getCurrentQuestion().correctFeedback, 'success');
        document.getElementById('score').textContent = QuizEngine.getScore();
        document.getElementById('next-btn').classList.remove('hidden');
        
        // Disable dragging after correct submission
        DragDrop.setDraggingEnabled(false);
        
        // Also disable the reset button after correct answer
        const resetButton = document.getElementById('reset-btn');
        resetButton.disabled = true;
        resetButton.classList.add('disabled');
        
        // Provide haptic feedback on supported devices
        if (window.navigator.vibrate) {
            window.navigator.vibrate([100, 50, 100]); // Success pattern
        }
    } else {
        // Original code...
    }
}

/**
 * In the resetQuestionUI function, make sure to enable reset button again
 */
function resetQuestionUI() {
    // Clear drop zones
    DragDrop.clearDropZones();
    
    // Hide feedback and next button
    document.getElementById('feedback-container').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    
    // Re-enable reset button
    const resetButton = document.getElementById('reset-btn');
    resetButton.disabled = false;
    resetButton.classList.remove('disabled');
}
```

### 4. Update file: `index.html`
Make minor adjustments to support the custom touch implementation.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Organic Chemistry Quiz Game</title>
    
    <!-- Existing CSS -->
    <link rel="stylesheet" href="css/styles.css">
    <!-- Add a modern CSS reset -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/2.0.0/modern-normalize.min.css">
    <!-- Add a font from Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Add a loading indicator for slower devices -->
    <div class="loading-indicator" id="loading-indicator">Loading...</div>

    <!-- Existing HTML content -->
    
    <!-- Scripts -->
    <script src="js/drag-drop.js"></script>
    <script src="js/quiz-engine.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

## Testing Criteria

### Devices to Test
- **iOS**: iPhone (latest models), iPad (latest models)
- **iOS Browsers**: Safari, Chrome, Firefox
- **Android**: Current flagship phones, mid-range devices, Samsung devices
- **Android Browsers**: Chrome, Firefox, Samsung Internet
- **Screen Sizes**: Both phone and tablet form factors
- **Orientations**: Portrait and landscape

### Test Scenarios
1. **Basic Touch Operations**:
   - Long press on molecule to start drag
   - Drag molecule from reagent bank to drop zone
   - Tap molecule in drop zone to remove it
   - Test rapid taps and drags

2. **SVG-Specific Testing**:
   - Verify no context menu appears on long press of SVG images
   - Test with different molecule SVGs of varying complexity
   - Verify that the molecule images move with the touch point correctly

3. **Edge Cases**:
   - Test with slow network conditions or CPU throttling
   - Test with rapid question cycling
   - Test after device orientation changes
   - Test with multi-touch gestures (should be prevented)

4. **Accessibility Testing**:
   - Test with VoiceOver (iOS)
   - Test with TalkBack (Android)
   - Test keyboard navigation on desktop

5. **Cross-Device Testing**:
   - Verify the experience is consistent between desktop and mobile
   - Check that mouse events still work properly on desktop
   - Verify that both drag and tap interactions work correctly

## Dependencies
None (this implementation removes external dependencies)

## Performance Considerations
1. **Animation Performance**: Monitor performance of ghost element animations, especially on lower-end devices.
2. **Touch Event Handling**: Be aware that certain devices may have varying touch event latencies.
3. **Memory Usage**: Clear ghost elements properly to avoid memory leaks.
4. **Render Performance**: Use CSS transitions instead of JavaScript animations when possible for better performance.
5. **Event Delegation**: Consider implementing event delegation for large numbers of draggable elements.

## Additional Notes
1. **Context Menu Prevention**: The key focus of this implementation is to ensure context menus do not appear on SVG elements during long press, which was the primary issue with the previous approach.

2. **Browser Quirks**: Some browsers may still exhibit quirky behavior with touch events. The implementation is designed to handle the most common cases, but edge cases may require adjustments.

3. **Custom Cursors**: Consider adding custom cursors for desktop drag-and-drop to match the mobile experience.

4. **Progressive Enhancement**: This approach follows a progressive enhancement strategy, providing the best experience available to each user based on their device capabilities.

5. **Testing Importance**: Thorough testing on actual devices is crucial, as browser emulation may not accurately represent all touch behaviors.

## Resources
- [MDN Touch Events Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [W3C Touch Events Specification](https://w3c.github.io/touch-events/)
- [Google Web Fundamentals: Touch Input](https://developers.google.com/web/fundamentals/design-and-ux/input/touch)
- [CSS-Tricks Guide to Touch Events](https://css-tricks.com/snippets/javascript/bind-different-events-for-touch-and-mouse/)
- [WebKit Touch Events Handling](https://webkit.org/blog/5610/more-responsive-tapping-on-ios/)
