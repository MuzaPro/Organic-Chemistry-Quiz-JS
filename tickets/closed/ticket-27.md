# Ticket #27: Enhance Next Question Button Styling

**STATUS: OPEN**
**Priority:** Medium
**Type:** Enhancement
**Estimate:** 1 hour
**Assigned to:** Unassigned

## Description
The "Next Question" button needs to be updated to match the visual style of the submit button (before it's disabled) and include a right arrow icon to better indicate its function. This visual consistency will improve the user experience and provide clearer navigation cues.

## Background
Currently, the "Next Question" button appears after a user submits an answer, but its visual style differs from the submit button. The button should use the primary button style rather than secondary style, and include a right arrow icon to better indicate its navigational purpose.

## Requirements
1. Style the "Next Question" button to match the appearance of the submit button:
   - Change from btn-secondary to btn-primary class
   - Same background color (primary color)
   - Same text color (white)
   - Same size and padding
   - Same hover/focus states

2. Add a right arrow icon to the button:
   - Icon should be positioned to the right of the text
   - Icon should be properly aligned vertically with the text
   - Icon should maintain the same color as the text
   - Use existing SVG from assets/images/arrow-right.svg or the provided inline SVG code

## Implementation Details

### HTML Change
The current button:
```html
<button id="next-btn" class="btn btn-secondary hidden">Next Question</button>
```

Should be updated to:
```html
<button id="next-btn" class="btn btn-primary hidden">
  <span>Next Question</span>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2" class="next-icon">
    <path d="M5 12l14 0"></path>
    <path d="M13 18l6 -6"></path>
    <path d="M13 6l6 6"></path>
  </svg>
</button>
```

### CSS Updates
Add the following CSS to `styles.css`:

```css
/* Next button styling */
#next-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.next-icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  transition: transform 0.2s ease;
}

#next-btn:hover .next-icon {
  transform: translateX(3px);
}

/* For mobile layout */
@media (max-width: 768px) {
  #next-btn {
    width: 100%;
  }
}
```

### JavaScript Modifications
If there's any JavaScript logic that manipulates the Next Question button's class, ensure it maintains the `btn-primary` class:

```javascript
// In app.js or similar, when showing the next button
function showNextButton() {
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.classList.remove('hidden');
    nextBtn.classList.add('btn-primary'); // Ensure the primary style is applied
  }
}
```

### Alternative: Using External SVG File
If using the external SVG file is preferred over inline SVG, the HTML would be:

```html
<button id="next-btn" class="btn btn-primary hidden">
  <span>Next Question</span>
  <img src="assets/images/arrow-right.svg" alt="Right arrow" class="next-icon">
</button>
```

And the CSS for the image would need slight adjustment:
```css
.next-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1); /* Make the SVG white to match text */
  transition: transform 0.2s ease;
}
```

## Test Cases
1. Verify the Next Question button appears with the correct styling after submitting an answer
2. Test the button in different viewport sizes to ensure responsive behavior
3. Verify the hover effect works correctly (arrow moves slightly right)
4. Test across different browsers to ensure consistent appearance
5. Verify that the button is properly highlighted for accessibility (focus state)

## Acceptance Criteria
- [ ] The Next Question button uses the same visual style as the Submit button (primary color)
- [ ] The button includes a right arrow icon
- [ ] The icon animates slightly on hover
- [ ] The button layout is responsive and maintains proper appearance on mobile
- [ ] Behavior remains unchanged - only the appearance is modified

## Related Files
- `index.html` - To update the button HTML
- `css/styles.css` - To add the necessary CSS
- `js/app.js` - To check for any related JavaScript logic
- `assets/images/arrow-right.svg` - Optional external SVG file

## Estimated Effort
Low (1 hour) - Straightforward CSS and HTML updates
