import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const QRStation = () => {
  const [tableCount, setTableCount] = useState(10);
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'master'));
      if (snap.exists()) {
        const data = snap.data();
        if (data.tables) setTableCount(parseInt(data.tables));
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleTableChange = async (val) => {
    setTableCount(val);
    await updateDoc(doc(db, 'settings', 'master'), { tables: val });
  };

  // Generate an array of tables based on the count
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-crmText">QR Code Station</h1>
          <p className="text-gray-400 mt-2">Generate and print high-quality QR codes for your tables.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-crmAccent hover:bg-[#964d20] text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-crmAccent/20 no-print"
        >
          <Printer size={20} />
          Print PDF
        </button>
      </div>

      <div className="bg-crmCard border border-crmBorder rounded-2xl p-6 shadow-xl mb-8 no-print">
        <h2 className="text-xl font-semibold text-crmText mb-6">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Number of Tables</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Public Ordering URL</label>
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
        {/* Special Takeaway Code */}
        <div className="bg-white p-6 rounded-2xl border-4 border-crmBorder flex flex-col items-center justify-center text-center print:border-black print:break-inside-avoid">
          <h3 className="text-2xl font-bold text-black mb-1">Takeaway</h3>
          <p className="text-sm text-gray-600 mb-6 uppercase tracking-wider">Scan to Order</p>
          <div className="bg-white p-2 rounded-xl shadow-sm">
            <QRCodeSVG 
              value={`${baseUrl}/order?type=takeaway`} 
              size={160}
              level="H"
              includeMargin={false}
              fgColor="#121212"
            />
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-crmAccent font-bold no-print cursor-pointer hover:underline">
            <Download size={16} /> SVG
          </div>
        </div>

        {/* Regular Table Codes */}
        {tables.map(num => (
          <div key={num} className="bg-white p-6 rounded-2xl border-4 border-crmBorder flex flex-col items-center justify-center text-center print:border-black print:break-inside-avoid">
            <h3 className="text-3xl font-bold text-black mb-1">Table {num}</h3>
            <p className="text-sm text-gray-600 mb-6 uppercase tracking-wider">Scan to Order</p>
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <QRCodeSVG 
                value={`${baseUrl}/order?table=${num}`} 
                size={160}
                level="H"
                includeMargin={false}
                fgColor="#121212"
              />
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-crmAccent font-bold no-print cursor-pointer hover:underline">
              <Download size={16} /> SVG
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
