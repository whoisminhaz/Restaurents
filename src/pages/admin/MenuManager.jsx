import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Save } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const categories = ['Mains', 'Drinks', 'Desserts', 'Add-ons'];

const allLanguages = [
  { id: 'en', label: 'English Name' },
  { id: 'ms', label: 'Malay Name' },
  { id: 'zh', label: 'Chinese Name' },
  { id: 'ta', label: 'Tamil Name' },
  { id: 'ar', label: 'Arabic Name' }
];

const MenuManager = () => {
  const [items, setItems] = useState([]);
  const [activeLangs, setActiveLangs] = useState(['en']);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    price: '',
    salePrice: '',
    category: '',
    available: true,
    imageUrl: '',
    names: {}
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get active languages from settings
      const settingsSnap = await getDoc(doc(db, 'settings', 'master'));
      if (settingsSnap.exists() && settingsSnap.data().languages) {
        setActiveLangs(settingsSnap.data().languages);
      }

      // 2. Get menu items
      const querySnapshot = await getDocs(collection(db, 'menu'));
      const menuList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(menuList);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setFormData(item);
    } else {
      const newId = 'item_' + Date.now().toString(36);
      setFormData({
        id: newId,
        price: '',
        salePrice: '',
        category: '',
        available: true,
        imageUrl: '',
        names: {}
      });
    }
    setModalOpen(true);
  };

  const handleNameChange = (langId, value) => {
    setFormData(prev => ({
      ...prev,
      names: { ...prev.names, [langId]: value }
    }));
  };

  // Resize and compress image using HTML5 Canvas (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Small size for fast database loading
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to high-compression JPEG
        const base64String = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
      };
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const itemToSave = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
      };

      // Save directly to Firestore database (bypassing Firebase Storage)
      await setDoc(doc(db, 'menu', formData.id), itemToSave);
      
      setModalOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item. Ensure Firestore Database Rules are correct.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, 'menu', id));
        fetchData();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await setDoc(doc(db, 'menu', item.id), { ...item, available: !item.available });
      setItems(items.map(i => i.id === item.id ? { ...i, available: !i.available } : i));
    } catch (error) {
      console.error("Error toggling:", error);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-crmText">Menu Manager</h1>
          <p className="text-gray-400 mt-2">Manage your food items, prices, photos, and translations.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-crmAccent hover:bg-[#964d20] text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-crmAccent/20"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      {loading ? (
        <LoadingScreen message="Loading menu..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-crmCard border border-crmBorder rounded-2xl overflow-hidden shadow-xl flex flex-col transition-transform hover:-translate-y-1">
              <div className="h-48 bg-crmDark relative flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="Food" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={48} className="text-crmBorder" />
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {item.available ? 'Available' : 'Sold Out'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-crmText">
                    {item.names['en'] || item.names[activeLangs[0]] || 'Unnamed Item'}
                  </h3>
                  <span className="font-bold text-crmAccent">RM {item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">{item.category}</p>
                
                <div className="mt-auto flex gap-2 border-t border-crmBorder pt-4">
                  <button onClick={() => toggleAvailability(item)} className="flex-1 px-3 py-2 bg-crmDark hover:bg-crmBorder text-crmText rounded-lg text-sm transition-colors">
                    {item.available ? 'Mark Sold Out' : 'Mark Available'}
                  </button>
                  <button onClick={() => openModal(item)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-crmBorder rounded-2xl">
              <p className="text-gray-400">Your menu is empty. Click "Add New Item" to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-crmCard border border-crmBorder rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-crmCard border-b border-crmBorder p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-crmText">
                {formData.names['en'] ? 'Edit Item' : 'New Menu Item'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Dynamic Language Inputs */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Item Names (Dynamic)</h3>
                <div className="space-y-3">
                  {activeLangs.map(langId => {
                    const langDef = allLanguages.find(l => l.id === langId);
                    return (
                      <div key={langId}>
                        <input
                          type="text"
                          placeholder={langDef ? langDef.label : `Name (${langId})`}
                          value={formData.names[langId] || ''}
                          onChange={(e) => handleNameChange(langId, e.target.value)}
                          className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
                          required={langId === activeLangs[0]}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent appearance-none"
                    required
                  >
                    <option value="" disabled>Select a category...</option>
                    <option value="Mains">Mains</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Add-ons">Add-ons</option>
                  </select>
                </div>
              </div>

              {/* Image Upload - BASE64 COMPRESSION */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Item Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-crmDark border border-crmBorder rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-crmAccent/10 file:text-crmAccent hover:file:bg-crmAccent/20 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">Will be automatically compressed.</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-crmBorder flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 text-gray-400 hover:text-white font-medium mr-4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-crmAccent hover:bg-[#964d20] text-white px-8 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-crmAccent/20"
                >
                  {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={20} />}
                  {saving ? 'Saving...' : 'Save Item'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
