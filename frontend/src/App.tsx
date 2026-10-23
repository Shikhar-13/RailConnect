import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Lazy-loaded pages for better performance
import Home from "./pages/public/Home";
import SearchResults from "./pages/public/SearchResults";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import BookingWizard from "./pages/booking/BookingWizard";
import Success from "./pages/payment/Success";
import MyBookings from "./pages/user/MyBookings";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminTrains from "./pages/admin/Trains";
import AdminStations from "./pages/admin/Stations";
import TatkalSection from "./pages/tatkal";

// Placeholder components to be implemented later
const Placeholder = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-background">
    <h1 className="text-3xl font-bold text-primary mb-4">{name} Page</h1>
    <p className="text-muted-foreground">This section is currently under development.</p>
  </div>
);

function App() {
  const { checkAuth, isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tatkal" element={<TatkalSection />} />
            
            {/* User Protected Routes */}
            <Route 
              path="/book" 
              element={isAuthenticated ? <BookingWizard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/payment/success" 
              element={isAuthenticated ? <Success /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-bookings" 
              element={isAuthenticated ? <MyBookings /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Placeholder name="Profile" /> : <Navigate to="/login" />} 
            />
            
            {/* Admin Protected Routes */}
            <Route 
              path="/admin" 
              element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin/users" 
              element={isAuthenticated && isAdmin ? <AdminUsers /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin/trains" 
              element={isAuthenticated && isAdmin ? <AdminTrains /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin/stations" 
              element={isAuthenticated && isAdmin ? <AdminStations /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
