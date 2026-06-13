import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ShoppingBag, Plus, Minus, ArrowLeft, Moon, Sun } from 'lucide-react';
import LanguageDropdown from '../../components/LanguageDropdown';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { t } from '../../utils/translations';
import LoadingScreen from '../../components/LoadingScreen';

const MenuOrder = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');

  const userLang = localStorage.getItem('userLang') || 'en';
  const [searchParams] = useSearchParams();
  const [orderMode, setOrderMode] = useState(localStorage.getItem('orderMode') || 'takeaway');
  let tableNumStr = localStorage.getItem('tableNum');
  const [tableNum, setTableNum] = useState(tableNumStr === 'null' || !tableNumStr ? null : tableNumStr);

  useEffect(() => {
    const tableQ = searchParams.get('table');
    const typeQ = searchParams.get('type');

    if (tableQ) {
      localStorage.setItem('tableNum', tableQ);
      localStorage.setItem('orderMode', 'dineIn');
      setTableNum(tableQ);
      setOrderMode('dineIn');
    } else if (typeQ === 'takeaway') {
      localStorage.removeItem('tableNum');
      localStorage.setItem('orderMode', 'takeaway');
      setTableNum(null);
      setOrderMode('takeaway');
    }
  }, [searchParams]);

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
    const fetchPublicData = async () => {
      try {
        let fetchedSettings = { restaurantName: 'Menu', themePrimary: '#b5602a' };
        const setSnap = await getDoc(doc(db, 'settings', 'master'));
        if (setSnap.exists()) {
          fetchedSettings = setSnap.data();
          setSettings(fetchedSettings);
        } else {
          setSettings(fetchedSettings);
        }

        const querySnapshot = await getDocs(collection(db, 'menu'));
        const menuList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let activePrice = data.price;
          let hasDiscount = false;
          
          if (fetchedSettings && fetchedSettings.discountPercent > 0) {
            const dItems = fetchedSettings.discountItems || ['all'];
            if (dItems.includes('all') || dItems.includes(doc.id)) {
              activePrice = data.price * (1 - (fetchedSettings.discountPercent / 100));
              hasDiscount = true;
            }
          }
          
          return { id: doc.id, ...data, activePrice, hasDiscount, originalPrice: data.price };
        });
        
        setItems(menuList.filter(i => i.available));
      } catch (error) {
        setSettings({ restaurantName: 'Menu Error', themePrimary: '#b5602a' });
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing.qty === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.activePrice * item.qty), 0);

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex items-center justify-center">
        <LoadingScreen message={`${t(userLang, 'processing')}`} themeColor={settings?.themePrimary || '#000'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] pb-32 transition-colors duration-500">
      {/* Header */}
      <header className="bg-white dark:bg-[#121212] sticky top-0 z-40 shadow-sm dark:shadow-black/50 px-4 py-4 flex items-center justify-between transition-colors duration-500">
        <button onClick={() => window.location.href = '/'} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{settings.restaurantName}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {localStorage.getItem('pendingReservation') 
              ? t(userLang, 'preOrder') 
              : (orderMode === 'takeaway' ? t(userLang, 'takeaway') : t(userLang, 'dineIn'))} 
            {tableNum ? ` - ${t(userLang, 'tableNumber')} ${tableNum}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <LanguageDropdown />
          <button onClick={() => setIsDark(!isDark)} className="p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:opacity-70 transition-opacity">
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="px-4 py-4 flex gap-3 overflow-x-auto no-scrollbar">
        {['all', 'mains', 'drinks', 'desserts', 'addons'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-medium text-sm transition-colors ${selectedCategory === cat ? 'text-white' : 'bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800'}`}
            style={selectedCategory === cat ? { backgroundColor: settings.themePrimary } : {}}
          >
            {t(userLang, cat)}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.filter(item => {
          if (selectedCategory === 'all') return true;
          const mappedCat = selectedCategory === 'addons' ? 'Add-ons' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
          return item.category === mappedCat;
        }).map(item => (
          <div key={item.id} className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col transition-colors duration-500">
            <div className="h-32 bg-gray-100 dark:bg-[#222] relative overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="Food" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">No Image</div>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 transition-colors">
                {(item.names && item.names[userLang]) || (item.names && item.names['en']) || item.name || 'Unknown Item'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 capitalize transition-colors">{item.category}</p>
              
              <div className="mt-auto flex items-center justify-between gap-1">
                <div className="min-w-0">
                  {item.hasDiscount && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold -mb-1 truncate">Discounted</span>
                      <div className="flex flex-col xl:flex-row xl:items-center xl:gap-1.5">
                        <span className="text-xs text-gray-400 line-through">RM {item.originalPrice.toFixed(2)}</span>
                        <span className="font-bold text-gray-900 dark:text-white transition-colors text-base md:text-lg">RM {item.activePrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {!item.hasDiscount && (
                    <span className="font-bold text-gray-900 dark:text-white transition-colors text-base md:text-lg">RM {item.activePrice.toFixed(2)}</span>
                  )}
                </div>
                
                {/* Cart Controls for this item */}
                {cart.find(i => i.id === item.id) ? (
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-black rounded-full p-1 transition-colors shrink-0">
                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 shrink-0 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm text-gray-800 dark:text-white hover:scale-105 active:scale-95 transition-transform">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold min-w-[16px] text-center dark:text-white">{cart.find(i => i.id === item.id).qty}</span>
                    <button 
                      onClick={() => addToCart(item)} 
                      className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center shadow-sm text-white hover:scale-105 active:scale-95 transition-transform"
                      style={{ backgroundColor: settings.themePrimary }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: settings.themePrimary }}
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
          <div 
            onClick={() => navigate('/checkout', { state: { cart, cartTotal } })}
            className="w-full max-w-md mx-auto text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform"
            style={{ backgroundColor: settings.themePrimary }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag size={24} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a1a1a] transition-colors">
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              </div>
              <span className="font-bold">{t(userLang, 'viewCart')}</span>
            </div>
            <span className="font-bold text-lg">RM {cartTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuOrder;
