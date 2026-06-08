import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Plus, Minus, Trash2, Send, CheckCircle2 } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const CashierPOS = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [orderMode, setOrderMode] = useState('takeaway');
  const [tableNum, setTableNum] = useState('');
  const [posCategory, setPosCategory] = useState('all');

  useEffect(() => {
    const fetchPOSData = async () => {
      try {
        const setSnap = await getDoc(doc(db, 'settings', 'master'));
        if (setSnap.exists()) setSettings(setSnap.data());

        const querySnapshot = await getDocs(collection(db, 'menu'));
        const menuList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(menuList.filter(i => i.available));
      } catch (error) {
        console.error("Error fetching POS data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPOSData();
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

  const deleteFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setProcessing(true);

    try {
      // Generate Order Number
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const qDaily = query(collection(db, 'orders'));
      const qsDaily = await getDocs(qDaily);
      let todaysCount = 0;
      qsDaily.forEach(docSnap => {
        const d = docSnap.data().timestamp?.toDate() || new Date();
        if (d >= startOfToday) todaysCount++;
      });
      const orderNumber = String(todaysCount + 1).padStart(3, '0');
      
      const orderData = {
        orderNumber,
        customerName: customerName || 'Walk-in Customer',
        phone: 'N/A (POS)',
        paymentRef: 'Cash/Card (POS)',
        table: orderMode === 'dine-in' ? tableNum : 'Takeaway',
        orderMode: orderMode,
        total: cartTotal,
        items: cart,
        status: 'processing',
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Phase 6 & 7: Immediately trigger webhook for Kitchen
      if (settings?.telegramWebhook) {
        try {
          const itemList = cart.map(i => `${i.qty}x ${i.names['en']}`).join('\n');
          const typeString = orderMode === 'takeaway' ? 'TAKEAWAY' : `DINE-IN (Table: ${tableNum})`;
          const payload = {
            message: `🔔 New Order (#${orderNumber})!\n\nType: ${typeString}\nCustomer: ${orderData.customerName}\n\nItems:\n${itemList}\n\nTotal: RM ${orderData.total.toFixed(2)}`
          };
          
          await fetch(settings.telegramWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (e) { console.error("Webhook failed quietly"); }
      }

      // Reset POS
      setCart([]);
      setCustomerName('');
      setTableNum('');
      alert("Order Sent to Kitchen!");

    } catch (error) {
      console.error("Failed to place POS order", error);
      alert("Failed to submit order.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading POS System..." />;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row bg-transparent">
      
      {/* Left Side: Menu Grid */}
      <div className="flex-1 p-6 overflow-y-auto no-scrollbar border-r border-crmBorder">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-crmText">Cashier Point of Sale</h1>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {['all', 'mains', 'drinks', 'desserts', 'addons'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setPosCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${posCategory === cat ? 'bg-crmAccent text-white' : 'bg-crmDark text-gray-400 border border-crmBorder hover:text-crmText'}`}
            >
              {cat === 'all' ? 'All' : cat === 'addons' ? 'Add-ons' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.filter(item => {
            if (posCategory === 'all') return true;
            const mappedCat = posCategory === 'addons' ? 'Add-ons' : posCategory.charAt(0).toUpperCase() + posCategory.slice(1);
            return item.category === mappedCat;
          }).map(item => (
            <button 
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-crmCard border border-crmBorder rounded-2xl overflow-hidden shadow-md hover:border-crmAccent transition-all text-left group flex flex-col active:scale-95"
            >
              <div className="h-24 w-full bg-crmDark overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="Food" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Image</div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <p className="font-bold text-crmText text-sm mb-1 line-clamp-2">{item.names['en'] || 'Item'}</p>
                <p className="font-bold text-crmAccent text-sm">RM {item.price.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: Cart Summary */}
      <div className="w-full md:w-96 bg-crmCard flex flex-col h-full shadow-2xl z-10 shrink-0">
        <div className="p-5 border-b border-crmBorder bg-crmDark">
          <h2 className="text-lg font-bold text-crmText mb-4">Current Order</h2>
          
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Customer Name (Optional)" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-crmCard border border-crmBorder text-crmText px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-crmAccent"
            />
            <div className="flex gap-2">
              <select 
                value={orderMode} 
                onChange={(e) => setOrderMode(e.target.value)}
                className="flex-1 bg-crmCard border border-crmBorder text-crmText px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-crmAccent"
              >
                <option value="takeaway">Takeaway</option>
                <option value="dine-in">Dine-In</option>
              </select>
              {orderMode === 'dine-in' && (
                <input 
                  type="text" 
                  placeholder="Table No." 
                  value={tableNum}
                  onChange={(e) => setTableNum(e.target.value)}
                  className="w-24 bg-crmCard border border-crmBorder text-crmText px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-crmAccent"
                />
              )}
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
              <CheckCircle2 size={48} className="opacity-20" />
              <p>No items added yet.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-3 bg-crmDark p-3 rounded-xl border border-crmBorder">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-crmText text-sm truncate">{item.names['en']}</p>
                  <p className="text-crmAccent text-xs font-bold mt-1">RM {(item.price * item.qty).toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-2 bg-crmCard rounded-lg border border-crmBorder p-1">
                  <button onClick={() => removeFromCart(item.id)} className="p-1.5 hover:bg-crmBorder rounded text-crmText"><Minus size={14}/></button>
                  <span className="text-sm font-bold w-4 text-center text-crmText">{item.qty}</span>
                  <button onClick={() => addToCart(item)} className="p-1.5 hover:bg-crmBorder rounded text-crmText"><Plus size={14}/></button>
                </div>
                
                <button onClick={() => deleteFromCart(item.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors ml-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Button */}
        <div className="p-5 border-t border-crmBorder bg-crmDark">
          <div className="flex justify-between items-center mb-4 text-lg">
            <span className="text-gray-400 font-medium">Total</span>
            <span className="text-2xl font-bold text-crmText">RM {cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleConfirmOrder}
            disabled={cart.length === 0 || processing}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex justify-center items-center gap-2 transition-all ${
              cart.length === 0 || processing ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-crmAccent hover:brightness-110 active:scale-95'
            }`}
          >
            {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={20} />}
            Confirm & Send to Kitchen
          </button>
        </div>
      </div>

    </div>
  );
};

export default CashierPOS;
