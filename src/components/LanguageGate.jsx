import React, { useState, useEffect } from 'react';

const LanguageGate = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('ownerLang'));

  const selectLanguage = (selectedLang) => {
    localStorage.setItem('ownerLang', selectedLang);
    setLang(selectedLang);
    // Reload to apply translations globally if necessary
    window.location.reload();
  };

  if (lang) {
    return (
      <div className="relative min-h-screen">
        {/* Top Right Global Language Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <select 
            value={lang} 
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
  }

  // Language Selection Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-crmDark/90 backdrop-blur-sm">
      <div className="bg-crmDarker border border-crmBorder rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Select Language</h2>
        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => selectLanguage('en')} className="bg-crmDark hover:bg-crmAccent text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-crmBorder">English (EN)</button>
          <button onClick={() => selectLanguage('my')} className="bg-crmDark hover:bg-crmAccent text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-crmBorder">Bahasa Melayu (MY)</button>
          <button onClick={() => selectLanguage('ar')} className="bg-crmDark hover:bg-crmAccent text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-crmBorder">العربية (AR)</button>
          <button onClick={() => selectLanguage('zh')} className="bg-crmDark hover:bg-crmAccent text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-crmBorder">中文 (ZH)</button>
          <button onClick={() => selectLanguage('vi')} className="bg-crmDark hover:bg-crmAccent text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-crmBorder">Tiếng Việt (VI)</button>
        </div>
      </div>
    </div>
  );
};

export default LanguageGate;
