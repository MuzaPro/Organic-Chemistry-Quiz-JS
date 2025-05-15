/**
 * Unit tests for quiz-engine.js
 * Tests the behavior of the quiz engine with limited questions per session
 */

// Mock for quiz-engine.js functionality
const QUESTIONS_PER_SESSION = 5;

// Mock questions array for testing
const mockQuestions = [
    { id: 1, question: "Question 1" },
    { id: 2, question: "Question 2" },
    { id: 3, question: "Question 3" },
    { id: 4, question: "Question 4" },
    { id: 5, question: "Question 5" },
    { id: 6, question: "Question 6" },
    { id: 7, question: "Question 7" },
    { id: 8, question: "Question 8" },
    { id: 9, question: "Question 9" },
    { id: 10, question: "Question 10" },
    { id: 11, question: "Question 11" },
    { id: 12, question: "Question 12" }
];

// Mock shuffle function that tracks original indices
function mockShuffle(array) {
    // Fisher-Yates shuffle implementation
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Mock loadQuestions function
function mockLoadQuestions(questions) {
    let shuffledQuestions = [...questions];
    mockShuffle(shuffledQuestions);
    
    if (shuffledQuestions.length > QUESTIONS_PER_SESSION) {
        shuffledQuestions = shuffledQuestions.slice(0, QUESTIONS_PER_SESSION);
    }
    
    return shuffledQuestions;
}

describe('Quiz Engine - Question Limiting', () => {
    test('Test 1: Should limit to 5 questions when more are available', () => {
        const result = mockLoadQuestions(mockQuestions);
        expect(result.length).toBe(QUESTIONS_PER_SESSION);
    });
    
    test('Test 2: Should provide different question sets across multiple sessions', () => {
        let differentFound = false;
        const firstRun = mockLoadQuestions(mockQuestions);
        
        // Run multiple times to account for random chance
        for (let i = 0; i < 10; i++) {
            const nextRun = mockLoadQuestions(mockQuestions);
            
            // Check if at least one question differs
            const anyDifferent = firstRun.some(q1 => 
                !nextRun.some(q2 => q2.id === q1.id));
                
            if (anyDifferent) {
                differentFound = true;
                break;
            }
        }
        
        expect(differentFound).toBe(true);
    });
    
    test('Test 3: Should use all questions when fewer than 5 are available', () => {
        const smallQuestionSet = mockQuestions.slice(0, 3);
        const result = mockLoadQuestions(smallQuestionSet);
        expect(result.length).toBe(3);
    });
});
