# Ticket #33: Fix Text Selection and Drag-and-Drop Interference

**STATUS: OPEN**  
**Priority:** High  
**Type:** Bug Fix  
**Estimate:** 2 hours  
**Assigned to:** Unassigned  
**Related Ticket:** #30 (Research Investigation)

## Description
Implement fixes for the text selection interference with drag-and-drop operations identified in Ticket #30's investigation. When desktop users accidentally select text on UI elements and then attempt to drag molecules, multiple undesirable behaviors occur including multi-molecule dragging, molecules getting stuck, or the quiz becoming unusable.

## Background
Investigation in Ticket #30 identified that:
- The issue occurs across all desktop browsers
- It happens when text is selected before attempting a drag operation
- Mobile devices aren't affected due to separate touch event handling
- The root cause is conflicting event models between text selection and HTML5 drag-and-drop

## Implementation Requirements
Based on the research findings, implement a combined approach:

1. **Prevent text selection on UI controls and interactive elements** using CSS
2. **Maintain text selection ability on informational content** (question text, chemistry notes)
3. **Add selection clearing code to dragstart event handlers**

## Implementation Details

### 1. Add CSS to Prevent Text Selection on Interactive Elements
Add the following to `styles.css`:

```css
/* Prevent text selection on interactive UI elements */
.btn, 
.operator, 
.reaction-arrow, 
.reagent-card, 
.reagent-in-dropzone, 
.drop-zone, 
.drop-zone-placeholder,
.action-buttons,
.footer-controls,
.progress-container,
#submit-btn,
#reset-btn,
#next-btn,
#chem-notes-btn,
#mute-btn,
#theme-toggle,
.modal .close-modal {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: default; /* Use default cursor for non-selectable text */
}

/* Use pointer cursor for interactive elements */
.btn, 
.reagent-card, 
.close-modal, 
#mute-btn, 
#theme-toggle {
    cursor: pointer;
}
```

### 2. Allow Selection on Content Elements
Ensure informational content remains selectable:

```css
/* Explicitly allow selection on informational content */
#question-text,
.feedback,
#notes-content,
.molecule-text {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
}
```

### 3. Add Selection Clearing to Drag Start Event Handler
Modify the `setupMouseEvents` function in `drag-drop.js`:

```javascript
const setupMouseEvents = (card) => {
    // Drag start
    card.addEventListener('dragstart', (e) => {
        if (!draggingEnabled) return;
        
        // Clear any text selection before starting drag
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
        
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
    
    // Drag end - existing code
    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        currentDragElement = null;
    });
}
```

### 4. Add Selection Clearing to Touch Events (for Completeness)
Although mobile isn't affected by this issue, add clearing to the touch event handler for consistency:

```javascript
const setupTouchEvents = (card) => {
    const hammer = new Hammer(card);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    
    hammer.on('panstart', (e) => {
        if (!draggingEnabled) return;
        
        // Clear any text selection for consistency with mouse events
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
        
        isDragging = true;
        // Rest of existing code...
    });
    
    // Rest of existing touch event code...
}
```

### 5. Add Global Event Handler (Optional Enhancement)
Consider adding a global handler to clear selection when interacting with the reagent area:

```javascript
// Add to the initialize function in drag-drop.js
const initialize = () => {
    // Existing initialization code...
    
    // Add global handler for the reagent bank to clear selection before any interaction
    const reagentBank = document.getElementById('reagent-bank');
    if (reagentBank) {
        reagentBank.addEventListener('mousedown', () => {
            // Clear any text selection when interacting with reagent bank
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (document.selection) {
                document.selection.empty();
            }
        });
    }
};
```

## Additional Considerations

### Accessibility Improvements
Add ARIA attributes to improve screen reader experience:

```html
<!-- Add to draggable elements in the code that generates reagent cards -->
<div class="reagent-card" data-id="${reagent.id}" draggable="true" 
     aria-grabbed="false" 
     aria-dropeffect="move" 
     aria-label="${reagent.name} - draggable molecule">
     <!-- Card content -->
</div>
```

Add to your JavaScript to update ARIA states during drag:

```javascript
// Add to dragstart event
card.setAttribute('aria-grabbed', 'true');

// Add to dragend event
card.setAttribute('aria-grabbed', 'false');
```

## Testing Criteria

### Functional Testing
1. Verify that dragging molecules works consistently even after text selection
2. Test by:
   - Selecting text in buttons, then attempting drag operations
   - Selecting text in question text, then attempting drag operations
   - Selecting text in the chemistry notes modal, then closing and attempting drag operations
   - Using keyboard to select text (Tab + Shift), then attempting drag operations
3. Verify that informational content (question text, chemistry notes) remains selectable
4. Test with multiple molecules to ensure performance is not impacted

### Cross-Browser Testing
1. Test on:
   - Chrome
   - Firefox
   - Safari
   - Edge
2. Verify functionality at different browser zoom levels (100%, 125%, 150%)

### Accessibility Testing
1. Test with screen reader to ensure proper ARIA attribute support
2. Verify keyboard navigation still works properly
3. Check that all interactive elements remain accessible

## Acceptance Criteria
- [ ] Dragging molecules works correctly even after text selection on UI elements
- [ ] Users can still select informational text (questions, chemistry notes)
- [ ] No instances of molecules getting stuck or quiz becoming unusable due to text selection
- [ ] Solution works across all desktop browsers
- [ ] Screen readers can properly identify draggable elements
- [ ] Performance is not negatively impacted by the changes

## Related Files
- `css/styles.css` - To add user-select CSS rules
- `js/drag-drop.js` - To modify event handlers for selection clearing
- `index.html` - Potentially to add ARIA attributes (if not generated dynamically)

## Notes
- The CSS approach is the primary solution and should prevent most instances of the issue
- The JS selection clearing provides a fallback mechanism for any edge cases
- Consider mentioning this fix in release notes so users know the issue has been addressed
- If implemented correctly, users should never encounter the text selection drag issue again
