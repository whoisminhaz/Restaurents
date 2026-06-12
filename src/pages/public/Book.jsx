import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ArrowLeft, CheckCircle2, Moon, Sun, CalendarDays, Search, XCircle, Clock, Download } from 'lucide-react';
import LanguageDropdown from '../../components/LanguageDropdown';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { t } from '../../utils/translations';

const Book = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  
  const [tab, setTab] = useState(searchParams.get('tab') === 'manage' ? 'manage' : 'book'); // 'book' | 'manage'
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    notes: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [manageDate, setManageDate] = useState('');
  const [foundRes, setFoundRes] = useState(null);
  const [manageLoading, setManageLoading] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdResId, setCreatedResId] = useState(null);

  const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');
  const userLang = localStorage.getItem('userLang') || 'en';

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
          setSettings(snap.data());
        } else {
          setError("Settings document not found. Please create 'settings/master' in Firestore.");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading settings: " + (err.message || "Unknown error"));
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'date' && settings) {
      const selectedDateStr = e.target.value;
      const dateObj = new Date(selectedDateStr);
      const dayIndex = dateObj.getDay();
      
      // Block past dates
      const today = new Date();
      today.setHours(0,0,0,0);
      if (dateObj < today) {
        alert("You cannot select a past date.");
        return;
      }
      
      if (settings.closedDates && settings.closedDates.includes(selectedDateStr)) {
        alert("Sorry, we are closed on this specific date.");
        return;
      }
      
      const operatingDays = settings.operatingDays || [0,1,2,3,4,5,6];
      if (!operatingDays.includes(dayIndex)) {
        alert("Sorry, we are closed on this day of the week.");
        return;
      }
      
      // Reset time when date changes so stale time isn't kept
      setFormData({ ...formData, date: selectedDateStr, time: '' });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateTimeSlots = (openTime, closeTime) => {
    if (!openTime || !closeTime) return [];
    const slots = [];
    let current = new Date(`1970-01-01T${openTime}`);
    const end = new Date(`1970-01-01T${closeTime}`);
    
    // We want the last booking to be 1 hour before close if each booking is 1 hr.
    end.setHours(end.getHours() - 1);

    while (current <= end) {
      const timeString = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  const allTimeSlots = settings ? generateTimeSlots(settings.operatingHoursOpen || '10:00', settings.operatingHoursClose || '22:00') : [];
  
  // Filter out past times if the selected date is today
  const timeSlots = allTimeSlots.filter(slot => {
    if (!formData.date) return true;
    const today = new Date();
    const selectedDate = new Date(formData.date);
    
    // If the selected date is today, filter out past times
    if (selectedDate.toDateString() === today.toDateString()) {
      // Parse the time slot string back to a comparable time
      const slotDate = new Date();
      const parts = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (parts) {
        let hours = parseInt(parts[1]);
        const minutes = parseInt(parts[2]);
        const ampm = parts[3].toUpperCase();
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        slotDate.setHours(hours, minutes, 0, 0);
        
        // Add 1 hour buffer (customers must book at least 1 hour in advance)
        const minAllowedTime = new Date(today.getTime() + 60 * 60 * 1000);
        return slotDate > minAllowedTime;
      }
    }
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.time) return alert("Please select a valid time.");

    setProcessing(true);
    try {
      // M2: Capacity Check
      const maxCap = settings.maxCapacityPerHour !== undefined ? settings.maxCapacityPerHour : 30;
      const qCap = query(
        collection(db, 'reservations'),
        where('date', '==', formData.date),
        where('time', '==', formData.time)
      );
      const snapCap = await getDocs(qCap);
      let confirmedGuests = 0;
      snapCap.forEach(doc => {
        if (doc.data().status === 'confirmed') {
          confirmedGuests += Number(doc.data().guests || 0);
        }
      });
      if (confirmedGuests + Number(formData.guests) > maxCap) {
        alert("Sorry, we are fully booked for this slot.");
        setProcessing(false);
        return;
      }

      // M2: Generate alphanumeric ID
      const generateId = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        let id = '';
        for(let i=0; i<2; i++) id += letters.charAt(Math.floor(Math.random() * letters.length));
        for(let i=0; i<3; i++) id += numbers.charAt(Math.floor(Math.random() * numbers.length));
        return id;
      };
      const resId = generateId();

      if (settings.bookingMode === 'preorder' || settings.requirePreOrderForBooking) {
        localStorage.setItem('pendingReservation', JSON.stringify({ ...formData, id: resId }));
        navigate('/order');
        return;
      }

      await setDoc(doc(db, 'reservations', resId), {
        ...formData,
        id: resId,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      setCreatedResId(resId);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit reservation.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSearchReservation = async (e) => {
    e.preventDefault();
    if (!manageDate) return alert("Please select the date of your reservation.");
    setManageLoading(true);
    setFoundRes(null);
    const searchVal = searchQuery.trim();
    try {
      let found = null;
      // 1. Try by ID first
      const resDoc = await getDoc(doc(db, 'reservations', searchVal));
      if (resDoc.exists() && resDoc.data().date === manageDate) {
        found = { id: resDoc.id, ...resDoc.data() };
      }
      
      // 2. Try by Phone
      if (!found) {
        const q = query(collection(db, 'reservations'), where('phone', '==', searchVal), where('date', '==', manageDate));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          found = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
      }

      if (found) {
        setFoundRes(found);
      } else {
        alert("No reservations found matching this Date and ID/Phone.");
      }
    } catch (err) {
      console.error(err);
      alert("Error finding reservation.");
    } finally {
      setManageLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if(!window.confirm("Are you sure you want to cancel your reservation?")) return;
    
    // Check if > 1 hour away
    const today = new Date();
    const timeParts = foundRes.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let hours = 0, mins = 0;
    if (timeParts) {
      hours = parseInt(timeParts[1], 10);
      mins = parseInt(timeParts[2], 10);
      if (timeParts[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (timeParts[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    const resDate = new Date(foundRes.date);
    resDate.setHours(hours, mins, 0, 0);
    
    const diffHours = (resDate - today) / (1000 * 60 * 60);
    if (diffHours <= 1) {
      alert("You cannot cancel a reservation less than 1 hour before the booked time.");
      return;
    }

    setManageLoading(true);
    try {
      await updateDoc(doc(db, 'reservations', foundRes.id), {
        status: 'cancelled'
      });
      setFoundRes(prev => ({ ...prev, status: 'cancelled' }));
      
      // Create cancellation ticket
      await addDoc(collection(db, 'orders'), {
        orderNumber: `CANC-${foundRes.id}`,
        status: 'pending',
        timestamp: serverTimestamp(),
        type: 'cancellation',
        customerName: foundRes.name,
        phone: foundRes.phone,
        date: foundRes.date,
        time: foundRes.time,
        reservationId: foundRes.id,
        notes: `Cancellation for reservation ${foundRes.id}`,
        total: 0,
        items: foundRes.preOrderItems || []
      });

      alert("Reservation cancelled successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel.");
    } finally {
      setManageLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-2">System Error</h1>
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-gray-800 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (settings.bookingEnabled === false || settings.bookingMode === 'disabled') {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reservations Closed</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Sorry, We are not taking Reservations Now!! Thanks for your Understandig.</p>
        <button 
          onClick={() => navigate('/')}
          className="py-3 px-8 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500">
        <CheckCircle2 size={64} className="text-green-500 mb-6 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reservation Requested!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">Your reservation is pending, please check back later for the owner confirmation.</p>
        <p className="text-2xl font-bold text-crmAccent mb-8">Booking ID: {createdResId}</p>

        <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden text-left border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 p-3 rounded-lg text-sm mb-4 font-medium flex items-start gap-2">
            <Clock size={18} className="shrink-0 mt-0.5" />
            Note: Your reservation gives you exactly 1 hour of booking time. Please arrive promptly.
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t(userLang, 'name')}</span>
            <span className="font-medium text-gray-900 dark:text-white">{formData.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t(userLang, 'date')}</span>
            <span className="font-medium text-gray-900 dark:text-white">{formData.date} at {formData.time}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Guests</span>
            <span className="font-medium text-gray-900 dark:text-white">{formData.guests} pax</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
          {(!settings.requirePreOrderForBooking && settings.bookingMode !== 'preorder') && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-2xl text-white shadow-xl shadow-orange-500/30 mb-4 animate-fade-in-up">
              <h3 className="font-bold text-xl mb-2 leading-tight">Want the food on your table when you arrive?</h3>
              <p className="text-orange-50 mb-5 text-sm">Don't wait for the food anymore. Pre-order now and it will be ready exactly when you sit down!</p>
              <button 
                onClick={() => {
                  localStorage.setItem('pendingReservation', JSON.stringify({ ...formData, id: createdResId }));
                  navigate('/order');
                }}
                className="w-full bg-white text-orange-600 font-bold py-3 px-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                Yes, I want to Pre-Order!
              </button>
            </div>
          )}

          <button 
            onClick={() => window.print()}
            className="w-full py-3 px-8 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2 no-print text-white"
            style={{ backgroundColor: settings.themePrimary }}
          >
            <Download size={20} />
            Download Receipt
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 px-8 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors no-print"
          >
            Return to Home
          </button>
        </div>

        {/* Printable Receipt Hidden by Default, Shown on Print */}
        <div className="hidden print:block absolute top-0 left-0 w-full bg-white text-black p-8 text-left font-sans">
          <div className="text-center mb-8 border-b border-dashed border-gray-400 pb-4">
            <h1 className="text-3xl font-bold mb-2 uppercase tracking-widest">{settings.restaurantName || 'Restaurant'}</h1>
            <p className="text-sm text-gray-600">Reservation Requested (Pending)</p>
            <p className="font-bold text-lg mt-2">ID: {createdResId}</p>
          </div>
          
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Date Created</p>
              <p className="font-bold text-lg">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Reservation For</p>
              <p className="font-bold text-lg">{formData.date} at {formData.time}</p>
            </div>
            <div>
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Customer</p>
              <p className="font-medium">{formData.name}</p>
              {formData.phone && <p>{formData.phone}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Guests</p>
              <p className="font-medium uppercase">{formData.guests} Pax</p>
            </div>
          </div>

          <div className="text-center border-t border-dashed border-gray-400 pt-8 mt-12 text-sm text-gray-500">
            <p className="mb-4">We look forward to serving you!</p>
            <p className="text-gray-300 text-xs">© whoisMinhaz</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] pb-32 transition-colors duration-500">
      <header className="bg-white dark:bg-[#121212] sticky top-0 z-40 shadow-sm px-4 py-4 flex items-center justify-between transition-colors duration-500">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{settings.restaurantName}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Reservations</p>
        </div>
        <div className="flex items-center gap-1">
          <LanguageDropdown />
          <button onClick={() => setIsDark(!isDark)} className="p-2 -mr-2 text-gray-600 dark:text-gray-300">
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto space-y-6 mt-4">
        
        {/* Tabs */}
        <div className="flex bg-gray-200 dark:bg-[#222] p-1 rounded-xl">
          <button 
            onClick={() => setTab('book')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'book' ? 'bg-white dark:bg-[#333] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
          >
            New Booking
          </button>
          <button 
            onClick={() => setTab('manage')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'manage' ? 'bg-white dark:bg-[#333] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
          >
            Manage Booking
          </button>
        </div>

        {tab === 'book' && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-500 flex flex-col items-center">
               <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white" style={{ backgroundColor: settings.themePrimary }}>
                 <CalendarDays size={32} />
               </div>
               <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Reserve a Table</h2>
               <p className="text-sm text-gray-500 text-center mb-4">Please note: A reservation gives you exactly 1 hour of booking time.</p>
               {settings.requirePreOrderForBooking && (
                 <span className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-center">
                   Food pre-order required to confirm booking.
                 </span>
               )}
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-500 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'name')}</label>
                <input 
                  type="text" 
                  name="name"
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                  style={{ focusRingColor: settings.themePrimary }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'phone')}</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                  style={{ focusRingColor: settings.themePrimary }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'date')}</label>
                  <input 
                    type="date" 
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                    style={{ focusRingColor: settings.themePrimary }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Time</label>
                  <select 
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors appearance-none"
                    style={{ focusRingColor: settings.themePrimary }}
                  >
                    <option value="" disabled>Select</option>
                    {timeSlots.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Number of Guests</label>
                <select 
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors appearance-none"
                  style={{ focusRingColor: settings.themePrimary }}
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                    <option key={num} value={num}>{num} People</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'specialInstructions')} (Optional)</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Birthday celebration, window seat..."
                  rows="2"
                  className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors resize-none"
                  style={{ focusRingColor: settings.themePrimary }}
                ></textarea>
              </div>
            </div>

            <button 
              type="submit"
              disabled={processing}
              className="w-full py-4 rounded-2xl text-white text-lg font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8"
              style={{ backgroundColor: processing ? '#9ca3af' : settings.themePrimary }}
            >
              {processing ? 'Processing...' : ((settings.requirePreOrderForBooking || settings.bookingMode === 'preorder') ? 'Proceed to Menu' : 'Request Booking')}
            </button>
          </form>
        )}

        {tab === 'manage' && (
          <div className="space-y-6 animate-fade-in-up">
            <form onSubmit={handleSearchReservation} className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-500 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Reservation Date</label>
                <input 
                  type="date" 
                  name="manageDate"
                  required 
                  value={manageDate}
                  onChange={(e) => setManageDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors mb-4"
                  style={{ focusRingColor: settings.themePrimary }}
                />
                
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number OR Reservation ID</label>
                <input 
                  type="text" 
                  name="searchQuery"
                  required 
                  placeholder="e.g. +60123456789 or AK649..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                  style={{ focusRingColor: settings.themePrimary }}
                />
              </div>
              <button 
                type="submit"
                disabled={manageLoading}
                className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: settings.themePrimary }}
              >
                {manageLoading ? 'Searching...' : <><Search size={18} /> Find Reservation</>}
              </button>
            </form>

            {foundRes && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-500 animate-fade-in-up">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">Booking Details</h3>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${
                    foundRes.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    foundRes.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    foundRes.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {foundRes.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <p className="text-base font-bold text-gray-900 dark:text-white font-mono">Booking ID: {foundRes.id}</p>
                  <p><span className="font-medium text-gray-900 dark:text-gray-200">Name:</span> {foundRes.name}</p>
                  <p><span className="font-medium text-gray-900 dark:text-gray-200">Date:</span> {foundRes.date}</p>
                  <p><span className="font-medium text-gray-900 dark:text-gray-200">Time:</span> {foundRes.time}</p>
                  <p><span className="font-medium text-gray-900 dark:text-gray-200">Guests:</span> {foundRes.guests}</p>
                  {foundRes.status === 'confirmed' && foundRes.table && foundRes.table !== 'Assigned' && (
                    <p className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-green-600 dark:text-green-400 font-bold">
                      Assigned Table: {foundRes.table}
                    </p>
                  )}
                </div>

                {(foundRes.status === 'pending' || foundRes.status === 'confirmed') && (
                  <button 
                    onClick={handleCancelReservation}
                    disabled={manageLoading}
                    className="w-full py-3 rounded-xl text-red-500 font-bold bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> Cancel Reservation
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;
