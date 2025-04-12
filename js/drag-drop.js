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
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    
    // Track touch dragging state
    let isDragging = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let elementStartX = 0;
    let elementStartY = 0;

    // Safely play a sound with error handling
    const playSoundSafely = (soundName) => {
        if (typeof AudioManager !== 'undefined' && typeof AudioManager.play === 'function') {
            try {
                AudioManager.play(soundName);
            } catch (err) {
                console.warn(`Error playing sound ${soundName}:`, err);
            }
        }
    };

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
            // Store original position for later use with Hammer.js
            const rect = card.getBoundingClientRect();
            card.setAttribute('data-original-x', rect.left);
            card.setAttribute('data-original-y', rect.top);
            
            if (isTouchDevice) {
                setupTouchEvents(card);
            } else {
                setupMouseEvents(card);
            }
        });
    };
    
    /**
     * Set up standard mouse drag events
     */
    const setupMouseEvents = (card) => {
        // Drag start
        card.addEventListener('dragstart', (e) => {
            if (!draggingEnabled) return;
            
            currentDragElement = card;
            card.classList.add('dragging');
            
            // Play pickup sound
            playSoundSafely('pickup');
            
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
        
        hammer.on('panstart', (e) => {
            if (!draggingEnabled) return;
            
            isDragging = true;
            currentDragElement = card;
            
            // Save start positions
            const rect = card.getBoundingClientRect();
            elementStartX = rect.left;
            elementStartY = rect.top;
            touchStartX = e.center.x;
            touchStartY = e.center.y;
            
            // Add visual feedback
            card.classList.add('touch-dragging');
            
            // Play pickup sound
            playSoundSafely('pickup');
            
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
            if (!draggingEnabled || !isDragging) return;
            
            // Calculate new position
            const deltaX = e.center.x - touchStartX;
            const deltaY = e.center.y - touchStartY;
            
            // Move the element
            card.style.position = 'fixed';
            card.style.zIndex = '1000';
            card.style.left = `${elementStartX + deltaX}px`;
            card.style.top = `${elementStartY + deltaY}px`;
            
            // Check for drop zones under the touch point
            const elementsAtPoint = document.elementsFromPoint(e.center.x, e.center.y);
            dropZones.forEach(zone => {
                if (elementsAtPoint.includes(zone.element)) {
                    zone.element.classList.add('touch-highlight');
                } else {
                    zone.element.classList.remove('touch-highlight');
                }
            });
            
            // Prevent scrolling while dragging
            e.srcEvent.preventDefault();
        });
        
        hammer.on('panend', (e) => {
            if (!draggingEnabled || !isDragging) return;
            
            isDragging = false;
            
            // Find drop zone at release point
            const elementsAtPoint = document.elementsFromPoint(e.center.x, e.center.y);
            let foundDropZone = null;
            
            // Check if we're over a drop zone
            for (const el of elementsAtPoint) {
                if (el.classList.contains('drop-zone')) {
                    const zoneNumber = parseInt(el.getAttribute('data-zone'), 10);
                    foundDropZone = dropZones.find(z => z.zone === zoneNumber);
                    break;
                }
            }
            
            // Remove highlighting from all drop zones
            dropZones.forEach(zone => {
                zone.element.classList.remove('touch-highlight');
            });
            
            // Reset card styles
            card.classList.remove('touch-dragging');
            card.style.position = '';
            card.style.zIndex = '';
            
            if (foundDropZone) {
                // Add to drop zone (sound will be played by addToDropZone)
                addToDropZone(foundDropZone, card);
            } else {
                // Return to original position with smooth transition
                card.style.transition = 'all 0.3s ease';
                card.style.left = '';
                card.style.top = '';
                
                // Remove transition after animation
                setTimeout(() => {
                    card.style.transition = '';
                }, 300);
            }
            
            currentDragElement = null;
        });
        
        // Store Hammer instance for cleanup
        card.hammerInstance = hammer;
    };

    /**
     * Set up touch events for the clone in a drop zone
     */
    const setupCloneTouchEvents = (clone, zone, original) => {
        if (isTouchDevice) {
            const hammer = new Hammer(clone);
            hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
            hammer.get('tap').set({ enable: true });
            
            // Tap to remove (keep existing functionality)
            hammer.on('tap', () => {
                if (!draggingEnabled) return;
                
                playSoundSafely('pickup');
                removeFromDropZone(zone);
                returnToBank(original);
                
                const nextBtn = document.getElementById('next-btn');
                if (nextBtn && !nextBtn.classList.contains('hidden')) {
                    nextBtn.classList.add('hidden');
                }
            });
            
            // NEW: Add pan handlers to enable dragging out of drop zones
            hammer.on('panstart', (e) => {
                if (!draggingEnabled) return;
                
                isDragging = true;
                currentDragElement = original;
                
                // Save start positions
                const rect = clone.getBoundingClientRect();
                elementStartX = rect.left;
                elementStartY = rect.top;
                touchStartX = e.center.x;
                touchStartY = e.center.y;
                
                // Add visual feedback
                clone.classList.add('touch-dragging');
                
                // Play pickup sound
                playSoundSafely('pickup');
                
                // Clear the drop zone immediately
                removeFromDropZone(zone);
                
                // Make original visible and positioned correctly for dragging
                original.style.visibility = 'visible';
                original.style.position = 'fixed';
                original.style.zIndex = '1000';
                original.style.left = `${elementStartX}px`;
                original.style.top = `${elementStartY}px`;
                original.classList.add('touch-dragging');
                
                // Prevent default behavior
                e.srcEvent.preventDefault();
            });

            hammer.on('pan', (e) => {
                if (!draggingEnabled || !isDragging) return;
                
                // Calculate new position
                const deltaX = e.center.x - touchStartX;
                const deltaY = e.center.y - touchStartY;
                
                // Move the original element
                original.style.left = `${elementStartX + deltaX}px`;
                original.style.top = `${elementStartY + deltaY}px`;
                
                // Check for drop zones under the touch point
                const elementsAtPoint = document.elementsFromPoint(e.center.x, e.center.y);
                dropZones.forEach(zone => {
                    if (elementsAtPoint.includes(zone.element)) {
                        zone.element.classList.add('touch-highlight');
                    } else {
                        zone.element.classList.remove('touch-highlight');
                    }
                });
                
                // Prevent scrolling while dragging
                e.srcEvent.preventDefault();
            });

            hammer.on('panend', (e) => {
                if (!draggingEnabled || !isDragging) return;
                
                isDragging = false;
                
                // Find drop zone at release point
                const elementsAtPoint = document.elementsFromPoint(e.center.x, e.center.y);
                let foundDropZone = null;
                
                // Check if we're over a drop zone
                for (const el of elementsAtPoint) {
                    if (el.classList.contains('drop-zone')) {
                        const zoneNumber = parseInt(el.getAttribute('data-zone'), 10);
                        foundDropZone = dropZones.find(z => z.zone === zoneNumber);
                        break;
                    }
                }
                
                // Remove highlighting from all drop zones
                dropZones.forEach(zone => {
                    zone.element.classList.remove('touch-highlight');
                });
                
                // Reset original element styles
                original.classList.remove('touch-dragging');
                
                if (foundDropZone) {
                    // Add to drop zone (sound will be played by addToDropZone)
                    addToDropZone(foundDropZone, original);
                } else {
                    // Return to bank with smooth transition
                    original.style.transition = 'all 0.3s ease';
                    original.style.position = '';
                    original.style.zIndex = '';
                    original.style.left = '';
                    original.style.top = '';
                    original.style.visibility = 'visible';
                    
                    // Remove transition after animation
                    setTimeout(() => {
                        original.style.transition = '';
                    }, 300);
                }
                
                currentDragElement = null;
            });
            
            // Store hammer instance for cleanup
            clone.hammerInstance = hammer;
        } else {
            setupCloneDragEvents(clone, zone, original);
        }
    };

    /**
     * Set up event listeners for drop zones
     */
    const setupDropZones = () => {
        dropZones.forEach(zone => {
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
        
        // Make the clone draggable for desktop
        cardClone.setAttribute('draggable', !isTouchDevice);
        
        // Enhanced element tracking
        const reagentId = reagentCard.getAttribute('data-id');
        cardClone.setAttribute('data-original-id', reagentId);
        cardClone.setAttribute('data-is-clone', 'true');
        
        // Add appropriate events to the clone
        setupCloneTouchEvents(cardClone, zone, reagentCard);
        
        // Check if another reagent is already in this drop zone
        if (zone.content) {
            // Return the current reagent to the bank
            returnToBank(zone.content.originalElement);
        }
        
        // Clear the drop zone
        while (zone.element.firstChild) {
            zone.element.removeChild(zone.element.firstChild);
        }
        
        // Play drop sound
        playSoundSafely('drop');
        
        // Add the clone to the drop zone
        zone.element.appendChild(cardClone);
        zone.element.classList.add('filled');
        
        // Enhanced content tracking
        zone.content = {
            element: cardClone,
            originalElement: reagentCard,
            reagentId: reagentId,
            originalId: reagentId // Ensure this is consistent
        };
        
        // Hide the original card
        reagentCard.style.visibility = 'hidden';
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
        // Handle the case where reagentCard is null or undefined
        if (!reagentCard) {
            console.warn('Attempted to return null reagent card to bank');
            return;
        }
        
        // Get the reagent ID to find the original card
        const dataId = reagentCard.getAttribute('data-id') || 
                      reagentCard.getAttribute('data-original-id');
        
        if (!dataId) {
            console.warn('Could not find data-id or data-original-id for reagent card');
            return;
        }
        
        // Find the original card in the reagent bank
        const originalCard = document.querySelector(`.reagent-card[data-id="${dataId}"]:not([data-is-clone])`);
        
        if (originalCard) {
            // Reset any transformations or positioning
            originalCard.style.transition = '';
            originalCard.style.position = '';
            originalCard.style.zIndex = '';
            originalCard.style.left = '';
            originalCard.style.top = '';
            originalCard.style.transform = '';
            
            // Make the original card visible
            originalCard.style.visibility = 'visible';
            
            // Ensure no dragging classes remain
            originalCard.classList.remove('touch-dragging', 'dragging');
        } else {
            console.warn(`Could not find original card with data-id="${dataId}"`);
            
            // Fallback: Make all reagent cards visible
            document.querySelectorAll('.reagent-card:not([data-is-clone])').forEach(card => {
                card.style.visibility = 'visible';
            });
        }
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
                if (!isTouchDevice) {
                    card.setAttribute('draggable', 'true');
                }
                card.classList.remove('disabled');
                if (card.hammerInstance) {
                    card.hammerInstance.set({ enable: true });
                }
            } else {
                if (!isTouchDevice) {
                    card.setAttribute('draggable', 'false');
                }
                card.classList.add('disabled');
                if (card.hammerInstance) {
                    card.hammerInstance.set({ enable: false });
                }
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
