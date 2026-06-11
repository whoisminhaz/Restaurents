const fs = require('fs');
let css = fs.readFileSync('src/assets/landing.css', 'utf8');

// Fix comments that were prefixed
css = css.replace(/\.landing-wrapper\s+\/\*(.*?)\*\//g, '/*$1*/');

// Fix keyframes that were prefixed
css = css.replace(/\.landing-wrapper\s+@keyframes/g, '@keyframes');

// Fix percentages that were prefixed (like 0%, 100% { ...)
css = css.replace(/\.landing-wrapper\s+(\d+%)/g, '$1');

// Fix image URLs to point to /images/landing/
css = css.replace(/url\(['"]?images\//g, 'url(\'/images/landing/');

fs.writeFileSync('src/assets/landing.css', css);
console.log('Fixed CSS');
