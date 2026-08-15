
import { Link } from "react-router-dom";
import { MessageCircle, PhoneCall } from "lucide-react";

export default function Catering() {
  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center bg-charcoal-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-serif text-ivory mb-6">Catering & Events</h1>
        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
          Bring the premium taste of D'Feringghi Tandoori House to your next event. We offer bespoke catering services for weddings, corporate events, birthday parties, and anniversaries. 
        </p>
        
        <div className="bg-charcoal border border-gold/30 rounded-lg p-10">
          <h2 className="text-2xl font-serif text-gold mb-6">Speak with our Events Manager</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a 
              href="tel:+60164446010" 
              className="flex items-center bg-charcoal-dark border border-gold text-gold hover:bg-gold hover:text-charcoal-dark px-8 py-4 rounded font-bold uppercase tracking-wider transition-all w-full sm:w-auto justify-center"
            >
              <PhoneCall className="mr-2" size={20} />
              Call +60 16-444 6010
            </a>
            <a 
              href="https://wa.me/60164446010?text=I'm%20interested%20in%20catering%20services." 
              target="_blank" rel="noopener noreferrer"
              className="flex items-center bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded font-bold uppercase tracking-wider transition-all w-full sm:w-auto justify-center"
            >
              <MessageCircle className="mr-2" size={20} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
