const fs = require('fs');
const file = 'F:/All restaurents/master-restaurant-template/public/index.html';
let content = fs.readFileSync(file, 'utf8');

const categories = {
  'cat-tandoori': ['images/menu_kebab.jpg', 'images/hero_tandoori.jpg'],
  'cat-biryani': ['images/menu_biryani.jpg', 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&h=400&fit=crop'],
  'cat-chicken': ['images/menu_curry.jpg', 'https://images.unsplash.com/photo-1585937421612-70100fe36e86?w=600&h=400&fit=crop'],
  'cat-mutton': ['images/food_mutton.jpg', 'https://images.unsplash.com/photo-1544025162-831109a25b29?w=600&h=400&fit=crop'],
  'cat-seafood': ['images/menu_seafood.jpg', 'images/hero-shellout.png'],
  'cat-appetizers': ['images/appetizer_samosa.jpg', 'images/mozacheese-korean.png'],
  'cat-naan': ['images/menu_naan.jpg', 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600&h=400&fit=crop'],
  'cat-veg': ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop'],
  'cat-rice': ['images/nasi-goreng.png', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop'],
  'cat-western': ['images/pasta-carbonara.png', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop'],
  'cat-egg': ['https://images.unsplash.com/photo-1482049360967-36cb9e57be33?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop'],
  'cat-dessert': ['https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1563805042-7684c8e9e533?w=600&h=400&fit=crop'],
  'cat-drinks': ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1544145945-f9042538dea1?w=600&h=400&fit=crop']
};

for (const [id, images] of Object.entries(categories)) {
  const regex = new RegExp('<div class="menu-category" id="' + id + '">\\s*<h3 class="menu-cat-title">.*?</h3>(?:\\s*<h4.*?>.*?</h4>)?\\s*(?:<div class="menu-feature-grid">[\\s\\S]*?</div>\\s*)?<div class="menu-list">');
  const featureHtml = `
      <div class="menu-feature-grid">
        <div class="feature-card"><img src="${images[0]}" alt="Feature Image 1" loading="lazy"></div>
        <div class="feature-card"><img src="${images[1]}" alt="Feature Image 2" loading="lazy"></div>
      </div>
      <div class="menu-list">`;
  content = content.replace(regex, (match) => {
    return match.replace(/<div class="menu-feature-grid">[\s\S]*?<\/div>\s*<div class="menu-list">|<div class="menu-list">/, featureHtml);
  });
}
fs.writeFileSync(file, content);
console.log('Images updated.');
