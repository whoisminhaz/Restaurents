const fs = require('fs');

let jsx = fs.readFileSync('tmp-landing.jsx', 'utf8');

// Remove scripts
jsx = jsx.replace(/<script[\s\S]*?<\/script>/g, '');

// Remove standard 'Order Now' links
jsx = jsx.replace(/<a[^>]*href=["']#order["'][^>]*>.*?<\/a>/ig, '');

// Replace 'Book Table' with 'Reserve a Table Now' and link to /book
jsx = jsx.replace(/<a([^>]*)href=["'][^"']*["']([^>]*)>(?:Book|Reserve|Book Table|Book A Table|Reserve Table)[\s\S]*?<\/a>/ig, '<button onClick={() => navigate(\'/book\')} $1 $2>Reserve a Table Now</button>');

// Replace class with className in remaining tags if any were missed
jsx = jsx.replace(/ class=/g, ' className=');

// SVG tags might have camelCase issues in React (e.g. stroke-width -> strokeWidth).
// A simple fix for lucide icons is we don't need them if we replace them or just let React warn us.
// But Mosty Kitchen used <i data-lucide="..."></i> instead of SVG directly! So we don't need to fix SVGs, we just leave the <i> tags. BUT lucide-react should be used instead, or we can just run lucide.createIcons() in a useEffect.
// I will add a useEffect to run lucide.createIcons().

const finalComponent = `import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../assets/landing.css';
import LanguageDropdown from '../../components/LanguageDropdown';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const Landing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNum = searchParams.get('table');

  useEffect(() => {
    if (tableNum) {
      localStorage.setItem('tableNum', tableNum);
      localStorage.setItem('orderMode', 'dineIn');
      navigate('/order');
    }
  }, [tableNum, navigate]);

  useEffect(() => {
    // Load lucide script dynamically for the <i> tags
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lucide@latest';
    script.onload = () => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="landing-wrapper relative">
      <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
        <LanguageDropdown />
      </div>
      ${jsx}
    </div>
  );
};

export default Landing;
`;

fs.writeFileSync('src/pages/public/Landing.jsx', finalComponent);
console.log('Landing.jsx generated');
