/**
 * Quiz Engine
 * Handles loading questions, checking answers, and tracking progress
 */

const QuizEngine = (() => {
    // Private variables
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    
    /**
     * Number of questions to display per quiz session
     * @constant {number}
     */
    const QUESTIONS_PER_SESSION = 5;
    
    /**
     * Load questions from the JSON file
     * @returns {Promise} A promise that resolves when questions are loaded
     */
    const loadQuestions = async () => {
        try {
            const response = await fetch('data/questions.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            let data = await response.json();
            let allQuestions = data.questions;
            
            // Shuffle all questions first
            shuffleQuestions(allQuestions);
            
            // Limit to QUESTIONS_PER_SESSION (or use all if fewer are available)
            if (allQuestions.length > QUESTIONS_PER_SESSION) {
                allQuestions = allQuestions.slice(0, QUESTIONS_PER_SESSION);
            }
            
            questions = allQuestions; // Update the questions array
            
            return true;
        } catch (error) {
            console.error('Error loading questions:', error);
            throw error;
        }
    };
    
    /**
     * Shuffle the questions array
     */
    const shuffleQuestions = (questionsArray) => {
        // Fisher-Yates shuffle algorithm
        for (let i = questionsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questionsArray[i], questionsArray[j]] = [questionsArray[j], questionsArray[i]];
        }
    };
    
    /**
     * Load a specific question into the UI
     * @param {number} index - The index of the question to load
     */
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
        const productDisplay = document.getElementById('product-display');
        productDisplay.innerHTML = ''; // Clear previous content
        
        // Check if we have an image path or text representation
        if (question.product.imagePath) {
            const productImage = document.createElement('img');
            productImage.src = question.product.imagePath;
            productImage.alt = question.product.name;
            productImage.className = 'molecule-image';
            productDisplay.appendChild(productImage);
        } else {
            // Use text representation
            const productText = document.createElement('div');
            productText.textContent = question.product.textRepresentation;
            productText.className = 'molecule-text';
            productDisplay.appendChild(productText);
        }
        
        // Load reagents into the reagent bank
        const reagentBank = document.getElementById('reagent-bank');
        reagentBank.innerHTML = ''; // Clear previous reagents
        
        question.reagents.forEach(reagent => {
            const reagentCard = document.createElement('div');
            reagentCard.className = 'reagent-card';
            reagentCard.setAttribute('data-id', reagent.id);
            reagentCard.setAttribute('data-name', reagent.name);
            reagentCard.setAttribute('draggable', 'true');
            
            // Create either an image or text representation
            if (reagent.imagePath) {
                const img = document.createElement('img');
                img.src = reagent.imagePath;
                img.alt = reagent.name;
                img.className = 'molecule-image';
                reagentCard.appendChild(img);
            } else {
                // Text representation
                const text = document.createElement('div');
                text.textContent = reagent.textRepresentation;
                text.className = 'molecule-text';
                reagentCard.appendChild(text);
            }
            
            reagentBank.appendChild(reagentCard);
        });
        
        return true;
    };
    
    /**
     * Check if the provided answer is correct
     * @param {Array} userAnswer - Array of reagent IDs
     * @returns {boolean} Whether the answer is correct
     */
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
    
    /**
     * Move to the next question
     * @returns {boolean} Whether there was a next question to load
     */
    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            return loadQuestion(currentQuestionIndex + 1);
        }
        return false; // No more questions
    };
    
    /**
     * Get the current question data
     * @returns {Object} The current question object
     */
    const getCurrentQuestion = () => {
        return questions[currentQuestionIndex];
    };
    
    /**
     * Get the current question number (1-indexed)
     * @returns {number} The current question number
     */
    const getCurrentQuestionNumber = () => {
        return currentQuestionIndex;
    };
    
    /**
     * Get the total number of questions
     * @returns {number} The total number of questions
     */
    const getTotalQuestions = () => {
        return questions.length;
    };
    
    /**
     * Get the current score
     * @returns {number} The current score
     */
    const getScore = () => {
        return score;
    };
    
    // Public API
    return {
        loadQuestions,
        loadQuestion,
        checkAnswer,
        nextQuestion,
        getCurrentQuestion,
        getCurrentQuestionNumber,
        getTotalQuestions,
        getScore
    };
})();
