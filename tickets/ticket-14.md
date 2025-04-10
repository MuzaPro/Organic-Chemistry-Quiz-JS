# Ticket #14: Implement Certificate for Perfect Completion

## Description
To enhance user engagement and provide a sense of accomplishment, the application should display a certificate/achievement visual when a user completes the quiz with a perfect score. This will be implemented using the provided SVG graphic located at `assets/images/rosette-discount-check.svg`.

## Priority
**Could Have** - User experience enhancement

## Tasks
1. Modify the `showQuizComplete` function to detect perfect scores
2. Implement the certificate visualization using the provided SVG
3. Add appropriate animations to make the achievement feel rewarding
4. Style the certificate presentation for both desktop and mobile

## Acceptance Criteria
- [ ] Certificate graphic appears only for users who achieve a 100% score
- [ ] Animation makes the achievement feel special and rewarding
- [ ] Certificate appearance is visually appealing and professional
- [ ] Implementation works on both desktop and mobile devices
- [ ] Regular completion message still appears for non-perfect scores

## Implementation Notes
Modify the `showQuizComplete` function in `app.js`:

```javascript
function showQuizComplete() {
    const container = document.querySelector('.question-container');
    const score = QuizEngine.getScore();
    const totalQuestions = QuizEngine.getTotalQuestions();
    const percentage = Math.round((score / totalQuestions) * 100);
    
    let message;
    let className;
    let certificateHTML = '';
    
    if (percentage === 100) {
        message = 'Perfect! You have mastered organic chemistry reactions!';
        className = 'success perfect-score';
        certificateHTML = `
            <div class="certificate-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-linecap="round" stroke-linejoin="round" width="120" height="120" stroke-width="2" class="certificate-svg">
                    <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"></path>
                    <path d="M9 12l2 2l4 -4"></path>
                </svg>
                <p class="certificate-text">Achievement Unlocked: Chemistry Master!</p>
            </div>
        `;
    } else if (percentage >= 80) {
        message = 'Excellent! You have a strong understanding of organic chemistry reactions.';
        className = 'success';
    } else if (percentage >= 60) {
        message = 'Good job! You have a decent grasp of organic chemistry concepts.';
        className = 'info';
    } else {
        message = 'Keep practicing! Organic chemistry takes time to master.';
        className = 'warning';
    }
    
    container.innerHTML = `
        <div class="quiz-complete ${className}">
            <h2>Quiz Complete!</h2>
            ${certificateHTML}
            <p>Your score: ${score}/${totalQuestions} (${percentage}%)</p>
            <p>${message}</p>
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
            </div>
        </div>
    `;
}
```

Add CSS styles to `styles.css`:

```css
.certificate-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px 0;
}

.certificate-svg {
    animation: certificate-appear 1s ease-out;
}

.certificate-text {
    font-weight: bold;
    margin-top: 10px;
    color: var(--success-color);
}

@keyframes certificate-appear {
    0% { transform: scale(0) rotate(0deg); opacity: 0; }
    60% { transform: scale(1.2) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.perfect-score {
    background-color: rgba(40, 167, 69, 0.2);
    border: 2px solid var(--success-color);
    border-radius: 8px;
    padding: 20px;
}
```

## Testing Steps
1. Complete the quiz with a perfect score and verify the certificate appears
2. Complete the quiz with various non-perfect scores and verify appropriate messages
3. Test the certificate animation and appearance
4. Verify the implementation on different screen sizes
5. Test across multiple browsers

## Related Files
- `js/app.js` - Main application logic
- `css/styles.css` - For certificate styling
- `assets/images/rosette-discount-check.svg` - SVG graphic

## Estimated Effort
Small (0.5 day)
