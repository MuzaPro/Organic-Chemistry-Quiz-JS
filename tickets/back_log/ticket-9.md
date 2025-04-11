# Ticket #9: Resolve Mobile Drop Zone Bug

## Description
On mobile devices, there is a critical bug where molecules cannot be dragged out of drop zones and molecules disappear when another molecule is placed in the same drop zone. This severely impacts mobile usability and forces users to rely on the reset button to continue.

## Priority
**Must Have** - Critical mobile usability issue

## Tasks
1. Investigate the issue in `drag-drop.js`, focusing on the Hammer.js implementation
2. Fix the touch event handling to allow molecules to be removed from drop zones
3. Ensure molecules properly return to the reagent bank when removed or replaced
4. Maintain proper cleanup of event listeners to prevent memory leaks
5. Test thoroughly on multiple mobile devices

## Acceptance Criteria
- [ ] Users can drag molecules out of drop zones on mobile devices
- [ ] When replacing a molecule in a drop zone, the original molecule returns to the reagent bank
- [ ] No molecules disappear during drag and drop operations
- [ ] Drag and drop functionality works consistently across desktop and mobile devices
- [ ] Performance remains smooth on mobile devices

## Implementation Notes
The issue appears to be in the touch event handling using Hammer.js. Focus on:

1. The `setupTouchEvents` function in `drag-drop.js`
2. The event handling for `panend` events
3. The `removeFromDropZone` function
4. The `returnToBank` function

Possible solution approach:
```javascript
// In the panend handler for Hammer.js, ensure proper cleanup:
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
    
    if (foundDropZone) {
        // Check if this drop zone already has content
        if (foundDropZone.content) {
            // Return the existing molecule to the bank
            returnToBank(foundDropZone.content.element);
        }
        
        // Add the new molecule to the drop zone
        addToDropZone(foundDropZone, card);
    } else {
        // Ensure the card is visible and properly positioned
        card.style.position = '';
        card.style.zIndex = '';
        card.style.left = '';
        card.style.top = '';
        card.style.transform = '';
        
        // If we were in a drop zone before, make sure we're visible
        card.style.visibility = 'visible';
    }
    
    currentDragElement = null;
});
```

## Testing Steps
1. Test on Android devices with Chrome
2. Test on iOS devices with Safari
3. Verify molecules can be:
   - Dragged from the reagent bank to drop zones
   - Dragged from one drop zone to another
   - Dragged from a drop zone back to the bank
4. Confirm molecules don't disappear during these operations
5. Test rapid interactions to ensure stability

## Related Files
- `js/drag-drop.js` - Main drag and drop functionality

## Estimated Effort
Medium (1-2 days)
