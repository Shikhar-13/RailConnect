import { Link } from "react-router-dom";
import { Train, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Train className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tighter text-primary">
                RailBook
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Experience the next generation of railway booking. Fast, secure, and modern travel planning at your fingertips.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-all">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-all">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-muted-foreground hover:text-primary text-sm transition-colors">Home</Link></li>
              <li><Link to="/search" className="text-muted-foreground hover:text-primary text-sm transition-colors">Search Trains</Link></li>
              <li><Link to="/my-bookings" className="text-muted-foreground hover:text-primary text-sm transition-colors">My Bookings</Link></li>
              <li><Link to="/tatkal" className="text-muted-foreground hover:text-primary text-sm transition-colors">Tatkal Status</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Help Center</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-muted-foreground text-sm">Rail Terminal, Gate 4, New Delhi, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-muted-foreground text-sm">support@railbook.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-muted-foreground text-sm">+91 011 2345 6789</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RailBook Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
