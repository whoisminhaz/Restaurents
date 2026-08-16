
import { Link } from "react-router-dom";
import { MessageCircle, PhoneCall, CalendarPlus, UtensilsCrossed } from "lucide-react";

export default function MobileBottomBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-charcoal border-t border-charcoal-dark z-50">
      <div className="flex justify-around items-center h-16">
        <Link to="/menu" className="flex flex-col items-center justify-center text-ivory hover:text-gold w-full h-full">
          <UtensilsCrossed size={20} />
          <span className="text-[10px] uppercase mt-1">Menu</span>
        </Link>
        <Link to="/reservations" className="flex flex-col items-center justify-center text-ivory hover:text-gold w-full h-full">
          <CalendarPlus size={20} />
          <span className="text-[10px] uppercase mt-1">Reserve</span>
        </Link>
        <a href="tel:+60147504040" className="flex flex-col items-center justify-center text-ivory hover:text-gold w-full h-full">
          <PhoneCall size={20} />
          <span className="text-[10px] uppercase mt-1">Call</span>
        </a>
        <a href="https://wa.me/60147504040" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center text-ivory hover:text-gold w-full h-full">
          <MessageCircle size={20} />
          <span className="text-[10px] uppercase mt-1">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
