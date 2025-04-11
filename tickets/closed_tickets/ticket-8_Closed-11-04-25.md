# Ticket #8: Fix Reset Button After Correct Answer and Add Reset Icon

## Description
Currently, users can click the reset button after answering correctly, which allows them to answer the same question again and artificially increase their score. The reset button should be disabled or hidden after a correct answer to prevent this exploitation. Additionally, the reset button needs a visual refresh icon to improve UI clarity and consistency.

## Priority
**Must Have** - Critical gameplay bug and UI enhancement

## Tasks
1. Modify `app.js` to disable the reset button after a correct answer is submitted
2. Update the UI to clearly indicate when the reset button is disabled
3. Ensure the reset button is re-enabled when moving to the next question
4. Add appropriate CSS styling for the disabled state
5. Add the refresh icon from `assets/image/refresh.svg` to the reset button
6. Ensure the icon is properly aligned and sized within the button

## Acceptance Criteria
- [ ] Reset button is disabled immediately after a correct answer
- [ ] Users cannot exploit the quiz by resetting and re-answering the same question
- [ ] Button appears visually disabled (grayed out) when inactive
- [ ] Reset button functionality is restored when moving to a new question
- [ ] Refresh icon appears on the reset button and is properly aligned
- [ ] Changes follow the existing UI design patterns
- [ ] Icon appears and scales correctly on all screen sizes

## Implementation Notes
```javascript
// In the handleSubmit function in app.js, after a correct answer:
if (isCorrect) {
    // Existing code...
    
    // Disable reset button
    const resetButton = document.getElementById('reset-btn');
    resetButton.disabled = true;
    resetButton.classList.add('disabled');
}

// In handleNextQuestion function, re-enable the reset button:
function handleNextQuestion() {
    // Existing code...
    
    // Re-enable reset button
    const resetButton = document.getElementById('reset-btn');
    resetButton.disabled = false;
    resetButton.classList.remove('disabled');
}
```

Update the HTML in `index.html` to include the icon:
```html
<!-- Update the reset button in index.html -->
<button id="reset-btn" class="btn btn-secondary">
  <img src="assets/image/refresh.svg" alt="" class="btn-icon" width="16" height="16">
  Reset Question
</button>
```

Add CSS for the button icon:
```css
/* Add to styles.css if not already present */
.btn-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 5px;
  position: relative;
  top: -1px;
}

.btn-secondary .btn-icon {
  filter: brightness(0.7); /* Match the dark-gray color */
}

.btn-secondary:hover .btn-icon {
  filter: brightness(0.5); /* Match text-color on hover */
}

.btn-secondary.disabled .btn-icon {
  opacity: 0.5;
}
```

## Testing Steps
1. Answer a question correctly and verify the reset button is disabled
2. Verify the button appears visually disabled with the icon grayed out
3. Try clicking the disabled reset button and confirm it has no effect
4. Move to the next question and verify the reset button is re-enabled
5. Check that the icon appears correctly on different screen sizes
6. Test across multiple browsers (Chrome, Firefox, Safari, Edge)

## Related Files
- `js/app.js` - Main application logic
- `css/styles.css` - For disabled button styling
- `index.html` - For button HTML update
- `assets/image/refresh.svg` - Icon file

## Estimated Effort
Small (0.5 day)
