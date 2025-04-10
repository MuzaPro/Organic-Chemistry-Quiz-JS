/**
 * SVG Touch Handler for Organic Chemistry Quiz
 * Implements Pointer Events API for cross-device SVG drag and drop
 */

const SVGTouchHandler = (() => {
    // Private variables
    let draggingEnabled = true;
    let activePointer = null;
    let selectedElement = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let dragClone = null;
    let dropZones = [];
    let currentDropZone = null;
    
    const initialize = () => {
        dropZones = Array.from(document.querySelectorAll('.drop-zone')).map(element => ({
            element,
            zone: parseInt(element.getAttribute('data-zone')),
            rect: element.getBoundingClientRect()
        }));
        
        setupReagentPointerEvents();
        window.addEventListener('resize', updateDropZonePositions);
        addPointerEventStyles();
    };
    
    const setupReagentPointerEvents = () => {
        const reagentBank = document.getElementById('reagent-bank');
        reagentBank.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointercancel', handlePointerCancel);
    };
    
    const updateDropZonePositions = () => {
        dropZones.forEach(zone => {
            zone.rect = zone.element.getBoundingClientRect();
        });
    };
    
    const addPointerEventStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .reagent-card {
                touch-action: none;
                user-select: none;
            }
            
            .svg-drag-clone {
                position: absolute;
                pointer-events: none;
                z-index: 9999;
                opacity: 0.8;
                transition: transform 0.05s linear;
            }
            
            .dragging {
                visibility: hidden !important;
            }
            
            .reagent-card svg {
                pointer-events: auto;
            }
            
            .reagent-card svg * {
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    };
    
    const handlePointerDown = (event) => {
        if (!draggingEnabled) return;
        if (activePointer !== null) return;
        
        const reagentCard = event.target.closest('.reagent-card');
        if (!reagentCard) return;
        
        activePointer = event.pointerId;
        selectedElement = reagentCard;
        
        const rect = reagentCard.getBoundingClientRect();
        dragOffsetX = event.clientX - rect.left;
        dragOffsetY = event.clientY - rect.top;
        
        createDragClone(reagentCard, event.clientX, event.clientY);
        reagentCard.setPointerCapture(event.pointerId);
        reagentCard.classList.add('dragging');
        
        DragDrop.dropZones.forEach(zone => {
            if (zone.content && zone.content.element === reagentCard) {
                DragDrop.removeFromDropZone(zone);
            }
        });
        
        event.preventDefault();
    };
    
    const handlePointerMove = (event) => {
        if (activePointer !== event.pointerId || !selectedElement || !dragClone) return;
        
        const x = event.clientX - dragOffsetX;
        const y = event.clientY - dragOffsetY;
        
        dragClone.style.left = `${x}px`;
        dragClone.style.top = `${y}px`;
        
        const newDropZone = findDropZoneAt(event.clientX, event.clientY);
        
        if (newDropZone !== currentDropZone) {
            if (currentDropZone) {
                currentDropZone.element.classList.remove('highlight');
            }
            
            if (newDropZone) {
                newDropZone.element.classList.add('highlight');
            }
            
            currentDropZone = newDropZone;
        }
        
        event.preventDefault();
    };
    
    const handlePointerUp = (event) => {
        if (activePointer !== event.pointerId) return;
        finishDrag();
        event.preventDefault();
    };
    
    const handlePointerCancel = (event) => {
        if (activePointer !== event.pointerId) return;
        
        if (selectedElement) {
            selectedElement.classList.remove('dragging');
            selectedElement = null;
        }
        
        if (dragClone && dragClone.parentNode) {
            dragClone.parentNode.removeChild(dragClone);
            dragClone = null;
        }
        
        if (currentDropZone) {
            currentDropZone.element.classList.remove('highlight');
            currentDropZone = null;
        }
        
        activePointer = null;
    };
    
    const createDragClone = (element, clientX, clientY) => {
        dragClone = element.cloneNode(true);
        dragClone.classList.add('svg-drag-clone');
        
        dragClone.style.left = `${clientX - dragOffsetX}px`;
        dragClone.style.top = `${clientY - dragOffsetY}px`;
        
        const rect = element.getBoundingClientRect();
        dragClone.style.width = `${rect.width}px`;
        dragClone.style.height = `${rect.height}px`;
        
        document.body.appendChild(dragClone);
    };
    
    const findDropZoneAt = (x, y) => {
        for (const zone of dropZones) {
            const rect = zone.rect;
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return zone;
            }
        }
        return null;
    };
    
    const finishDrag = () => {
        if (!selectedElement || !dragClone) return;
        
        try {
            if (currentDropZone) {
                const dropZoneId = currentDropZone.zone;
                const targetZone = DragDrop.dropZones.find(z => z.zone === dropZoneId);
                
                if (targetZone) {
                    if (targetZone.content) {
                        DragDrop.returnToBank(targetZone.content.element);
                    }
                    DragDrop.addToDropZone(targetZone, selectedElement);
                }
                
                currentDropZone.element.classList.remove('highlight');
            } else {
                selectedElement.classList.remove('dragging');
                selectedElement.style.visibility = 'visible';
            }
        } finally {
            if (dragClone && dragClone.parentNode) {
                dragClone.parentNode.removeChild(dragClone);
                dragClone = null;
            }
            
            activePointer = null;
            selectedElement = null;
            currentDropZone = null;
        }
    };
    
    const setDraggingEnabled = (enabled) => {
        draggingEnabled = enabled;
    };
    
    return {
        initialize,
        setDraggingEnabled,
        updateDropZonePositions
    };
})();