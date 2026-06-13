import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ArrowRight, Menu, X, Globe, CheckCircle, Smartphone, Monitor, ChevronDown, MessageCircle, BarChart3, Clock, Utensils, CalendarDays, Server, Code, BrainCircuit } from 'lucide-react';

const landingTranslations = {
  en: {
    heroTitle: "The Only Lifetime-Free Restaurant Management System & Premium Tech Solutions",
    heroSub: "From a Zero-Monthly-Fee Restaurant OS to Custom Web Development and AI Solutions. We build technology that scales your business.",
    tryDemo: "Try Restaurant OS Demo",
    exploreServices: "Explore Our Services",
    proofLive: "Restaurants Live",
    proofFree: "Free Forever",
    proofSetup: "Average Setup Time",
    proofStates: "Across Malaysia",
    servicesTitle: "More Than Just Restaurants. We Build AI & SaaS Solutions.",
    problemTitle: "Malaysian Restaurants Are Losing Orders Every Night — Here Is Why",
    featuresTitle: "Everything Your Restaurant Needs — One System, Zero Monthly Cost",
    demoTitle: "Try the System Right Now — No Login Required",
    videoTitle: "Watch: Full System Walkthrough",
    portfolioTitle: "Restaurant Websites We Have Designed — Browse Live Examples",
    adTitle: "One Minute Overview — What DOT ZERO AI Does For You",
    pricingTitle: "Why Pay Monthly? DOT ZERO AI Restaurant OS is Free Forever",
    faqTitle: "Frequently Asked Questions About DOT ZERO AI",
    founderTitle: "Built by a Developer Who Refused to Overcharge Business Owners",
    footerTagline: "Restaurant Technology. Free. Forever.",
  },
  ms: {
    heroTitle: "Sistem Pengurusan Restoran Percuma Seumur Hidup & Penyelesaian Teknologi Premium",
    heroSub: "Daripada OS Restoran Tanpa Yuran Bulanan hingga Pembangunan Web Tersuai dan Penyelesaian AI.",
    tryDemo: "Cuba Demo OS Restoran",
    exploreServices: "Lihat Perkhidmatan Kami",
    proofLive: "Restoran Langsung",
    proofFree: "Percuma Selamanya",
    proofSetup: "Purata Masa Persediaan",
    proofStates: "Seluruh Malaysia",
    servicesTitle: "Lebih Daripada Restoran. Kami Membina Penyelesaian AI & SaaS.",
    problemTitle: "Restoran Malaysia Kehilangan Pesanan Setiap Malam — Ini Sebabnya",
    featuresTitle: "Semua Keperluan Restoran Anda — Satu Sistem, Kos Bulanan Sifar",
    demoTitle: "Cuba Sistem Sekarang — Log Masuk Tidak Diperlukan",
    videoTitle: "Tonton: Panduan Penuh Sistem",
    portfolioTitle: "Laman Web Restoran Yang Kami Reka — Lihat Contoh Langsung",
    adTitle: "Gambaran Keseluruhan Satu Minit",
    pricingTitle: "Mengapa Bayar Bulanan? OS Restoran DOT ZERO AI Percuma Selamanya",
    faqTitle: "Soalan Lazim Mengenai DOT ZERO AI",
    founderTitle: "Dibina oleh Pembangun Yang Enggan Mengenakan Caj Berlebihan",
    footerTagline: "Teknologi Restoran. Percuma. Selamanya.",
  },
  zh: {
    heroTitle: "唯一的终身免费餐厅管理系统和高级技术解决方案",
    heroSub: "从零月费餐厅系统到定制 Web 开发和 AI 解决方案。",
    tryDemo: "尝试餐厅系统演示",
    exploreServices: "探索我们的服务",
    proofLive: "在线餐厅",
    proofFree: "永久免费",
    proofSetup: "平均设置时间",
    proofStates: "遍布马来西亚",
    servicesTitle: "不仅限于餐厅。我们构建 AI 和 SaaS 解决方案。",
    problemTitle: "马来西亚餐厅每晚都在流失订单——原因在此",
    featuresTitle: "您餐厅所需的一切——一个系统，零月费",
    demoTitle: "立即尝试系统——无需登录",
    videoTitle: "观看：完整系统演示",
    portfolioTitle: "我们设计的餐厅网站——浏览真实案例",
    adTitle: "一分钟概述——DOT ZERO AI 能为您做什么",
    pricingTitle: "为何按月付费？DOT ZERO AI 餐厅系统永久免费",
    faqTitle: "关于 DOT ZERO AI 的常见问题",
    founderTitle: "由拒绝向企业主收取高昂费用的开发者构建",
    footerTagline: "餐厅技术。免费。永远。",
  },
  ta: {
    heroTitle: "ஒரே வாழ்நாள் முழுவதும் இலவச உணவக மேலாண்மை அமைப்பு மற்றும் பிரீமியம் தொழில்நுட்ப தீர்வுகள்",
    heroSub: "மாதாந்திர கட்டணமில்லாத உணவக OS முதல் தனிப்பயன் வலை மேம்பாடு மற்றும் AI தீர்வுகள் வரை.",
    tryDemo: "உணவக OS டெமோவை முயற்சிக்கவும்",
    exploreServices: "எங்கள் சேவைகளை ஆராயுங்கள்",
    proofLive: "நேரலை உணவகங்கள்",
    proofFree: "என்றென்றும் இலவசம்",
    proofSetup: "சராசரி அமைவு நேரம்",
    proofStates: "மலேசியா முழுவதும்",
    servicesTitle: "உணவகங்களை விட அதிகம். நாங்கள் AI மற்றும் SaaS தீர்வுகளை உருவாக்குகிறோம்.",
    problemTitle: "மலேசிய உணவகங்கள் ஒவ்வொரு இரவும் ஆர்டர்களை இழக்கின்றன — இதோ காரணம்",
    featuresTitle: "உங்கள் உணவகத்திற்குத் தேவையான அனைத்தும் — ஒரு அமைப்பு, பூஜ்ஜிய மாத செலவு",
    demoTitle: "இப்போதே அமைப்பை முயற்சிக்கவும் — உள்நுழைய தேவையில்லை",
    videoTitle: "பாருங்கள்: முழு அமைப்பு ஒத்திகை",
    portfolioTitle: "நாங்கள் வடிவமைத்த உணவக வலைத்தளங்கள் — நேரடி எடுத்துக்காட்டுகளை உலாவுக",
    adTitle: "ஒரு நிமிட கண்ணோட்டம் — DOT ZERO AI உங்களுக்காக என்ன செய்கிறது",
    pricingTitle: "மாதாந்திரம் ஏன் செலுத்த வேண்டும்? DOT ZERO AI உணவக OS என்றென்றும் இலவசம்",
    faqTitle: "DOT ZERO AI பற்றிய அடிக்கடி கேட்கப்படும் கேள்விகள்",
    founderTitle: "வணிக உரிமையாளர்களிடம் அதிக கட்டணம் வசூலிக்க மறுத்த ஒரு டெவலப்பரால் உருவாக்கப்பட்டது",
    footerTagline: "உணவக தொழில்நுட்பம். இலவசம். என்றென்றும்.",
  }
};

const ParticleNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const isDark = document.documentElement.classList.contains('dark');

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];
      const particleCount = Math.floor((width * height) / 15000);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const isDarkNow = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDarkNow ? 'rgba(0, 200, 212, 0.4)' : 'rgba(0, 200, 212, 0.6)';
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = isDarkNow ? 'rgba(0, 200, 212, 0.1)' : 'rgba(0, 200, 212, 0.2)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };

    init();
    draw();

    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />;
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl mb-4 overflow-hidden bg-white dark:bg-[#0f1820] transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center font-bold text-lg hover:bg-gray-50 dark:hover:bg-[#141f2e] transition-colors"
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp className="text-[#00c8d4]" /> : <ChevronDown className="text-[#00c8d4]" />}
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ${isOpen ? 'py-4 max-h-96' : 'max-h-0 py-0'}`}>
        <p className="text-gray-600 dark:text-[#8aa4bc] leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');
  const [userLang, setUserLang] = useState(localStorage.getItem('userLang') || 'en');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = (key) => landingTranslations[userLang]?.[key] || landingTranslations['en'][key];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const changeLanguage = (lang) => {
    localStorage.setItem('userLang', lang);
    setUserLang(lang);
  };

  const faqs = [
    { q: "Is DOT ZERO AI Restaurant OS really completely free?", a: "Yes. The Restaurant OS platform itself — including QR ordering, live dashboard, analytics, reservation system, kitchen display, and Telegram notifications — is 100% free to use with no monthly fees, no commission per order, and no hidden charges. You pay a one-time setup fee for our team to configure and deploy the system for your restaurant. After that, you own it and use it free forever." },
    { q: "What is included in the one-time setup fee?", a: "The setup fee covers full deployment of the Restaurant OS for your restaurant: Firebase project creation, custom branding and colours, menu setup with photos, table QR code generation and printing, Telegram bot configuration, staff account setup, and a training session. We also build your restaurant's marketing website if you need one." },
    { q: "How long does the setup take?", a: "The technical setup takes approximately 30 minutes. Menu population (entering all your food items with photos and prices) takes 1–2 hours depending on your menu size. Your restaurant can be fully live within the same day." },
    { q: "Does the system work for halal restaurants?", a: "Yes, completely. DOT ZERO AI Restaurant OS has no food-type restrictions. It works for halal restaurants, cafés, Western restaurants, Malaysian food, fine dining, food courts, and ghost kitchens. All our current live clients are halal establishments." },
    { q: "How does the Telegram notification work?", a: "When a customer places an order via QR code, the system instantly sends a structured notification to your Telegram group — showing the table number, customer name, items ordered, total amount, and time. You can mark orders as done by replying in Telegram. No app installation required on your end." },
    { q: "Can customers book tables through the system?", a: "Yes. Your restaurant website includes a table reservation page where customers can select a date, time slot, and number of guests. They can also pre-order food at the time of booking. The owner confirms bookings and assigns table numbers through the dashboard. Pre-ordered food automatically appears in the kitchen 1 hour before the reservation time." },
    { q: "What happens to my data if I stop using the system?", a: "Your data belongs entirely to you. We set up the Firebase project under your Google account, not ours. If you ever stop using DOT ZERO AI, you retain full access to all your order history, reservation records, and customer data. Nothing is locked in our platform." },
    { q: "Does it work on mobile phones?", a: "Yes. The owner dashboard is a Progressive Web App (PWA). Open it on your phone's browser, tap 'Add to Home Screen', and it installs like a native app with an icon on your home screen. No App Store download needed. Works on iPhone and Android." },
    { q: "How is this different from Grabfood or Foodpanda?", a: "Grabfood and Foodpanda are delivery marketplaces that charge 20–30% commission on every order. DOT ZERO AI Restaurant OS is a self-owned system — customers order directly at your table via QR code, with zero commission. You keep 100% of your revenue. We also offer dine-in ordering, reservations, and analytics that delivery platforms do not provide." },
    { q: "Can I manage multiple restaurant branches?", a: "Yes. Each branch gets its own standalone system. For restaurant groups, we provide a centralised setup where each branch has its own dashboard, its own Telegram notification group, and its own menu — while sharing the same underlying infrastructure." },
    { q: "What other AI or SaaS services do you offer?", a: "Beyond restaurants, DOT ZERO AI specializes in custom SaaS development, AI chatbots, business automation tools, and premium corporate websites. If your business needs a digital transformation, we can build it." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080d14] text-gray-900 dark:text-[#f0f4f8] font-sans transition-colors duration-300 overflow-x-hidden">
      <Helmet>
        <title>DOT ZERO AI - AI Solutions, Web Development & Free Restaurant SaaS</title>
        <meta name="description" content="Discover DOT ZERO AI's premium Web Development, custom AI Solutions, and the only Lifetime-Free Restaurant Management System in Malaysia." />
        <meta name="keywords" content="free restaurant ordering system Malaysia, lifetime free QR menu, AI solutions, web development Malaysia, DOT ZERO AI, SaaS products, free table booking system, restaurant CRM Malaysia" />
        <meta name="theme-color" content={isDark ? "#00c8d4" : "#ffffff"} />
        <meta property="og:title" content="DOT ZERO AI - Premium SaaS & AI Solutions" />
        <meta property="og:description" content="Lifetime-Free Restaurant OS, Custom Web Development, and Advanced AI Products." />
        <meta property="og:image" content="https://dotzeroai.web.app/assets/dotzeroai/logo%201.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "name": "DOT ZERO AI",
                "url": "https://dotzeroai.web.app",
                "logo": "https://dotzeroai.web.app/assets/dotzeroai/logo%201.png",
                "founder": {
                  "@type": "Person",
                  "name": "Md Minhaz Uddin"
                },
                "sameAs": [
                  "https://facebook.com/dotzeroai",
                  "https://tiktok.com/@dotzeroai",
                  "https://youtube.com/@dotzeroai",
                  "https://instagram.com/dotzeroai"
                ]
              },
              {
                "@type": "SoftwareApplication",
                "name": "DOT ZERO AI Restaurant OS",
                "operatingSystem": "Web, Android, iOS",
                "applicationCategory": "BusinessApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "MYR"
                }
              },
              {
                "@type": "FAQPage",
                "mainEntity": faqs.map(f => ({
                  "@type": "Question",
                  "name": f.q,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f.a
                  }
                }))
              }
            ]
          })}
        </script>
      </Helmet>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-[#080d14]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#00c8d4]/10 shadow-sm' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <img src="/assets/dotzeroai/logo 1.png" alt="DOT ZERO AI Logo" className="h-10 w-auto" />
              <span className="font-extrabold text-2xl tracking-tight hidden sm:block">DOT ZERO AI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 font-medium">
              <a href="#services" className="hover:text-[#00c8d4] transition-colors">Services</a>
              <a href="#features" className="hover:text-[#00c8d4] transition-colors">Features</a>
              <a href="#demo" className="hover:text-[#00c8d4] transition-colors">Demo</a>
              <a href="#portfolio" className="hover:text-[#00c8d4] transition-colors">Portfolio</a>
              <a href="#pricing" className="hover:text-[#00c8d4] transition-colors">Pricing</a>
              
              <div className="flex items-center space-x-3 border-l border-gray-300 dark:border-gray-700 pl-4">
                <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Globe size={20} />
                  </button>
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#141f2e] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 dark:border-gray-700">
                    {['en', 'ms', 'zh', 'ta'].map(lang => (
                      <button key={lang} onClick={() => changeLanguage(lang)} className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 uppercase text-sm first:rounded-t-lg last:rounded-b-lg font-bold">
                        {lang === 'en' ? 'English' : lang === 'ms' ? 'Malay' : lang === 'zh' ? 'Chinese' : 'Tamil'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-lg bg-[#00c8d4] hover:bg-[#00b0ba] text-white font-bold transition-transform hover:scale-105 shadow-lg shadow-[#00c8d4]/30">
                Login
              </button>
            </div>
            
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden absolute w-full bg-white dark:bg-[#080d14] border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'} overflow-hidden`}>
          <div className="px-4 py-4 space-y-4 font-medium flex flex-col">
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#00c8d4]">Services</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#00c8d4]">Features</a>
            <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#00c8d4]">Portfolio</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#00c8d4]">Pricing</a>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex space-x-4">
               <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                </button>
                <button onClick={() => changeLanguage(userLang === 'en' ? 'ms' : 'en')} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 uppercase text-sm font-bold">
                  {userLang}
                </button>
            </div>
            <button onClick={() => navigate('/login')} className="w-full text-center px-6 py-3 rounded-lg bg-[#00c8d4] text-white font-bold">
              Dashboard Login
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative pt-32 lg:pt-48 pb-20 overflow-hidden min-h-[90vh] flex items-center">
        <ParticleNetwork />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#00c8d4]/10 border border-[#00c8d4]/20 text-[#00c8d4] font-bold text-sm mb-8 animate-pulse backdrop-blur-sm">
            🇲🇾 Built for Malaysian Businesses & Global Reach
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl leading-tight drop-shadow-lg">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 dark:text-[#8aa4bc] max-w-3xl mb-10 font-medium">
            {t('heroSub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button onClick={() => document.getElementById('demo').scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 rounded-xl bg-[#00c8d4] hover:bg-[#00b0ba] text-white font-bold text-lg transition-transform hover:scale-105 shadow-2xl shadow-[#00c8d4]/40 flex items-center justify-center">
              {t('tryDemo')} <ArrowRight className="ml-2" size={22} />
            </button>
            <button onClick={() => document.getElementById('services').scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 rounded-xl border-2 border-gray-300 dark:border-[#00c8d4]/40 hover:bg-gray-100 dark:hover:bg-[#00c8d4]/10 font-bold text-lg transition-colors flex items-center justify-center bg-white/50 dark:bg-transparent backdrop-blur-sm">
              {t('exploreServices')}
            </button>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm md:text-base font-bold text-gray-500 dark:text-gray-400">
            <span className="flex items-center"><CheckCircle size={16} className="mr-2 text-[#22c55e]" /> No Monthly Fee</span>
            <span className="flex items-center"><CheckCircle size={16} className="mr-2 text-[#22c55e]" /> No Commission</span>
            <span className="flex items-center"><CheckCircle size={16} className="mr-2 text-[#22c55e]" /> Custom Branding</span>
            <span className="flex items-center"><CheckCircle size={16} className="mr-2 text-[#22c55e]" /> AI Ready</span>
          </div>
        </div>

        {/* Ticker Bar */}
        <div className="absolute bottom-0 w-full overflow-hidden bg-gray-100 dark:bg-[#0a111a] py-3 border-y border-gray-200 dark:border-[#00c8d4]/20 hidden md:block">
          <div className="whitespace-nowrap animate-[marquee_25s_linear_infinite] flex space-x-12 text-[#00c8d4] font-extrabold tracking-widest text-sm">
            <span>QR TABLE ORDERING</span><span>•</span>
            <span>CUSTOM AI CHATBOTS</span><span>•</span>
            <span>LIVE KITCHEN DISPLAY</span><span>•</span>
            <span>TELEGRAM NOTIFICATIONS</span><span>•</span>
            <span>SAAS DEVELOPMENT</span><span>•</span>
            <span>TABLE RESERVATIONS</span><span>•</span>
            <span>REAL-TIME ANALYTICS</span><span>•</span>
            <span>WEB DEVELOPMENT</span><span>•</span>
            <span>FIREBASE POWERED</span><span>•</span>
            <span>QR TABLE ORDERING</span><span>•</span>
            <span>CUSTOM AI CHATBOTS</span><span>•</span>
            <span>LIVE KITCHEN DISPLAY</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROOF BAR */}
      <section className="bg-[#00c8d4] text-[#080d14] py-12 relative z-20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-[#080d14]/20">
            <div>
              <div className="text-4xl md:text-5xl font-black mb-1">5+</div>
              <div className="font-bold text-sm uppercase tracking-wider">{t('proofLive')}</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-1">100%</div>
              <div className="font-bold text-sm uppercase tracking-wider">{t('proofFree')}</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-1">30m</div>
              <div className="font-bold text-sm uppercase tracking-wider">{t('proofSetup')}</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-1">Global</div>
              <div className="font-bold text-sm uppercase tracking-wider">Reach & Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: SERVICES */}
      <section id="services" className="py-24 bg-white dark:bg-[#0f1820]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t('servicesTitle')}</h2>
            <p className="text-xl text-gray-600 dark:text-[#8aa4bc] max-w-3xl mx-auto">
              We specialize in digital transformation. From restaurants to corporate enterprises, we build scalable, aesthetic, and functional software tailored to your specific needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-[#141f2e] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[#00c8d4]/50 transition-colors group">
              <div className="w-16 h-16 bg-[#00c8d4]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Utensils className="text-[#00c8d4]" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Restaurant OS</h3>
              <p className="text-gray-600 dark:text-[#8aa4bc] leading-relaxed mb-6">
                Our flagship product. A complete, lifetime-free restaurant management system with QR ordering, POS, live dashboard, and reservations.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#141f2e] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[#00c8d4]/50 transition-colors group">
              <div className="w-16 h-16 bg-[#00c8d4]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="text-[#00c8d4]" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Custom AI Solutions</h3>
              <p className="text-gray-600 dark:text-[#8aa4bc] leading-relaxed mb-6">
                Integrate advanced AI into your workflow. Custom chatbots, automated data processing, and AI-driven analytics tailored to your company's data.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#141f2e] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[#00c8d4]/50 transition-colors group">
              <div className="w-16 h-16 bg-[#00c8d4]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code className="text-[#00c8d4]" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium Web Development</h3>
              <p className="text-gray-600 dark:text-[#8aa4bc] leading-relaxed mb-6">
                From SEO-optimized corporate landing pages to complex full-stack SaaS platforms. We build aesthetic, lightning-fast web applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE PROBLEM */}
      <section className="py-24 bg-gray-50 dark:bg-[#080d14] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t('problemTitle')}</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* The Messy WhatsApp */}
            <div className="relative rounded-3xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-8 shadow-[0_0_50px_rgba(239,68,68,0.05)] dark:shadow-[0_0_50px_rgba(239,68,68,0.1)]">
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Old Way</div>
              <h3 className="text-2xl font-bold mb-6 flex items-center text-red-600 dark:text-red-500"><X size={28} className="mr-2"/> The WhatsApp Chaos</h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg rounded-tl-none inline-block max-w-[80%] text-gray-800 dark:text-gray-200">table 3 order?</div><br/>
                <div className="bg-red-200 dark:bg-red-900/50 p-4 rounded-lg rounded-tr-none inline-block max-w-[80%] float-right text-red-900 dark:text-red-200">mana order table 5?? customer marah!</div><div className="clear-both"></div>
                <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg rounded-tl-none inline-block max-w-[80%] text-gray-800 dark:text-gray-200">salah order lagi bos</div><br/>
                <div className="bg-red-200 dark:bg-red-900/50 p-4 rounded-lg rounded-tr-none inline-block max-w-[80%] float-right text-red-900 dark:text-red-200">missed 3 orders tonight...</div><div className="clear-both"></div>
              </div>
            </div>
            
            {/* The Clean Telegram */}
            <div className="relative rounded-3xl bg-[#00c8d4]/10 border border-[#00c8d4]/30 p-8 shadow-[0_0_50px_rgba(0,200,212,0.05)] dark:shadow-[0_0_50px_rgba(0,200,212,0.15)]">
              <div className="absolute top-4 right-4 bg-[#00c8d4] text-white text-xs font-bold px-3 py-1 rounded-full">DOT ZERO AI Way</div>
              <h3 className="text-2xl font-bold mb-6 flex items-center text-[#00b0ba] dark:text-[#00c8d4]"><CheckCircle size={28} className="mr-2"/> Structured Automation</h3>
              <div className="bg-white dark:bg-[#141f2e] border border-gray-200 dark:border-gray-700 p-5 rounded-2xl shadow-lg">
                <div className="font-bold text-lg mb-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center">
                  <MessageCircle size={20} className="text-blue-500 mr-2"/> NEW ORDER — UB-AK649
                </div>
                <div className="space-y-1 font-medium text-gray-600 dark:text-[#8aa4bc]">
                  <p>🪑 Table: <span className="text-gray-900 dark:text-white font-bold">5</span></p>
                  <p>👤 Customer: <span className="text-gray-900 dark:text-white font-bold">Ahmad</span></p>
                  <p className="mt-2">📋 Order:</p>
                  <ul className="list-disc list-inside pl-2 text-gray-900 dark:text-gray-300">
                    <li>2× Lamb Chop (RM 83.80)</li>
                    <li>1× Pasta Carbonara (RM 26.90)</li>
                  </ul>
                  <p className="mt-3 text-lg">💰 Total: <span className="text-[#00c8d4] font-bold">RM 110.70</span></p>
                </div>
              </div>
              <p className="mt-6 text-gray-700 dark:text-[#8aa4bc] font-medium leading-relaxed">
                DOT ZERO AI Restaurant OS gives you instant, structured order notifications on Telegram — while saving every order to a live cloud dashboard that never sleeps and never charges a monthly fee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES */}
      <section id="features" className="py-24 bg-white dark:bg-[#0f1820]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t('featuresTitle')}</h2>
          </div>

          <div className="space-y-32">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="bg-[#e2e8f0] dark:bg-[#141f2e] rounded-t-xl p-2 flex items-center space-x-2 border border-gray-300 dark:border-gray-800">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <img src="/assets/dotzeroai/Dashboard_analytics_ss.png" alt="Analytics Dashboard" className="w-full rounded-b-xl border-x border-b border-gray-300 dark:border-gray-800 shadow-2xl" loading="lazy" />
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center space-x-3 mb-4 text-[#00c8d4]">
                  <BarChart3 size={32} />
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Real-Time Analytics</h3>
                </div>
                <p className="text-lg text-gray-600 dark:text-[#8aa4bc] mb-6 leading-relaxed">
                  Track total revenue, order volumes, average order value, peak selling hours, and top-performing menu items. Filter by any custom date range. Built for owners who want data without spreadsheets.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Revenue Tracking</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Top Items</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Date Filters</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-4 text-[#00c8d4]">
                  <Monitor size={32} />
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Live Kitchen Display</h3>
                </div>
                <p className="text-lg text-gray-600 dark:text-[#8aa4bc] mb-6 leading-relaxed">
                  New orders appear instantly. The kitchen sees every ticket in real-time. Move orders through New → Processing → Completed with one click. Audio alerts for new orders.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Real-Time Sync</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Kanban Board</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Audio Alerts</span>
                </div>
              </div>
              <div className="relative">
                 <div className="bg-[#e2e8f0] dark:bg-[#141f2e] rounded-t-xl p-2 flex items-center space-x-2 border border-gray-300 dark:border-gray-800">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <img src="/assets/dotzeroai/Dashboard_LiveOrders_ss.png" alt="Live Orders Dashboard" className="w-full rounded-b-xl border-x border-b border-gray-300 dark:border-gray-800 shadow-2xl" loading="lazy" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="bg-[#e2e8f0] dark:bg-[#141f2e] rounded-t-xl p-2 flex items-center space-x-2 border border-gray-300 dark:border-gray-800">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <img src="/assets/dotzeroai/Dashboard_Menu_SS.png" alt="Menu Manager" className="w-full rounded-b-xl border-x border-b border-gray-300 dark:border-gray-800 shadow-2xl" loading="lazy" />
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center space-x-3 mb-4 text-[#00c8d4]">
                  <Smartphone size={32} />
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Live Menu Manager</h3>
                </div>
                <p className="text-lg text-gray-600 dark:text-[#8aa4bc] mb-6 leading-relaxed">
                  No developer needed. Upload food photos, update prices, mark items sold out, or add categories directly from your phone. Changes sync instantly to customer devices.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Photo Uploads</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Sold Out Toggle</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">No-Code Editing</span>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-4 text-[#00c8d4]">
                  <CalendarDays size={32} />
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Table Reservations & Pre-Orders</h3>
                </div>
                <p className="text-lg text-gray-600 dark:text-[#8aa4bc] mb-6 leading-relaxed">
                  Customers book tables online and pre-order food. Owners confirm bookings and assign table numbers. Pre-orders appear in the kitchen exactly 1 hour before arrival.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Online Booking</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Auto-Trigger PreOrders</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">Booking IDs</span>
                </div>
              </div>
              <div className="relative">
                 <div className="bg-[#e2e8f0] dark:bg-[#141f2e] rounded-t-xl p-2 flex items-center space-x-2 border border-gray-300 dark:border-gray-800">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <img src="/assets/dotzeroai/Dashboard_Reservations_ss.png" alt="Reservations System" className="w-full rounded-b-xl border-x border-b border-gray-300 dark:border-gray-800 shadow-2xl" loading="lazy" />
              </div>
            </div>
          </div>

          <div className="mt-20 p-8 rounded-2xl border-2 border-[#22c55e] bg-green-50 dark:bg-[#22c55e]/5 text-center shadow-xl">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">And Much More Included Out of the Box:</h4>
            <p className="text-gray-700 dark:text-[#8aa4bc] font-medium">
              QR Station Print Tool • Cashier POS • Multi-Staff Role Permissions • Tax & Service Charge Config • PWA Mobile App Install
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: LIVE DEMO */}
      <section id="demo" className="py-24 bg-gray-50 dark:bg-[#080d14] border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t('demoTitle')}</h2>
            <p className="text-xl text-gray-600 dark:text-[#8aa4bc]">Scan any QR code below with your phone to experience customer ordering live.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[1, 7, 12].map(table => (
              <div key={table} className="bg-white dark:bg-[#141f2e] p-8 rounded-3xl border border-gray-200 dark:border-gray-700 text-center shadow-xl hover:-translate-y-2 transition-transform">
                <div className="bg-white p-4 inline-block rounded-xl mb-6 border-4 border-gray-100 shadow-sm">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://restaurant-master-template.web.app/order?table=${table}`} alt={`QR Code Table ${table}`} className="w-48 h-48" />
                </div>
                <div className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Table {table}</div>
                <div className="text-sm font-bold uppercase tracking-wider text-[#00c8d4]">Try QR Ordering</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-[#141f2e] p-10 rounded-3xl border border-gray-200 dark:border-gray-800 text-center relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00c8d4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Experience the Owner Dashboard</h3>
              <p className="text-gray-600 dark:text-[#8aa4bc] mb-8 font-medium">See live orders, manage the menu, view analytics. Demo credentials are pre-filled.</p>
              <button onClick={() => navigate('/login')} className="px-8 py-4 rounded-xl bg-[#00c8d4] hover:bg-[#00b0ba] text-white font-bold w-full transition-transform hover:scale-105 shadow-xl shadow-[#00c8d4]/30 flex items-center justify-center">
                Open Live Dashboard <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
            <div className="bg-white dark:bg-[#141f2e] p-10 rounded-3xl border border-gray-200 dark:border-gray-800 text-center relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Try Customer Table Booking</h3>
              <p className="text-gray-600 dark:text-[#8aa4bc] mb-8 font-medium">Book a table through our reservation system and see how the customer experience works.</p>
              <button onClick={() => navigate('/book')} className="px-8 py-4 rounded-xl border-2 border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-white font-bold w-full transition-all hover:scale-105 shadow-xl flex items-center justify-center">
                Make a Demo Reservation <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: VIDEOS */}
      <section className="py-24 bg-white dark:bg-[#0f1820]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t('videoTitle')}</h2>
            <p className="text-xl text-gray-600 dark:text-[#8aa4bc] max-w-3xl mx-auto">
              This walkthrough demonstrates the complete DOT ZERO AI Restaurant OS. Built on Firebase, deployed instantly, with real-time Telegram notifications. All free.
            </p>
          </div>
          
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200 dark:border-gray-800 max-w-5xl mx-auto bg-black aspect-video relative">
            <iframe 
              src="https://www.youtube.com/embed/Al4t80_UCPE?rel=0" 
              title="DOT ZERO AI System Walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>

      {/* SECTION 7: PORTFOLIO */}
      <section id="portfolio" className="py-24 bg-gray-50 dark:bg-[#080d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t('portfolioTitle')}</h2>
            <p className="text-xl text-gray-600 dark:text-[#8aa4bc] max-w-3xl mx-auto">
              Every website we build is custom-designed to match the client's identity. Browse live examples — each link opens the actual working site.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Mosty Kitchen", loc: "Kuala Kangsar, Perak", type: "Western Restaurant", url: "https://restaurant-master-template.web.app", color: "bg-yellow-500", fullSystem: true },
              { name: "Restoran Hadramawth", loc: "Alor Setar, Kedah", type: "Middle Eastern", url: "https://hadramawth-f58ba.web.app", color: "bg-green-500", fullSystem: true },
              { name: "Utoo Boho Café", loc: "George Town, Penang", type: "Café & Patisserie", url: "https://whoisminhaz.github.io/UtoBoho/", color: "bg-orange-500" },
              { name: "Acupaday Coffee Shop", loc: "Malaysia", type: "Coffee Shop", url: "https://whoisminhaz.github.io/acupaday/", color: "bg-teal-500" },
              { name: "INA Cafe", loc: "Penang", type: "Café", url: "https://whoisminhaz.github.io/INA-Cafe/", color: "bg-purple-500" },
              { name: "Tingdap Kopi", loc: "Penang", type: "Traditional Coffee", url: "https://whoisminhaz.github.io/Tingdap-Kopi", color: "bg-red-500" }
            ].map((site, i) => (
              <div key={i} className="bg-white dark:bg-[#141f2e] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl hover:-translate-y-2 transition-transform flex flex-col h-full relative">
                <div className={`h-3 w-full ${site.color}`}></div>
                {site.fullSystem && (
                  <div className="absolute top-6 right-4 bg-[#22c55e] text-white text-[10px] font-black uppercase px-2 py-1 rounded">Full OS Included</div>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{site.name}</h3>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{site.loc}</p>
                  <p className="text-sm text-gray-600 dark:text-[#8aa4bc] mb-8">{site.type}</p>
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className="mt-auto px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-center font-bold text-gray-900 dark:text-white transition-colors">
                    Visit Live Site →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: PORTRAIT AD & PRICING */}
      <section id="pricing" className="py-24 bg-white dark:bg-[#0f1820]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* The Phone Ad */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center">{t('adTitle')}</h2>
              <div className="w-[300px] h-[600px] bg-black rounded-[40px] border-[14px] border-gray-900 dark:border-gray-800 shadow-2xl relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 dark:bg-gray-800 rounded-b-xl w-32 mx-auto z-20"></div>
                <iframe 
                  src="https://www.youtube.com/embed/D3U7jCobPKQ?rel=0" 
                  title="DOT ZERO AI Overview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full z-10"
                ></iframe>
              </div>
            </div>

            {/* Pricing Comparison */}
            <div className="lg:col-span-8">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-8">{t('pricingTitle')}</h2>
              <p className="text-xl text-gray-600 dark:text-[#8aa4bc] mb-10">
                The average Malaysian restaurant saves RM 6,000–12,000 per year by switching to DOT ZERO AI.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Traditional */}
                <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-200 dark:border-red-900/30 shadow-sm">
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">Traditional Systems</h3>
                  <div className="space-y-4 font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between items-center"><span className="flex items-center"><X size={16} className="text-red-500 mr-2"/> POS Software</span> <span>RM 300/mo</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center"><X size={16} className="text-red-500 mr-2"/> Delivery Apps</span> <span>30% per order</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center"><X size={16} className="text-red-500 mr-2"/> Booking System</span> <span>RM 150/mo</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center"><X size={16} className="text-red-500 mr-2"/> Analytics</span> <span>RM 100/mo</span></div>
                    <div className="border-t border-red-200 dark:border-red-900/50 pt-4 mt-4 text-xl font-black text-red-600 dark:text-red-400">Total: ~RM 6,600 / year</div>
                  </div>
                </div>

                {/* DOT ZERO AI */}
                <div className="bg-[#00c8d4]/5 p-8 rounded-3xl border-2 border-[#00c8d4] shadow-[0_0_30px_rgba(0,200,212,0.1)]">
                  <div className="bg-[#00c8d4] text-white text-xs font-black uppercase px-3 py-1 rounded-full inline-block mb-4">Your New Setup</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">DOT ZERO AI OS</h3>
                  <div className="space-y-4 font-bold text-gray-800 dark:text-gray-200">
                    <div className="flex justify-between items-center"><span className="flex items-center"><CheckCircle size={16} className="text-[#00c8d4] mr-2"/> QR Ordering</span> <span className="text-[#00c8d4]">Free</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center"><CheckCircle size={16} className="text-[#00c8d4] mr-2"/> Live Dashboard</span> <span className="text-[#00c8d4]">Free</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center"><CheckCircle size={16} className="text-[#00c8d4] mr-2"/> Table Booking</span> <span className="text-[#00c8d4]">Free</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center"><CheckCircle size={16} className="text-[#00c8d4] mr-2"/> Kitchen Display</span> <span className="text-[#00c8d4]">Free</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center"><CheckCircle size={16} className="text-[#00c8d4] mr-2"/> Zero Commission</span> <span className="text-[#00c8d4]">Free</span></div>
                    <div className="border-t border-[#00c8d4]/30 pt-4 mt-4 text-xl font-black text-gray-900 dark:text-white">Monthly Fee: RM 0</div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600 dark:text-[#8aa4bc] font-medium">One-time setup fee only. Your restaurant. Your data. Forever.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 9: FAQ */}
      <section className="py-24 bg-gray-50 dark:bg-[#080d14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t('faqTitle')}</h2>
          </div>
          <div>
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: FOUNDER */}
      <section id="founder" className="py-24 bg-white dark:bg-[#0f1820] border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t('founderTitle')}</h2>
          </div>

          <div className="bg-gray-50 dark:bg-[#141f2e] rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-800 max-w-5xl mx-auto shadow-sm">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0 border-4 border-[#00c8d4] overflow-hidden shadow-xl flex items-center justify-center font-bold text-4xl text-[#00c8d4]">
                MU
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2 text-gray-900 dark:text-white">Md Minhaz Uddin</h3>
                <p className="text-[#00c8d4] font-bold uppercase tracking-wider text-sm mb-6">Founder & Developer, DOT ZERO AI</p>
                <p className="text-lg text-gray-600 dark:text-[#8aa4bc] mb-8 leading-relaxed font-medium">
                  Minhaz is an international student at Albukhary International University (AIU) in Alor Setar, Kedah, Malaysia. Frustrated by the high monthly costs that prevent small Malaysian businesses from using modern technology, he designed a system that delivers enterprise-level features at zero recurring cost.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">Firebase</span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">React</span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">AI Integration</span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">Restaurant Tech</span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">PWA</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <a href="https://portfolio.whoisminhaz.workers.dev/" target="_blank" rel="noopener noreferrer" className="px-6 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold transition-transform hover:-translate-y-1 shadow-md">Portfolio</a>
                  <a href="https://www.tiktok.com/@dotzeroai" target="_blank" rel="noopener noreferrer" className="px-6 py-2 rounded-lg bg-black text-white font-bold transition-transform hover:-translate-y-1 shadow-md">TikTok</a>
                  <a href="https://www.facebook.com/dotzeroai" target="_blank" rel="noopener noreferrer" className="px-6 py-2 rounded-lg bg-[#1877F2] text-white font-bold transition-transform hover:-translate-y-1 shadow-md">Facebook</a>
                  <a href="https://www.instagram.com/dotzeroai" target="_blank" rel="noopener noreferrer" className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-bold transition-transform hover:-translate-y-1 shadow-md">Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 dark:bg-[#080d14] border-t border-gray-200 dark:border-gray-800 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                <img src="/assets/dotzeroai/logo 1.png" alt="DOT ZERO AI Logo" className="h-10 w-auto" />
                <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">DOT ZERO AI</span>
              </div>
              <p className="text-gray-600 dark:text-[#8aa4bc] font-bold">{t('footerTagline')}</p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">Services</h4>
              <ul className="space-y-4 text-gray-600 dark:text-[#8aa4bc] font-medium">
                <li>Restaurant OS Setup</li>
                <li>Custom SaaS Development</li>
                <li>AI Chatbot Integration</li>
                <li>Premium Web Design</li>
                <li>Analytics Dashboards</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">Portfolio</h4>
              <ul className="space-y-4 text-gray-600 dark:text-[#8aa4bc] font-medium">
                <li><a href="https://restaurant-master-template.web.app" target="_blank" rel="noreferrer" className="hover:text-[#00c8d4] transition-colors">Mosty Kitchen</a></li>
                <li><a href="https://hadramawth-f58ba.web.app/" target="_blank" rel="noreferrer" className="hover:text-[#00c8d4] transition-colors">Restoran Hadramawth</a></li>
                <li><a href="https://whoisminhaz.github.io/UtoBoho/" target="_blank" rel="noreferrer" className="hover:text-[#00c8d4] transition-colors">Utoo Boho</a></li>
                <li><a href="https://whoisminhaz.github.io/acupaday/" target="_blank" rel="noreferrer" className="hover:text-[#00c8d4] transition-colors">Acupaday</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">Contact</h4>
              <ul className="space-y-4 text-gray-600 dark:text-[#8aa4bc] font-medium">
                <li>Email: hello@dotzeroai.com</li>
                <li>Location: Alor Setar, Kedah, Malaysia</li>
                <li className="pt-4">
                  <a href="https://wa.me/601139414271" target="_blank" rel="noreferrer" className="inline-flex items-center px-6 py-3 bg-[#22c55e] text-white font-bold rounded-xl hover:bg-[#1ea951] transition-all hover:scale-105 shadow-lg shadow-[#22c55e]/30">
                    WhatsApp Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-gray-600 font-bold text-sm">
              © {new Date().getFullYear()} DOT ZERO AI. All Rights Reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
              <span>Halal Tech</span>
              <span className="hidden sm:inline">•</span>
              <span>Malaysian Built</span>
              <span className="hidden sm:inline">•</span>
              <span>Firebase Powered</span>
            </div>
          </div>
          
          {/* SEO Hidden Text */}
          <div className="mt-8 text-transparent select-none opacity-0" style={{fontSize: '1px'}}>
            Keywords: free restaurant ordering system Malaysia, lifetime free QR menu, restaurant management system free, sistem pesanan QR percuma Malaysia, free table booking system, restaurant CRM Malaysia, kitchen display system free, AI chatbot Malaysia, Web development Penang Kedah KL.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
