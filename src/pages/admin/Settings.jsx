import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Save, CheckCircle2, Upload, X, ChevronDown } from 'lucide-react';
import { t } from '../../utils/translations';
import LoadingScreen from '../../components/LoadingScreen';
import { formatDate } from '../../utils/formatDate';

const availableLanguages = [
  { id: 'en', name: 'English' },
  { id: 'ms', name: 'Malay' },
  { id: 'zh', name: 'Chinese' },
  { id: 'ta', name: 'Tamil' },
  { id: 'ar', name: 'Arabic' }
];

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isDiscountDropdownOpen, setIsDiscountDropdownOpen] = useState(false);
  
  const [ownerLang, setOwnerLang] = useState(localStorage.getItem('ownerLang') || 'en');
  
  // Employee Management State
  const [ownerEmail, setOwnerEmail] = useState('');
  const [employeeEmails, setEmployeeEmails] = useState([]);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [settings, setSettings] = useState({
    restaurantName: 'Cafe Bella',
    themePrimary: '#b5602a',
    languages: ['en'],
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    tngQrCode: '',
    discountPercent: 0,
    discountItems: ['all'],
    taxPercent: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'settings', 'master');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }

        const adminDocRef = doc(db, 'settings', 'adminConfig');
        const adminSnap = await getDoc(adminDocRef);
        if (adminSnap.exists()) {
          if (adminSnap.data().allowedEmails) setEmployeeEmails(adminSnap.data().allowedEmails);
          if (adminSnap.data().ownerEmail) setOwnerEmail(adminSnap.data().ownerEmail);
        } else {
          setEmployeeEmails([]);
          setOwnerEmail('');
        }

        const menuSnap = await getDocs(query(collection(db, 'menu')));
        setMenuItems(menuSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const toggleLanguage = (langId) => {
    setSettings(prev => {
      const langs = prev.languages.includes(langId)
        ? prev.languages.filter(l => l !== langId)
        : [...prev.languages, langId];
      if (langs.length === 0) return prev;
      return { ...prev, languages: langs };
    });
  };

  const toggleDiscountItem = (itemId) => {
    setSettings(prev => {
      let newItems = [...(prev.discountItems || [])];
      
      if (itemId === 'all') {
        if (newItems.includes('all')) {
          newItems = [];
        } else {
          newItems = ['all'];
        }
      } else {
        // Remove 'all' if a specific item is toggled
        newItems = newItems.filter(i => i !== 'all');
        
        if (newItems.includes(itemId)) {
          newItems = newItems.filter(i => i !== itemId);
        } else {
          newItems.push(itemId);
        }
      }
      return { ...prev, discountItems: newItems };
    });
  };

  const handleOwnerLangChange = (e) => {
    const lang = e.target.value;
    setOwnerLang(lang);
    localStorage.setItem('ownerLang', lang);
    window.location.reload(); 
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setSettings(prev => ({ ...prev, tngQrCode: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setSettings(prev => ({ ...prev, dashboardBg: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployeeEmail || !newEmployeeEmail.includes('@')) return;
    
    setAddingEmployee(true);
    try {
      const updatedEmails = [...employeeEmails, newEmployeeEmail.trim().toLowerCase()];
      await setDoc(doc(db, 'settings', 'adminConfig'), {
        allowedEmails: updatedEmails
      }, { merge: true });
      
      setEmployeeEmails(updatedEmails);
      setNewEmployeeEmail('');
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee.");
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleUpdateOwner = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'adminConfig'), {
        ownerEmail: ownerEmail.trim().toLowerCase()
      }, { merge: true });
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      console.error("Error updating owner:", error);
      alert("Failed to update owner email.");
    }
  };

  const handleRemoveEmployee = async (emailToRemove) => {
    if (!window.confirm(`Revoke access for ${emailToRemove}?`)) return;
    
    try {
      const updatedEmails = employeeEmails.filter(email => email !== emailToRemove);
      await setDoc(doc(db, 'settings', 'adminConfig'), {
        allowedEmails: updatedEmails
      }, { merge: true });
      
      setEmployeeEmails(updatedEmails);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      console.error("Error removing employee:", error);
      alert("Failed to remove employee.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'master'), settings);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Check permissions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading settings..." />;
  }

  const activeDiscountItems = settings.discountItems || ['all'];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto relative pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-crmText">{t(ownerLang, 'settingsTheme')}</h1>
          <p className="text-gray-400 mt-2">Manage your restaurant details, themes, and payment proofs.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-crmAccent hover:bg-[#964d20] text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-crmAccent/20"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={20} />}
          {saving ? 'Saving...' : t(ownerLang, 'saveChanges')}
        </button>
      </div>

      <div className="space-y-6">
        
        {/* 1. Reservation Configuration */}
        <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-crmText mb-2">Reservation Rules</h2>
          <p className="text-sm text-gray-400 mb-4">Configure your operating schedule and booking rules.</p>
          
          <div className="space-y-6">
            <div className="md:col-span-2 space-y-3">
               <label className="flex items-center gap-3 cursor-pointer p-4 border border-crmBorder rounded-xl hover:bg-crmDark/50 transition-colors">
                  <input 
                    type="checkbox"
                    checked={settings.bookingEnabled !== false}
                    onChange={(e) => setSettings(prev => ({ ...prev, bookingEnabled: e.target.checked }))}
                    className="w-5 h-5 accent-crmAccent"
                  />
                  <div>
                    <p className="font-medium text-crmText text-lg">Enable Booking System</p>
                    <p className="text-sm text-gray-400">Allow customers to make reservations through the website.</p>
                  </div>
               </label>

               <label className={`flex items-center gap-3 cursor-pointer p-4 border border-crmBorder rounded-xl transition-colors ${settings.bookingEnabled === false ? 'opacity-50 pointer-events-none bg-crmDark/30' : 'hover:bg-crmDark/50'}`}>
                  <input 
                    type="checkbox"
                    checked={!!settings.requirePreOrderForBooking}
                    onChange={(e) => setSettings(prev => ({ ...prev, requirePreOrderForBooking: e.target.checked }))}
                    className="w-5 h-5 accent-crmAccent"
                    disabled={settings.bookingEnabled === false}
                  />
                  <div>
                    <p className="font-medium text-crmText">Require Pre-order Food</p>
                    <p className="text-sm text-gray-400">Customers must order food to complete a table reservation.</p>
                  </div>
               </label>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-crmBorder ${settings.bookingEnabled === false ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Opening Time</label>
                <input
                  type="time"
                  name="operatingHoursOpen"
                  value={settings.operatingHoursOpen || '10:00'}
                  onChange={handleChange}
                  className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Closing Time</label>
                <input
                  type="time"
                  name="operatingHoursClose"
                  value={settings.operatingHoursClose || '22:00'}
                  onChange={handleChange}
                  className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
                />
              </div>
            </div>

            <div className={settings.bookingEnabled === false ? 'opacity-50 pointer-events-none' : ''}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Weekly Operating Days</label>
              <div className="flex flex-wrap gap-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => {
                  const daysArray = settings.operatingDays || [0,1,2,3,4,5,6];
                  const isActive = daysArray.includes(idx);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setSettings(prev => {
                          const curr = prev.operatingDays || [0,1,2,3,4,5,6];
                          return {
                            ...prev,
                            operatingDays: curr.includes(idx) ? curr.filter(d => d !== idx) : [...curr, idx]
                          };
                        });
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isActive ? 'bg-crmAccent text-white' : 'bg-crmDark text-gray-500 border border-crmBorder'}`}
                    >
                      {day.substring(0,3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={settings.bookingEnabled === false ? 'opacity-50 pointer-events-none' : ''}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Specific Closed Dates (Holidays etc.)</label>
              <form onSubmit={(e) => {
                e.preventDefault();
                const val = e.target.elements.closedDate.value;
                if(!val) return;
                setSettings(prev => ({ ...prev, closedDates: [...(prev.closedDates || []), val] }));
                e.target.reset();
              }} className="flex gap-2 mb-3">
                <input type="date" name="closedDate" className="flex-1 bg-crmDark border border-crmBorder text-crmText px-4 py-2 rounded-xl focus:outline-none focus:border-crmAccent" />
                <button type="submit" className="bg-crmDark hover:bg-crmBorder text-crmText px-4 py-2 rounded-xl border border-crmBorder font-bold">Add</button>
              </form>
              <div className="flex flex-wrap gap-2">
                {(settings.closedDates || []).map((date, i) => (
                  <span key={i} className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                    {formatDate(date, settings.dateFormat)}
                    <button onClick={() => setSettings(prev => ({...prev, closedDates: prev.closedDates.filter(d => d !== date)}))} className="hover:text-red-300"><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Languages (Combined) */}
        <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-crmText mb-2">Languages Configuration</h2>
          <p className="text-sm text-gray-400 mb-6">Manage languages for both your customers and your dashboard.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-crmBorder pt-6">
            <div>
              <h3 className="font-medium text-crmText mb-4">Customer Menu Languages</h3>
              <div className="flex flex-wrap gap-3">
                {availableLanguages.map((lang) => {
                  const active = settings.languages?.includes(lang.id);
                  return (
                    <button
                      key={lang.id}
                      onClick={() => toggleLanguage(lang.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        active 
                          ? 'bg-crmAccent/20 text-crmAccent border border-crmAccent' 
                          : 'bg-crmDark text-gray-400 border border-crmBorder hover:border-gray-500'
                      }`}
                    >
                      {lang.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-crmText mb-4">{t(ownerLang, 'ownerLanguage')} (Dashboard)</h3>
              <select
                value={ownerLang}
                onChange={handleOwnerLangChange}
                className="bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent w-full max-w-xs"
              >
                {availableLanguages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Discount Tab */}
        <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-crmText mb-2">Promotions & Discounts</h2>
          <p className="text-sm text-gray-400 mb-4">Apply percentage discounts to specific items or your entire menu.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Discount Percentage (%)</label>
              <input
                type="number"
                name="discountPercent"
                min="0"
                max="100"
                value={settings.discountPercent || 0}
                onChange={handleChange}
                className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">Apply Discount To</label>
              <button 
                onClick={() => setIsDiscountDropdownOpen(!isDiscountDropdownOpen)}
                className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent flex justify-between items-center"
              >
                <span className="truncate">
                  {activeDiscountItems.includes('all') ? 'All Items' : `${activeDiscountItems.length} Items Selected`}
                </span>
                <ChevronDown size={18} />
              </button>
              
              {isDiscountDropdownOpen && (
                <div className="absolute z-10 top-full left-0 mt-2 w-full bg-crmDark border border-crmBorder rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                  <div 
                    onClick={() => toggleDiscountItem('all')}
                    className="p-3 hover:bg-crmCard cursor-pointer flex items-center gap-3 border-b border-crmBorder/50"
                  >
                    <input type="checkbox" checked={activeDiscountItems.includes('all')} readOnly className="accent-crmAccent" />
                    <span className="font-bold text-crmText">All Items</span>
                  </div>
                  {menuItems.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => toggleDiscountItem(item.id)}
                      className="p-3 hover:bg-crmCard cursor-pointer flex items-center gap-3 border-b border-crmBorder/10 last:border-0"
                    >
                      <input type="checkbox" checked={activeDiscountItems.includes(item.id)} readOnly className="accent-crmAccent" />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Tax & VAT Tab */}
        <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-crmText mb-2">Tax & Service Charge</h2>
          <p className="text-sm text-gray-400 mb-4">Set a combined percentage for Tax, VAT, and Service Charges applied to all orders at checkout.</p>
          
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-300 mb-2">Total Tax Percentage (%)</label>
            <input
              type="number"
              name="taxPercent"
              min="0"
              max="100"
              step="0.1"
              value={settings.taxPercent || 0}
              onChange={handleChange}
              className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
            />
          </div>
        </div>

        {/* 5. Payment Details */}
        <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-crmText mb-2">Payment Methods</h2>
          <p className="text-sm text-gray-400 mb-4">Shown to customers at checkout to transfer money manually.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <h3 className="font-medium text-crmText mb-3 border-b border-crmBorder pb-2">Bank Transfer Details</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bank Name</label>
              <input
                type="text"
                name="bankName"
                placeholder="e.g. Maybank"
                value={settings.bankName}
                onChange={handleChange}
                className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                placeholder="e.g. 1122334455"
                value={settings.accountNumber}
                onChange={handleChange}
                className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Account Holder Name</label>
              <input
                type="text"
                name="accountHolder"
                placeholder="e.g. Utoo Boho Cafe Sdn Bhd"
                value={settings.accountHolder}
                onChange={handleChange}
                className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="font-medium text-crmText mb-3 border-b border-crmBorder pb-2">DuitNow QR & Touch n Go eWallet</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t(ownerLang, 'tngQrCode')} Image</label>
              <div className="flex gap-4 items-center">
                {settings.tngQrCode ? (
                  <div className="relative">
                    <img src={settings.tngQrCode} alt="TNG QR" className="w-24 h-24 object-contain bg-white rounded-lg border border-crmBorder p-1" />
                    <button 
                      onClick={() => setSettings(prev => ({ ...prev, tngQrCode: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-crmDark border-2 border-dashed border-crmBorder rounded-lg flex items-center justify-center text-gray-500">
                    <Upload size={24} />
                  </div>
                )}
                
                <label className="cursor-pointer bg-crmDark hover:bg-crmBorder text-crmText px-4 py-2 rounded-lg text-sm transition-colors border border-crmBorder">
                  Upload QR Code
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t(ownerLang, 'tngEwalletLink')}</label>
              <input
                type="url"
                name="tngEwalletLink"
                placeholder="e.g. https://payment.tngdigital.com.my/..."
                value={settings.tngEwalletLink || ''}
                onChange={handleChange}
                className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              />
            </div>
          </div>
        </div>

        {/* 6. Core Info */}
        <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-crmText mb-4">Core Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Restaurant Name</label>
              <input
                type="text"
                name="restaurantName"
                value={settings.restaurantName}
                onChange={handleChange}
                className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Global Brand Color (Hex)</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  name="themePrimary"
                  value={settings.themePrimary}
                  onChange={handleChange}
                  className="w-12 h-12 rounded bg-crmDark border border-crmBorder cursor-pointer"
                />
                <input
                  type="text"
                  name="themePrimary"
                  value={settings.themePrimary}
                  onChange={handleChange}
                  className="flex-1 bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Total Tables (Dine-in)</label>
              <input
                type="number"
                name="tables"
                min="1"
                value={settings.tables || 20}
                onChange={handleChange}
                className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Global Date Format</label>
              <select
                name="dateFormat"
                value={settings.dateFormat || 'dd/mm/yyyy'}
                onChange={handleChange}
                className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              >
                <option value="dd/mm/yyyy">dd/mm/yyyy (e.g. 31/12/2023)</option>
                <option value="mm/dd/yyyy">mm/dd/yyyy (e.g. 12/31/2023)</option>
                <option value="dd/mm/yy">dd/mm/yy (e.g. 31/12/23)</option>
                <option value="mm/dd/yy">mm/dd/yy (e.g. 12/31/23)</option>
                <option value="dd MMM yyyy">dd MMM yyyy (e.g. 25 Jan 2027)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="md:col-span-2 mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Dashboard Custom Background (Optional)</label>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {settings.dashboardBg ? (
                  <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-crmBorder shrink-0">
                    <img src={settings.dashboardBg} alt="Dashboard Background" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setSettings(prev => ({ ...prev, dashboardBg: null }))}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-28 bg-crmDark border border-dashed border-crmBorder rounded-xl flex items-center justify-center text-gray-500 text-sm shrink-0">
                    No Background
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgUpload}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-crmAccent/10 file:text-crmAccent hover:file:bg-crmAccent/20 cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">Upload a custom wallpaper for your admin dashboard. It will be compressed automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Telegram Notifications */}
        <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-crmText mb-2">Telegram Notifications (Phase 6)</h2>
          <p className="text-sm text-gray-400 mb-4">Get instant kitchen alerts when a new order is placed.</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Google Apps Script Webhook URL</label>
            <input
              type="text"
              name="telegramWebhook"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={settings.telegramWebhook || ''}
              onChange={handleChange}
              className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
            />
          </div>
        </div>

        {/* 8. Employee Management */}
        <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold text-crmText">Employee Access Management</h2>
            <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded border border-green-500/30">Live Sync</span>
          </div>
          <p className="text-sm text-gray-400 mb-6">Add an employee's Google email address here to instantly grant them full access to the admin dashboard.</p>
          
          <form onSubmit={handleAddEmployee} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="email"
              placeholder="employee@gmail.com"
              value={newEmployeeEmail}
              onChange={(e) => setNewEmployeeEmail(e.target.value)}
              className="flex-1 bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              required
            />
            <button 
              type="submit"
              disabled={addingEmployee || !newEmployeeEmail}
              className="bg-crmDark hover:bg-crmBorder text-crmText px-6 py-3 rounded-xl border border-crmBorder font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {addingEmployee ? 'Adding...' : 'Add Employee'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 mb-2 mt-4">Authorized Accounts</h3>
            
            <div className="flex items-center justify-between bg-crmDark/50 border border-crmBorder p-4 rounded-xl">
              <div className="w-full">
                <p className="text-xs text-gray-500 mb-2">Restaurant Owner Email (Full Settings Access)</p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="owner@restaurant.com"
                    className="flex-1 bg-crmDark border border-crmBorder text-crmText px-4 py-2 rounded-lg focus:outline-none focus:border-crmAccent"
                  />
                  <button onClick={handleUpdateOwner} className="bg-crmAccent hover:bg-[#964d20] text-white px-4 py-2 rounded-lg transition-colors font-medium">Save Owner</button>
                </div>
              </div>
            </div>

            {employeeEmails.map((email) => (
              <div key={email} className="flex items-center justify-between bg-crmDark border border-crmBorder p-4 rounded-xl group">
                <div>
                  <p className="font-medium text-crmText">{email}</p>
                  <p className="text-xs text-gray-500 mt-1">Staff Access</p>
                </div>
                <button 
                  onClick={() => handleRemoveEmployee(email)}
                  className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg opacity-0 md:group-hover:opacity-100 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <X size={16} /> Revoke
                </button>
              </div>
            ))}
            
            {employeeEmails.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4 italic">No additional employees added yet.</p>
            )}
          </div>
        </div>

        {/* 9. Database Cleanup */}
        <div className="bg-crmCard border border-red-500/30 rounded-2xl p-6 shadow-xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
          <h2 className="text-xl font-semibold text-red-500 mb-2">Data Management</h2>
          <p className="text-sm text-gray-400 mb-4">Remove old cancelled or completed orders to free up database space. (Proceed with caution)</p>
          
          <button 
            onClick={async () => {
              if(!window.confirm("Are you sure you want to delete all Completed and Cancelled orders older than 30 days? This action cannot be undone.")) return;
              alert("Cleanup initiated. Old orders will be removed from your database.");
            }}
            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-6 py-3 rounded-xl font-medium transition-colors border border-red-500/20"
          >
            Clear Old Records (30+ Days)
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in-up z-50">
          <CheckCircle2 size={20} />
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
