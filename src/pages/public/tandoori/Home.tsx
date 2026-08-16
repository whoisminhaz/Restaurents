
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, ChefHat, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/80 via-charcoal-dark/60 to-charcoal-dark z-10" />
          <img src="/assets/images/hero_tandoori.jpg" alt="D'Feringghi Tandoori House Interior" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-16">
          <div className="inline-flex items-center space-x-2 bg-charcoal-dark/80 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
            <Star className="text-gold w-4 h-4 fill-gold" />
            <span className="text-ivory text-sm uppercase tracking-widest font-medium">4.6/5 on Google Reviews</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-ivory mb-6 leading-tight">
            The Crown Jewel of <br />
            <span className="text-gold italic">Batu Ferringhi</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
            Premium Halal Pakistani, Indian, Arabian & Western Cuisine. <br />
            Just a 3-minute walk from the beach.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/reservations" 
              className="bg-gold hover:bg-gold-light text-charcoal-dark px-8 py-4 rounded font-bold uppercase tracking-wider transition-all w-full sm:w-auto text-center"
            >
              Reserve a Table
            </Link>
            <Link 
              href="/menu" 
              className="bg-charcoal-dark/50 hover:bg-charcoal-dark border border-gold text-gold px-8 py-4 rounded font-bold uppercase tracking-wider transition-all w-full sm:w-auto text-center backdrop-blur-sm"
            >
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <section className="bg-charcoal border-y border-charcoal-dark py-8 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="text-gold w-8 h-8 mb-2" />
              <span className="text-ivory font-semibold uppercase tracking-wider text-sm">100% Halal</span>
            </div>
            <div className="flex flex-col items-center">
              <ChefHat className="text-gold w-8 h-8 mb-2" />
              <span className="text-ivory font-semibold uppercase tracking-wider text-sm">No MSG</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="text-gold w-8 h-8 mb-2" />
              <span className="text-ivory font-semibold uppercase tracking-wider text-sm">Open Daily till 11:30PM</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="text-gold w-8 h-8 mb-2" />
              <span className="text-ivory font-semibold uppercase tracking-wider text-sm">Prime Location</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Signature Dishes */}
      <section className="py-24 bg-charcoal-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-gold font-sans uppercase tracking-[0.2em] text-sm font-bold mb-4">Our Masterpieces</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-ivory">Signature Dishes</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dish 1 */}
            <div className="group rounded-lg overflow-hidden bg-charcoal border border-charcoal-light hover:border-gold/50 transition-colors">
              <div className="relative h-64 overflow-hidden">
                <img src="/assets/images/menu_biryani.jpg" alt="Lamb Shank Biryani" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-charcoal-dark/90 text-gold text-xs font-bold px-3 py-1 uppercase tracking-wider rounded backdrop-blur-sm">
                  Signature
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-serif text-ivory">Lamb Shank Biryani</h4>
                  <span className="text-gold font-bold">RM 64.90</span>
                </div>
                <p className="text-gray-400 text-sm">Tender lamb shanks with fragrant spices and aromatic basmati rice, a true feast for the senses.</p>
              </div>
            </div>

            {/* Dish 2 */}
            <div className="group rounded-lg overflow-hidden bg-charcoal border border-charcoal-light hover:border-gold/50 transition-colors">
              <div className="relative h-64 overflow-hidden">
                <img src="/assets/images/menu_kebab.jpg" alt="Mix Grill" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-ember text-ivory text-xs font-bold px-3 py-1 uppercase tracking-wider rounded backdrop-blur-sm">
                  Best Seller
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-serif text-ivory">Mix Grill Platter</h4>
                  <span className="text-gold font-bold">RM 69.90</span>
                </div>
                <p className="text-gray-400 text-sm">The ultimate feast. Tandoor platter of succulent chicken, fish, prawn and mutton.</p>
              </div>
            </div>

            {/* Dish 3 */}
            <div className="group rounded-lg overflow-hidden bg-charcoal border border-charcoal-light hover:border-gold/50 transition-colors">
              <div className="relative h-64 overflow-hidden">
                <img src="/assets/images/menu_curry.jpg" alt="Butter Chicken" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-charcoal-dark/90 text-gold text-xs font-bold px-3 py-1 uppercase tracking-wider rounded backdrop-blur-sm">
                  Popular
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-serif text-ivory">Butter Chicken</h4>
                  <span className="text-gold font-bold">RM 29.90</span>
                </div>
                <p className="text-gray-400 text-sm">The godfather of Punjabi dishes — rich, creamy tomato sauce infused with authentic spices and butter.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/menu" className="inline-flex items-center text-gold hover:text-gold-light uppercase tracking-widest text-sm font-bold group">
              Explore Full Menu 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
