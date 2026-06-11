const fs = require('fs');
let html = fs.readFileSync('f:/mosty kitchen/index.html', 'utf8');

// Get body content only
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyMatch) {
  html = bodyMatch[1];
}

html = html
  .replace(/class=/g, 'className=')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<img([^>]*[^/])>/g, '<img$1 />')
  .replace(/<input([^>]*[^/])>/g, '<input$1 />')
  .replace(/<br>/g, '<br />')
  .replace(/<hr>/g, '<hr />')
  .replace(/style="([^"]*)"/g, ''); // strip inline styles

fs.writeFileSync('tmp-landing.jsx', html);
console.log('JSX generated');
