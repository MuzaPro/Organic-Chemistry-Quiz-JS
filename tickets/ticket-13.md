# Ticket #13: Optimize Layout for Mobile Screens

## Description
The quiz interface currently does not display well on mobile devices in portrait orientation. This ticket involves improving the responsive design to either better support portrait mode or guide users to use landscape orientation for optimal experience.

## Priority
**Should Have** - Important for mobile users

## Tasks
1. Evaluate the current mobile experience and identify specific issues
2. Improve responsive styles for small screen sizes
3. Implement orientation detection and guidance for optimal viewing
4. Reorganize quiz elements for better mobile display
5. Test on various mobile screen sizes and devices

## Acceptance Criteria
- [ ] Quiz is usable on mobile devices in both portrait and landscape orientations
- [ ] If portrait mode is suboptimal, clear guidance is provided to rotate the device
- [ ] Touch targets are appropriately sized for mobile interaction (minimum 44x44px)
- [ ] Text is readable without zooming on mobile devices
- [ ] Quiz elements reflow appropriately for different screen sizes
- [ ] Performance remains smooth on mobile devices

## Implementation Notes
Add orientation detection and guidance:

```javascript
// Add to app.js
function checkOrientation() {
  const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  const orientationMessage = document.getElementById('orientation-message');
  
  if (orientation === 'portrait' && window.innerWidth < 768) {
    orientationMessage.classList.remove('hidden');
  } else {
    orientationMessage.classList.add('hidden');
  }
}

// Add event listeners
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
document.addEventListener('DOMContentLoaded', checkOrientation);
```

```html
<!-- Add to index.html -->
<div id="orientation-message" class="orientation-message hidden">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rotate-icon">
    <path d="M17 17H7V7"></path>
    <path d="M7 17L21 3"></path>
  </svg>
  <p>Please rotate your device for the best experience</p>
</div>
```

```css
/* Add to styles.css */
.orientation-message {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  text-align: center;
  padding: 20px;
}

.rotate-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 20px;
  animation: rotate 2s infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(90deg); }
  100% { transform: rotate(0deg); }
}

/* Improve mobile layout in portrait mode */
@media (max-width: 480px) {
  .reagent-card, .drop-zone, .product-container {
    width: 70px;
    height: 70px;
  }
  
  .molecule-text {
    font-size: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn {
    width: 100%;
    padding: 12px; /* Larger touch target */
  }
  
  /* Stack reaction components vertically */
  .reaction-area {
    flex-direction: column;
    align-items: center;
  }
  
  .operator, .reaction-arrow {
    transform: rotate(90deg);
    margin: 10px 0;
  }
}
```

## Testing Steps
1. Test on various mobile devices (iPhone, Android phones, tablets)
2. Verify functionality in both portrait and landscape orientations
3. Test the orientation detection and message functionality
4. Verify all quiz elements are usable and appropriately sized
5. Test with actual user interaction to ensure usability

## Related Files
- `index.html` - Main HTML file
- `js/app.js` - For orientation detection
- `css/styles.css` - For responsive styling

## Estimated Effort
Medium (1 day)
