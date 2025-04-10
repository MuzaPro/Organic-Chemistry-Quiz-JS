# Ticket #8: Fix Reset Button After Correct Answer

## Description
Currently, users can click the reset button after answering correctly, which allows them to answer the same question again and artificially increase their score. The reset button should be disabled or hidden after a correct answer to prevent this exploitation.

## Priority
**Must Have** - Critical gameplay bug

## Tasks
1. Modify `app.js` to disable the reset button after a correct answer is submitted
2. Update the UI to clearly indicate when the reset button is disabled
3. Ensure the reset button is re-enabled when moving to the next question
4. Add appropriate CSS styling for the disabled state

## Acceptance Criteria
- [ ] Reset button is disabled immediately after a correct answer
- [ ] Users cannot exploit the quiz by resetting and re-answering the same question
- [ ] Button appears visually disabled (grayed out)
- [ ] Reset button functionality is restored when moving to a new question
- [ ] Changes follow the existing UI design patterns

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

## Testing Steps
1. Answer a question correctly and verify the reset button is disabled
2. Try clicking the disabled reset button and confirm it has no effect
3. Move to the next question and verify the reset button is re-enabled
4. Test across multiple browsers (Chrome, Firefox, Safari, Edge)

## Related Files
- `js/app.js` - Main application logic
- `css/styles.css` - For disabled button styling

## Estimated Effort
Small (0.5 day)
