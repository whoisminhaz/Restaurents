import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const allLanguages = [
  { code: 'en', name: 'English (EN)' },
  { code: 'ms', name: 'Bahasa Melayu (MY)' },
  { code: 'zh', name: '中文 (ZH)' },
  { code: 'ta', name: 'தமிழ் (TA)' },
  { code: 'ar', name: 'العربية (AR)' },
  { code: 'bn', name: 'বাংলা (BN)' }
];

const LanguageDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentLang = localStorage.getItem('userLang') || 'en';
  const [availableLangs, setAvailableLangs] = useState(allLanguages);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'master'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.languages && data.languages.length > 0) {
            const filtered = allLanguages.filter(l => data.languages.includes(l.code));
            // Always ensure English is available as fallback
            if (!filtered.find(l => l.code === 'en')) {
              filtered.unshift(allLanguages[0]);
            }
            setAvailableLangs(filtered);
          }
        }
      } catch (e) {
        console.error("Error fetching language settings", e);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLang = (code) => {
    localStorage.setItem('userLang', code);
    window.location.reload();
  };

  if (availableLangs.length <= 1) return null; // No need for dropdown if only 1 language

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:opacity-70 transition-opacity flex items-center justify-center"
        aria-label="Select Language"
      >
        <Globe size={22} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          {availableLangs.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                currentLang === lang.code 
                  ? 'bg-gray-100 dark:bg-white/10 font-bold text-gray-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
