import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Utensils, CalendarDays, Star, ChevronRight, Clock, MapPin, 
  Phone, Quote, ChefHat, Award, Users, Coffee, CheckCircle2 
} from 'lucide-react';

const Landing = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    document.title = "Restoran Hadramawt 3 Beradik — Premium Authentic Middle Eastern Dining | Alor Setar";
    const metaDescription = document.querySelector('meta[name="description"]');
    const descContent = "Experience premium Middle Eastern dining, authentic Yemeni spices, Nasi Mandi Ayam, and unforgettable culinary moments at Restoran Hadramawt 3 Beradik in Alor Setar.";
    if (metaDescription) {
      metaDescription.setAttribute("content", descContent);
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = descContent;
      document.head.appendChild(meta);
    }
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    },
    viewport: { once: true, margin: "-100px" }
  };

  const bgPattern = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjAuNVYxOEgwdi0yaDIwdi0ySDB2LTJoMjB2LTJIMFY4aDIwVjZIMFY0aDIwVjJIMFYwaDIydjIwaDJWMGgydjIwaDJWMGgydjIwaDJWMGgydjIwaDJWMGgydjIwaDJ2MkgyMHYtMS41ek0wIDIwaDJ2MjBIMFYyMHptNCAwaDJ2MjBINFYyMHptNCAwaDJ2MjBIOFYyMHptNCAwaDJ2MjBoLTJWMjB6bTQgMGgydjIwaC0yVjIwem00IDRoMjB2MkgyMHYtMnptMCA0aDIwdjJIMjB2LTJ6bTAgNGgyMHYySDIwdi0yem0wIDRoMjB2MkgyMHYtMnoiIGZpbGw9IiNCNTYwMkEiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+";

  const menuCategories = [
    {
      title: "Signature Rice Dishes",
      items: [
        { name: "Nasi Mandi Ayam", desc: "Our famous slow-cooked chicken with smoked basmati rice.", price: "RM 18.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80&w=800" },
        { name: "Nasi Mandi Kambing", desc: "Tender lamb, slow-roasted to perfection with Yemeni spices.", price: "RM 38.00", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800" },
        { name: "Chicken Kabsa", desc: "Richly spiced rice adorned with toasted nuts and raisins.", price: "RM 24.00", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Fresh Appetizers & Breads",
      items: [
        { name: "Roti Bawang", desc: "Freshly baked garlic bread, crispy on the outside, soft inside.", price: "RM 8.00", image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&q=80&w=800" },
        { name: "Classic Hummus", desc: "Creamy chickpea dip with tahini, olive oil, and lemon.", price: "RM 12.00", image: "https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&q=80&w=800" },
        { name: "Crispy Falafel", desc: "Deep-fried spiced chickpea patties served with tahini sauce.", price: "RM 14.00", image: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?auto=format&fit=crop&q=80&w=800" }
      ]
    },
    {
      title: "Desserts & Beverages",
      items: [
        { name: "Cheese Kunafa", desc: "Sweet, warm cheesy pastry soaked in rose-infused syrup.", price: "RM 18.00", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800" },
        { name: "Arabic Coffee", desc: "Traditional brewed coffee with cardamom and saffron.", price: "RM 10.00", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800" },
        { name: "Mint Tea", desc: "Refreshing black tea brewed with fresh mint leaves.", price: "RM 8.00", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-crmDark text-crmText font-sans selection:bg-crmAccent/30 overflow-x-hidden dark">
      {/* Dynamic Background Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: '40px 40px' }}
      ></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-crmDark/85 backdrop-blur-xl border-b border-crmBorder/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-crmAccent/20 flex items-center justify-center border border-crmAccent/30 shadow-[0_0_15px_rgba(181,96,42,0.2)]">
              <span className="text-crmAccent font-serif font-bold text-2xl">H</span>
            </div>
            <div>
              <span className="block text-2xl font-serif font-bold tracking-wide leading-none">Hadramawt</span>
              <span className="block text-xs text-crmAccent tracking-[0.2em] mt-1 uppercase">3 Beradik</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-widest text-gray-300">
            <a href="#about" className="hover:text-crmAccent transition-colors">Our Story</a>
            <a href="#menu" className="hover:text-crmAccent transition-colors">Menu</a>
            <a href="#gallery" className="hover:text-crmAccent transition-colors">Gallery</a>
            <a href="#contact" className="hover:text-crmAccent transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden lg:flex text-sm font-medium px-4 py-2.5 rounded border border-crmBorder hover:bg-crmBorder/50 transition-colors">
              Owner Login
            </Link>
            <Link to="/book" className="bg-crmAccent text-white px-6 py-3 rounded text-sm font-bold shadow-[0_0_20px_rgba(181,96,42,0.3)] hover:bg-crmAccent/90 hover:scale-105 transition-all uppercase tracking-wider">
              Reserve Table
            </Link>
          </div>
        </div>
      </nav>

      {/* Epic Hero Section */}
      <section className="relative min-h-[90vh] pt-32 pb-20 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            style={{ y: y1 }}
            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=2000" 
            alt="Middle Eastern Spices" 
            className="w-full h-[120%] object-cover scale-110 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-crmDark via-crmDark/70 to-crmDark"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--crm-dark)_100%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div 
            initial="initial"
            animate="whileInView"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crmAccent/10 text-crmAccent text-sm font-bold tracking-widest uppercase mb-8 border border-crmAccent/20 backdrop-blur-md">
              <Star className="w-4 h-4 fill-crmAccent" />
              <span>Alor Setar's Finest Hadrami Cuisine</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-8xl font-serif font-bold leading-[1.1] mb-8">
              A Symphony of <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-crmAccent to-orange-400">
                Yemeni Flavors
              </span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl leading-relaxed font-light">
              Experience the legendary Nasi Mandi Ayam and authentic Middle Eastern hospitality at Restoran Hadramawt 3 Beradik. Tradition on every plate.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5">
              <Link to="/book?tab=manage" className="group flex items-center justify-center gap-3 bg-crmAccent text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-crmAccent/90 transition-all shadow-[0_10px_30px_rgba(181,96,42,0.4)] hover:-translate-y-1">
                <CalendarDays className="w-6 h-6" />
                My Reservations
                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link to="/book" className="group flex items-center justify-center gap-3 bg-crmCard/50 backdrop-blur-md border border-crmBorder/50 text-white px-10 py-5 rounded-xl font-bold text-lg hover:border-crmAccent hover:bg-crmCard transition-all hover:-translate-y-1">
                <CalendarDays className="w-6 h-6 text-crmAccent" />
                Book a Table
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="mt-16 flex items-center gap-8 border-t border-crmBorder/50 pt-8">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="flex flex-col">
                  <div className="flex text-crmAccent">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Foodpanda Rating</span>
                </div>
              </div>
              <div className="w-px h-12 bg-crmBorder/50"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-crmAccent/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-crmAccent" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white">100% Authentic</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Hadrami Recipes</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Us / Story Section */}
      <section id="about" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="initial"
              whileInView="whileInView"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeIn}>
                <h2 className="text-crmAccent font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2">
                  <ChefHat className="w-5 h-5" /> Our Story
                </h2>
                <h3 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                  Bringing Yemen to <br/> <span className="text-gray-400">Jalan Tanjung Bendahara</span>
                </h3>
              </motion.div>
              
              <motion.p variants={fadeIn} className="text-gray-400 text-lg leading-relaxed">
                Restoran Hadramawt 3 Beradik was founded on a simple principle: to serve the most authentic, soulful Middle Eastern food in Kedah. We source the finest spices directly from Yemen and prepare our meats using traditional slow-cooking methods.
              </motion.p>
              
              <motion.div variants={fadeIn} className="grid sm:grid-cols-2 gap-6 pt-6">
                <div className="bg-crmCard border border-crmBorder/50 p-6 rounded-2xl hover:border-crmAccent/50 transition-colors">
                  <Award className="w-8 h-8 text-crmAccent mb-4" />
                  <h4 className="text-xl font-bold mb-2">Master Chefs</h4>
                  <p className="text-sm text-gray-400">Our kitchen is led by chefs with decades of experience in Hadrami cuisine.</p>
                </div>
                <div className="bg-crmCard border border-crmBorder/50 p-6 rounded-2xl hover:border-crmAccent/50 transition-colors">
                  <Users className="w-8 h-8 text-crmAccent mb-4" />
                  <h4 className="text-xl font-bold mb-2">Family Friendly</h4>
                  <p className="text-sm text-gray-400">A warm, welcoming environment perfect for large family gatherings.</p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-crmAccent/20 rounded-3xl translate-x-4 translate-y-4 blur-xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200" 
                alt="Restaurant Interior" 
                className="relative rounded-3xl border border-crmBorder shadow-2xl z-10 w-full h-[600px] object-cover"
              />
              <div className="absolute -bottom-8 -left-8 bg-crmDark border border-crmBorder p-6 rounded-2xl shadow-xl z-20 hidden md:block">
                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Established</p>
                <p className="text-3xl font-serif font-bold text-white">In Alor Setar</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Expanded Menu Showcase */}
      <section id="menu" className="py-32 bg-crmCard/30 border-y border-crmBorder/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(181,96,42,0.05),transparent_50%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-crmAccent font-bold tracking-widest uppercase text-sm mb-4">Our Extensive Menu</h2>
            <h3 className="text-4xl md:text-6xl font-serif font-bold mb-6">A Feast for the Senses</h3>
            <p className="text-gray-400 text-lg">From our legendary Nasi Mandi Ayam to freshly baked Roti Bawang and creamy Hummus, explore a menu crafted with passion and authenticity.</p>
          </div>
          
          <div className="space-y-24">
            {menuCategories.map((category, catIdx) => (
              <div key={catIdx}>
                <h4 className="text-2xl font-serif font-bold text-white mb-8 pb-4 border-b border-crmBorder/50 flex items-center gap-3">
                  <span className="w-8 h-1 bg-crmAccent rounded-full"></span>
                  {category.title}
                </h4>
                <div className="grid md:grid-cols-3 gap-8">
                  {category.items.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.15 }}
                      className="group rounded-2xl overflow-hidden bg-crmDark border border-crmBorder hover:border-crmAccent/50 transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(181,96,42,0.1)] flex flex-col"
                    >
                      <div className="relative h-72 overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-crmDark via-crmDark/20 to-transparent opacity-90"></div>
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                          <h4 className="text-2xl font-serif font-bold text-white leading-tight pr-4">{item.name}</h4>
                          <span className="text-crmAccent font-bold bg-crmDark/90 backdrop-blur px-4 py-2 rounded-lg border border-crmBorder shrink-0">{item.price}</span>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <p className="text-gray-400 text-base leading-relaxed mb-8">{item.desc}</p>
                        <Link to="/order" className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-crmAccent flex items-center gap-2 transition-colors">
                          Add to order <span className="w-8 h-px bg-crmBorder group-hover:bg-crmAccent transition-colors"></span> <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <Link to="/order" className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-crmAccent text-crmAccent hover:bg-crmAccent hover:text-white px-10 py-4 rounded-xl transition-all font-bold text-lg tracking-wide uppercase">
              View Complete Menu <Utensils className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-crmAccent font-bold tracking-widest uppercase text-sm mb-4">Reviews</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold">What Our Guests Say</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "The Nasi Mandi Ayam is absolutely the best in Alor Setar. The rice is incredibly flavorful and the chicken falls off the bone.", author: "Ahmad F.", rating: 5 },
              { text: "Foodpanda delivery was fast and the food arrived hot. The Roti Bawang and Hummus are a must-try combination!", author: "Siti N.", rating: 5 },
              { text: "Very authentic Hadrami taste. Reminds me of my travels to the Middle East. Great portion sizes and worth every penny.", author: "Khairul M.", rating: 5 }
            ].map((review, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="bg-crmCard p-8 rounded-2xl border border-crmBorder relative hover:-translate-y-2 transition-transform duration-300"
              >
                <Quote className="w-10 h-10 text-crmAccent/20 absolute top-6 right-6" />
                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-crmAccent text-crmAccent" />)}
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-8 italic">"{review.text}"</p>
                <p className="font-bold text-white">— {review.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Info & Footer */}
      <footer id="contact" className="bg-[#0a0a0a] py-24 relative border-t border-crmBorder">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--crm-accent)_0,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-4 gap-12 mb-16 pb-16 border-b border-crmBorder/30">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-crmAccent/20 flex items-center justify-center border border-crmAccent/30">
                  <span className="text-crmAccent font-serif font-bold text-xl">H</span>
                </div>
                <h4 className="text-3xl font-serif font-bold text-white">Hadramawt 3 Beradik</h4>
              </div>
              <p className="text-gray-400 mb-8 max-w-md leading-relaxed text-lg">
                The premier destination for authentic Middle Eastern and Hadrami cuisine in Alor Setar. Experience the perfect blend of tradition, quality, and hospitality.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-full bg-crmCard border border-crmBorder flex items-center justify-center hover:border-crmAccent hover:text-crmAccent hover:bg-crmAccent/10 transition-all">
                  <span className="font-serif font-bold">f</span>
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-crmCard border border-crmBorder flex items-center justify-center hover:border-crmAccent hover:text-crmAccent hover:bg-crmAccent/10 transition-all">
                  <span className="font-serif font-bold">ig</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold tracking-widest text-sm uppercase text-crmAccent mb-8 border-l-2 border-crmAccent pl-3">Location & Hours</h4>
              <div className="space-y-6">
                <div className="flex gap-4 text-gray-400 group">
                  <MapPin className="w-6 h-6 text-crmAccent shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="leading-relaxed text-sm">No 20, Jalan Tanjung Bendahara,<br/>Bandar Alor Setar,<br/>05300 Alor Setar, Kedah</p>
                </div>
                <div className="flex gap-4 text-gray-400 group">
                  <Phone className="w-6 h-6 text-crmAccent shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="text-sm">+60 3-4256 0678</p>
                </div>
                <div className="flex gap-4 text-gray-400 group">
                  <Clock className="w-6 h-6 text-crmAccent shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="text-sm">Open Daily<br/>11:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold tracking-widest text-sm uppercase text-crmAccent mb-8 border-l-2 border-crmAccent pl-3">Quick Links</h4>
              <div className="flex flex-col gap-4 text-sm font-medium">
                <Link to="/order" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-crmAccent" /> Order via Foodpanda
                </Link>
                <Link to="/book" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-crmAccent" /> Table Reservations
                </Link>
                <Link to="/book?tab=manage" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-crmAccent" /> Manage Reservation
                </Link>
                <Link to="/login" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-crmAccent" /> Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 font-medium">
            <p>&copy; {new Date().getFullYear()} Restoran Hadramawt 3 Beradik. All rights reserved.</p>
            <p className="flex items-center gap-2">Crafted with <Coffee className="w-4 h-4 text-crmAccent" /> in Malaysia</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
