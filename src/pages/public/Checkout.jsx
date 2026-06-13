import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, query, getDocs, where, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ArrowLeft, CheckCircle2, Moon, Sun, Download } from 'lucide-react';
import LanguageDropdown from '../../components/LanguageDropdown';
import { useLocation, useNavigate } from 'react-router-dom';
import { t } from '../../utils/translations';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartTotal } = location.state || { cart: [], cartTotal: 0 };
  
  const [settings, setSettings] = useState(null);
  const [customerName, setCustomerName] = useState(() => {
    const p = localStorage.getItem('pendingReservation');
    return p ? JSON.parse(p).name : '';
  });
  const [phone, setPhone] = useState(() => {
    const p = localStorage.getItem('pendingReservation');
    return p ? JSON.parse(p).phone : '';
  });
  const [notes, setNotes] = useState('');
  const isPreOrder = !!localStorage.getItem('pendingReservation');
  const [paymentMethod, setPaymentMethod] = useState(isPreOrder ? 'online' : 'counter');
  const [paymentRef, setPaymentRef] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');
  const userLang = localStorage.getItem('userLang') || 'en';
  const orderMode = localStorage.getItem('orderMode') || 'takeaway';
  const tableNum = localStorage.getItem('tableNum');

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
    if (cart.length === 0) navigate('/order');
    
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'master'));
      if (snap.exists()) setSettings(snap.data());
    };
    fetchSettings();
  }, [cart, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const pendingResStr = localStorage.getItem('pendingReservation');
      const isPreOrder = !!pendingResStr;
      let pendingRes = null;
      if (isPreOrder) {
        try { pendingRes = JSON.parse(pendingResStr); } catch(e){}
      }

      // 1. Generate Order Number
      let orderNumber = "001";
      if (isPreOrder && pendingRes && pendingRes.id) {
        orderNumber = pendingRes.id;
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        const counterRef = doc(db, 'counters', todayStr);
        try {
          await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            if (!counterDoc.exists()) {
              transaction.set(counterRef, { count: 1 });
              orderNumber = "001";
            } else {
              const newCount = (counterDoc.data().count || 0) + 1;
              transaction.update(counterRef, { count: newCount });
              orderNumber = String(newCount).padStart(3, '0');
            }
          });
        } catch (e) {
          console.error("Transaction failed, falling back to random", e);
          orderNumber = String(Math.floor(1000 + Math.random() * 9000));
        }
      }

      const taxPercent = settings?.taxPercent ? parseFloat(settings.taxPercent) : 0;
      const taxAmount = (cartTotal * taxPercent) / 100;
      const grandTotal = cartTotal + taxAmount;

      // 2. Save Order
      
      const finalOrderMode = isPreOrder ? 'dineIn' : (tableNum ? 'dineIn' : orderMode);
      const finalTable = isPreOrder ? 'Pending Table' : (tableNum ? tableNum : 'Takeaway');
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB');
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const orderData = {
        orderNumber,
        customerName,
        phone,
        notes,
        paymentMethod,
        paymentRef: paymentMethod !== 'counter' ? paymentRef : 'Cash/Counter',
        table: finalTable,
        orderMode: finalOrderMode,
        subTotal: cartTotal,
        taxPercent: taxPercent,
        taxAmount: taxAmount,
        total: grandTotal,
        items: cart,
        status: isPreOrder ? 'scheduled' : 'pending',
        dateStr,
        timeStr,
        timestamp: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', orderNumber), { ...orderData, id: orderNumber });
      
      // 3. Create Reservation if pending
      let reservationDetails = null;
      if (isPreOrder && pendingRes) {
        try {
          reservationDetails = pendingRes;
          
          await setDoc(doc(db, 'reservations', pendingRes.id), {
            ...pendingRes,
            linkedOrderId: orderNumber,
            status: 'pending',
            timestamp: serverTimestamp()
          });

          localStorage.removeItem('pendingReservation');
        } catch (e) { 
          console.error("Error processing reservation", e); 
          localStorage.removeItem('pendingReservation'); // clear it so we don't ruin future orders
        }
      }

      setSuccessData({ ...orderData, reservation: reservationDetails });
    } catch (error) {
      console.error(error);
      alert("Failed to place order. Please try again.");
      setProcessing(false);
    }
  };

  if (!settings) return null;

  if (successData) {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500">
        <CheckCircle2 size={64} className="text-green-500 mb-6 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{successData.reservation ? 'Reservation Requested!' : t(userLang, 'orderSuccess')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{successData.reservation ? 'Your reservation and pre-order are pending, please check back later for the owner confirmation.' : t(userLang, 'orderSuccessSub')}</p>

        {/* Beautiful Receipt */}
        <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden text-left border border-gray-100 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-[#222] p-6 border-b border-gray-100 dark:border-gray-800 text-center">
            <h2 className="font-bold text-xl text-gray-900 dark:text-white">{settings.restaurantName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date().toLocaleString()}</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-4">
              <span className="text-gray-500 dark:text-gray-400">{t(userLang, 'orderNumber')}</span>
              <span className="text-2xl font-bold" style={{ color: settings.themePrimary }}>#{successData.orderNumber}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t(userLang, 'name')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{successData.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{successData.orderMode} {successData.table !== 'Takeaway' ? `(${successData.table})` : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium text-gray-900 dark:text-white uppercase">{successData.paymentMethod}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
              {successData.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-200">{item.qty}x {(item.names && item.names[userLang]) || item.name}</span>
                  <span className="font-medium text-gray-900 dark:text-white">RM {((item.activePrice || item.price) * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Subtotal</span>
                <span>RM {successData.subTotal?.toFixed(2) || successData.total.toFixed(2)}</span>
              </div>
              {successData.taxPercent > 0 && (
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Tax ({successData.taxPercent}%)</span>
                  <span>RM {successData.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-lg pt-2">
                <span className="text-gray-900 dark:text-white">{t(userLang, 'total')}</span>
                <span style={{ color: settings.themePrimary }}>RM {successData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
          <button 
            onClick={() => window.print()}
            className="w-full py-3 px-8 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2 no-print text-white"
            style={{ backgroundColor: settings.themePrimary }}
          >
            <Download size={20} />
            Download Receipt
          </button>
          
          <button 
            onClick={() => {
              navigate('/');
              window.location.reload();
            }}
            className="w-full py-3 px-8 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors no-print"
          >
            Return to Home
          </button>
        </div>

        {/* Printable Receipt Hidden by Default, Shown on Print */}
        <div className="hidden print:block absolute top-0 left-0 w-full bg-white text-black p-8 text-left font-sans">
          <div className="text-center mb-8 border-b border-dashed border-gray-400 pb-4">
            <h1 className="text-3xl font-bold mb-2 uppercase tracking-widest">{settings.restaurantName || 'Restaurant'}</h1>
            <p className="text-sm text-gray-600">Official Receipt</p>
          </div>
          
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Order No.</p>
              <p className="font-bold text-lg">#{successData.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Date & Time</p>
              <p>{new Date().toLocaleString()}</p>
            </div>
            <div>
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Customer</p>
              <p className="font-medium">{successData.customerName}</p>
              {successData.phone && <p>{successData.phone}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Type</p>
              <p className="font-medium uppercase">{successData.orderMode === 'takeaway' ? 'Takeaway' : `Dine-In (Table ${successData.table})`}</p>
            </div>
            <div>
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Payment Method</p>
              <p className="font-medium uppercase">{successData.paymentMethod}</p>
            </div>
            <div className="text-right">
              {successData.reservation && (
                <>
                  <p className="font-bold text-gray-500 uppercase text-xs mb-1">Reservation For</p>
                  <p className="font-medium">{successData.reservation.date} at {successData.reservation.time}</p>
                  <p className="text-xs">{successData.reservation.guests} Guests</p>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-b border-black py-4 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left pb-2 font-bold uppercase">Item</th>
                  <th className="text-center pb-2 font-bold uppercase w-16">Qty</th>
                  <th className="text-right pb-2 font-bold uppercase w-24">Price</th>
                </tr>
              </thead>
              <tbody>
                {successData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2">{(item.names && item.names['en']) || item.name || 'Item'}</td>
                    <td className="py-2 text-center">{item.qty}</td>
                    <td className="py-2 text-right">RM {((item.activePrice || item.price) * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-1 mb-8 text-sm">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span>RM {successData.subTotal?.toFixed(2) || successData.total.toFixed(2)}</span>
            </div>
            {successData.taxPercent > 0 && (
              <div className="flex justify-between items-center">
                <span>Tax & Service ({successData.taxPercent}%)</span>
                <span>RM {successData.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t border-black">
              <span>TOTAL</span>
              <span>RM {successData.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center border-t border-dashed border-gray-400 pt-8 mt-12 text-sm text-gray-500">
            <p className="mb-4">Thank you for your order!</p>
            <p className="text-gray-300 text-xs">© whoisMinhaz</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] pb-32 transition-colors duration-500">
      <header className="bg-white dark:bg-[#121212] sticky top-0 z-40 shadow-sm px-4 py-4 flex items-center justify-between transition-colors duration-500">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{t(userLang, 'checkout')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{orderMode === 'takeaway' ? t(userLang, 'takeaway') : t(userLang, 'dineIn')} {tableNum ? `- ${t(userLang, 'tableNumber')} ${tableNum}` : ''}</p>
        </div>
        <div className="flex items-center gap-1">
          <LanguageDropdown />
          <button onClick={() => setIsDark(!isDark)} className="p-2 -mr-2 text-gray-600 dark:text-gray-300">
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-6">
        
        {/* Order Summary */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-500">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t(userLang, 'orderSummary')}</h2>
          <div className="space-y-3 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{item.qty}x {(item.names && item.names[userLang]) || item.names?.['en'] || item.name || 'Item'}</span>
                <span className="font-medium text-gray-900 dark:text-white">RM {((item.activePrice || item.price) * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Subtotal</span>
              <span>RM {cartTotal.toFixed(2)}</span>
            </div>
            {settings.taxPercent > 0 && (
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Tax & Service ({settings.taxPercent}%)</span>
                <span>RM {((cartTotal * parseFloat(settings.taxPercent)) / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
              <span className="text-gray-900 dark:text-white">{t(userLang, 'total')}</span>
              <span style={{ color: settings.themePrimary }}>RM {(cartTotal + (cartTotal * (parseFloat(settings.taxPercent) || 0)) / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-500">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t(userLang, 'customerDetails')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'name')}</label>
              <input 
                type="text" 
                required 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                style={{ focusRingColor: settings.themePrimary }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'phone')} (Optional)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                style={{ focusRingColor: settings.themePrimary }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'specialInstructions')} (Optional)</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t(userLang, 'notesPlaceholder')}
                rows="2"
                className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors resize-none"
                style={{ focusRingColor: settings.themePrimary }}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-500">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t(userLang, 'paymentMethod')}</h2>
          <div className="space-y-3">
            {!isPreOrder && (
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'counter' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" value="counter" checked={paymentMethod === 'counter'} onChange={() => setPaymentMethod('counter')} className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{t(userLang, 'payAtCounter')}</span>
                </div>
              </label>
            )}
            
            <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'online' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-900 dark:text-white">{t(userLang, 'onlineTransfer')}</span>
              </div>
            </label>

            <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'tng' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="payment" value="tng" checked={paymentMethod === 'tng'} onChange={() => setPaymentMethod('tng')} className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-900 dark:text-white">{t(userLang, 'tngPayment')}</span>
              </div>
            </label>

            <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'ewallet' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="payment" value="ewallet" checked={paymentMethod === 'ewallet'} onChange={() => setPaymentMethod('ewallet')} className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-900 dark:text-white">{t(userLang, 'tngEwallet')}</span>
              </div>
            </label>
          </div>

          {paymentMethod === 'online' && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-[#222] rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 transition-colors">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bank Name</p>
                <p className="font-bold text-gray-900 dark:text-white">{settings.bankName || 'Not Set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg tracking-wider">{settings.accountNumber || 'Not Set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Name</p>
                <p className="font-bold text-gray-900 dark:text-white uppercase">{settings.accountHolder || 'Not Set'}</p>
              </div>
              <div className="pt-2">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'paymentRef')}</label>
                <input 
                  type="text" 
                  minLength={4}
                  required={paymentMethod === 'online'}
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2"
                  style={{ focusRingColor: settings.themePrimary }}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'tng' && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-[#222] rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 transition-colors flex flex-col items-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Scan to Pay with DuitNow QR</p>
              {settings.tngQrCode ? (
                <img src={settings.tngQrCode} alt="DuitNow QR Code" className="w-48 h-48 object-contain bg-white p-2 rounded-xl border shadow-sm" />
              ) : (
                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 text-sm text-center px-4">
                  QR Code not set by restaurant
                </div>
              )}
              <div className="pt-4 w-full">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'paymentRef')}</label>
                <input 
                  type="text" 
                  minLength={4}
                  required={paymentMethod === 'tng'}
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2"
                  style={{ focusRingColor: settings.themePrimary }}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'ewallet' && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-[#222] rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 transition-colors flex flex-col items-center text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Pay with Touch n Go eWallet</p>
              {settings.tngEwalletLink ? (
                <a 
                  href={settings.tngEwalletLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-xl text-white font-bold transition-all shadow-md bg-[#00529C] hover:bg-[#004180] mb-2 text-sm"
                >
                  Click Here to Open Merchant Link
                </a>
              ) : (
                <div className="w-full py-3 bg-gray-200 dark:bg-gray-800 rounded-xl text-gray-500 text-sm mb-2">
                  Merchant Link not set by restaurant
                </div>
              )}
              <div className="pt-2 w-full text-left">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t(userLang, 'paymentRef')}</label>
                <input 
                  type="text" 
                  minLength={4}
                  required={paymentMethod === 'ewallet'}
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2"
                  style={{ focusRingColor: settings.themePrimary }}
                />
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={processing}
          className="w-full py-4 rounded-2xl text-white text-lg font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8"
          style={{ backgroundColor: processing ? '#9ca3af' : settings.themePrimary }}
        >
          {processing ? 'Processing...' : t(userLang, 'placeOrder')}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
