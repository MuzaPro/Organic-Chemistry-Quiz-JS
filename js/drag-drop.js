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
            
            // Click to clear
            element.addEventListener('click', () => {
                if (!draggingEnabled) return;
                
                if (zone.content) {
                    const reagentCard = zone.content.element;
                    removeFromDropZone(zone);
                    returnToBank(reagentCard);
                }
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
        cardClone.setAttribute('draggable', 'false');
        
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
        reagentCard.style.visibility = 'visible';
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
    
    // Public API
    return {
        initialize,
        setDraggingEnabled,
        getDropZoneContent,
        clearDropZones
    };
})();
