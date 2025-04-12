# Ticket #21: Add Studio Branding to Footer

**STATUS: OPEN**
**Priority:** Medium
**Type:** Enhancement
**Estimate:** 1 hour
**Assigned to:** Unassigned

## Description
Enhance the studio branding in the quiz footer by adding the studio logo before the studio name. Both the logo and name should be clickable links that open the studio website in a new tab.

## Background
Currently, the footer contains only the studio name "Muza Productions" without the logo, and the link may not be properly configured to open in a new tab. We need to improve the branding visibility and ensure proper linking behavior.

## Tasks
1. Add the studio logo image before the studio name in the footer
2. Make both the logo and name clickable, linking to the studio website
3. Ensure the link opens in a new tab using `target="_blank"`
4. Align the logo and text properly for visual consistency
5. Add appropriate hover effects for better user experience

## Implementation Details
- Logo file location: `assets\images\Muza_logo.png`
- Target URL: `https://www.muza.productions/`
- Current footer HTML (from `index.html`):
```html
<div class="credits">
    <p>by <a target="_blank" href="https://www.muza.productions/">Muza Productions </a>  | Organic Chemistry Quiz Game -sfx version</p>
    <button id="mute-btn" class="btn-icon-only" title="Mute sounds">
        <!-- SVG content here -->
    </button>
</div>
```

- Modified footer HTML should look something like:
```html
<div class="credits">
    <p>
        by 
        <a target="_blank" href="https://www.muza.productions/" rel="noopener">
            <img src="assets/images/Muza_logo.png" alt="Muza Productions Logo" class="footer-logo">
            Muza Productions
        </a> 
        | Organic Chemistry Quiz Game -sfx version
    </p>
    <button id="mute-btn" class="btn-icon-only" title="Mute sounds">
        <!-- SVG content here -->
    </button>
</div>
```

- Add CSS for the logo in `styles.css`:
```css
.footer-logo {
    height: 18px;
    vertical-align: middle;
    margin-right: 5px;
}
```

## Acceptance Criteria
- [ ] Studio logo appears before the studio name in the footer
- [ ] Both logo and name are part of the same clickable link
- [ ] Link opens `https://www.muza.productions/` in a new tab
- [ ] Logo is properly sized and aligned with the text
- [ ] Link includes `rel="noopener"` for security best practices
- [ ] Appearance is consistent across desktop and mobile devices
- [ ] Footer maintains proper layout after changes

## Test Plan
1. Check appearance on desktop (Chrome, Firefox, Safari, Edge)
2. Check appearance on mobile devices (iOS and Android)
3. Verify link opens in a new tab
4. Verify hover effects work as expected
5. Ensure the footer still fits properly on small screens

## Related Files
- `index.html` - To modify the footer HTML
- `css/styles.css` - To add styling for the logo
- `assets/images/Muza_logo.png` - The logo image to be used

## Estimated Effort
Low (1 hour) - Simple HTML and CSS modifications
