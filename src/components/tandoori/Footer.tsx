import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Share2, Link as LinkIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal-dark border-t border-charcoal pt-16 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-serif text-2xl font-bold tracking-wider text-ivory mb-4">
              D'FERINGGHI <span className="text-gold">TANDOORI HOUSE</span>
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Experience authentic Pakistani, Indian, Arabian, and Western cuisine at the heart of Batu Ferringhi.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-ivory hover:text-gold transition-colors">
                <LinkIcon size={24} />
              </a>
              <a href="#" className="text-ivory hover:text-gold transition-colors">
                <Share2 size={24} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg text-gold mb-4 uppercase tracking-widest">Contact</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 text-gold flex-shrink-0 mt-1" />
                <span>66, Jalan Batu Ferringhi, 11100 Batu Ferringhi, Pulau Pinang, Malaysia</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-gold flex-shrink-0" />
                <a href="tel:+60147504040" className="hover:text-gold transition-colors">+60 14-750 4040</a>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-gold flex-shrink-0" />
                <a href="mailto:dferingghitandoorihouse@gmail.com" className="hover:text-gold transition-colors">dferingghitandoorihouse@gmail.com</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg text-gold mb-4 uppercase tracking-widest">Hours</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start">
                <Clock size={20} className="mr-2 text-gold flex-shrink-0 mt-1" />
                <div>
                  <p>Monday - Sunday</p>
                  <p className="text-ivory">11:00 AM - 11:30 PM</p>
                </div>
              </li>
            </ul>
            <div className="mt-8">
              <Link href="/reservations" className="inline-block bg-gold hover:bg-gold-light text-charcoal-dark px-6 py-2 rounded font-semibold transition-colors uppercase tracking-wider text-sm">
                Reserve a Table
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-charcoal text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} D'Feringghi Tandoori House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
