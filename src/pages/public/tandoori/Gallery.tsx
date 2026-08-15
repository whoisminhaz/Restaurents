


const IMAGES = [
  { src: "/assets/images/hero_tandoori.jpg", alt: "Restaurant Interior", colSpan: "col-span-1 md:col-span-2", rowSpan: "row-span-2" },
  { src: "/assets/images/menu_kebab.jpg", alt: "Mix Grill Platter", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { src: "/assets/images/menu_biryani.jpg", alt: "Lamb Shank Biryani", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { src: "/assets/images/menu_curry.jpg", alt: "Butter Chicken", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { src: "/assets/images/menu_seafood.jpg", alt: "Grilled Fish", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { src: "/assets/images/menu_naan.jpg", alt: "Fresh Naan", colSpan: "col-span-1 md:col-span-2", rowSpan: "row-span-1" },
];

export default function Gallery() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-ivory mb-6">Gallery</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">A visual taste of our premium dining experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
          {IMAGES.map((img, idx) => (
            <div key={idx} className={`relative rounded-lg overflow-hidden group ${img.colSpan} ${img.rowSpan}`}>
              <img 
                src={img.src} 
                alt={img.alt} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-charcoal-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-ivory font-serif text-xl tracking-wider">{img.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
