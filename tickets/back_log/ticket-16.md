# Ticket #16: Create Intro Screen with Start Button

## Description
Add an introduction screen that appears before the quiz begins, welcoming users and setting context. This screen should include an inspiring message about organic chemistry and a prominent "Start Quiz" button.

## Priority
**Could Have** - User experience enhancement

## Tasks
1. Design an intro screen layout
2. Create HTML and CSS for the intro screen
3. Implement the logic to transition from intro screen to quiz
4. Add an inspiring message about organic chemistry knowledge
5. Ensure the intro screen is responsive on all devices

## Acceptance Criteria
- [ ] Intro screen appears when the quiz first loads
- [ ] Screen contains an engaging message about testing organic chemistry knowledge
- [ ] "Start Quiz" button is prominent and initiates the quiz when clicked
- [ ] Transition between intro screen and quiz is smooth
- [ ] Intro screen is responsive and looks good on all devices
- [ ] Intro screen provides context about the quiz purpose

## Implementation Notes
Add to `index.html` before the app-container:

```html
<div id="intro-screen" class="intro-screen">
    <div class="intro-content">
        <h1>Organic Chemistry Quiz</h1>
        <div class="intro-image">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="intro-icon">
                <path d="M10 2v7.31"></path>
                <path d="M14 9.3V1.99"></path>
                <path d="M8.5 2h7"></path>
                <path d="M14 7.3h6.3a.7.7 0 0 1 .7.7v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a.7.7 0 0 1 .7-.7H10"></path>
                <path d="M5 15h14"></path>
                <path d="M9 11v9"></path>
                <path d="M15 11v9"></path>
            </svg>
        </div>
        <p class="intro-message">Test your knowledge of organic chemistry reactions! Master substitution, elimination, and synthesis mechanisms in this interactive quiz.</p>
        <p class="intro-details">Drag and drop reagents to complete reactions and see if you can achieve a perfect score!</p>
        <button id="start-quiz-btn" class="btn btn-primary">Start Quiz</button>
    </div>
</div>
```

Add to `styles.css`:

```css
.intro-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--secondary-color);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    transition: opacity 0.5s ease;
}

.intro-content {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 40px;
    text-align: center;
    max-width: 600px;
    width: 90%;
}

.intro-image {
    margin: 30px 0;
}

.intro-icon {
    width: 120px;
    height: 120px;
    stroke: var(--primary-color);
}

.intro-message {
    font-size: 1.2rem;
    margin-bottom: 15px;
    color: var(--text-color);
    font-weight: 500;
}

.intro-details {
    font-size: 1rem;
    margin-bottom: 30px;
    color: var(--dark-gray);
}

#start-quiz-btn {
    font-size: 1.1rem;
    padding: 12px 30px;
}

.app-container {
    opacity: 0;
    transition: opacity 0.5s ease;
}

.app-container.show {
    opacity: 1;
}

@media (max-width: 480px) {
    .intro-content {
        padding: 30px 20px;
    }
    
    .intro-icon {
        width: 80px;
        height: 80px;
    }
    
    .intro-message {
        font-size: 1rem;
    }
}
```

Modify `app.js`:

```javascript
// Modify the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // Set up start button
    const startButton = document.getElementById('start-quiz-btn');
    startButton.addEventListener('click', startQuiz);
    
    // Set up other event listeners
    setupEventListeners();
});

// Add new function to handle starting the quiz
function startQuiz() {
    // Hide intro screen with fade
    const introScreen = document.getElementById('intro-screen');
    introScreen.style.opacity = '0';
    
    // Show app container
    const appContainer = document.querySelector('.app-container');
    appContainer.classList.add('show');
    
    // Initialize quiz after transition
    setTimeout(() => {
        introScreen.style.display = 'none';
        initializeQuiz();
    }, 500);
}
```

## Testing Steps
1. Verify intro screen appears when the page loads
2. Test the "Start Quiz" button functionality
3. Check the transition animation between screens
4. Verify the intro screen is responsive on different devices
5. Test on multiple browsers

## Related Files
- `index.html` - For intro screen HTML
- `css/styles.css` - For intro screen styling
- `js/app.js` - For intro screen logic

## Estimated Effort
Medium (1 day)
