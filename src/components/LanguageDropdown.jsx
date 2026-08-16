import React, { useState, useEffect } from 'react';
import { Globe, X } from 'lucide-react';
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

  const changeLang = (code) => {
    localStorage.setItem('userLang', code);
    window.location.reload();
  };

  if (availableLangs.length <= 1) return null; // No need for dropdown if only 1 language

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:opacity-70 transition-opacity flex items-center justify-center"
        aria-label="Select Language"
      >
        <Globe size={22} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Select Language</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {availableLangs.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLang(lang.code)}
                  className={`w-full text-center px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-colors ${
                    currentLang === lang.code 
                      ? 'bg-crmAccent text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageDropdown;
