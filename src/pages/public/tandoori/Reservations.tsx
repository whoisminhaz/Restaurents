
import { useState } from "react";
import { CalendarDays, Clock, Users, Phone, User, MessageSquare } from "lucide-react";

export default function Reservations() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "19:00",
    guests: "2",
    occasion: "Casual Dining",
    requests: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a reference
    const dateObj = new Date();
    const ref = `DFTH-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Format WhatsApp message
    const message = `*Table Reservation Request* %0A%0A*Reference:* ${ref}%0A*Name:* ${formData.name}%0A*WhatsApp:* ${formData.phone}%0A*Date:* ${formData.date}%0A*Time:* ${formData.time}%0A*Guests:* ${formData.guests} pax%0A*Occasion:* ${formData.occasion}%0A*Special Requests:* ${formData.requests || 'None'}%0A%0A_Please confirm availability for this request._`;
    
    // Redirect to WhatsApp
    window.open(`https://wa.me/60147504040?text=${message}`, '_blank');
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-charcoal-dark">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-ivory mb-4">Reserve a Table</h1>
          <p className="text-gray-400">
            For instant confirmation, please fill out the form below. Your request will be sent directly to our WhatsApp reservation desk.
          </p>
        </div>

        <div className="bg-charcoal border border-charcoal-light rounded-xl p-6 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-ivory text-sm font-medium mb-2 uppercase tracking-wider">
                  <User size={16} className="mr-2 text-gold" /> Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-charcoal-dark border border-gray-700 rounded-md py-3 px-4 text-ivory focus:outline-none focus:border-gold transition-colors"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="flex items-center text-ivory text-sm font-medium mb-2 uppercase tracking-wider">
                  <Phone size={16} className="mr-2 text-gold" /> WhatsApp Number
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-charcoal-dark border border-gray-700 rounded-md py-3 px-4 text-ivory focus:outline-none focus:border-gold transition-colors"
                  placeholder="+60 1x-xxx xxxx"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-ivory text-sm font-medium mb-2 uppercase tracking-wider">
                  <CalendarDays size={16} className="mr-2 text-gold" /> Date
                </label>
                <input 
                  type="date" 
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-charcoal-dark border border-gray-700 rounded-md py-3 px-4 text-ivory focus:outline-none focus:border-gold transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="flex items-center text-ivory text-sm font-medium mb-2 uppercase tracking-wider">
                  <Clock size={16} className="mr-2 text-gold" /> Time
                </label>
                <select 
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-charcoal-dark border border-gray-700 rounded-md py-3 px-4 text-ivory focus:outline-none focus:border-gold transition-colors appearance-none"
                >
                  <option value="">Select a time</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                  <option value="22:00">10:00 PM</option>
                </select>
              </div>
            </div>

            {/* Guests & Occasion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-ivory text-sm font-medium mb-2 uppercase tracking-wider">
                  <Users size={16} className="mr-2 text-gold" /> Party Size
                </label>
                <select 
                  name="guests"
                  required
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full bg-charcoal-dark border border-gray-700 rounded-md py-3 px-4 text-ivory focus:outline-none focus:border-gold transition-colors appearance-none"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Person' : 'People'}</option>
                  ))}
                  <option value="21+">More than 20 (Event)</option>
                </select>
              </div>
              <div>
                <label className="flex items-center text-ivory text-sm font-medium mb-2 uppercase tracking-wider">
                  <Star size={16} className="mr-2 text-gold" /> Occasion
                </label>
                <select 
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  className="w-full bg-charcoal-dark border border-gray-700 rounded-md py-3 px-4 text-ivory focus:outline-none focus:border-gold transition-colors appearance-none"
                >
                  <option value="Casual Dining">Casual Dining</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Date Night">Date Night</option>
                  <option value="Other">Other Special Occasion</option>
                </select>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="flex items-center text-ivory text-sm font-medium mb-2 uppercase tracking-wider">
                <MessageSquare size={16} className="mr-2 text-gold" /> Special Requests
              </label>
              <textarea 
                name="requests"
                rows={3}
                value={formData.requests}
                onChange={handleChange}
                className="w-full bg-charcoal-dark border border-gray-700 rounded-md py-3 px-4 text-ivory focus:outline-none focus:border-gold transition-colors resize-none"
                placeholder="Allergies, high chair needed, wheelchair access, etc."
              ></textarea>
            </div>

            <div className="pt-4 border-t border-charcoal-dark">
              <button 
                type="submit"
                className="w-full bg-gold hover:bg-gold-light text-charcoal-dark font-bold text-lg uppercase tracking-wider py-4 rounded-md transition-all flex justify-center items-center"
              >
                Request via WhatsApp
              </button>
              <p className="text-center text-gray-500 text-xs mt-4">
                We will reply shortly to confirm your table.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
