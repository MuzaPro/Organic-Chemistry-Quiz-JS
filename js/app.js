/**
 * Organic Chemistry Quiz Game
 * Main Application Script
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize audio first
        AudioManager.initialize();
        
        // Initialize theme manager
        ThemeManager.initialize();
        
        // Set up intro screen event listener
        const startButton = document.getElementById('start-quiz-btn');
        startButton.addEventListener('click', startQuiz);
        
        // Set up other event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorMessage('Failed to initialize application. Please refresh the page or try again later.');
    }
    createDynamicBackground();
});

/**
 * Start the quiz when the start button is clicked
 */
async function startQuiz() {
    // Hide main intro screen with fade
    const introScreen = document.getElementById('intro-screen');
    introScreen.style.transition = 'opacity 0.7s ease';
    introScreen.style.opacity = '0';
    
    // After intro screen fade completes, show instruction screen
    setTimeout(() => {
        introScreen.style.display = 'none';
        
        // Show instruction screen
        const instructionScreen = document.getElementById('instruction-screen');
        instructionScreen.style.display = 'flex';
        instructionScreen.style.opacity = '0';
        
        // Fade in instruction screen
        setTimeout(() => {
            instructionScreen.style.transition = 'opacity 0.5s ease';
            instructionScreen.style.opacity = '1';
            
            // Keep instruction screen visible for 4 seconds before starting quiz
            setTimeout(() => {
                // Begin fading out instruction screen
                instructionScreen.style.opacity = '0';
                
                // Once instruction screen fade out completes, begin quiz initialization
                setTimeout(() => {
                    instructionScreen.style.display = 'none';
                    
                    // Show app container
                    const appContainer = document.querySelector('.app-container');
                    appContainer.classList.add('show');
                    
                    // Begin quiz initialization with animations
                    initializeQuiz();
                }, 500); // Instruction fade-out time
            }, 4000); // Instruction display time - 4 FULL SECONDS
        }, 100); // Small delay before instruction fade-in
    }, 700); // Intro screen fade-out time
}

/**
 * Initialize the quiz by loading questions and setting up the first question
 */
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
        
        // Get UI elements for animation
        const questionText = document.getElementById('question-text');
        const reactionArea = document.querySelector('.reaction-area');
        const reagentBank = document.getElementById('reagent-bank');
        
        // Ensure all elements start invisible
        questionText.style.opacity = '0';
        questionText.style.transform = 'translateY(-20px)';
        reactionArea.style.opacity = '0';
        reagentBank.style.opacity = '0';
        
        // Load the first question (elements are still invisible)
        QuizEngine.loadQuestion(0);
        
        // SEQUENCE: Animate each element with deliberate pacing
        
        // 1. First animate in the question text
        setTimeout(() => {
            questionText.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            questionText.style.opacity = '1';
            questionText.style.transform = 'translateY(0)';
            
            // 2. Then animate in the reaction area
            setTimeout(() => {
                reactionArea.style.transition = 'opacity 0.6s ease';
                reactionArea.style.opacity = '1';
                
                // 3. Finally animate in the reagent bank
                setTimeout(() => {
                    reagentBank.style.transition = 'opacity 0.6s ease';
                    reagentBank.style.opacity = '1';
                    
                    // 4. Initialize drag and drop only after all animations complete
                    setTimeout(() => {
                        DragDrop.initialize();
                    }, 600);
                }, 600);
            }, 600);
        }, 100);
        
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
    
    // Check the answer using the correct reagentId property
    const isCorrect = QuizEngine.checkAnswer([dropZone1Content.reagentId, dropZone2Content.reagentId]);
    
    if (isCorrect) {
        showFeedback(QuizEngine.getCurrentQuestion().correctFeedback, 'success');
        document.getElementById('score').textContent = QuizEngine.getScore();
        
        // Play correct sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.play('correct');
        }
        
        // Disable dragging and reset button after correct submission
        DragDrop.setDraggingEnabled(false);
        const resetButton = document.getElementById('reset-btn');
        resetButton.disabled = true;
        resetButton.classList.add('disabled');
        
        // Disable submit button after correct answer
        const submitButton = document.getElementById('submit-btn');
        submitButton.disabled = true;
        submitButton.classList.add('disabled');
    } else {
        showFeedback(QuizEngine.getCurrentQuestion().incorrectFeedback, 'error');
        
        // Play wrong sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.play('wrong');
        }
        // Add skip message
        document.getElementById('feedback-container').innerHTML += 
            '<p class="skip-text">You can try again or move to the next question.</p>';
    }
    
    // Change Next button to primary style after submission
    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.remove('btn-secondary');
    nextBtn.classList.add('btn-primary');
}

