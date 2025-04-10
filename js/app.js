/**
 * Organic Chemistry Quiz Game
 * Main Application Script
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the quiz
    initializeQuiz();
    
    // Set up event listeners
    setupEventListeners();
    
    // Prevent page scrolling during touch drag operations
    document.addEventListener('touchmove', function(e) {
        const body = document.body;
        if (body.classList.contains('touch-dragging')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent zoom/scaling during interaction with the quiz
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault(); // Prevent pinch zoom
        }
    }, { passive: false });
});

// Loading indicator management
const LoadingIndicator = {
    show: () => {
        document.getElementById('loading-indicator').classList.add('show');
    },
    hide: () => {
        document.getElementById('loading-indicator').classList.remove('show');
    }
};

/**
 * Initialize the quiz by loading questions and setting up the first question
 */
async function initializeQuiz() {
    try {
        // Check if modules are available
        if (typeof DragDrop === 'undefined' || typeof QuizEngine === 'undefined') {throw new Error('Required modules are not loaded');}
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

/**
 * Set up all event listeners for the quiz interface
 */
function setupEventListeners() {
    // Submit button
    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', handleSubmit);
    
    // Next question button
    const nextButton = document.getElementById('next-btn');
    nextButton.addEventListener('click', handleNextQuestion);
    
    // Reset button
    const resetButton = document.getElementById('reset-btn');
    resetButton.addEventListener('click', resetQuestion);
    
    // Chemistry notes button
    const chemNotesButton = document.getElementById('chem-notes-btn');
    chemNotesButton.addEventListener('click', handleChemNotesClick);
    
    // Modal close button
    const closeModalButton = document.querySelector('.close-modal');
    closeModalButton.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    const modal = document.getElementById('notes-modal');
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Keyboard events for accessibility
    document.addEventListener('keydown', (event) => {
        // Close modal with Escape key
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // Add touch event handlers for better mobile experience
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        // Prevent default touch actions on buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.classList.add('touch-active');
            }, { passive: false });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.classList.remove('touch-active');
            }, { passive: false });
        });
        
        // Double-tap prevention
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault();
            }
            lastTap = currentTime;
        });
    }
}

/**
 * Handle submission of an answer
 */
function handleSubmit() {
    // Get the current drop zones' content
    const dropZone1Content = DragDrop.getDropZoneContent(1);
    const dropZone2Content = DragDrop.getDropZoneContent(2);
    
    // Check if both drop zones have reagents
    if (!dropZone1Content || !dropZone2Content) {
        showFeedback('Please place both reactants before submitting.', 'error');
        return;
    }
    
    // Show loading indicator while checking answer
    LoadingIndicator.show();
    
    // Check the answer
    const isCorrect = QuizEngine.checkAnswer([dropZone1Content.id, dropZone2Content.id]);
    
    // Hide loading indicator
    LoadingIndicator.hide();
    
    if (isCorrect) {
        showFeedback(QuizEngine.getCurrentQuestion().correctFeedback, 'success');
        document.getElementById('score').textContent = QuizEngine.getScore();
        document.getElementById('next-btn').classList.remove('hidden');
        
        // Disable dragging after correct submission
        DragDrop.setDraggingEnabled(false);
        
        // Provide haptic feedback on supported devices
        if (window.navigator.vibrate) {
            window.navigator.vibrate([100, 50, 100]); // Success pattern
        }
    } else {
        showFeedback(QuizEngine.getCurrentQuestion().incorrectFeedback, 'error');
        // Keep dragging enabled for incorrect answers so user can try again
        
        // Provide haptic feedback for incorrect answer
        if (window.navigator.vibrate) {
            window.navigator.vibrate(50); // Short buzz
        }
    }
}

/**
 * Handle moving to the next question
 */
function handleNextQuestion() {
    // Show loading indicator
    LoadingIndicator.show();
    
    // Move to the next question
    const nextQuestionLoaded = QuizEngine.nextQuestion();
    
    if (nextQuestionLoaded) {
        // Reset the UI
        resetQuestionUI();
        
        // Update progress
        updateProgress();
        
        // Re-enable dragging for the new question
        DragDrop.setDraggingEnabled(true);
        
        // Re-initialize drag and drop for the new question
        DragDrop.initialize();
        
        // Provide haptic feedback for new question
        if (window.navigator.vibrate) {
            window.navigator.vibrate(30);
        }
    } else {
        // Quiz is complete
        showQuizComplete();
    }
    
    // Hide loading indicator
    LoadingIndicator.hide();
}

/**
 * Reset the UI for a new question
 */
function resetQuestionUI() {
    // Clear drop zones
    DragDrop.clearDropZones();
    
    // Hide feedback and next button
    document.getElementById('feedback-container').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
}

/**
 * Update the progress indicators
 */
function updateProgress() {
    const currentQuestionNum = QuizEngine.getCurrentQuestionNumber() + 1;
    const totalQuestions = QuizEngine.getTotalQuestions();
    
    document.getElementById('current-question').textContent = currentQuestionNum;
    
    // Update progress bar
    const progressPercentage = (currentQuestionNum / totalQuestions) * 100;
    document.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
}

/**
 * Display feedback to the user
 * @param {string} message - The feedback message
 * @param {string} type - The type of feedback (success, error, info)
 */
function showFeedback(message, type = 'info') {
    const feedbackContainer = document.getElementById('feedback-container');
    feedbackContainer.textContent = message;
    feedbackContainer.className = `feedback ${type}`;
    feedbackContainer.classList.remove('hidden');
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    const container = document.querySelector('.question-container');
    container.innerHTML = `
        <div class="error-message">
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Reload</button>
        </div>
    `;
}

/**
 * Handle the chemistry notes button click
 */
function handleChemNotesClick() {
    // Get notes from the current question
    const notes = QuizEngine.getCurrentQuestion().chemistryNotes;
    
    // Populate the modal
    document.getElementById('notes-content').innerHTML = notes;
    
    // Show the modal
    document.getElementById('notes-modal').classList.add('show');
}

/**
 * Reset the current question
 */
function resetQuestion() {
    // Show loading indicator
    LoadingIndicator.show();
    
    // Clear drop zones
    DragDrop.clearDropZones();
    
    // Hide feedback and next button
    document.getElementById('feedback-container').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    
    // Re-enable dragging
    DragDrop.setDraggingEnabled(true);
    
    // Make sure all reagent cards are visible
    document.querySelectorAll('.reagent-card').forEach(card => {
        card.style.visibility = 'visible';
    });
    
    // Hide loading indicator
    LoadingIndicator.hide();
    
    // Provide haptic feedback
    if (window.navigator.vibrate) {
        window.navigator.vibrate(30);
    }
}

/**
 * Close the modal
 */
function closeModal() {
    document.getElementById('notes-modal').classList.remove('show');
}

/**
 * Show the quiz completion screen
 */
function showQuizComplete() {
    const container = document.querySelector('.question-container');
    const score = QuizEngine.getScore();
    const totalQuestions = QuizEngine.getTotalQuestions();
    const percentage = Math.round((score / totalQuestions) * 100);
    
    let message;
    let className;
    
    if (percentage >= 80) {
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
            <p>Your score: ${score}/${totalQuestions} (${percentage}%)</p>
            <p>${message}</p>
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
            </div>
        </div>
    `;
}
