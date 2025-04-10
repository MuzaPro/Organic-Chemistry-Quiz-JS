/**
 * Organic Chemistry Quiz Game
 * Main Application Script with Mobile Touch Enhancements
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile drag-and-drop polyfill if available
    if (typeof MobileDragDrop !== 'undefined') {
        // Initialize the polyfill
        MobileDragDrop.polyfill({
            // Use this to make it work inside scrollable elements
            dragImageTranslateOverride: MobileDragDrop.scrollBehaviourDragImageTranslateOverride,
            // Shorter hold time for better mobile experience
            holdToDrag: 200
        });
        console.log('Mobile drag-and-drop polyfill initialized');
        
        // Handle global touch events to prevent unwanted behaviors
        document.addEventListener('touchmove', function(event) {
            // Prevent scrolling during drag operations
            const draggingElement = document.querySelector('.dragging');
            if (draggingElement) {
                event.preventDefault();
            }
        }, { passive: false });
    }
    
    // Test if drag-and-drop is supported
    const testDragDrop = () => {
        // Create a test element
        const div = document.createElement('div');
        // Check if it has draggable property
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };
    
    // Display a notification if drag-and-drop might not be fully supported
    if (!testDragDrop()) {
        const message = document.createElement('div');
        message.className = 'notice';
        message.textContent = 'Touch-based drag-and-drop may not be fully supported on your device. Try tapping and holding an item to drag it.';
        
        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.insertBefore(message, quizContainer.firstChild);
    }
    
    // Initialize the quiz
    initializeQuiz();
    
    // Set up event listeners
    setupEventListeners();
});

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
 * Enhanced with keyboard accessibility
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
        
        // Handle Enter key for drop zones
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('drop-zone')) {
                // Show a menu of draggable items
                showDraggableItemsMenu(activeElement);
            }
        }
    });
    
    // Add touch-specific handling for drop zones
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.addEventListener('touchstart', (e) => {
            // Don't add any special handling yet, but prevent default behavior
            // for drop zones that already have content
            if (zone.classList.contains('filled')) {
                e.preventDefault();
            }
        }, { passive: false });
    });
}

/**
 * Creates an accessible menu for keyboard users to select draggable items
 * @param {Element} dropZone - The drop zone that received focus
 */
function showDraggableItemsMenu(dropZone) {
    // Only show the menu if we're in an interactive state
    if (!DragDrop.isDraggingEnabled) return;
    
    // Create a menu of all available reagents
    const reagentCards = document.querySelectorAll('.reagent-card');
    if (reagentCards.length === 0) return;
    
    // Create a menu element
    const menu = document.createElement('div');
    menu.className = 'keyboard-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Select a reagent');
    
    // Add each visible reagent as an option
    let menuItems = [];
    reagentCards.forEach(card => {
        // Skip hidden cards (already in use)
        if (card.style.visibility === 'hidden') return;
        
        const menuItem = document.createElement('button');
        menuItem.className = 'keyboard-menu-item';
        menuItem.setAttribute('role', 'menuitem');
        menuItem.textContent = card.getAttribute('data-name');
        
        menuItem.addEventListener('click', () => {
            // Find the zone object
            const zoneNumber = parseInt(dropZone.getAttribute('data-zone'));
            const zoneObj = { element: dropZone, zone: zoneNumber, content: null };
            
            // Add the selected reagent to the drop zone
            DragDrop.addToDropZone(zoneObj, card);
            
            // Remove the menu
            document.body.removeChild(menu);
        });
        
        menu.appendChild(menuItem);
        menuItems.push(menuItem);
    });
    
    // Only show menu if we have items to display
    if (menuItems.length === 0) return;
    
    // Position the menu near the drop zone
    const rect = dropZone.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    menu.style.left = (rect.left + window.scrollX) + 'px';
    
    // Add the menu to the document
    document.body.appendChild(menu);
    
    // Focus the first menu item
    if (menuItems.length > 0) {
        menuItems[0].focus();
    }
    
    // Close the menu when clicking outside
    const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
            document.body.removeChild(menu);
            document.removeEventListener('click', closeMenu);
            dropZone.focus(); // Return focus to the drop zone
        }
    };
    
    // Set a small timeout to avoid immediate closing
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 100);
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
    
    // Check the answer
    const isCorrect = QuizEngine.checkAnswer([dropZone1Content.id, dropZone2Content.id]);
    
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
        
        // Different vibration pattern for incorrect
        if (window.navigator.vibrate) {
            window.navigator.vibrate(250); // Longer single vibration
        }
    }
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
        
        // Re-enable dragging for the new question
        DragDrop.setDraggingEnabled(true);

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
    
    // For screen readers
    feedbackContainer.setAttribute('aria-live', 'assertive');
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    const container = document.querySelector('.question-container');
    container.innerHTML = `
        <div class="error-message" role="alert">
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
    const modal = document.getElementById('notes-modal');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Set focus on the close button
    document.querySelector('.close-modal').focus();
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
    const modal = document.getElementById('notes-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    
    // Return focus to the chem notes button
    document.getElementById('chem-notes-btn').focus();
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
        <div class="quiz-complete ${className}" role="status" aria-live="polite">
            <h2>Quiz Complete!</h2>
            <p>Your score: ${score}/${totalQuestions} (${percentage}%)</p>
            <p>${message}</p>
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
            </div>
        </div>
    `;
    
    // Provide haptic feedback for quiz completion
    if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100, 50, 100]); // Completion pattern
    }
}