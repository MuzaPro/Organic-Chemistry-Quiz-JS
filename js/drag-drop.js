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
        });
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
        
        // Make the clone draggable
        cardClone.setAttribute('draggable', 'true');
        cardClone.setAttribute('data-original-id', reagentCard.getAttribute('data-id'));
        
        // Add drag events to the clone
        setupCloneDragEvents(cardClone, zone, reagentCard);
        
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
                card.setAttribute('draggable', 'true');
                card.classList.remove('disabled');
            } else {
                card.setAttribute('draggable', 'false');
                card.classList.add('disabled');
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
