const fs = require('fs');
const path = require('path');

const srcDir = 'F:/All restaurents/res2/src';
const destDir = 'F:/All restaurents/master-restaurant-template/src';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function processFile(content) {
  content = content.replace(/"use client";\n/g, '');
  content = content.replace(/import Link from "next\/link";/g, 'import { Link } from "react-router-dom";');
  content = content.replace(/import Image from "next\/image";/g, '');
  
  // Basic Next.js Image to img replacement
  content = content.replace(/<Image\s+src=\{?("[^"]+"|'[^']+')}?\s+alt=\{?("[^"]+"|'[^']+')}?[\s\S]*?\/>/g, (match, src, alt) => {
    return `<img src=${src} alt=${alt} className="w-full h-full object-cover" />`;
  });
  content = content.replace(/<Image([^>]+)\/>/g, (match, props) => {
    let newProps = props.replace(/fill/g, 'className="w-full h-full object-cover"').replace(/priority/g, '');
    return `<img${newProps}/>`;
  });
  
  // Remove metadata exports (Next.js specific)
  content = content.replace(/export const metadata.*?};\n/gs, '');

  return content;
}

const compSrc = path.join(srcDir, 'components');
const compDest = path.join(destDir, 'components', 'tandoori');
ensureDir(compDest);
fs.readdirSync(compSrc).forEach(file => {
  let content = fs.readFileSync(path.join(compSrc, file), 'utf-8');
  fs.writeFileSync(path.join(compDest, file.replace('.tsx', '.jsx')), processFile(content));
});

const pagesDest = path.join(destDir, 'pages', 'public', 'tandoori');
ensureDir(pagesDest);

const appDir = path.join(srcDir, 'app');
const dirs = ['about', 'catering', 'gallery', 'menu', 'reservations'];
dirs.forEach(d => {
  let p = path.join(appDir, d, 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    fs.writeFileSync(path.join(pagesDest, d.charAt(0).toUpperCase() + d.slice(1) + '.jsx'), processFile(content));
  }
});

let p = path.join(appDir, 'page.tsx');
if (fs.existsSync(p)) {
  let content = fs.readFileSync(p, 'utf-8');
  fs.writeFileSync(path.join(pagesDest, 'Home.jsx'), processFile(content));
}
