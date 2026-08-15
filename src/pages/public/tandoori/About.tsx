


export default function About() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-ivory mb-6">Our Story</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[600px] rounded-lg overflow-hidden border border-gold/30">
            <img src="/assets/images/hero_tandoori.jpg" alt="D'Feringghi Tandoori House" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-gold mb-6">Authentic Flavors, Premium Experience</h2>
            <p className="text-gray-300 mb-6 leading-relaxed text-lg">
              Located in the heart of Batu Ferringhi, Penang, D'Feringghi Tandoori House brings you an exquisite culinary journey across Pakistan, India, and the Middle East. Our chefs use traditional recipes passed down through generations.
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              We are committed to quality. All our meats are strictly Halal-certified. We never use MSG or artificial preservatives. Just pure, wholesome ingredients and authentic spices.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-charcoal p-6 border border-charcoal-light rounded text-center">
                <span className="block text-3xl font-serif text-gold mb-2">10+</span>
                <span className="text-ivory text-sm uppercase tracking-wider">Years Serving</span>
              </div>
              <div className="bg-charcoal p-6 border border-charcoal-light rounded text-center">
                <span className="block text-3xl font-serif text-gold mb-2">100+</span>
                <span className="text-ivory text-sm uppercase tracking-wider">Menu Items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
