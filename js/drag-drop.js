/**
 * Drag and Drop Handler
 * Manages the drag and drop functionality for the quiz
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
     */
    const setupReagentCards = () => {
        // Get all reagent cards
        reagentCards = document.querySelectorAll('.reagent-card');
        
        reagentCards.forEach(card => {
            if (!isMobileDevice) {
                setupDragEvents(card);
            } else {
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
            }, 150);
            
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
                finishTouchDrag(null);
            }
            
            touchElement = null;
            touchDragging = false;
        });
    };
    
    /**
     * Start a touch drag operation
     */
    const startTouchDrag = (card, cardInDropZone, cardDropZone) => {
        touchDragging = true;
        document.body.classList.add('touch-dragging');
        
        // Create a ghost element for dragging
        ghostElement = card.cloneNode(true);
        ghostElement.classList.add('touch-ghost');
        ghostElement.style.position = 'fixed';
        ghostElement.style.zIndex = '1000';
        ghostElement.style.opacity = '0.8';
        ghostElement.style.pointerEvents = 'none';
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
            window.navigator.vibrate(50);
        }
    };
    
    /**
     * Move the ghost element during touch drag
     */
    const moveGhostElement = (clientX, clientY) => {
        if (!ghostElement) return;
        
        ghostElement.style.left = (clientX - touchOffsetX) + 'px';
        ghostElement.style.top = (clientY - touchOffsetY) + 'px';
    };
    
    /**
     * Check for a potential drop target during touch drag
     */
    const checkTouchDropTarget = (clientX, clientY) => {
        dropZones.forEach(zone => {
            zone.element.classList.remove('highlight');
        });
        
        const target = findTouchDropTarget(clientX, clientY);
        if (target) {
            target.element.classList.add('highlight');
        }
    };
    
    /**
     * Find a drop target at the specified coordinates
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
     */
    const finishTouchDrag = (dropTarget) => {
        if (!touchElement || !ghostElement) return;
        
        document.body.classList.remove('touch-dragging');
        
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
                window.navigator.vibrate([50, 50, 50]);
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
                setupDropZoneDesktopEvents(zone);
            }
        });
    };
    
    /**
     * Set up desktop drag-and-drop events for drop zones
     */
    const setupDropZoneDesktopEvents = (zone) => {
        const element = zone.element;
        
        element.addEventListener('dragover', (e) => {
            if (!draggingEnabled) return;
            
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            element.classList.add('highlight');
        });
        
        element.addEventListener('dragenter', (e) => {
            if (!draggingEnabled) return;
            
            e.preventDefault();
            element.classList.add('highlight');
        });
        
        element.addEventListener('dragleave', () => {
            element.classList.remove('highlight');
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('highlight');
            
            if (!draggingEnabled) return;
            
            const reagentId = e.dataTransfer.getData('text/plain');
            const reagentCard = document.querySelector(`.reagent-card[data-id="${reagentId}"]`);
            
            if (!reagentCard) return;
            
            if (zone.content) {
                returnToBank(zone.content.element);
            }
            
            addToDropZone(zone, reagentCard);
        });
    };
    
    /**
     * Add a reagent card to a drop zone
     */
    const addToDropZone = (zone, reagentCard) => {
        const cardClone = reagentCard.cloneNode(true);
        cardClone.classList.add('reagent-in-dropzone');
        
        if (!isMobileDevice) {
            cardClone.setAttribute('draggable', 'true');
            setupCloneDragEvents(cardClone, zone, reagentCard);
        } else {
            setupCloneTouchEvents(cardClone, zone, reagentCard);
        }
        
        cardClone.setAttribute('data-original-id', reagentCard.getAttribute('data-id'));
        
        while (zone.element.firstChild) {
            zone.element.removeChild(zone.element.firstChild);
        }
        
        zone.element.appendChild(cardClone);
        zone.element.classList.add('filled');
        
        reagentCard.style.visibility = 'hidden';
        
        zone.content = {
            element: reagentCard,
            clone: cardClone,
            id: reagentCard.getAttribute('data-id'),
            name: reagentCard.getAttribute('data-name')
        };
        
        zone.element.setAttribute('aria-dropeffect', 'move');
        cardClone.setAttribute('aria-grabbed', 'true');
    };
    
    /**
     * Set up touch events for a clone in a drop zone
     */
    const setupCloneTouchEvents = (clone, zone, original) => {
        clone.style.touchAction = 'none';
        
        clone.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
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
        
        clone.addEventListener('touchstart', (e) => {
            if (!draggingEnabled) return;
            e.preventDefault();
            clone.classList.add('touch-active');
        }, { passive: false });
        
        clone.addEventListener('touchend', (e) => {
            if (!draggingEnabled) return;
            
            e.preventDefault();
            clone.classList.remove('touch-active');
            
            const touch = e.changedTouches[0];
            const rect = clone.getBoundingClientRect();
            
            if (
                touch.clientX >= rect.left && 
                touch.clientX <= rect.right && 
                touch.clientY >= rect.top && 
                touch.clientY <= rect.bottom
            ) {
                removeFromDropZone(zone);
                returnToBank(original);
                
                const nextBtn = document.getElementById('next-btn');
                if (nextBtn && !nextBtn.classList.contains('hidden')) {
                    nextBtn.classList.add('hidden');
                }
                
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(50);
                }
            }
        }, { passive: false });
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
     * Set up drag events for the clone in a drop zone
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
        
        // Click to clear
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
