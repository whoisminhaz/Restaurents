import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, getDocs, where, deleteDoc, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CalendarDays, CheckCircle2, Clock, Users, Trash2 } from 'lucide-react';
import { t } from '../../utils/translations';
import { formatDate } from '../../utils/formatDate';
import LoadingScreen from '../../components/LoadingScreen';

const ReservationCard = React.memo(({ r, totalTables, onUpdateStatus, onDelete }) => {
  const [selectedTable, setSelectedTable] = useState(
    r.table && r.table !== 'Pending Table' && r.table !== 'Assigned' ? r.table : ''
  );
  const [busy, setBusy] = useState(false);

  const handleAction = async (status) => {
    setBusy(true);
    await onUpdateStatus(r.id, status, r.linkedOrderId, status === 'confirmed' ? selectedTable : null);
    setBusy(false);
  };

  return (
    <div className="bg-crmCard border border-crmBorder rounded-xl p-4 flex flex-col shadow-sm hover:border-crmAccent transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
            r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
            r.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' :
            r.status === 'completed' ? 'bg-green-500/10 text-green-500' :
            'bg-red-500/10 text-red-500'
          }`}>
            {r.status}
          </span>
          <h3 className="font-bold text-crmText text-base mt-1.5 line-clamp-1">{r.name}</h3>
          <p className="text-gray-400 text-xs mt-0.5">{r.phone}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1.5">
          <div className="bg-crmDark border border-crmBorder rounded-lg p-1.5 text-center min-w-[60px]">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Guests</p>
            <p className="font-bold text-crmText text-base">{r.guests}</p>
          </div>
          {r.linkedOrderId && (
            <span className="bg-crmAccent/10 text-crmAccent text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              Order #{r.linkedOrderId}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-crmDark p-2 rounded-lg border border-crmBorder flex items-center gap-1.5">
          <CalendarDays size={14} className="text-crmAccent shrink-0" />
          <span className="text-xs font-medium text-crmText">{r.date}</span>
        </div>
        <div className="bg-crmDark p-2 rounded-lg border border-crmBorder flex items-center gap-1.5">
          <Clock size={14} className="text-crmAccent shrink-0" />
          <span className="text-xs font-medium text-crmText">{r.time}</span>
        </div>
      </div>

      {r.table && r.status === 'confirmed' && r.table !== 'Pending Table' && r.table !== 'Assigned' && (
        <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg text-xs mb-3 font-bold flex items-center gap-1.5">
          Table: {r.table}
        </div>
      )}

      {r.notes && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-2 rounded-lg text-xs mb-3 line-clamp-2">
          <span className="font-bold">Notes:</span> {r.notes}
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-crmBorder flex flex-col gap-2">
        {r.status === 'pending' && (
          <>
            <div className="flex items-center gap-2 mb-1 bg-crmDark p-2 rounded-lg border border-crmBorder">
              <label className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Assign Table:</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="flex-1 bg-crmCard text-crmText text-xs font-bold focus:outline-none cursor-pointer rounded px-1 py-0.5 border border-crmBorder"
              >
                <option value="" disabled>Select Table</option>
                {[...Array(totalTables)].map((_, i) => (
                  <option key={i+1} value={String(i+1)}>Table {i+1}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button disabled={busy} onClick={() => handleAction('cancelled')} className="flex-1 py-1.5 rounded-lg font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs disabled:opacity-50">Decline</button>
              <button disabled={busy || !selectedTable} onClick={() => handleAction('confirmed')} className="flex-1 py-1.5 rounded-lg font-bold bg-crmAccent text-white hover:brightness-110 text-xs flex items-center justify-center gap-1 disabled:opacity-50"><CheckCircle2 size={14}/> Confirm</button>
            </div>
          </>
        )}
        {r.status === 'pending' && (
          <button disabled={busy} onClick={async () => { setBusy(true); await onDelete(r.id); setBusy(false); }} className="w-full py-1 rounded-lg font-bold bg-gray-500/10 text-gray-400 hover:bg-red-500/10 hover:text-red-500 text-[10px] flex items-center justify-center gap-1 disabled:opacity-50 mt-1">
            <Trash2 size={10}/> Remove from list
          </button>
        )}
        {r.status === 'confirmed' && (
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => handleAction('cancelled')} className="flex-1 py-1.5 rounded-lg font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs disabled:opacity-50">Cancel</button>
            <button disabled={busy} onClick={() => handleAction('completed')} className="flex-1 py-1.5 rounded-lg font-bold bg-green-500 text-white hover:bg-green-600 text-xs flex items-center justify-center gap-1 disabled:opacity-50"><CheckCircle2 size={14}/> Complete</button>
          </div>
        )}
      </div>
    </div>
  );
});

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('schedule');
  const ownerLang = localStorage.getItem('ownerLang') || 'en';
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'master'));
      if (snap.exists()) setSettings(snap.data());
    };
    fetchSettings();

    const q = query(collection(db, 'reservations'), orderBy('timestamp', 'desc'), limit(150));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id
      }));
      setReservations(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = useCallback(async (resId, status, linkedOrderId, selectedTable) => {
    try {
      let updates = { status };
      
      if (status === 'confirmed' && selectedTable) {
        updates.table = selectedTable;
      }

      await updateDoc(doc(db, 'reservations', resId), updates);

      // If confirming and there's a pre-order, update the order's table too
      if (status === 'confirmed' && linkedOrderId && selectedTable) {
        const orderQ = query(collection(db, 'orders'), where('orderNumber', '==', linkedOrderId));
        const orderSnaps = await getDocs(orderQ);
        for (const orderDoc of orderSnaps.docs) {
          await updateDoc(doc(db, 'orders', orderDoc.id), { table: selectedTable });
        }
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  }, []);

  const handleDelete = useCallback(async (resId) => {
    if (!window.confirm("Are you sure you want to permanently delete this reservation?")) return;
    try {
      await deleteDoc(doc(db, 'reservations', resId));
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  }, []);

  if (loading) return <LoadingScreen message="Loading reservations..." />;

  const totalTables = parseInt(settings?.tables) || 20;
  const pending = reservations.filter(r => r.status === 'pending');
  const confirmed = reservations.filter(r => r.status === 'confirmed');
  const completed = reservations.filter(r => r.status === 'completed' || r.status === 'cancelled');

  // Group by Date -> Time for Schedule View
  const schedule = {};
  [...pending, ...confirmed].forEach(r => {
    if (!schedule[r.date]) schedule[r.date] = {};
    if (!schedule[r.date][r.time]) schedule[r.date][r.time] = { pax: 0, list: [] };
    schedule[r.date][r.time].pax += parseInt(r.guests) || 0;
    schedule[r.date][r.time].list.push(r);
  });

  // Sort dates
  const sortedDates = Object.keys(schedule).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-60px)] flex flex-col">
      <div className="mb-3 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-crmText flex items-center gap-2">
          <CalendarDays className="text-crmAccent" size={20} />
          {t(ownerLang, 'reservations')}
        </h1>
        
        <div className="flex bg-crmCard border border-crmBorder p-1 rounded-xl">
          <button 
            onClick={() => setView('schedule')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${view === 'schedule' ? 'bg-crmAccent text-white' : 'text-gray-400 hover:text-crmText'}`}
          >
            Daily Schedule
          </button>
          <button 
            onClick={() => setView('confirmed')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${view === 'confirmed' ? 'bg-crmAccent text-white' : 'text-gray-400 hover:text-crmText'}`}
          >
            Confirmed Bookings
          </button>
          <button 
            onClick={() => setView('requests')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${view === 'requests' ? 'bg-crmAccent text-white' : 'text-gray-400 hover:text-crmText'}`}
          >
            Pending Requests 
            {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pending.length}</span>}
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${view === 'history' ? 'bg-crmAccent text-white' : 'text-gray-400 hover:text-crmText'}`}
          >
            History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 animate-fade-in-up">
        {view === 'schedule' && (
          <div>
            {sortedDates.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed border-crmBorder rounded-3xl">
                <CalendarDays size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-bold text-crmText">No Upcoming Bookings</h3>
                <p className="text-gray-500 mt-2">Your schedule is completely clear.</p>
              </div>
            ) : (
              sortedDates.map(date => (
                <div key={date} className="mb-8">
                  <div className="sticky top-0 bg-crmDark/90 backdrop-blur-md py-2 z-10 border-b border-crmBorder mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-crmAccent rounded-full"></div>
                    <h2 className="text-base font-bold text-crmText">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.keys(schedule[date]).sort().map(time => (
                      <div key={time} className="flex flex-col lg:flex-row gap-4">
                        {/* Time Column */}
                        <div className="lg:w-36 shrink-0">
                          <div className="bg-crmCard border border-crmBorder rounded-xl p-2.5 sticky top-20">
                            <h3 className="text-lg font-bold text-crmText mb-1">{time}</h3>
                            <div className="flex items-center gap-1.5 text-crmAccent text-xs font-bold bg-crmAccent/10 px-2 py-1 rounded-lg w-fit">
                              <Users size={12} />
                              {schedule[date][time].pax} Pax Total
                            </div>
                          </div>
                        </div>
                        {/* Cards Column */}
                        <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {schedule[date][time].list.map(r => <ReservationCard key={r.id} r={r} totalTables={totalTables} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'requests' && (
          <div>
            {pending.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center py-12">No pending requests to review.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pending.map(r => <ReservationCard key={r.id} r={r} totalTables={totalTables} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />)}
              </div>
            )}
          </div>
        )}

        {view === 'confirmed' && (
          <div>
            {confirmed.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center py-12">No confirmed bookings.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {confirmed.map(r => <ReservationCard key={r.id} r={r} totalTables={totalTables} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />)}
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div>
            {completed.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center py-12">No historical records found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                {completed.map(r => <ReservationCard key={r.id} r={r} totalTables={totalTables} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
