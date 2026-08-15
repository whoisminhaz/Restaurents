
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Catering", href: "/catering" },
  ];

  return (
    <nav
      className={clsx(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-charcoal-dark/90 backdrop-blur-md border-b border-charcoal py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="font-serif text-2xl font-bold tracking-wider text-ivory">
              D'FERINGGHI <span className="text-gold">TANDOORI HOUSE</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-ivory hover:text-gold transition-colors text-sm uppercase tracking-widest"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/reservations"
              className="bg-gold hover:bg-gold-light text-charcoal-dark px-6 py-2 rounded font-semibold transition-colors uppercase tracking-wider text-sm"
            >
              Reserve Table
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-ivory hover:text-gold focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-charcoal-dark absolute w-full border-b border-charcoal">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base uppercase tracking-widest text-ivory hover:text-gold"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/reservations"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block mt-4 text-center bg-gold text-charcoal-dark px-6 py-3 rounded font-semibold uppercase tracking-wider"
            >
              Reserve Table
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
