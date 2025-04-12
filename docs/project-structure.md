# Organic Chemistry Quiz Game: Project Structure

## Table of Contents
- [Directory Structure Overview](#directory-structure-overview)
- [Root Directory](#root-directory)
- [CSS Directory](#css-directory)
- [JavaScript Directory](#javascript-directory)
- [Data Directory](#data-directory)
- [Assets Directory](#assets-directory)
- [Documentation Directory](#documentation-directory)
- [File Naming Conventions](#file-naming-conventions)
- [Organization Principles](#organization-principles)

## Directory Structure Overview

The Organic Chemistry Quiz Game follows a clear directory structure organized by file type and function:

```
organic-chemistry-quiz/
│
├── index.html              # Main HTML entry point
├── css/
│   └── styles.css          # Main stylesheet
│
├── js/
│   ├── app.js              # Main application logic
│   ├── quiz-engine.js      # Quiz functionality
│   ├── drag-drop.js        # Drag and drop functionality
│   └── audio.js            # Audio system
│
├── data/
│   └── questions.json      # Question database
│
├── assets/
│   ├── images/             # UI images and icons
│   ├── molecules/          # SVG files for molecule structures
│   └── sound/              # Audio files for sound effects
│
├── docs/                   # Project documentation
│   ├── technical/          # Technical documentation
│   └── features/           # Feature-specific documentation
│
└── README.md               # Project overview
```

## Root Directory

The root directory contains:

- **index.html**: The main HTML file that serves as the entry point for the application.
  - Includes all necessary script and style references
  - Contains the basic HTML structure
  - Initializes the application when loaded

- **README.md**: Project overview documentation with:
  - Brief description
  - Features list
  - Installation instructions
  - Usage guidelines
  - Project structure overview
  - Contribution information

## CSS Directory

The CSS directory contains styling resources:

- **styles.css**: The main stylesheet for the entire application
  - Uses CSS variables for theming (defined in the `:root` selector)
  - Organized by component type
  - Includes responsive design breakpoints
  - Contains all animation and transition definitions

Key sections in styles.css:
1. Base styles and variables
2. Layout and container styles
3. Quiz components (questions, reagents, reactions)
4. Interactive element styles
5. Feedback and notification styles
6. Modal styles
7. Responsive design adjustments
8. Animation definitions
9. Utility classes
10. Accessibility overrides

## JavaScript Directory

The JavaScript directory contains the application logic divided into modular files:

- **app.js**: The main application script
  - Initializes the application
  - Coordinates other modules
  - Sets up event listeners
  - Handles high-level application flow
  - Manages user interactions with the quiz

- **quiz-engine.js**: Handles quiz logic
  - Loads questions from the data file
  - Tracks current question and progress
  - Evaluates answers
  - Manages question navigation
  - Calculates and tracks score

- **drag-drop.js**: Implements drag and drop functionality
  - Sets up drag events for reagent cards
  - Manages drop zones
  - Handles both mouse and touch interactions via Hammer.js
  - Tracks the state of dragged elements
  - Provides interfaces for checking drop zone contents

- **audio.js**: Manages sound effects and audio preferences
  - Loads and plays sound effects
  - Handles mute toggling and persistence
  - Manages browser autoplay restrictions
  - Provides error handling for audio playback

## Data Directory

The data directory contains structured data used by the application:

- **questions.json**: The question database
  - Defines all quiz questions
  - Includes question text, reagents, and products
  - Contains correct and incorrect feedback messages
  - Includes detailed chemistry notes
  - Follows a consistent structure for all questions

Example question format:
```json
{
  "id": "q1",
  "questionText": "Drag reactants to complete the following...",
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

## Assets Directory

The assets directory contains all static resources:

- **images/**: UI images and icons
  - Contains navigation icons
  - UI elements like buttons and backgrounds
  - Branding assets
  - Screenshot for documentation

- **molecules/**: SVG files for molecule structures
  - Contains all molecular structure illustrations
  - Follows consistent naming convention: `molecule-name.svg`
  - Organized by reaction type for easy reference
  - Created and maintained with the custom Promatheus MolGen tool

- **sound/**: Audio files for sound effects
  - Contains all sound effects used in the application
  - Uses MP3 format for broad compatibility
  - Follows consistent naming convention: `action_name.mp3`
  - Includes:
    - `pickup_card.mp3`: Sound for picking up a reagent
    - `drop_card.mp3`: Sound for dropping a reagent
    - `correct_answer.mp3`: Sound for correct answers
    - `wrong_answer.mp3`: Sound for incorrect answers

## Documentation Directory

The docs directory contains all project documentation:

- **technical/**: Technical documentation
  - Contains architecture and component documentation
  - Includes development guides
  - Technical specifications
  - Code standards and conventions

- **features/**: Feature-specific documentation
  - Detailed documentation for specific features
  - Includes implementation details
  - Usage guidelines
  - Feature limitations and future enhancements

Key documentation files:
- `audio-system.md`: Documentation for the audio feedback system
- `question-navigation.md`: Documentation for the question navigation system
- `touch-events.md`: Documentation for mobile touch support

## File Naming Conventions

The project follows these naming conventions:

1. **HTML Files**: Lowercase with hyphens (e.g., `index.html`)
2. **CSS Files**: Lowercase with hyphens (e.g., `styles.css`)
3. **JavaScript Files**: Camel case with hyphens for functional separation (e.g., `quiz-engine.js`)
4. **JSON Files**: Lowercase with hyphens (e.g., `questions.json`)
5. **Image Files**: Lowercase with hyphens (e.g., `molecule-name.svg`)
6. **Audio Files**: Lowercase with underscores for clarity (e.g., `pickup_card.mp3`)
7. **Documentation Files**: Lowercase with hyphens (e.g., `audio-system.md`)

## Organization Principles

The project follows these organization principles:

### 1. Separation of Concerns
- HTML for structure
- CSS for presentation
- JavaScript for behavior
- JSON for data

### 2. Modularity
- Each JavaScript file has a specific responsibility
- Components communicate through well-defined interfaces
- Minimal dependencies between modules

### 3. Progressive Enhancement
- Core functionality works without advanced features
- Enhanced experience with JavaScript enabled
- Accessibility considerations throughout

### 4. Resource Optimization
- Small, focused files
- SVG for scalable graphics
- Minimized asset sizes
- Efficient code patterns

### 5. Consistent Structure
- Predictable file locations
- Standard naming conventions
- Logical grouping of related files
- Clear separation of application code and assets

### 6. Documentation Integration
- Documentation alongside code
- Feature-specific documentation
- Technical and non-technical documentation
- Maintained with code changes

---

*This document provides an overview of the Organic Chemistry Quiz Game project structure. For more detailed information about specific components, please refer to the component documentation.*
