# Ticket #28: Replace Intro Screen Icon and Add Dynamic Background

**Priority:** Medium  
**Type:** Enhancement  
**Estimated Time:** 2 hours  
**Related Files:**
- `index.html`
- `css/styles.css`
- `assets/images/favicon.svg`

## Description
The intro screen of the Organic Chemistry Quiz Game needs visual enhancements to match the overall application styling. Currently, the intro screen has an inline SVG icon and lacks the dynamic background used in the main quiz area. This ticket implements visual consistency by replacing the inline SVG with the favicon SVG and adding the dynamic background.

## Requirements
1. Replace the current inline SVG icon in the intro screen with the favicon SVG from assets/images/favicon.svg
2. Add the dynamic background from the main quiz body to the intro screen
3. Ensure the intro screen elements maintain proper layout and visibility against the new background
4. Ensure the changes are responsive across all device sizes

## Implementation Steps

### 1. Replace Intro Icon with Favicon SVG
- **Current Implementation:**
  ```html
  <div class="intro-image">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="intro-icon">
          <path d="M10 2v7.31"></path>
          <path d="M14 9.3V1.99"></path>
          <!-- ... additional path elements ... -->
      </svg>
  </div>
  ```

- **New Implementation:**
  ```html
  <div class="intro-image">
      <img src="assets/images/favicon.svg" alt="Organic Chemistry Icon" class="intro-icon">
  </div>
  ```

- Update CSS as needed to ensure the new SVG displays at the correct size:
  ```css
  .intro-icon {
      width: 120px; /* Adjust as needed */
      height: auto;
      margin: 0 auto;
      display: block;
  }
  ```

### 2. Add Dynamic Background to Intro Screen
- Identify the background styling used in the quiz body 
- Apply the same background styling to the `.intro-screen` class
- Example CSS update (actual values will depend on the current implementation):
  ```css
  .intro-screen {
      /* Existing styles */
      background: var(--dynamic-background);
      /* Or directly add the background properties if they're not in a variable */
  }
  ```

### 3. Adjust Text Contrast if Needed
- Ensure text in the intro screen maintains sufficient contrast against the new background
- This may require adjusting text colors, adding text shadows, or modifying content containers:
  ```css
  .intro-content {
      /* You might need to add or adjust: */
      background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent background */
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  ```

## Testing Criteria
1. **Visual Verification:**
   - The new favicon SVG should appear in place of the previous inline SVG
   - The intro screen should display the same dynamic background as the main quiz body
   - All text should be clearly readable against the new background

2. **Responsive Testing:**
   - Test on desktop, tablet, and mobile layouts
   - Verify that the intro screen looks appropriate on both portrait and landscape orientations

3. **Browser Compatibility:**
   - Test on Chrome, Firefox, Safari, and Edge
   - Ensure SVG displays correctly in all browsers

4. **Performance:**
   - Ensure the changes don't introduce any noticeable loading delays

## Definition of Done
- The intro screen displays the favicon.svg instead of the inline SVG
- The intro screen has the same dynamic background as the main quiz area
- The implementation passes all testing criteria
- Code follows project coding standards
- Changes are committed with appropriate comments
- Ticket documentation is updated with implementation details

## Additional Notes
- If favicon.svg doesn't exist and only favicon.png is available, you'll need to use favicon.png instead. In that case, ensure the image quality is sufficient for larger display on the intro screen.
- If the background requires additional CSS changes to look correct, document those changes in your implementation.

## Resources
- See existing styling in `styles.css` for background implementation details
- Reference the app's design system for proper spacing and sizing guidelines