/**
 * Handle moving to the next question
 */
function handleNextQuestion() {
    // Move to the next question
    const nextQuestionLoaded = QuizEngine.nextQuestion();
    
    if (nextQuestionLoaded) {
        // Reset the UI
        resetQuestionUI();
        
        // Update progress
        updateProgress();
        
        // Re-enable dragging and reset button for the new question
        DragDrop.setDraggingEnabled(true);
        const resetButton = document.getElementById('reset-btn');
        resetButton.disabled = false;
        resetButton.classList.remove('disabled');

        // Re-enable and show submit button for the new question
        const submitButton = document.getElementById('submit-btn');
        submitButton.disabled = false;
        submitButton.classList.remove('disabled');

        // Reset Next button to secondary style
        const nextBtn = document.getElementById('next-btn');
        nextBtn.classList.remove('btn-primary');
        nextBtn.classList.add('btn-secondary');

        // Re-initialize drag and drop for the new question
        DragDrop.initialize();
    } else {
        // Quiz is complete
        showQuizComplete();
    }
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
    
    // CRITICAL: Ensure all elements have proper visibility for next question
    const questionText = document.getElementById('question-text');
    const reactionArea = document.querySelector('.reaction-area');
    const reagentBank = document.getElementById('reagent-bank');
    
    // Remove any transitions that might have been added
    questionText.style.transition = 'none';
    reactionArea.style.transition = 'none';
    reagentBank.style.transition = 'none';
    
    // Reset transformations and ensure full visibility
    questionText.style.opacity = '1';
    questionText.style.transform = 'translateY(0)';
    reactionArea.style.opacity = '1';
    reagentBank.style.opacity = '1';
    
    // Re-enable any disabled elements
    reagentBank.querySelectorAll('.reagent-card').forEach(card => {
        card.style.visibility = 'visible';
        card.style.opacity = '1';
    });
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
    let certificateHTML = '';
    
    if (percentage === 100) {
        message = 'Perfect! You have mastered organic chemistry reactions!';
        className = 'success perfect-score';
        certificateHTML = `
            <div class="certificate-container">
                <img src="assets/images/rosette-discount-check.svg" alt="Achievement certificate" class="certificate-svg">
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

/**
 * Create dynamic background with chemistry-themed elements
 */
function createDynamicBackground() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    // Create background for both intro screen and main app
    const introScreen = document.getElementById('intro-screen');
    const appContainer = document.querySelector('.app-container');
    
    [introScreen, appContainer].forEach(container => {
        if (!container) return;
        
        const background = document.createElement('div');
        background.className = 'dynamic-background';
        
        // Create background elements
        for (let i = 0; i < 15; i++) {
            const element = document.createElement('div');
            element.className = 'bg-element';
            
            // Random size between 30px and 100px
            const size = Math.random() * 70 + 30;
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            
            // Random position
            element.style.left = `${Math.random() * 100}%`;
            element.style.top = `${Math.random() * 100}%`;
            
            // Random animation delay and duration
            element.style.animationDelay = `${Math.random() * 20}s`;
            element.style.animationDuration = `${Math.random() * 10 + 15}s`;
            
            // Add random shape class
            const shapeType = Math.floor(Math.random() * 3);
            element.classList.add(
                shapeType === 0 ? 'bg-hexagon' :
                shapeType === 1 ? 'bg-benzene' : 'bg-molecule'
            );
            
            background.appendChild(element);
        }
        
        container.insertBefore(background, container.firstChild);
    });
}
