import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { TrendingUp, ShoppingBag, Utensils, CreditCard, Activity } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import { t } from '../../utils/translations';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('today'); // today, week, month, all
  const ownerLang = localStorage.getItem('ownerLang') || 'en';

  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    takeawayCount: 0,
    dineInCount: 0,
    topItems: [],
    loading: true
  });

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setStats(s => ({ ...s, loading: true }));
      try {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();
        
        if (timeRange === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (timeRange === 'yesterday') {
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
        } else if (timeRange === 'thisWeek') {
          const day = now.getDay() || 7; 
          startDate.setDate(now.getDate() - day + 1);
          startDate.setHours(0, 0, 0, 0);
        } else if (timeRange === 'lastWeek') {
          const day = now.getDay() || 7;
          startDate.setDate(now.getDate() - day - 6);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
        } else if (timeRange === 'thisMonth') {
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
        } else if (timeRange === 'lastMonth') {
          startDate.setMonth(now.getMonth() - 1, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          endDate.setHours(23, 59, 59, 999);
        } else if (timeRange === 'all') {
          startDate = new Date(2000, 0, 1);
        } else if (timeRange === 'custom') {
          if (!customStart || !customEnd) {
            setStats(s => ({ ...s, loading: false }));
            return; // Wait for both dates
          }
          startDate = new Date(customStart);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customEnd);
          endDate.setHours(23, 59, 59, 999);
        } else {
          startDate.setDate(now.getDate() - 7); // fallback week
        }

        const q = query(collection(db, 'orders'));
        const querySnapshot = await getDocs(q);
        
        let revenue = 0;
        let orderCount = 0;
        let takeaway = 0;
        let dineIn = 0;
        const itemCounts = {};

        querySnapshot.forEach(doc => {
          const data = doc.data();
          const orderDate = data.timestamp ? data.timestamp.toDate() : new Date();
          
          if (orderDate >= startDate && (timeRange !== 'custom' || orderDate <= endDate) && data.status !== 'cancelled') {
            revenue += data.total || 0;
            orderCount++;
            
            if (data.orderMode === 'takeaway') takeaway++;
            else dineIn++;

            (data.items || []).forEach(item => {
              const name = (item.names && item.names['en']) || item.name || 'Unknown';
              itemCounts[name] = (itemCounts[name] || 0) + (item.qty || 1);
            });
          }
        });

        const sortedItems = Object.keys(itemCounts)
          .map(name => ({ name, count: itemCounts[name] }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          todayRevenue: revenue,
          todayOrders: orderCount,
          takeawayCount: takeaway,
          dineInCount: dineIn,
          topItems: sortedItems,
          loading: false
        });
      } catch (error) {
        console.error("Failed to load analytics:", error);
        setStats(s => ({ ...s, loading: false }));
      }
    };

    fetchAnalytics();
  }, [timeRange, customStart, customEnd]);

  if (stats.loading) return <LoadingScreen message="Loading analytics..." />;

  const maxItems = Math.max(...stats.topItems.map(i => i.count), 1);

  const getRangeLabel = () => {
    if (timeRange === 'today') return t(ownerLang, 'today');
    if (timeRange === 'week') return t(ownerLang, 'thisWeek');
    if (timeRange === 'month') return t(ownerLang, 'thisMonth');
    if (timeRange === 'custom') return 'Custom Range';
    return t(ownerLang, 'allTime');
  };

  return (
    <div className="p-6 md:p-8 bg-crmDark min-h-full">
      <div className="mb-8 flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-crmText mb-2 tracking-tight">{t(ownerLang, 'analytics')}</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your restaurant's performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 bg-crmCard border border-crmBorder p-1 rounded-xl">
              <input 
                type="date" 
                value={customStart} 
                onChange={e => setCustomStart(e.target.value)}
                className="bg-crmDark text-crmText text-sm px-2 py-1 rounded border border-crmBorder focus:outline-none"
              />
              <span className="text-gray-500">to</span>
              <input 
                type="date" 
                value={customEnd} 
                onChange={e => setCustomEnd(e.target.value)}
                className="bg-crmDark text-crmText text-sm px-2 py-1 rounded border border-crmBorder focus:outline-none"
              />
            </div>
          )}
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-crmCard border border-crmBorder text-crmText px-4 py-2 rounded-xl focus:outline-none focus:border-crmAccent h-[42px]"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="thisWeek">This Week</option>
            <option value="lastWeek">Last Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Date Range</option>
          </select>
          <div className="bg-crmCard p-2.5 rounded-xl shadow-sm border border-crmBorder text-crmAccent h-[42px] flex items-center justify-center">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-crmCard p-6 rounded-3xl shadow-sm border border-crmBorder flex flex-col justify-between hover:border-crmAccent/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-500/10 p-3 rounded-xl text-green-500"><TrendingUp size={24} /></div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{getRangeLabel()}</span>
          </div>
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t(ownerLang, 'totalRevenue')}</h3>
            <p className="text-3xl font-bold text-crmText">RM {stats.todayRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-crmCard p-6 rounded-3xl shadow-sm border border-crmBorder flex flex-col justify-between hover:border-crmAccent/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500"><ShoppingBag size={24} /></div>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">{getRangeLabel()}</span>
          </div>
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t(ownerLang, 'totalOrders')}</h3>
            <p className="text-3xl font-bold text-crmText">{stats.todayOrders}</p>
          </div>
        </div>

        <div className="bg-crmCard p-6 rounded-3xl shadow-sm border border-crmBorder flex flex-col justify-between hover:border-crmAccent/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500"><Utensils size={24} /></div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">Split</span>
          </div>
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t(ownerLang, 'split')}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-bold text-crmText">{stats.dineInCount}</span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${(stats.dineInCount / (stats.todayOrders || 1)) * 100}%` }} className="h-full bg-orange-500"></div>
                <div style={{ width: `${(stats.takeawayCount / (stats.todayOrders || 1)) * 100}%` }} className="h-full bg-blue-500"></div>
              </div>
              <span className="font-bold text-crmText">{stats.takeawayCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-crmCard p-6 rounded-3xl shadow-sm border border-crmBorder flex flex-col justify-between hover:border-crmAccent/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-500/10 p-3 rounded-xl text-purple-500"><CreditCard size={24} /></div>
            <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full">Avg</span>
          </div>
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t(ownerLang, 'avgOrderValue')}</h3>
            <p className="text-3xl font-bold text-crmText">RM {stats.todayOrders > 0 ? (stats.todayRevenue / stats.todayOrders).toFixed(2) : '0.00'}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Items */}
        <div className="bg-crmCard rounded-3xl shadow-sm border border-crmBorder p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-crmText mb-6">{t(ownerLang, 'topItems')}</h2>
          
          {stats.topItems.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 border-2 border-dashed border-crmBorder rounded-2xl">
              No sales recorded in this period.
            </div>
          ) : (
            <div className="space-y-5">
              {stats.topItems.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-crmDark flex items-center justify-center font-bold text-gray-500 shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-crmText truncate pr-4">{item.name}</span>
                      <span className="font-bold text-crmText shrink-0">{item.count} sold</span>
                    </div>
                    <div className="w-full h-2.5 bg-crmDark rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${(item.count / maxItems) * 100}%`,
                          backgroundColor: 'var(--crm-accent)' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips or Alerts */}
        <div className="bg-gradient-to-br from-crmAccent/20 to-crmAccent/5 border border-crmAccent/20 rounded-3xl p-6 flex flex-col">
          <h2 className="text-xl font-bold text-crmText mb-4">Insights ({getRangeLabel()})</h2>
          <div className="flex-1 space-y-4">
            <div className="bg-crmCard/80 backdrop-blur p-4 rounded-2xl">
              <p className="text-sm text-crmText"><span className="font-bold">Trending:</span> {stats.topItems[0] ? `${stats.topItems[0].name} is your best seller!` : 'Awaiting first order.'}</p>
            </div>
            <div className="bg-crmCard/80 backdrop-blur p-4 rounded-2xl">
              <p className="text-sm text-crmText"><span className="font-bold">Volume:</span> You have processed {stats.todayOrders} orders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
