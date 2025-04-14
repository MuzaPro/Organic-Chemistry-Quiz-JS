# Ticket #32: Slow Down Quiz Startup Animation

**STATUS: OPEN**  
**Priority:** Medium  
**Type:** Enhancement  
**Estimate:** 2 hours  
**Assigned to:** Unassigned  

## Description
After clicking the "Start Quiz" button, the application displays instructions about dragging molecules and then loads the quiz question with animations. However, the current transition happens too quickly (occurring in approximately 7 frames at 25fps, or 0.28 seconds), appearing as a momentary blur to users. This ticket aims to slow down these animations to create a more intentional, readable, and polished user experience.

## Current Behavior
- User clicks "Start Quiz" button
- Instructions and question content animate in
- The entire animation sequence completes in approximately 0.28 seconds
- The transition appears as a brief blur rather than a deliberate animation
- Users may miss important instructional content

## Desired Behavior
- User clicks "Start Quiz" button
- The intro screen fades out at a comfortable pace (0.5-0.7 seconds)
- Instructions appear and remain visible long enough to be read (1-1.5 seconds)
- Question content animates in with a deliberate, satisfying motion (0.5-0.8 seconds)
- Total animation sequence takes approximately 2-3 seconds
- All animations feel polished and intentional

## Implementation Details

### 1. Adjust Intro Screen Fade-Out
In `app.js`, modify the startQuiz function to increase transition duration:

```javascript
// Current implementation
function startQuiz() {
    // Hide intro screen with fade
    const introScreen = document.getElementById('intro-screen');
    introScreen.style.opacity = '0';
    
    // Show app container
    const appContainer = document.querySelector('.app-container');
    appContainer.classList.add('show');
    
    // Initialize quiz after transition
    setTimeout(async () => {
        introScreen.style.display = 'none';
        await initializeQuiz();
    }, 500); // Currently 500ms
}

// Suggested change
function startQuiz() {
    // Hide intro screen with fade
    const introScreen = document.getElementById('intro-screen');
    introScreen.style.opacity = '0';
    introScreen.style.transition = 'opacity 0.7s ease'; // Increase from default
    
    // Show app container with delay
    const appContainer = document.querySelector('.app-container');
    setTimeout(() => {
        appContainer.classList.add('show');
    }, 500); // Delay app container appearance
    
    // Initialize quiz after longer transition
    setTimeout(async () => {
        introScreen.style.display = 'none';
        await initializeQuiz();
    }, 800); // Increase from 500ms
}
```

### 2. Add Sequential Animation to Question Loading
Modify the `initializeQuiz` function to introduce staged animations:

```javascript
async function initializeQuiz() {
    try {
        // Load questions from JSON file
        await QuizEngine.loadQuestions();
        
        // Update total questions count in UI
        document.getElementById('total-questions').textContent = QuizEngine.getTotalQuestions();
        
        // 1. First display the question text with animation
        const questionText = document.getElementById('question-text');
        questionText.style.opacity = '0';
        questionText.style.transform = 'translateY(-20px)';
        
        // 2. Load the first question (but keep elements invisible)
        QuizEngine.loadQuestion(0);
        
        // Hide elements initially
        const reactionArea = document.querySelector('.reaction-area');
        const reagentBank = document.getElementById('reagent-bank');
        reactionArea.style.opacity = '0';
        reagentBank.style.opacity = '0';
        
        // 3. Animate question text in
        setTimeout(() => {
            questionText.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            questionText.style.opacity = '1';
            questionText.style.transform = 'translateY(0)';
        }, 200);
        
        // 4. Animate reaction area in
        setTimeout(() => {
            reactionArea.style.transition = 'opacity 0.6s ease';
            reactionArea.style.opacity = '1';
        }, 800);
        
        // 5. Animate reagent bank in
        setTimeout(() => {
            reagentBank.style.transition = 'opacity 0.6s ease';
            reagentBank.style.opacity = '1';
            
            // 6. Initialize drag and drop functionality after animations complete
            setTimeout(() => {
                DragDrop.initialize();
            }, 300);
        }, 1400);
        
    } catch (error) {
        console.error('Failed to initialize quiz:', error);
        showErrorMessage('Failed to load quiz data. Please refresh the page or try again later.');
    }
}
```

### 3. Update CSS for Smoother Transitions
Add or modify the following CSS in `styles.css`:

```css
/* Update existing transition for app container */
.app-container {
    opacity: 0;
    transition: opacity 0.7s ease; /* Increase from existing */
}

/* Add transitions for quiz elements */
#question-text {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.reaction-area {
    transition: opacity 0.6s ease;
}

#reagent-bank {
    transition: opacity 0.6s ease;
}

/* Optional entry animations for individual reagent cards */
.reagent-card {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.2s ease;
}

.reagent-card.animate-in {
    opacity: 1;
    transform: translateY(0);
}
```

### 4. Add Staggered Animation for Reagent Cards (Optional Enhancement)
Add this code to `initializeQuiz` to create a staggered entry for reagent cards:

```javascript
// 7. Animate reagent cards with staggered entry
setTimeout(() => {
    const reagentCards = document.querySelectorAll('.reagent-card');
    reagentCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate-in');
        }, 50 * index); // Stagger each card by 50ms
    });
}, 1600);
```

## Testing Criteria
1. Measure the total animation duration (should be 2-3 seconds)
2. Verify all elements animate in the correct sequence
3. Ensure text is readable during the animation
4. Test on different devices to ensure consistent timing
5. Verify animations are smooth without stuttering
6. Check that drag and drop functionality works correctly after animations
7. Test with prefers-reduced-motion media query

## Browser Compatibility
Test animations in:
- Chrome
- Firefox
- Safari
- Edge

## Accessibility Considerations
- Honor user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
    .app-container,
    #question-text,
    .reaction-area,
    #reagent-bank,
    .reagent-card {
        transition: none !important;
        animation: none !important;
        transform: none !important;
    }
}
```

## Acceptance Criteria
- [ ] Intro screen fades out over at least 0.5 seconds
- [ ] Question text appears and is readable for at least 1 second before other elements
- [ ] Reaction area and reagent bank have clear, deliberate entrance animations
- [ ] Total animation sequence takes 2-3 seconds (not less)
- [ ] Animations are smooth and professional in appearance
- [ ] User can read all instructions before needing to interact
- [ ] Animation respects prefers-reduced-motion setting
- [ ] Drag and drop functionality works correctly after animations complete

## Related Files
- `js/app.js` - To modify transition timing in startQuiz and initializeQuiz functions
- `css/styles.css` - To update transition properties
- `index.html` - Possibly to add animation-related classes

## Notes
- Consider adding a subtle "loading" or "ready" indicator during longer transitions
- Animation timings may need adjustment based on user testing feedback
- Be careful not to make animations too slow, which could frustrate returning users
