import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UtensilsCrossed, ShoppingBag, CalendarDays, Moon, Sun } from 'lucide-react';
import { t } from '../../utils/translations';

const languageNames = {
  'en': 'English',
  'ms': 'Bahasa Melayu',
  'zh': '中文',
  'ta': 'தமிழ்',
  'ar': 'العربية'
};

const Landing = () => {
  const [searchParams] = useSearchParams();
  const tableNum = searchParams.get('table');
  const [settings, setSettings] = useState(null);
  const [showLangGate, setShowLangGate] = useState(true);
  
  const navigate = useNavigate();
  
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('userLang') || null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'master'));
        if (snap.exists()) {
          const data = snap.data();
          setSettings(data);
          
          if (tableNum && data.languages && data.languages.length === 1) {
            handleEnter(data.languages[0], 'dine-in', tableNum);
          }
        } else {
          setSettings({
            restaurantName: 'Our Restaurant',
            themePrimary: '#b5602a',
            languages: ['en']
          });
        }
      } catch (error) {
        console.error("Firestore Error:", error);
        setSettings({ 
          restaurantName: 'Error: ' + (error.message || 'Unknown'), 
          themePrimary: '#ff0000', 
          languages: ['en'] 
        });
      }
    };
    fetchSettings();
  }, [tableNum]);

  const handleEnter = (lang, mode, table = null) => {
    const finalLang = selectedLang || lang;
    localStorage.setItem('userLang', finalLang);
    localStorage.setItem('orderMode', mode);
    if (table) localStorage.setItem('tableNum', table);
    navigate('/order');
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex items-center justify-center transition-colors duration-500">
        <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-gray-800 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // Theme Toggle Button Component
  const ThemeToggle = () => (
    <button 
      onClick={() => setIsDark(!isDark)}
      className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md text-gray-800 dark:text-white transition-all shadow-lg border border-black/5 dark:border-white/10 z-50"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );

  if (showLangGate && settings.languages.length > 1) {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
        <ThemeToggle />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: settings.themePrimary }}
        ></div>

        <div className="relative z-10 w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{settings.restaurantName}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 transition-colors">Please select your preferred language</p>
          
          <div className="space-y-4">
            {settings.languages.map(lang => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLang(lang);
                  setShowLangGate(false);
                }}
                className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 shadow-sm border border-gray-100 dark:border-white/10 text-gray-800 dark:text-white text-lg font-medium transition-all backdrop-blur-md"
              >
                {languageNames[lang] || lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentLang = selectedLang || settings.languages[0] || 'en';

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative transition-colors duration-500">
      <ThemeToggle />
      <div className="w-full max-w-md text-center">
        <div 
          className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl text-white font-bold text-2xl transition-transform hover:scale-105"
          style={{ backgroundColor: settings.themePrimary }}
        >
          {settings.restaurantName.charAt(0)}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{t(currentLang, 'welcome')}<br/>{settings.restaurantName}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 transition-colors">How would you like to dine with us today?</p>
        
        <div className="w-full space-y-4">
          {tableNum ? (
            <button
              onClick={() => handleEnter(currentLang, 'dine-in', tableNum)}
              className="w-full py-5 px-6 rounded-2xl text-white text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 hover:-translate-y-1"
              style={{ backgroundColor: settings.themePrimary }}
            >
              <UtensilsCrossed size={24} />
              {t(currentLang, 'orderTakeaway').replace('Takeaway', `for Table ${tableNum}`)} 
            </button>
          ) : (
            <>
              {/* 1. Book Table (Only Option for Website Visitors) */}
              <button
                onClick={() => settings.bookingEnabled !== false && navigate('/book')}
                disabled={settings.bookingEnabled === false}
                className={`w-full py-5 px-6 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-3 mt-2 ${
                  settings.bookingEnabled !== false 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:-translate-y-1' 
                  : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                }`}
              >
                <CalendarDays size={24} />
                {settings.bookingEnabled !== false ? 'Reservations' : 'Reservations (Unavailable)'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;
