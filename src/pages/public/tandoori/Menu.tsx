
import { useState } from "react";


const MENU_CATEGORIES = [
  "Tandoori & Grill",
  "Biryani & Mandi",
  "Curries & Gravies",
  "Seafood",
  "Naan & Bread",
  "Appetizers"
];

const MENU_ITEMS = [
  {
    category: "Tandoori & Grill",
    name: "Tandoori Chicken",
    price: "RM 17.90",
    desc: "Chicken marinated with special blend of spices and yoghurt, grilled over charcoal fire",
    badge: "Signature"
  },
  {
    category: "Tandoori & Grill",
    name: "Mix Grill (1 PAX)",
    price: "RM 69.90",
    desc: "Tandoor platter of chicken, fish, prawn and mutton — the ultimate feast",
    badge: "Best Seller"
  },
  {
    category: "Tandoori & Grill",
    name: "Shish Tawook",
    price: "RM 34.90",
    desc: "Tender juicy chicken marinated in yogurt, lemon, and garlic",
    badge: "Popular"
  },
  {
    category: "Tandoori & Grill",
    name: "Grilled Prawns",
    price: "RM 55.90",
    desc: "Juicy prawns cooked on the grill in spicy garlic lemon butter sauce",
    badge: null
  },
  {
    category: "Biryani & Mandi",
    name: "Chicken Biryani",
    price: "RM 29.90",
    desc: "Fine grain basmati rice cooked with chicken, freshly grounded herbs and aromatic spices",
    badge: "Best Seller"
  },
  {
    category: "Biryani & Mandi",
    name: "Lamb Shank Biryani",
    price: "RM 64.90",
    desc: "Tender lamb shanks with fragrant spices and aromatic basmati rice",
    badge: "Signature"
  },
  {
    category: "Curries & Gravies",
    name: "Butter Chicken",
    price: "RM 29.90",
    desc: "The godfather of all Punjabi dishes — rich tomato sauce with cream and butter",
    badge: "Best Seller"
  },
  {
    category: "Curries & Gravies",
    name: "Paneer Butter Masala",
    price: "RM 24.90",
    desc: "Cottage cheese cubes in a rich, creamy tomato gravy — vegetarian favourite",
    badge: null
  },
  {
    category: "Seafood",
    name: "Grilled Fish (Red Snapper)",
    price: "RM 89.90",
    desc: "Fresh red snapper marinated with garlic, green chilies & special spices",
    badge: "Signature"
  },
  {
    category: "Naan & Bread",
    name: "Garlic Naan",
    price: "RM 7.90",
    desc: "Freshly baked in tandoor, infused with aromatic garlic & butter",
    badge: "Best Seller"
  },
  {
    category: "Naan & Bread",
    name: "Cheese Naan",
    price: "RM 17.90",
    desc: "Soft tandoor bread stuffed with generous melting cheese",
    badge: "Popular"
  },
  {
    category: "Appetizers",
    name: "Hummus",
    price: "RM 18.90",
    desc: "Creamy pureed chickpeas with sesame, perfect as a dip",
    badge: "Popular"
  }
];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("Tandoori & Grill");

  const filteredItems = MENU_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Header */}
      <div className="text-center py-12 px-4">
        <h1 className="text-5xl font-serif text-ivory mb-4">Our Menu</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore our extensive menu featuring authentic flavors from Pakistan, India, and the Middle East. All our meats are 100% Halal certified.
        </p>
      </div>

      {/* Category Nav */}
      <div className="sticky top-16 md:top-20 z-40 bg-charcoal-dark/95 backdrop-blur-md border-y border-charcoal py-4 mb-12">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-6 md:justify-center w-max md:w-auto px-2">
            {MENU_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap uppercase tracking-widest text-sm font-bold transition-colors pb-1 border-b-2 ${
                  activeCategory === category 
                    ? "text-gold border-gold" 
                    : "text-gray-400 border-transparent hover:text-ivory"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {filteredItems.map((item, idx) => (
            <div key={idx} className="border-b border-charcoal border-dashed pb-6 group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <h3 className="text-xl font-serif text-ivory group-hover:text-gold transition-colors">
                    {item.name}
                  </h3>
                  {item.badge && (
                    <span className={`ml-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                      item.badge === "Signature" ? "bg-charcoal text-gold border border-gold/30" :
                      item.badge === "Best Seller" ? "bg-ember text-ivory" :
                      "bg-charcoal text-gray-300"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-gold font-bold ml-4 whitespace-nowrap">{item.price}</span>
              </div>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="mt-20 text-center bg-charcoal border border-charcoal-light p-8 rounded-lg max-w-3xl mx-auto">
          <h4 className="text-2xl font-serif text-ivory mb-4">Craving Something Special?</h4>
          <p className="text-gray-400 mb-6">Our full menu contains over 100 dishes including vegetarian, vegan, and gluten-free options.</p>
          <a 
            href="/reservations" 
            className="inline-block bg-gold text-charcoal-dark font-bold uppercase tracking-wider px-8 py-3 rounded hover:bg-gold-light transition-colors"
          >
            Reserve Your Table
          </a>
        </div>
      </div>
    </div>
  );
}
