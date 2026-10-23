import { Link, useNavigate } from "react-router-dom";
import { Train, User, LogOut, LayoutDashboard, Bell, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { cn } from "../../lib/utils";

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "My Bookings", path: "/my-bookings" },
    { name: "Tatkal", path: "/tatkal" },
  ];

  if (isAdmin) {
    navLinks.push({ name: "Trains", path: "/admin/trains" });
    navLinks.push({ name: "Stations", path: "/admin/stations" });
    navLinks.push({ name: "Users", path: "/admin/users" });
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <Train className="h-6 w-6 text-white" />
            </div>
            <span className={cn(
              "font-bold text-2xl tracking-tighter",
              isScrolled ? "text-primary" : "text-primary"
            )}>
              RailBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium hover:text-secondary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Actions Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <Link to="/notifications" className="relative p-2 hover:bg-muted rounded-xl transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-secondary rounded-full border-2 border-white"></span>
                </Link>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="text-right">
                       <p className="text-xs font-black text-primary leading-tight">{user?.firstName}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Traveler</p>
                    </div>
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                       {user?.firstName ? user.firstName[0] : "U"}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-sm font-bold text-primary hover:bg-gray-50 transition-all rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-3 text-base font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-3 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 font-medium text-red-600"
                  >
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-3 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary text-white px-3 py-3 rounded-lg font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
