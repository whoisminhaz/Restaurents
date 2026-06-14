import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, CalendarDays, Star, ChevronRight, Clock, MapPin, Phone } from 'lucide-react';

const Landing = () => {
  useEffect(() => {
    document.title = "Restoran Hadramawt — Premium Authentic Middle Eastern Dining | Kuala Lumpur";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Experience premium Middle Eastern dining, authentic Yemeni spices, Lamb Mandy, and unforgettable culinary moments at Restoran Hadramawt.");
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = "Experience premium Middle Eastern dining, authentic Yemeni spices, Lamb Mandy, and unforgettable culinary moments at Restoran Hadramawt.";
      document.head.appendChild(meta);
    }
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const featuredItems = [
    {
      name: "Lamb Mandy",
      desc: "Slow-cooked tender lamb with smoked basmati rice, served with our signature sahawiq.",
      price: "RM 38.00",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Chicken Kabsa",
      desc: "Richly spiced chicken served over fragrant rice, adorned with toasted nuts and raisins.",
      price: "RM 24.00",
      image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Cheese Kunafa",
      desc: "Sweet, warm cheesy pastry soaked in rose-infused syrup and topped with crushed pistachios.",
      price: "RM 18.00",
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="min-h-screen bg-crmDark text-crmText font-sans selection:bg-crmAccent/30 overflow-x-hidden dark">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-crmDark/80 backdrop-blur-lg border-b border-crmBorder transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-crmAccent/20 flex items-center justify-center border border-crmAccent/30">
              <span className="text-crmAccent font-serif font-bold text-xl">H</span>
            </div>
            <span className="text-2xl font-serif font-bold tracking-wide">Hadramawt</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
            <a href="#menu" className="hover:text-crmAccent transition-colors">Menu</a>
            <a href="#contact" className="hover:text-crmAccent transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:flex text-sm font-medium px-4 py-2 rounded border border-crmBorder hover:bg-crmBorder/50 transition-colors">
              Owner Login
            </Link>
            <Link to="/book" className="bg-crmAccent text-white px-5 py-2.5 rounded text-sm font-bold shadow-lg shadow-crmAccent/20 hover:bg-crmAccent/90 transition-all uppercase tracking-wider">
              Reserve
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=2000" 
            alt="Middle Eastern Spices Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-crmDark via-crmDark/80 to-crmDark"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crmAccent/10 text-crmAccent text-sm font-medium mb-6 border border-crmAccent/20">
              <Star className="w-4 h-4 fill-crmAccent" />
              <span>Experience Authentic Yemeni Cuisine</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
              A Journey Through <br/> <span className="text-crmAccent">Middle Eastern</span> Flavors
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Discover the true essence of Arabian hospitality. From our slow-cooked Lamb Mandy to our wood-fired grills, every dish tells a story of tradition, passion, and perfection.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
              <Link to="/order" className="group flex items-center justify-center gap-2 bg-crmAccent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-crmAccent/90 transition-all shadow-xl shadow-crmAccent/20">
                <Utensils className="w-5 h-5" />
                Order Delivery
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/book" className="group flex items-center justify-center gap-2 bg-crmCard border border-crmBorder text-crmText px-8 py-4 rounded-lg font-bold text-lg hover:border-crmAccent hover:text-crmAccent transition-all">
                <CalendarDays className="w-5 h-5" />
                Book a Table
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Menu */}
      <section id="menu" className="py-24 bg-crmCard border-y border-crmBorder">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-crmAccent font-bold tracking-widest uppercase text-sm mb-3">Our Signatures</h2>
            <h3 className="text-4xl font-serif font-bold">Taste the Tradition</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredItems.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group rounded-2xl overflow-hidden bg-crmDark border border-crmBorder hover:border-crmAccent/50 transition-colors flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-crmDark to-transparent opacity-80"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <h4 className="text-2xl font-serif font-bold">{item.name}</h4>
                    <span className="text-crmAccent font-bold bg-crmDark/80 backdrop-blur px-3 py-1 rounded">{item.price}</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{item.desc}</p>
                  <Link to="/order" className="text-sm font-bold uppercase tracking-wider hover:text-crmAccent flex items-center gap-1 transition-colors">
                    Add to order <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/order" className="inline-flex items-center justify-center gap-2 bg-crmDark border border-crmBorder px-8 py-3 rounded hover:bg-crmBorder/30 transition-colors font-medium">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Info & Footer */}
      <footer id="contact" className="bg-crmDark py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--crm-accent)_0,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 mb-16 pb-12 border-b border-crmBorder/50">
            <div>
              <h4 className="text-2xl font-serif font-bold text-white mb-6">Restoran Hadramawt</h4>
              <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                Bringing the authentic taste of Yemen and the Middle East to the heart of Malaysia. A premium dining experience awaits.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold tracking-widest text-sm uppercase text-crmAccent mb-6">Visit Us</h4>
              <div className="flex gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-crmAccent shrink-0" />
                <p>No 259, Susuran Bandar Baru Mergong,<br/>Alor Setar, Kedah</p>
              </div>
              <div className="flex gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-crmAccent shrink-0" />
                <p>+60 3-4256 0678</p>
              </div>
              <div className="flex gap-3 text-gray-400">
                <Clock className="w-5 h-5 text-crmAccent shrink-0" />
                <p>Open Daily<br/>11:00 AM - 2:00 AM</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold tracking-widest text-sm uppercase text-crmAccent mb-6">Quick Links</h4>
              <div className="flex flex-col gap-3">
                <Link to="/order" className="text-gray-400 hover:text-white transition-colors">Order Delivery</Link>
                <Link to="/book" className="text-gray-400 hover:text-white transition-colors">Table Reservations</Link>
                <Link to="/book?tab=manage" className="text-gray-400 hover:text-white transition-colors">Manage Reservation</Link>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Owner Dashboard</Link>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Restoran Hadramawt. All rights reserved.</p>
            <p>Designed with excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
