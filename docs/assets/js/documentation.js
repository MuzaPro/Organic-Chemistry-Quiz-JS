/**
 * Documentation site JavaScript
 * Handles interactive elements in the Organic Chemistry Quiz documentation
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
    });
  }
  
  // Add active class to current page in navigation
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('#main-nav a, .sidebar a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.endsWith(linkPath) || 
        (linkPath === 'index.html' && currentPath.endsWith('/docs/'))) {
      link.classList.add('active');
    }
  });
  
  // Code block copy buttons
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(block => {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-button';
    copyButton.textContent = 'Copy';
    
    // Wrap the code block in a container for positioning
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block.parentNode);
    wrapper.appendChild(copyButton);
    
    copyButton.addEventListener('click', function() {
      const textToCopy = block.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    });
  });
  
  // Collapsible sections
  const collapsibleHeadings = document.querySelectorAll('.collapsible-heading');
  
  collapsibleHeadings.forEach(heading => {
    heading.addEventListener('click', function() {
      this.classList.toggle('collapsed');
      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
  
  // Table of contents with scroll spy
  const headings = document.querySelectorAll('main h2, main h3');
  const tocContainer = document.querySelector('.table-of-contents');
  
  if (tocContainer && headings.length > 0) {
    const toc = document.createElement('ul');
    tocContainer.appendChild(toc);
    
    headings.forEach((heading, index) => {
      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }
      
      // Create TOC item
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = heading.textContent;
      link.href = `#${heading.id}`;
      
      // Indent h3 items
      if (heading.tagName === 'H3') {
        listItem.style.paddingLeft = '1rem';
      }
      
      listItem.appendChild(link);
      toc.appendChild(listItem);
      
      // Set up scroll tracking
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            document.querySelectorAll('.table-of-contents a').forEach(a => {
              a.classList.remove('active');
            });
            link.classList.add('active');
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(heading);
    });
  }
  
  // Dark/light mode toggle
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.classList.add(savedTheme);
    }
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      
      // Save user preference
      if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark-theme');
      } else {
        localStorage.setItem('theme', '');
      }
    });
  }
});