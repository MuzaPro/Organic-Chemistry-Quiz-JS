# Ticket #15: Integrate Sound Effects System

**STATUS: CLOSED - April 11, 2025**
**Implemented by:** VS Code AI Agent
**Original Estimate:** 1 day
**Actual Time:** 1 day
**Files Modified:**
- `js/audio.js` (new)
- `js/app.js`
- `js/drag-drop.js`
- `index.html`
- `css/styles.css`

## Description
Add sound effects to enhance the quiz experience. Sounds should be played when dragging molecules, submitting correct/incorrect answers, and during other key interactions. The sound files have been added to the project directory.

## Priority
**Could Have** - Experience enhancement

## Tasks
1. Create an audio utility module (`audio.js`)
2. Integrate sound effects with drag-drop interactions
3. Add sounds for correct and incorrect answer submissions
4. Add mute/unmute functionality
5. Ensure sounds don't interfere with the user experience

## Acceptance Criteria
- [ ] Sound effects play for the following interactions:
  - Picking up molecules (`pickup_card.mp3`)
  - Dropping molecules in drop zones (`drop_card.mp3`)
  - Submitting correct answers (`correct_answer.mp3`)
  - Submitting incorrect answers (`wrong_answer.mp3`)
- [ ] Sounds are at an appropriate volume
- [ ] Users can mute/unmute sounds via a button
- [ ] Mute preference is remembered across sessions (localStorage)
- [ ] Sound playback doesn't cause performance issues

## Implementation Notes
Create a new file `js/audio.js`:

```javascript
/**
 * Audio Manager
 * Handles sound effects for the quiz
 */
const AudioManager = (() => {
    // Track mute state
    let muted = localStorage.getItem('quizSoundMuted') === 'true';
    
    // Define sound effects
    const sounds = {
        pickup: new Audio('assets/sound/pickup_card.mp3'),
        drop: new Audio('assets/sound/drop_card.mp3'),
        correct: new Audio('assets/sound/correct_answer.mp3'),
        wrong: new Audio('assets/sound/wrong_answer.mp3')
    };
    
    // Preload all sounds
    const preloadSounds = () => {
        for (const sound in sounds) {
            sounds[sound].load();
            sounds[sound].volume = 0.5; // Set volume to 50%
        }
    };
    
    // Play a specific sound
    const play = (soundName) => {
        if (muted || !sounds[soundName]) return;
        
        // Stop the sound if it's already playing
        sounds[soundName].pause();
        sounds[soundName].currentTime = 0;
        
        // Play the sound
        sounds[soundName].play().catch(error => {
            console.warn(`Error playing sound ${soundName}:`, error);
        });
    };
    
    // Toggle mute state
    const toggleMute = () => {
        muted = !muted;
        localStorage.setItem('quizSoundMuted', muted);
        updateMuteButton();
        return muted;
    };
    
    // Update mute button appearance
    const updateMuteButton = () => {
        const muteButton = document.getElementById('mute-btn');
        if (!muteButton) return;
        
        if (muted) {
            muteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                    stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
            `;
            muteButton.setAttribute('title', 'Unmute sounds');
        } else {
            muteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                    stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
            `;
            muteButton.setAttribute('title', 'Mute sounds');
        }
    };
    
    // Initialize
    const initialize = () => {
        preloadSounds();
        
        // Add mute button
        const footer = document.querySelector('footer .credits');
        if (footer) {
            const muteButton = document.createElement('button');
            muteButton.id = 'mute-btn';
            muteButton.className = 'btn-icon-only';
            footer.appendChild(muteButton);
            
            muteButton.addEventListener('click', toggleMute);
            updateMuteButton();
        }
    };
    
    // Public API
    return {
        initialize,
        play,
        toggleMute
    };
})();

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', AudioManager.initialize);
```

Update `drag-drop.js` to include sound effects:

```javascript
// In the setupMouseEvents function
card.addEventListener('dragstart', (e) => {
    if (!draggingEnabled) return;
    
    // Play pickup sound
    if (typeof AudioManager !== 'undefined') {
        AudioManager.play('pickup');
    }
    
    // Existing code...
});

// In the addToDropZone function
const addToDropZone = (zone, reagentCard) => {
    // Play drop sound
    if (typeof AudioManager !== 'undefined') {
        AudioManager.play('drop');
    }
    
    // Existing code...
};
```

Update `app.js` for answer sounds:

```javascript
// In the handleSubmit function
if (isCorrect) {
    // Play correct sound
    if (typeof AudioManager !== 'undefined') {
        AudioManager.play('correct');
    }
    
    // Existing code...
} else {
    // Play wrong sound
    if (typeof AudioManager !== 'undefined') {
        AudioManager.play('wrong');
    }
    
    // Existing code...
}
```

Add CSS for the mute button:

```css
.btn-icon-only {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--dark-gray);
    border-radius: 4px;
    margin-left: 10px;
}

.btn-icon-only:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--text-color);
}
```

## Testing Steps
1. Test all sound effects during their corresponding interactions
2. Verify the mute button works properly
3. Check that mute preference is saved between sessions
4. Test on different browsers and devices
5. Ensure sounds don't cause performance issues or delays

## Related Files
- `js/audio.js` - New audio utility module
- `js/app.js` - For integrating answer sounds
- `js/drag-drop.js` - For integrating drag interaction sounds
- `index.html` - For adding script reference
- `css/styles.css` - For mute button styling
- `assets/sound/` - Sound effect files

## Estimated Effort
Medium (1 day)
