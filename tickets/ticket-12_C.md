# Ticket #12: Add Notebook Icon to Chemistry Notes Button

## Description
To improve UI clarity and provide a visual cue, the "Read the Chem-notes" button should include a notebook icon. This will enhance visual recognition and make the button's purpose more immediately clear to users.

## Priority
**Should Have** - UI/UX enhancement

## Tasks
1. Add the SVG notebook icon to the "Read the Chem-notes" button
2. Style the icon to align properly with the button text
3. Ensure the icon scales appropriately on different screen sizes
4. Maintain proper contrast for accessibility

## Acceptance Criteria
- [ ] Notebook icon appears on the "Read the Chem-notes" button
- [ ] Icon is visually balanced with the button text
- [ ] Button remains accessible with proper color contrast
- [ ] Icon appears correctly on both desktop and mobile devices
- [ ] Implementation follows the existing UI design patterns

## Implementation Notes
Use the provided SVG code for the notebook icon:

```html
<!-- Update the button in index.html -->
<button id="chem-notes-btn" class="btn btn-secondary">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" stroke-width="2" class="btn-icon">
    <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
    <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
    <path d="M3 6l0 13"></path>
    <path d="M12 6l0 13"></path>
    <path d="M21 6l0 13"></path>
  </svg>
  Read the Chem-notes
</button>
```

```css
/* Add to styles.css */
.btn-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 5px;
  position: relative;
  top: -1px;
}

.btn-secondary .btn-icon {
  stroke: var(--dark-gray);
}

.btn-secondary:hover .btn-icon {
  stroke: var(--text-color);
}
```

Alternatively, if you prefer to use the standalone SVG file:
```html
<button id="chem-notes-btn" class="btn btn-secondary">
  <img src="assets/images/book.svg" alt="" class="btn-icon" width="16" height="16">
  Read the Chem-notes
</button>
```

## Testing Steps
1. Verify the icon appears correctly on the button
2. Check alignment with text on different screen sizes
3. Test button hover states to ensure icon styles update appropriately
4. Verify accessibility with keyboard navigation and screen readers
5. Test across multiple browsers and devices

## Related Files
- `index.html` - Main HTML file
- `css/styles.css` - For icon styling
- `assets/images/book.svg` - SVG file (alternative approach)

## Estimated Effort
XS (1-2 hours)
