import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Clock, CheckCircle2, XCircle, ChevronRight, FileText, BellRing, Users } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import LoadingScreen from '../../components/LoadingScreen';
import { t } from '../../utils/translations';

const LiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, processing, completed, cancelled
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ownerLang = localStorage.getItem('ownerLang') || 'en';

  const [settings, setSettings] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Check every minute for reservations
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'master'));
      if (snap.exists()) setSettings(snap.data());
    };
    fetchSettings();

    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'), limit(150));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        time: doc.data().timestamp ? new Date(doc.data().timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'
      }));
      setOrders(orderList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching live orders:", error);
      setLoading(false);
    });

    const resQ = query(collection(db, 'reservations'), limit(200));
    const unsubscribeRes = onSnapshot(resQ, (snapshot) => {
      const resList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setReservations(resList);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeRes();
    };
  }, []);

  const updateOrderStatus = async (orderId, newStatus, fullOrder = null) => {
    try {
      const orderData = fullOrder || selectedOrder;
      
      // Handle cancellation tickets — skip the normal flow, just mark everything completed
      if (orderData?.type === 'cancellation' && (newStatus === 'completed' || newStatus === 'processing')) {
        if (orderData.reservationId) {
          await updateDoc(doc(db, 'reservations', orderData.reservationId), { status: 'completed' });
        }
        await updateDoc(doc(db, 'orders', orderId), { status: 'completed' });
        setSelectedOrder(null);
        return;
      }
      
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      
      if (newStatus === 'processing' && settings?.telegramWebhook && orderData) {
        try {
          const itemList = (orderData.items || []).map(i => {
            const itemName = (i.names && i.names['en']) || i.name || 'Unknown Item';
            return `${i.qty || 1}x ${itemName}`;
          }).join('\n');
          
          let typeString = orderData.orderMode === 'takeaway' ? 'TAKEAWAY' : `DINE-IN (Table: ${orderData.table || 'N/A'})`;
          
          if (orderData.status === 'scheduled') {
            const res = reservations.find(r => r.linkedOrderId === orderData.orderNumber);
            if (res) typeString = `PRE-ORDER RESERVATION (${res.time})`;
          }
          
          const safeTotal = typeof orderData.total === 'number' ? orderData.total : 0;
          const notesStr = orderData.notes ? `\n\nNotes: ${orderData.notes}` : '';

          const message = `🔔 New Order (#${orderData.orderNumber || '000'})!\n\nType: ${typeString}\nCustomer: ${orderData.customerName || 'N/A'}${notesStr}\n\nItems:\n${itemList}\n\nTotal: RM ${safeTotal.toFixed(2)}`;
          
          fetch(settings.telegramWebhook, {
            method: 'POST',
            body: JSON.stringify({ message }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
          }).catch(e => console.error("Webhook failed quietly"));
        } catch (e) {
          console.error("Webhook prep failed:", e);
        }
      }

      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const sendReservationAlert = async (r) => {
    if (!settings?.telegramWebhook) {
      alert("Please configure Telegram Webhook in Settings first.");
      return;
    }
    
    try {
      const message = `⏰ *UPCOMING RESERVATION (1 HOUR)*\n\n` +
        `*Name:* ${r.name}\n` +
        `*Arrival:* ${r.time} (Date: ${r.date})\n` +
        `*Guests:* ${r.guests} Pax\n` +
        `*Phone:* ${r.phone}\n` +
        (r.linkedOrderId ? `*Pre-Ordered Food:* Yes (Order #${r.linkedOrderId})\n` : '') +
        (r.notes ? `*Notes:* ${r.notes}` : '');

      await fetch(settings.telegramWebhook, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      await updateDoc(doc(db, 'reservations', r.id), { alertSent: true });
      alert("Telegram alert sent successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to send alert.");
    }
  };

  const parseTime = (timeStr) => {
    const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let hours = 0, mins = 0;
    if (timeParts) {
      hours = parseInt(timeParts[1], 10);
      mins = parseInt(timeParts[2], 10);
      if (timeParts[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (timeParts[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return { hours, mins };
  };

  // Calculate upcoming reservations for the "New Orders" section
  const upcomingReservations = reservations.filter(r => {
    if (r.status !== 'confirmed' || r.alertSent || !r.date || !r.time) return false;
    if (r.linkedOrderId) return false; // Hide here, the Order card handles it!
    const { hours, mins } = parseTime(r.time);
    const arrival = new Date(r.date);
    arrival.setHours(hours, mins, 0, 0);
    const diffMinutes = (arrival - currentTime) / (1000 * 60);
    return diffMinutes > 0 && diffMinutes <= 60;
  });

  const getPendingOrders = () => {
    return orders.filter(o => {
      if (o.status === 'pending') return true;
      if (o.status === 'scheduled') {
        const res = reservations.find(r => r.linkedOrderId === o.orderNumber);
        if (res && res.status === 'confirmed' && res.date && res.time) {
          const { hours, mins } = parseTime(res.time);
          const arrival = new Date(res.date);
          arrival.setHours(hours, mins, 0, 0);
          const diffMinutes = (arrival - currentTime) / (1000 * 60);
          if (diffMinutes <= 60) return true;
        }
      }
      return false;
    });
  };

  const pendingOrdersList = getPendingOrders();
  const pendingCount = pendingOrdersList.length + upcomingReservations.length;
  const scheduledOrdersList = orders.filter(o => {
    if (o.status !== 'scheduled') return false;
    if (pendingOrdersList.find(p => p.id === o.id)) return false;
    const res = reservations.find(r => r.linkedOrderId === o.orderNumber);
    if (res && res.status !== 'confirmed') return false;
    return true;
  });
  const filteredOrders = activeTab === 'pending' ? pendingOrdersList : (activeTab === 'scheduled' ? scheduledOrdersList : orders.filter(o => o.status === activeTab));

  const tabs = [
    { id: 'pending', label: t(ownerLang, 'newOrdersAlerts'), count: pendingCount, color: 'text-yellow-500' },
    { id: 'processing', label: t(ownerLang, 'processingKitchen'), count: orders.filter(o => o.status === 'processing').length, color: 'text-blue-500' },
    { id: 'scheduled', label: t(ownerLang, 'scheduled'), count: scheduledOrdersList.length, color: 'text-purple-500' },
    { id: 'completed', label: t(ownerLang, 'completed'), count: orders.filter(o => o.status === 'completed').length, color: 'text-green-500' },
    { id: 'cancelled', label: t(ownerLang, 'cancelled'), count: orders.filter(o => o.status === 'cancelled').length, color: 'text-red-500' }
  ];

  if (loading) return <LoadingScreen message="Loading live orders..." />;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-60px)] flex flex-col">
      <div className="mb-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-crmText flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          {t(ownerLang, 'liveOrders')}
          <span className="text-gray-500 text-xs font-normal hidden md:inline ml-1">— {t(ownerLang, 'realTimeOrderManagement')}</span>
        </h1>
      </div>

      <div className="flex overflow-x-auto gap-4 border-b border-crmBorder pb-4 mb-6 shrink-0 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-crmCard text-crmText border border-crmBorder shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs bg-crmDark ${tab.color}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up">
          
          {/* Render Upcoming Reservations if in Pending Tab */}
          {activeTab === 'pending' && upcomingReservations.map(r => (
            <div key={`res-${r.id}`} className="bg-crmCard border-2 border-purple-500/50 rounded-2xl p-5 shadow-lg shadow-purple-500/10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <span className="text-xs font-bold text-purple-400 tracking-wider bg-purple-500/10 px-2 py-1 rounded-md flex items-center gap-1 w-fit mb-2">
                    <BellRing size={12} /> {t(ownerLang, 'oneHourAlert')}
                  </span>
                  <h3 className="font-bold text-crmText text-xl">{r.name}</h3>
                </div>
                <div className="text-right">
                  <p className="font-bold text-crmText flex items-center gap-1 justify-end"><Clock size={14}/> {r.time}</p>
                  <p className="text-sm text-purple-400 mt-1 font-bold flex items-center gap-1 justify-end"><Users size={14}/> {r.guests} Pax</p>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">Reservation Date: {formatDate(r.date, settings?.dateFormat || 'dd/mm/yyyy')}</p>

              {r.linkedOrderId && (
                 <div className="bg-crmAccent/10 border border-crmAccent/20 text-crmAccent p-2 rounded-lg text-xs mb-4 flex gap-2">
                   <FileText size={14} className="shrink-0 mt-0.5" />
                   <p className="font-bold">{t(ownerLang, 'preOrderedFoodOrder').replace('{id}', r.linkedOrderId)}</p>
                 </div>
              )}

              <div className="border-t border-crmBorder pt-3 mt-auto relative z-10">
                <button 
                  onClick={() => sendReservationAlert(r)} 
                  className="w-full py-2.5 rounded-lg font-bold bg-purple-500 text-white hover:brightness-110 text-xs flex justify-center items-center gap-2"
                >
                  <BellRing size={16}/> {t(ownerLang, 'sendTelegramReminder')}
                </button>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (activeTab !== 'pending' || upcomingReservations.length === 0) ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-crmBorder rounded-2xl">
              <p className="text-gray-400 text-lg">{t(ownerLang, 'noItemsAtMoment').replace('items', activeTab)}</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order.id} 
                className="bg-crmCard border border-crmBorder rounded-2xl p-5 shadow-lg flex flex-col hover:border-crmAccent transition-colors relative"
              >
                <div 
                  className="cursor-pointer mb-4"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {order.type === 'cancellation' && (
                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-2 w-fit uppercase">
                          {t(ownerLang, 'bookingCancellation')}
                        </div>
                      )}
                      {order.status === 'scheduled' && order.type !== 'cancellation' && (
                        <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-2 animate-pulse w-fit uppercase">
                          {t(ownerLang, 'reservationsAt')} {reservations.find(r => r.linkedOrderId === order.orderNumber)?.time}
                        </div>
                      )}
                      <span className="text-xs font-bold text-crmAccent tracking-wider bg-crmAccent/10 px-2 py-1 rounded-md">
                        {order.orderNumber ? `#${order.orderNumber}` : order.orderMode?.toUpperCase()}
                      </span>
                      <h3 className="font-bold text-crmText text-xl mt-2">{order.type === 'cancellation' ? t(ownerLang, 'cancellationUpper') : (order.table !== 'Takeaway' ? `${t(ownerLang, 'table')} ${order.table}` : t(ownerLang, 'takeaway'))}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 flex items-center gap-1 justify-end">
                        <Clock size={12}/> 
                        {order.status === 'scheduled' ? (reservations.find(r => r.linkedOrderId === order.orderNumber)?.time || order.time) : order.time}
                      </p>
                      <p className="font-bold text-crmText mt-1">RM {order.total?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm font-medium mb-1 line-clamp-1">{order.customerName}</p>
                  <p className="text-gray-500 text-xs mb-4">{t(ownerLang, 'ref')}: <span className="text-gray-300 font-mono">{order.paymentRef || 'None'}</span></p>

                  {order.notes && (
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-2 rounded-lg text-xs mb-4 flex gap-2">
                      <FileText size={14} className="shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{order.notes}</p>
                    </div>
                  )}

                  <div className="border-t border-crmBorder pt-3 flex items-center justify-between text-crmAccent text-sm font-bold">
                    <span>{order.items?.length || 0} {t(ownerLang, 'items')}</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* Direct Action Buttons on Card */}
                <div className="border-t border-crmBorder pt-3 mt-auto">
                  {(order.status === 'pending' || order.status === 'scheduled') && (
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'cancelled', order); }} className="flex-1 py-2 rounded-lg font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs">{t(ownerLang, 'cancelOrder')}</button>
                      <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'processing', order); }} className="flex-1 py-2 rounded-lg font-bold bg-crmAccent text-white hover:brightness-110 text-xs flex justify-center items-center gap-1">
                        <CheckCircle2 size={14}/> {order.type === 'cancellation' ? 'Accept' : t(ownerLang, 'sendToKitchen')}
                      </button>
                    </div>
                  )}
                  {order.status === 'processing' && (
                    <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'completed', order); }} className="w-full py-2 rounded-lg font-bold bg-green-500 text-white hover:bg-green-600 text-xs flex justify-center items-center gap-1"><CheckCircle2 size={14}/> {t(ownerLang, 'markCompleted')}</button>
                  )}
                  {(order.status === 'completed' || order.status === 'cancelled') && (
                    <div className="w-full text-center py-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      {order.status}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-crmCard border border-crmBorder rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-crmBorder flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-crmText">Order Details #{selectedOrder.orderNumber || ''}</h2>
                <p className="text-gray-400 text-sm">Placed at {selectedOrder.time}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white transition-colors">
                <XCircle size={28} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-crmDark p-3 rounded-xl border border-crmBorder">
                  <p className="text-gray-500 mb-1">Customer</p>
                  <p className="font-bold text-crmText">{selectedOrder.customerName}</p>
                  <p className="text-crmText">{selectedOrder.phone}</p>
                </div>
                <div className="bg-crmDark p-3 rounded-xl border border-crmBorder">
                  <p className="text-gray-500 mb-1">Payment Ref</p>
                  <p className="font-bold text-crmText font-mono text-lg">{selectedOrder.paymentRef || 'No Ref Provided'}</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-4 rounded-xl mb-6">
                  <h3 className="font-bold text-sm mb-1 flex items-center gap-2"><FileText size={16}/> Special Instructions</h3>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              <h3 className="font-bold text-crmText mb-3 border-b border-crmBorder pb-2">Order Items</h3>
              <div className="space-y-3 mb-6">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-crmAccent">{item.qty}x</span>
                      <span className="text-gray-300">{item.names?.['en'] || 'Unknown Item'}</span>
                    </div>
                    <span className="text-gray-400">RM {(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-lg font-bold border-t border-crmBorder pt-4 text-crmText">
                <span>Total Amount</span>
                <span className="text-crmAccent">RM {selectedOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-6 border-t border-crmBorder bg-crmDark rounded-b-2xl shrink-0 flex gap-3">
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'scheduled') && (
                <>
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled', selectedOrder)} className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">{selectedOrder.type === 'cancellation' ? 'Dismiss' : t(ownerLang, 'cancelOrder')}</button>
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'processing', selectedOrder)} className="flex-1 py-3 px-4 rounded-xl font-bold bg-crmAccent text-white shadow-lg hover:brightness-110 transition-all flex justify-center items-center gap-2"><CheckCircle2 size={20}/> {selectedOrder.type === 'cancellation' ? 'Accept Cancellation' : 'Confirm Payment'}</button>
                </>
              )}
              {selectedOrder.status === 'processing' && (
                <button onClick={() => updateOrderStatus(selectedOrder.id, 'completed', selectedOrder)} className="w-full py-3 px-4 rounded-xl font-bold bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all flex justify-center items-center gap-2"><CheckCircle2 size={20}/> Mark as Served / Completed</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveOrders;
