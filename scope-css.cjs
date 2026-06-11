const fs = require('fs');

const css = fs.readFileSync('f:/mosty kitchen/style.css', 'utf8');

// A simple regex to prefix all selectors that aren't at-rules
// This is a naive regex but good enough for a simple static site CSS
const scopedCss = css.replace(/^(?!@)([^\{\}]+)\{/gm, (match, selector) => {
  // Split by comma for multiple selectors
  const selectors = selector.split(',').map(s => {
    const trimmed = s.trim();
    if (trimmed === ':root' || trimmed === 'body' || trimmed === 'html') {
      return '.landing-wrapper'; // map root/body/html to the wrapper itself
    }
    return '.landing-wrapper ' + trimmed;
  });
  return selectors.join(', ') + ' {';
});

fs.writeFileSync('src/assets/landing.css', scopedCss);
console.log('Scoped CSS generated successfully.');
