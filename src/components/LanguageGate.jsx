import React, { useState, useEffect } from 'react';

const LanguageGate = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('ownerLang'));

  const selectLanguage = (selectedLang) => {
    localStorage.setItem('ownerLang', selectedLang);
    setLang(selectedLang);
    // Reload to apply translations globally if necessary
    window.location.reload();
  };

  useEffect(() => {
    if (!lang) {
      localStorage.setItem('ownerLang', 'en');
      setLang('en');
    }
  }, [lang]);

  return (
    <div className="relative min-h-screen">
      {/* Top Right Global Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <select 
          value={lang || 'en'} 
          onChange={(e) => selectLanguage(e.target.value)}
          className="bg-crmDark text-crmText border border-crmBorder rounded-md px-3 py-1 shadow-lg focus:outline-none focus:ring-2 focus:ring-crmAccent"
        >
          <option value="en">English (EN)</option>
          <option value="my">Bahasa Melayu (MY)</option>
          <option value="ar">العربية (AR)</option>
          <option value="zh">中文 (ZH)</option>
          <option value="vi">Tiếng Việt (VI)</option>
        </select>
      </div>
      {children}
    </div>
  );
};

export default LanguageGate;
