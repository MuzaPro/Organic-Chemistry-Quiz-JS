# Organic Chemistry Quiz Game: Core Components

## Table of Contents
- [Overview](#overview)
- [Main Application Logic](#main-application-logic)
- [Quiz Engine](#quiz-engine)
- [Drag and Drop System](#drag-and-drop-system)
- [Audio System](#audio-system)
- [Question Navigation](#question-navigation)
- [Modal System](#modal-system)
- [UI Components](#ui-components)
- [Component Integration](#component-integration)

## Overview

The Organic Chemistry Quiz Game is built around several core components that work together to provide the complete quiz experience. Each component is responsible for a specific aspect of functionality and communicates with other components through well-defined interfaces.

This document provides detailed information about each core component, its responsibilities, implementation details, and integration with other components.

## Main Application Logic

**File: `app.js`**

The main application logic serves as the coordinator for the entire application, initializing other components and handling high-level application flow.

### Responsibilities
- Application initialization
- Event listener setup
- User interaction handling
- Quiz state coordination
- Answer submission and validation
- Feedback display
- Quiz completion handling

### Key Functions

#### `initializeQuiz()`
Initializes the quiz by loading questions and setting up the first question.

```javascript
async function initializeQuiz() {
    try {
        // Check if modules are available
        if (typeof DragDrop === 'undefined' || typeof QuizEngine === 'undefined') {
            throw new Error('Required modules are not loaded');
        }
        // Load questions from JSON file
        await QuizEngine.loadQuestions();
        
        // Update total questions count in UI
        document.getElementById('total-questions').textContent = QuizEngine.getTotalQuestions();
        
        // Load the first question
        QuizEngine.loadQuestion(0);
        
        // Initialize drag and drop functionality
        DragDrop.initialize();
        
    } catch (error) {
        console.error('Failed to initialize quiz:', error);
        showErrorMessage('Failed to load quiz data. Please refresh the page or try again later.');
    }
}
```

#### `handleSubmit()`
Processes the submission of an answer and provides feedback.

```javascript
function handleSubmit() {
    // Get the current drop zones' content
    const dropZone1Content = DragDrop.getDropZoneContent(1);
    const dropZone2Content = DragDrop.getDropZoneContent(2);
    
    // Check if both drop zones have reagents
    if (!dropZone1Content || !dropZone2Content) {
        showFeedback('Please place both reactants before submitting.', 'error');
        return;
    }
    
    // Check the answer
    const isCorrect = QuizEngine.checkAnswer([dropZone1Content.reagentId, dropZone2Content.reagentId]);
    
    if (isCorrect) {
        showFeedback(QuizEngine.getCurrentQuestion().correctFeedback, 'success');
        document.getElementById('score').textContent = QuizEngine.getScore();
        
        // Play correct sound
        AudioManager.play('correct');
        
        // Disable dragging after correct submission
        DragDrop.setDraggingEnabled(false);
        const resetButton = document.getElementById('reset-btn');
        resetButton.disabled = true;
        resetButton.classList.add('disabled');
    } else {
        showFeedback(QuizEngine.getCurrentQuestion().incorrectFeedback, 'error');
        
        // Play wrong sound
        AudioManager.play('wrong');
        
        // Add skip message
        document.getElementById('feedback-container').innerHTML += 
            '<p class="skip-text">You can try again or move to the next question.</p>';
    }
    
    // Show next button in both cases
    document.getElementById('next-btn').classList.remove('hidden');
}
```

#### `handleNextQuestion()`
Advances to the next question or shows quiz completion.

```javascript
function handleNextQuestion() {
    // Move to the next question
    const nextQuestionLoaded = QuizEngine.nextQuestion();
    
    if (nextQuestionLoaded) {
        // Reset the UI
        resetQuestionUI();
        
        // Update progress
        updateProgress();
        
        // Re-enable dragging for the new question
        DragDrop.setDraggingEnabled(true);
        const resetButton = document.getElementById('reset-btn');
        resetButton.disabled = false;
        resetButton.classList.remove('disabled');

        // Re-initialize drag and drop
        DragDrop.initialize();
    } else {
        // Quiz is complete
        showQuizComplete();
    }
}
```

### Integration Points
- Initializes and communicates with the Quiz Engine
- Initializes and communicates with the Drag and Drop system
- Initializes and communicates with the Audio system
- Manages DOM updates and UI state

## Quiz Engine

**File: `quiz-engine.js`**

The Quiz Engine manages all aspects of the quiz questions, including loading, tracking, and evaluating answers.

### Responsibilities
- Loading questions from JSON
- Managing current question state
- Shuffling questions for variety
- Checking answers
- Tracking score
- Providing question navigation

### Key Functions

#### `loadQuestions()`
Loads questions from the JSON file and prepares them for the quiz.

```javascript
const loadQuestions = async () => {
    try {
        const response = await fetch('data/questions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        questions = data.questions;
        
        // Shuffle questions for variety
        shuffleQuestions();
        
        return true;
    } catch (error) {
        console.error('Error loading questions:', error);
        throw error;
    }
};
```

#### `loadQuestion()`
Loads a specific question into the UI.

```javascript
const loadQuestion = (index) => {
    if (index < 0 || index >= questions.length) {
        console.error('Question index out of bounds:', index);
        return false;
    }
    
    currentQuestionIndex = index;
    const question = questions[index];
    
    // Set question text
    document.getElementById('question-text').textContent = question.questionText;
    
    // Load product
    // ... product loading code ...
    
    // Load reagents into the reagent bank
    // ... reagent loading code ...
    
    return true;
};
```

#### `checkAnswer()`
Validates the user's answer against the correct answer.

```javascript
const checkAnswer = (userAnswer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.correctReagents;
    
    // Sort both arrays to ensure order doesn't matter
    const sortedUserAnswer = [...userAnswer].sort();
    const sortedCorrectAnswer = [...correctAnswer].sort();
    
    // Compare the sorted arrays
    const isCorrect = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
    
    // Update score if correct
    if (isCorrect) {
        score++;
    }
    
    return isCorrect;
};
```

### Data Model

The Quiz Engine uses the following data model for questions:

```javascript
// Question object structure
{
  "id": "unique-id",
  "questionText": "Question prompt...",
  "product": {
    "name": "Product Name",
    "formula": "Chemical Formula",
    "imagePath": "assets/molecules/product.svg",
    "textRepresentation": "Text Representation"
  },
  "reagents": [
    // Array of reagent objects with similar structure
  ],
  "correctReagents": ["reagent-id-1", "reagent-id-2"],
  "reactionType": "Reaction Type",
  "correctFeedback": "Correct answer feedback",
  "incorrectFeedback": "Incorrect answer feedback",
  "chemistryNotes": "Detailed notes about the reaction"
}
```

### Integration Points
- Provides question data to the main application
- Evaluates answers submitted by the user
- Tracks and reports quiz progress and score

## Drag and Drop System

**File: `drag-drop.js`**

The Drag and Drop system handles all interactive elements, allowing users to drag reagents to drop zones.

### Responsibilities
- Setting up drag events for reagent cards
- Managing drop zones
- Handling both mouse and touch interactions
- Tracking the state of dragged elements
- Managing clone elements for drop zones
- Enabling/disabling drag functionality

### Key Functions

#### `initialize()`
Sets up drag and drop functionality for the current question.

```javascript
const initialize = () => {
    // Store references to drop zones
    dropZones = [
        { element: document.getElementById('drop-zone-1'), zone: 1, content: null },
        { element: document.getElementById('drop-zone-2'), zone: 2, content: null }
    ];
    
    // Set up reagent cards
    setupReagentCards();
    
    // Set up drop zones
    setupDropZones();
};
```

#### `setupReagentCards()`
Sets up event listeners for reagent cards based on device type.

```javascript
const setupReagentCards = () => {
    // Get all reagent cards
    reagentCards = document.querySelectorAll('.reagent-card');
    
    reagentCards.forEach(card => {
        // Store original position for later use with Hammer.js
        const rect = card.getBoundingClientRect();
        card.setAttribute('data-original-x', rect.left);
        card.setAttribute('data-original-y', rect.top);
        
        if (isTouchDevice) {
            setupTouchEvents(card);
        } else {
            setupMouseEvents(card);
        }
    });
};
```

#### `setupTouchEvents()`
Sets up touch event handling using Hammer.js.

```javascript
const setupTouchEvents = (card) => {
    const hammer = new Hammer(card);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    
    hammer.on('panstart', (e) => {
        if (!draggingEnabled) return;
        
        isDragging = true;
        currentDragElement = card;
        
        // Save start positions
        const rect = card.getBoundingClientRect();
        elementStartX = rect.left;
        elementStartY = rect.top;
        touchStartX = e.center.x;
        touchStartY = e.center.y;
        
        // Add visual feedback
        card.classList.add('touch-dragging');
        
        // Play pickup sound
        playSoundSafely('pickup');
        
        // If this card was already in a drop zone, clear that drop zone
        dropZones.forEach(zone => {
            if (zone.content && zone.content.element === card) {
                removeFromDropZone(zone);
            }
        });
        
        // Prevent default behavior
        e.srcEvent.preventDefault();
    });
    
    // Additional pan and panend event handlers...
};
```

#### `addToDropZone()`
Adds a reagent card to a drop zone.

```javascript
const addToDropZone = (zone, reagentCard) => {
    // Create a clone to place in the drop zone
    const cardClone = reagentCard.cloneNode(true);
    cardClone.classList.add('reagent-in-dropzone');
    
    // Make the clone draggable for desktop
    cardClone.setAttribute('draggable', !isTouchDevice);
    cardClone.setAttribute('data-original-id', reagentCard.getAttribute('data-id'));
    
    // Add appropriate events to the clone
    setupCloneTouchEvents(cardClone, zone, reagentCard);
    
    // Clear the drop zone
    while (zone.element.firstChild) {
        zone.element.removeChild(zone.element.firstChild);
    }
    
    // Play drop sound
    playSoundSafely('drop');
    
    // Add the clone to the drop zone
    zone.element.appendChild(cardClone);
    zone.element.classList.add('filled');
    
    // Update drop zone content tracking
    zone.content = {
        element: cardClone,
        originalElement: reagentCard,
        reagentId: reagentCard.getAttribute('data-id')
    };
    
    // Hide the original card
    reagentCard.style.visibility = 'hidden';
};
```

### Integration Points
- Provides drag and drop functionality for the quiz interface
- Reports drop zone contents to the main application
- Receives enable/disable commands from the main application
- Integrates with the Audio system for sound effects

## Audio System

**File: `audio.js`**

The Audio system manages sound effects and user audio preferences.

### Responsibilities
- Loading and playing sound effects
- Managing mute state
- Persisting audio preferences
- Handling browser autoplay restrictions
- Providing error handling for audio playback

### Key Functions

#### `initialize()`
Sets up the audio system and mute button.

```javascript
const initialize = () => {
    preloadSounds();
    
    // Add mute button handler
    const muteButton = document.getElementById('mute-btn');
    if (muteButton) {
        muteButton.addEventListener('click', toggleMute);
        updateMuteButton();
    }
};
```

#### `play()`
Plays a specific sound effect with error handling.

```javascript
const play = (soundName) => {
    if (muted || !sounds[soundName]) return;
    
    // Stop the sound if it's already playing
    sounds[soundName].pause();
    sounds[soundName].currentTime = 0;
    
    // Play the sound with proper error handling
    const playPromise = sounds[soundName].play();
    
    // Handle play promise (required for mobile browsers)
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            // Auto-play might be prevented (especially on mobile)
            console.warn(`Sound playback was prevented: ${error}`);
            
            // Don't show autoplay errors to users
            if (error.name !== 'NotAllowedError') {
                console.error(`Error playing sound ${soundName}:`, error);
            }
        });
    }
};
```

#### `toggleMute()`
Toggles the mute state and persists the preference.

```javascript
const toggleMute = () => {
    muted = !muted;
    localStorage.setItem('quizSoundMuted', muted);
    updateMuteButton();
    return muted;
};
```

### Sound Library
The audio system includes the following sound effects:

```javascript
const sounds = {
    pickup: new Audio('assets/sound/pickup_card.mp3'),
    drop: new Audio('assets/sound/drop_card.mp3'),
    correct: new Audio('assets/sound/correct_answer.mp3'),
    wrong: new Audio('assets/sound/wrong_answer.mp3')
};
```

### Integration Points
- Receives play requests from the main application and drag-drop system
- Maintains user preferences in localStorage
- Handles UI updates for the mute button

For more details, see [audio-system.md](docs/features/audio-system.md).

## Question Navigation

The Question Navigation system manages progression through the quiz questions and provides appropriate feedback.

### Responsibilities
- Enabling movement between questions
- Providing retry options for incorrect answers
- Tracking quiz completion
- Updating progress indicators
- Displaying final score and feedback

### Key Functions

#### `handleNextQuestion()`
Manages progression to the next question.

```javascript
function handleNextQuestion() {
    // Move to the next question
    const nextQuestionLoaded = QuizEngine.nextQuestion();
    
    if (nextQuestionLoaded) {
        // Reset the UI
        resetQuestionUI();
        
        // Update progress
        updateProgress();
        
        // Re-enable dragging for the new question
        DragDrop.setDraggingEnabled(true);
        const resetButton = document.getElementById('reset-btn');
        resetButton.disabled = false;
        resetButton.classList.remove('disabled');

        // Re-initialize drag and drop
        DragDrop.initialize();
    } else {
        // Quiz is complete
        showQuizComplete();
    }
}
```

#### `updateProgress()`
Updates progress indicators in the UI.

```javascript
function updateProgress() {
    const currentQuestionNum = QuizEngine.getCurrentQuestionNumber() + 1;
    const totalQuestions = QuizEngine.getTotalQuestions();
    
    document.getElementById('current-question').textContent = currentQuestionNum;
    
    // Update progress bar
    const progressPercentage = (currentQuestionNum / totalQuestions) * 100;
    document.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
}
```

#### `showQuizComplete()`
Displays the quiz completion screen with appropriate feedback.

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
                <img src="assets/images/certificate.svg" alt="Achievement certificate" class="certificate-svg">
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

### Integration Points
- Uses the Quiz Engine to track question state
- Coordinates with the Drag and Drop system to reset between questions
- Updates the UI based on quiz progress
- Provides completion feedback based on score

For more details, see [question-navigation.md](docs/features/question-navigation.md).

## Modal System

The Modal system provides a way to display detailed chemistry notes and other information.

### Responsibilities
- Displaying chemistry notes in a modal window
- Managing modal visibility
- Handling modal interactions (close, escape key)
- Providing backdrop for focus on modal content

### Key Functions

#### `handleChemNotesClick()`
Opens the chemistry notes modal with content from the current question.

```javascript
function handleChemNotesClick() {
    // Get notes from the current question
    const notes = QuizEngine.getCurrentQuestion().chemistryNotes;
    
    // Populate the modal
    document.getElementById('notes-content').innerHTML = notes;
    
    // Show the modal
    document.getElementById('notes-modal').classList.add('show');
}
```

#### `closeModal()`
Closes the currently open modal.

```javascript
function closeModal() {
    document.getElementById('notes-modal').classList.remove('show');
}
```

### HTML Structure
The modal system uses the following HTML structure:

```html
<!-- Chemistry Notes Modal -->
<div id="notes-modal" class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>Chemistry Notes</h3>
        <div id="notes-content">
            <!-- Notes content will be loaded from questions.json -->
        </div>
    </div>
</div>
```

### Integration Points
- Receives content from the Quiz Engine
- Controlled by the main application logic
- Accessibility features for keyboard navigation

## UI Components

The application includes several key UI components that provide the interactive interface.

### Reagent Bank
Displays available reagents for the current question.

```html
<div class="reagent-bank" id="reagent-bank">
    <!-- Reagent cards will be loaded dynamically -->
</div>
```

### Reaction Area
Displays the reaction components including drop zones, operators, and product.

```html
<div class="reaction-area">
    <!-- Drop Zone 1 -->
    <div class="drop-zone" id="drop-zone-1" data-zone="1">
        <div class="drop-zone-placeholder">?</div>
    </div>
    
    <!-- Plus sign -->
    <div class="operator">+</div>
    
    <!-- Drop Zone 2 -->
    <div class="drop-zone" id="drop-zone-2" data-zone="2">
        <div class="drop-zone-placeholder">?</div>
    </div>
    
    <!-- Arrow -->
    <div class="reaction-arrow">→</div>
    
    <!-- Product -->
    <div class="product-container" id="product-display">
        <!-- Product will be loaded from questions.json -->
    </div>
    
    <!-- Submit Button -->
    <div class="submit-container">
        <button id="submit-btn" class="btn btn-primary">Submit</button>
    </div>
</div>
```

### Progress Indicators
Displays the current question number and progress bar.

```html
<div class="progress-container">
    <div class="progress-text">Question <span id="current-question">1</span> of <span id="total-questions">10</span></div>
    <div class="progress-bar">
        <div class="progress-fill" style="width: 10%;"></div>
    </div>
</div>
```

### Feedback Container
Displays feedback messages for correct and incorrect answers.

```html
<div id="feedback-container" class="feedback hidden">
    <!-- Feedback will be displayed here -->
</div>
```

### Action Buttons
Provides interaction buttons for reset, chemistry notes, and next question.

```html
<div class="action-buttons">
    <button id="reset-btn" class="btn btn-secondary">
        <svg><!-- Icon SVG --></svg>
        Reset Question
    </button>
    <button id="chem-notes-btn" class="btn btn-secondary">
        <svg><!-- Icon SVG --></svg>
        Read the Chem-notes
    </button>
    <button id="next-btn" class="btn btn-secondary hidden">Next Question</button>
</div>
```

## Component Integration

The components work together in the following ways:

1. **Initialization Flow**
   - The main application initializes the Audio system
   - The Quiz Engine loads questions from the JSON file
   - The first question is loaded into the UI
   - The Drag and Drop system is initialized

2. **Question Interaction Flow**
   - User drags reagents using the Drag and Drop system
   - Audio system provides sound feedback
   - User submits their answer
   - Quiz Engine validates the answer
   - Main application displays appropriate feedback
   - Question Navigation allows progression to the next question

3. **Module Communication**
   - Components communicate through well-defined public APIs
   - The main application coordinates between components
   - State is maintained within each module for its domain
   - UI updates are handled by the component responsible for the specific UI element

4. **Error Handling**
   - Each component includes error handling for its functionality
   - The main application provides fallback behavior for component failures
   - User-friendly error messages are displayed when needed

---

*This document provides detailed information about the core components of the Organic Chemistry Quiz Game. For more information about the overall architecture and project structure, please refer to the architecture and structure documentation.*
