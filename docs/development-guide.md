# Organic Chemistry Quiz Game: Development Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Setup](#project-setup)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Adding New Questions](#adding-new-questions)
- [Creating New Features](#creating-new-features)
- [Testing Guidelines](#testing-guidelines)
- [Deployment Process](#deployment-process)
- [Ticket System](#ticket-system)
- [Common Issues and Solutions](#common-issues-and-solutions)

## Getting Started

This guide will help you set up your development environment and understand the workflow for contributing to the Organic Chemistry Quiz Game project.

### Prerequisites

Before you begin, make sure you have the following installed:
- Git
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A code editor (VS Code recommended)
- Basic understanding of HTML, CSS, and JavaScript
- [Optional] Node.js (for local server)
- [Optional] Python (for local server alternative)

## Development Environment

### Recommended Tools

1. **VS Code** - Primary IDE with the following extensions:
   - Live Server
   - Prettier - Code formatter
   - ESLint
   - HTML CSS Support
   - JavaScript (ES6) code snippets
   - Markdown All in One
   - GitHub Copilot (if available)

2. **Browser DevTools** - For debugging and testing
   - Chrome DevTools or Firefox Developer Tools
   - Mobile device emulation for responsive testing

3. **Git** - For version control
   - GitHub Desktop or GitKraken (optional GUI clients)

4. **Local Server** - For development
   - VS Code Live Server extension
   - Node.js `npx serve` command
   - Python's `python -m http.server`

## Project Setup

### Cloning the Repository

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Organic-Chemistry-Quiz-JS.git
   ```

2. Navigate to the project directory:
   ```bash
   cd organic-chemistry-quiz
   ```

### Setting up VS Code

1. Open the project in VS Code:
   ```bash
   code .
   ```

2. Configure workspace settings:
   - Create `.vscode/settings.json` with:
     ```json
     {
       "editor.formatOnSave": true,
       "editor.defaultFormatter": "esbenp.prettier-vscode",
       "editor.tabSize": 2,
       "liveServer.settings.donotShowInfoMsg": true,
       "files.eol": "\n"
     }
     ```

### Running the Project

1. Using VS Code Live Server:
   - Right-click on `index.html`
   - Select "Open with Live Server"

2. Using Node.js:
   ```bash
   npx serve
   ```

3. Using Python:
   ```bash
   python -m http.server
   ```

4. Access the application at:
   - http://localhost:5500/index.html (Live Server)
   - http://localhost:3000 (Node.js)
   - http://localhost:8000 (Python)

## Development Workflow

### Branching Strategy

Use the following branching strategy:
- `main` - Production branch, contains stable code
- `development` - Integration branch for testing features
- `feature/feature-name` - Feature branches for new development
- `bugfix/bug-name` - Bug fix branches

### Workflow Steps

1. **Create a new branch**:
   ```bash
   git checkout development
   git pull
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** to the codebase according to the ticket or feature requirements.

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Meaningful commit message"
   ```

4. **Push your branch**:
   ```bash
   git push -u origin feature/your-feature-name
   ```

5. **Create a pull request** to merge your changes into the development branch.

6. **Address review comments** if any are provided.

7. **Merge into development** once approved.

8. **Test in development** before merging to main.

## Code Style Guidelines

### HTML Guidelines

- Use semantic HTML elements
- Include appropriate ARIA attributes for accessibility
- Keep markup clean and properly indented
- Use HTML5 doctype

Example:
```html
<section class="quiz-section">
  <h2>Question</h2>
  <div class="question-content" aria-live="polite">
    <p id="question-text">Question text goes here</p>
  </div>
</section>
```

### CSS Guidelines

- Use the BEM (Block, Element, Modifier) naming convention
- Organize CSS by component
- Use CSS variables for theming
- Include responsive designs with media queries

Example:
```css
/* BEM Naming Example */
.question-card {}
.question-card__title {}
.question-card__content {}
.question-card--highlighted {}

/* Using Variables */
:root {
  --primary-color: #4361ee;
  --secondary-color: #f8f9fa;
}

.button {
  background-color: var(--primary-color);
}
```

### JavaScript Guidelines

- Use ES6+ features
- Follow the Module Pattern for encapsulation
- Use descriptive variable and function names
- Include JSDoc comments for functions
- Handle errors appropriately

Example:
```javascript
/**
 * Check if the answer is correct
 * @param {Array} userAnswer - Array of reagent IDs
 * @returns {boolean} Whether the answer is correct
 */
const checkAnswer = (userAnswer) => {
  try {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.correctReagents;
    
    // Sort both arrays to ensure order doesn't matter
    const sortedUserAnswer = [...userAnswer].sort();
    const sortedCorrectAnswer = [...correctAnswer].sort();
    
    return JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
  } catch (error) {
    console.error('Error checking answer:', error);
    return false;
  }
};
```

## Adding New Questions

Adding new questions to the quiz is straightforward. Follow these steps:

### 1. Understand the Question Format

Each question in `data/questions.json` follows this structure:

```json
{
  "id": "q6",
  "questionText": "Complete this reaction to form...",
  "product": {
    "name": "Product Name",
    "formula": "Chemical Formula",
    "imagePath": "assets/molecules/product-name.svg",
    "textRepresentation": "Text Representation"
  },
  "reagents": [
    {
      "id": "reagent-1",
      "name": "Reagent Name",
      "formula": "Chemical Formula",
      "imagePath": "assets/molecules/reagent-name.svg",
      "textRepresentation": "Text Representation"
    },
    // More reagents...
  ],
  "correctReagents": ["reagent-1", "reagent-3"],
  "reactionType": "Reaction Type",
  "correctFeedback": "Correct answer feedback",
  "incorrectFeedback": "Incorrect answer feedback",
  "chemistryNotes": "<p>Detailed notes about the reaction</p>"
}
```

### 2. Create Molecule SVGs

If needed, create SVG files for new molecules:
1. Design molecule structures using a chemistry drawing tool
2. Save as SVG files
3. Place them in the `assets/molecules/` directory
4. Use a consistent naming convention: `compound-name.svg`

### 3. Add Question to JSON

1. Open `data/questions.json`
2. Add your new question object to the `questions` array
3. Ensure the `id` is unique (e.g., incrementing from existing questions)
4. Include all required fields as shown above
5. Validate the JSON format to ensure it's correct

### 4. Test Your Question

1. Run the application
2. Check that your question appears
3. Verify that the correct answer works
4. Test incorrect answers for appropriate feedback
5. Review chemistry notes for accuracy

### 5. Best Practices for Questions

- Provide clear and concise question text
- Include 5-6 reagent options for each question
- Ensure exactly 2 correct reagents for consistency
- Write informative feedback messages
- Include detailed chemistry notes with proper HTML formatting
- Use IUPAC nomenclature for chemical names
- Ensure formulas are accurate

## Creating New Features

When adding new features to the quiz game, follow these guidelines:

### 1. Plan Your Feature

- Create a ticket describing the feature
- Outline the requirements and acceptance criteria
- Identify which existing components will be affected
- Plan new components if needed

### 2. Code Organization

- Create new files for significant new features
- Follow the existing module pattern
- Keep related functionality together
- Document public APIs

### 3. Integration Steps

1. **Create new modules** if needed:
   ```javascript
   const NewFeature = (() => {
     // Private variables and functions
     
     // Public API
     return {
       initialize: () => { /* Implementation */ },
       publicMethod: () => { /* Implementation */ }
     };
   })();
   ```

2. **Register with main application** in `app.js`:
   ```javascript
   document.addEventListener('DOMContentLoaded', () => {
     // Initialize existing components
     
     // Initialize new feature
     NewFeature.initialize();
   });
   ```

3. **Update HTML** to include new UI elements if needed

4. **Add CSS** for new components

### 4. Documentation

Document your new feature:
1. Update relevant documentation files
2. Add JSDoc comments to functions
3. Create a feature-specific documentation file if substantial

## Testing Guidelines

### Manual Testing

Test your changes thoroughly before submitting:

1. **Functionality Testing**
   - Verify that all features work as expected
   - Test edge cases and error conditions
   - Ensure proper state management

2. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari, and Edge
   - Verify functionality works consistently

3. **Responsive Testing**
   - Test on different screen sizes
   - Verify the layout adapts appropriately
   - Test using device emulators in browser dev tools

4. **Accessibility Testing**
   - Test keyboard navigation
   - Verify screen reader compatibility
   - Check color contrast

### Testing Checklist

For each pull request, verify:
- [ ] All functionality works as expected
- [ ] No console errors or warnings
- [ ] Responsive design works on all screen sizes
- [ ] Code follows style guidelines
- [ ] Documentation is updated

## Deployment Process

The application is deployed to GitHub Pages. Follow these steps for deployment:

### 1. Prepare for Deployment

1. Merge changes into the `development` branch
2. Test thoroughly in the development environment
3. Update version number if needed

### 2. Merge to Main

1. Create a pull request from `development` to `main`
2. Have it reviewed by another developer
3. Merge once approved

### 3. GitHub Pages Deployment

GitHub Pages automatically deploys from the `main` branch. To set up:

1. Go to the repository settings
2. Navigate to the "Pages" section
3. Select the `main` branch for deployment
4. Click "Save"

The application will be deployed to: https://username.github.io/repository-name/

## Ticket System

The project uses a ticket system for tracking work. Each ticket should include:

### Ticket Format

```markdown
# Ticket #[Number]: [Title]

**STATUS:** OPEN/IN PROGRESS/CLOSED
**Priority:** High/Medium/Low
**Type:** Feature/Bug/Enhancement
**Estimate:** [Time Estimate]
**Assigned to:** [Developer Name]

## Description
[Detailed description of the task]

## Tasks
1. [Specific task 1]
2. [Specific task 2]
...

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
...

## Related Files
- [File path 1]
- [File path 2]
...

## Implementation Notes
[Notes for implementation, if any]
```

### Ticket Workflow

1. **Create** a new ticket for each feature or bug
2. **Assign** the ticket to a developer
3. Update the status to **IN PROGRESS** when work begins
4. Create a feature branch based on the ticket number
5. Reference the ticket number in commit messages
6. Update the ticket with progress notes
7. Mark acceptance criteria as completed
8. Change status to **CLOSED** when completed

## Common Issues and Solutions

### Error: "Required modules are not loaded"

**Cause**: Script loading order issue

**Solution**:
- Check that all script tags are in the correct order in `index.html`
- Ensure all required scripts are included
- Check browser console for specific script loading errors

### Touch Events Not Working on Mobile

**Cause**: Hammer.js integration issue or missing touch-specific handling

**Solution**:
- Verify Hammer.js is properly loaded
- Check the `isTouchDevice` detection
- Ensure touch event handlers are properly set up
- Test with different mobile browsers

### Audio Not Playing on Mobile

**Cause**: Mobile browsers require user interaction before playing audio

**Solution**:
- Ensure audio is triggered by user interaction
- Implement the error handling in the audio play method
- Use the playSoundSafely wrapper function

### Question Not Loading Correctly

**Cause**: JSON format issue or missing assets

**Solution**:
- Validate the question JSON format
- Check that all referenced assets exist
- Verify the question has all required fields
- Check browser console for specific errors

---

*This document provides guidelines for developing the Organic Chemistry Quiz Game. For more detailed information about specific components, please refer to the component documentation.*
