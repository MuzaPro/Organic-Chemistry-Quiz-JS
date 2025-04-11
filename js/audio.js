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
                </svg>`;
            muteButton.setAttribute('title', 'Unmute sounds');
        } else {
            muteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                    stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>`;
            muteButton.setAttribute('title', 'Mute sounds');
        }
    };
    
    // Initialize
    const initialize = () => {
        preloadSounds();
        
        // Add mute button handler
        const muteButton = document.getElementById('mute-btn');
        if (muteButton) {
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