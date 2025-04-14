# Ticket #30: Research Text Selection Interference with Drag-and-Drop

**STATUS: OPEN**  
**Priority:** High  
**Type:** Bug Investigation  
**Estimate:** 3 hours  
**Assigned to:** Unassigned  

## Description
Investigate a bug affecting PC users where text selection interferes with the drag-and-drop functionality of the quiz. When users accidentally select button text or other UI elements and then try to drag molecules while that text selection is still active, multiple unintended behaviors occur including mass-dragging of all molecules or molecules getting stuck in incorrect positions on the screen, potentially rendering the quiz unusable.

## Bug Report
PC users are experiencing disruptions to the quiz when text selection and drag-and-drop operations conflict:

- When button text or other UI elements are selected (highlighted)
- And the user attempts to drag a molecule card while the text selection is active
- The system either:
  - Drags all molecules in the bank simultaneously, or
  - Causes molecules to "glitch" and get stuck in invalid positions
  - In severe cases, leaves the quiz in an unusable state requiring refresh

This issue appears to be specific to desktop/PC users, likely due to the difference in selection and drag behavior between mouse and touch interfaces.

## Investigation Goals
This is a **research ticket only**. The goals are to:

1. Confirm and document the exact reproduction steps
2. Identify the root cause of the interaction conflict
3. Determine scope of affected functionality
4. Evaluate potential solution approaches
5. Provide recommendations for implementation

No code changes should be committed as part of this ticket.

## Reproduction Steps
Investigate the following reproduction sequence:

1. Load the Organic Chemistry Quiz
2. Click and drag to select text on a button (e.g., "Submit" or "Reset Question")
3. While text is still highlighted/selected, attempt to drag a molecule
4. Observe and document behavior
5. Try variations:
   - Different browsers (Chrome, Firefox, Edge, Safari)
   - Different text selection targets (buttons, question text, labels)
   - Different selection methods (double-click, triple-click, click-drag)
   - Different timing between selection and drag attempt

## Investigation Areas

### 1. Event Handling Conflicts
- Research how text selection events (mouseup/mousedown) might interfere with drag event initialization
- Examine the event propagation in the drag-drop.js file
- Determine if event.preventDefault() or event.stopPropagation() could resolve the issue
- Check for event listener conflicts between native browser selection and custom drag events

### 2. Browser Selection Behavior
- Document differences in selection behavior across browsers
- Investigate browser-specific selection management APIs
- Check for existing known issues with selection and drag-and-drop in browser bug trackers

### 3. DOM State Analysis
- Analyze how document selection state affects drag-and-drop functionality
- Investigate window.getSelection() behavior during problematic interactions
- Determine if selection state can be detected before drag operations begin

### 4. Drag-and-Drop Implementation
- Review current implementation in drag-drop.js
- Identify areas where text selection might interfere with drag detection
- Check if Hammer.js (for touch events) handles selection differently than mouse events
- Investigate if the drag-and-drop implementation follows different paths for touch vs mouse

### 5. Potential Solution Approaches
Evaluate these potential approaches (without implementing):

- Clearing text selection when drag operations start
- Preventing text selection on crucial UI elements using CSS
- Adding checks for active text selection before initializing drag
- Modifying event handling to better manage the interaction between selection and drag
- Using pointer events instead of mouse events where appropriate

## Deliverables

1. **Bug Documentation**
   - Detailed reproduction steps with exact conditions required
   - List of affected browsers and environments
   - Screenshots or screen recordings demonstrating the issue
   - Impact assessment on quiz usability

2. **Root Cause Analysis**
   - Technical explanation of why the conflict occurs
   - Identification of specific code sections involved
   - Analysis of event sequence causing the issue

3. **Solution Recommendations**
   - 2-3 potential approaches to fix the issue
   - Pros and cons of each approach
   - Estimated complexity of implementation
   - Recommended solution with justification

## Test Scenarios
Document behavior in these scenarios:

1. Text selection followed by immediate drag attempt
2. Text selection followed by click elsewhere then drag attempt
3. Text selection on different UI elements (buttons, labels, question text)
4. Text selection with keyboard (Tab + Shift) followed by drag attempts
5. Performance impact observation (does the bug worsen with more reagent cards?)

## Resources
- Current Drag-and-Drop implementation in `js/drag-drop.js`
- Browser documentation for:
  - [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection)
  - [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- Hammer.js documentation for touch events

## Related Files
- `js/drag-drop.js` - Main drag-and-drop implementation
- `index.html` - Button elements that can be selected
- `css/styles.css` - May need style adjustments for selection prevention
- `js/app.js` - Could contain event handling that affects selection

## Notes
- This is a research-only ticket. No implementation should be done.
- Focus on identifying all facets of the issue rather than fixing it.
- Create a follow-up implementation ticket with solution details after research is complete.
- Consider testing with various configurations of browser zoom level and window size.
