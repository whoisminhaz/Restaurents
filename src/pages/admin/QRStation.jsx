import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { t } from '../../utils/translations';

const QRStation = () => {
  const [tableCount, setTableCount] = useState(10);
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const ownerLang = localStorage.getItem('ownerLang') || 'en';

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'master'));
      if (snap.exists()) {
        const data = snap.data();
        if (data.tables) setTableCount(parseInt(data.tables));
        if (data.googleMapUrl) setGoogleMapUrl(data.googleMapUrl);
        if (data.wifiSsid) setWifiSsid(data.wifiSsid);
        if (data.wifiPassword) setWifiPassword(data.wifiPassword);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleTableChange = async (val) => {
    setTableCount(val);
    await updateDoc(doc(db, 'settings', 'master'), { tables: val });
  };

  const handleSettingBlur = async (field, value) => {
    try {
      await updateDoc(doc(db, 'settings', 'master'), { [field]: value });
    } catch (e) {
      console.error('Failed to save ' + field, e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedBaseUrl = (baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`).replace(/\/+$/, '');

  // Generate an array of tables based on the count
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto relative pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-crmText">{t(ownerLang, 'qrStation')}</h1>
          <p className="text-gray-400 mt-2">{t(ownerLang, 'qrStationDesc')}</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-crmAccent hover:bg-[#964d20] text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-crmAccent/20 no-print"
        >
          <Printer size={20} />
          {t(ownerLang, 'printPdf')}
        </button>
      </div>

      <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl mb-8 no-print">
        <h2 className="text-xl font-semibold text-crmText mb-6">{t(ownerLang, 'configuration')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Google Map Review Link</label>
            <input
              type="text"
              value={googleMapUrl}
              onChange={(e) => setGoogleMapUrl(e.target.value)}
              onBlur={(e) => handleSettingBlur('googleMapUrl', e.target.value)}
              className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              placeholder="e.g. https://g.page/r/.../review"
            />
            <p className="text-xs text-gray-500 mt-2">
              <strong>How to get this:</strong> Search your restaurant on Google &rarr; Click <strong>"Ask for reviews"</strong> (on your Business Profile) &rarr; Copy that specific link. 
              <br/><em>Note: If you paste a regular map share link, customers will just have to manually tap the "Reviews" tab when it opens.</em>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-crmBorder/50">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Wi-Fi Network Name (SSID)</label>
            <input
              type="text"
              value={wifiSsid}
              onChange={(e) => setWifiSsid(e.target.value)}
              onBlur={(e) => handleSettingBlur('wifiSsid', e.target.value)}
              className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              placeholder="e.g. Guest_WiFi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Wi-Fi Password</label>
            <input
              type="text"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              onBlur={(e) => handleSettingBlur('wifiPassword', e.target.value)}
              className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              placeholder="e.g. Password123"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t(ownerLang, 'numberOfTables')}</label>
            <input
              type="number"
              min="1"
              max="100"
              value={tableCount}
              onChange={(e) => handleTableChange(Number(e.target.value))}
              className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t(ownerLang, 'publicOrderingUrl')}</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
              placeholder="https://yourcafe.com"
            />
          </div>
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-10">
        
        {/* Google Maps Review Code */}
        {googleMapUrl && (
          <div className="bg-white p-6 rounded-2xl border-4 border-crmBorder flex flex-col items-center justify-center text-center print:border-black print:break-inside-avoid">
            <h3 className="text-2xl font-bold text-black mb-1">Review Us</h3>
            <p className="text-xs text-gray-600 mb-4 uppercase tracking-wider font-bold">Scan to leave a Google review</p>
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <QRCodeSVG 
                value={googleMapUrl} 
                size={160}
                level="H"
                includeMargin={false}
                fgColor="#121212"
              />
            </div>
          </div>
        )}

        {/* Wi-Fi Connection Code */}
        {wifiSsid && (
          <div className="bg-white p-6 rounded-2xl border-4 border-crmBorder flex flex-col items-center justify-center text-center print:border-black print:break-inside-avoid">
            <h3 className="text-2xl font-bold text-black mb-1">Free Wi-Fi</h3>
            <p className="text-xs text-gray-600 mb-4 uppercase tracking-wider font-bold">Scan to connect instantly</p>
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <QRCodeSVG 
                value={`WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`} 
                size={160}
                level="H"
                includeMargin={false}
                fgColor="#121212"
              />
            </div>
            <div className="mt-4 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              <span className="text-black">{wifiSsid}</span>
            </div>
          </div>
        )}

        {/* Special Takeaway Code */}
        <div className="bg-white p-6 rounded-2xl border-4 border-crmBorder flex flex-col items-center justify-center text-center print:border-black print:break-inside-avoid">
          <h3 className="text-2xl font-bold text-black mb-1">{t(ownerLang, 'takeaway')}</h3>
          <p className="text-xs text-gray-600 mb-4 uppercase tracking-wider font-bold">{t(ownerLang, 'scanToOrder')}</p>
          <div className="bg-white p-2 rounded-xl shadow-sm">
            <QRCodeSVG 
              value={`${formattedBaseUrl}/order?type=takeaway`} 
              size={160}
              level="H"
              includeMargin={false}
              fgColor="#121212"
            />
          </div>
        </div>

        {/* Regular Table Codes */}
        {tables.map(num => (
          <div key={num} className="bg-white p-6 rounded-2xl border-4 border-crmBorder flex flex-col items-center justify-center text-center print:border-black print:break-inside-avoid">
            <h3 className="text-3xl font-bold text-black mb-1">{t(ownerLang, 'table')} {num}</h3>
            <p className="text-xs text-gray-600 mb-4 uppercase tracking-wider font-bold">{t(ownerLang, 'scanToOrder')}</p>
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <QRCodeSVG 
                value={`${formattedBaseUrl}/order?table=${num}`} 
                size={160}
                level="H"
                includeMargin={false}
                fgColor="#121212"
              />
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .print\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .print\\:gap-10 { gap: 2.5rem !important; }
          .print\\:border-black { border-color: #000 !important; }
          .print\\:break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          
          .grid { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
          .grid * { visibility: visible; }
        }
      `}} />
    </div>
  );
};

export default QRStation;
