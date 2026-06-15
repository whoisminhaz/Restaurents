import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { LayoutDashboard, ShoppingCart, Menu as MenuIcon, QrCode, Settings, LogOut, Menu as Hamburger, Moon, Sun, Activity, CalendarDays, RefreshCw, Clock } from 'lucide-react';
import { t } from '../utils/translations';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const ownerLang = localStorage.getItem('ownerLang') || 'en';
  
  const [dashboardBg, setDashboardBg] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);
  const [resCount, setResCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'master'));
      if (snap.exists()) {
        const data = snap.data();
        if (data.themePrimary) {
          document.documentElement.style.setProperty('--crm-accent', data.themePrimary);
        }
        if (data.dashboardBg) setDashboardBg(data.dashboardBg);
      }
      
      const adminSnap = await getDoc(doc(db, 'settings', 'adminConfig'));
      if (adminSnap.exists()) {
        const adminData = adminSnap.data();
        const userEmail = auth.currentUser?.email;
        const adminEmails = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
        const isSuper = adminEmails.includes(userEmail);
        const isOwner = userEmail === adminData.ownerEmail;
        if (isSuper || isOwner) {
          setIsAdmin(true);
        }
      } else {
        // Fallback for Super Admin if adminConfig doesn't exist
        const userEmail = auth.currentUser?.email;
        const adminEmails = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
        if (adminEmails.includes(userEmail)) {
          setIsAdmin(true);
        }
      }
    };
    fetchSettings();

    // Real-time Badge Listeners
    const qPending = query(collection(db, 'orders'), where('status', '==', 'pending'));
    const unsubPending = onSnapshot(qPending, (snap) => setPendingCount(snap.docs.length));

    const qProcessing = query(collection(db, 'orders'), where('status', '==', 'processing'));
    const unsubProcessing = onSnapshot(qProcessing, (snap) => setProcessingCount(snap.docs.length));

    const qRes = query(collection(db, 'reservations'), where('status', '==', 'pending'));
    const unsubRes = onSnapshot(qRes, (snap) => setResCount(snap.docs.length));

    return () => {
      unsubPending();
      unsubProcessing();
      unsubRes();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navLinks = [
    { name: t(ownerLang, 'liveOrders'), path: '/dashboard/live-orders', icon: LayoutDashboard, pendingCount, processingCount, adminOnly: false },
    { name: t(ownerLang, 'cashierPos'), path: '/dashboard/pos', icon: ShoppingCart, adminOnly: false },
    { name: t(ownerLang, 'reservations'), path: '/dashboard/reservations', icon: CalendarDays, count: resCount, adminOnly: false },
    { name: t(ownerLang, 'menuManager'), path: '/dashboard/menu', icon: MenuIcon, adminOnly: false },
    { name: t(ownerLang, 'analytics'), path: '/dashboard/analytics', icon: Activity, adminOnly: false },
    { name: t(ownerLang, 'qrStation'), path: '/dashboard/qr', icon: QrCode, adminOnly: false },
    { name: t(ownerLang, 'settingsTheme'), path: '/dashboard/settings', icon: Settings, adminOnly: true },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-crmCard/95 backdrop-blur-md border-r border-crmBorder w-64 text-crmText transition-colors duration-300">
      <div className="p-6 border-b border-crmBorder flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-crmAccent flex items-center justify-center font-bold text-white">OS</div>
        <h2 className="text-xl font-bold tracking-tight">Restaurant OS</h2>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navLinks.filter(link => !link.adminOnly || isAdmin).map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-crmAccent/10 text-crmAccent border border-crmAccent/20' : 'hover:bg-crmBorder text-gray-400 hover:text-crmText'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="font-medium text-sm">{link.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {link.pendingCount > 0 && (
                  <span className="bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.pendingCount}
                  </span>
                )}
                {link.processingCount > 0 && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.processingCount}
                  </span>
                )}
                {link.count > 0 && (
                  <span className="bg-crmAccent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.count}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-crmBorder">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">{t(ownerLang, 'signOut')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="flex h-screen bg-crmDark overflow-hidden transition-colors duration-300 relative"
      style={dashboardBg ? { 
        backgroundImage: `url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      {dashboardBg && <div className="absolute inset-0 bg-crmDark/80 z-0"></div>}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block z-10">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 shadow-2xl h-full animate-fade-in-right">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-10">
        {/* Header with Theme Switcher */}
        <header className="flex items-center justify-between p-4 bg-crmCard/95 backdrop-blur-md border-b border-crmBorder transition-colors duration-300">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-crmAccent flex items-center justify-center font-bold text-white text-xs">OS</div>
            <h1 className="text-lg font-bold text-crmText">Restaurant OS</h1>
          </div>
          <div className="hidden md:block" />

          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-crmDark border border-crmBorder px-3 py-1.5 rounded-lg text-crmText font-mono text-sm tracking-wide items-center gap-2">
              <CalendarDays size={14} className="text-crmAccent opacity-80" />
              <span>{currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              <div className="w-px h-4 bg-crmBorder mx-1"></div>
              <Clock size={14} className="text-crmAccent opacity-80" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
            <button onClick={() => window.location.reload()} title="Hard Refresh" className="text-crmText hover:opacity-70 transition-opacity p-2 rounded-full hover:bg-crmBorder">
              <RefreshCw size={20} />
            </button>
            <button onClick={() => setIsDark(!isDark)} className="text-crmText hover:opacity-70 transition-opacity p-2 rounded-full hover:bg-crmBorder">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-crmText p-1">
              <Hamburger size={24} />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
