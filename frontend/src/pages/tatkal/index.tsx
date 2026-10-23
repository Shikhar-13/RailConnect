import { motion } from "framer-motion";
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ShieldCheck,
  TrendingUp,
  Info,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";

const TatkalSection = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextTatkal = new Date();
      nextTatkal.setHours(10, 0, 0, 0);
      if (now.getHours() >= 10) nextTatkal.setDate(now.getDate() + 1);
      
      const diff = nextTatkal.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
         <div className="absolute inset-0 bg-primary">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         </div>
         
         <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6"
            >
               <Zap className="h-4 w-4 text-secondary fill-secondary" />
               <span className="text-xs font-black text-secondary uppercase tracking-widest">Premium Service</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
              Tatkal <span className="text-secondary">Booking</span>
            </h1>
            <p className="text-white/70 text-lg font-medium max-w-2xl mx-auto">
              Last-minute plans? Secure your journey with our lightning-fast Tatkal booking engine. 
              Optimized for speed when every second counts.
            </p>
         </div>
      </section>

      {/* Countdown & Status */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[48px] p-10 shadow-2xl shadow-primary/5 border border-gray-100">
               <div className="flex flex-wrap items-center justify-between gap-8">
                  <div>
                     <h3 className="text-2xl font-black text-primary mb-2">Next Window Opens In</h3>
                     <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Standard AC Class: 10:00 AM Daily</p>
                  </div>
                  <div className="bg-primary p-8 rounded-[32px] text-white min-w-[240px] text-center shadow-xl shadow-primary/20">
                     <p className="text-4xl font-mono font-black tracking-tighter">{timeLeft}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Countdown to Launch</p>
                  </div>
               </div>
               
               <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-gray-50">
                  <div className="flex gap-4">
                     <div className="bg-secondary/10 p-4 rounded-2xl h-fit">
                        <TrendingUp className="h-6 w-6 text-secondary" />
                     </div>
                     <div>
                        <h4 className="font-bold text-primary mb-1">Dynamic Pricing</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">Tatkal charges are fixed at a percentage of fare at 10% for second class and 30% for other classes.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="bg-primary/5 p-4 rounded-2xl h-fit">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                     </div>
                     <div>
                        <h4 className="font-bold text-primary mb-1">Instant Confirmation</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">Priority allocation system ensures confirmed seats for 20% of train capacity.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-amber-50 rounded-[48px] p-10 border border-amber-100">
               <div className="bg-amber-500 p-4 rounded-3xl inline-flex mb-6 text-white shadow-lg shadow-amber-500/20">
                  <AlertTriangle className="h-8 w-8" />
               </div>
               <h3 className="text-2xl font-black text-amber-900 mb-4">Tatkal Rules</h3>
               <ul className="space-y-4">
                  {[
                    "Booking opens at 10 AM (AC) and 11 AM (Non-AC).",
                    "Max 4 passengers per PNR allowed.",
                    "No refund on cancellation of confirmed tickets.",
                    "Waitlisted tickets follow automatic refund."
                  ].map((rule, i) => (
                    <li key={i} className="flex gap-3 text-sm font-bold text-amber-800/80">
                       <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0" /> {rule}
                    </li>
                  ))}
               </ul>
               <button className="w-full mt-10 bg-amber-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-600/10 hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                  Full Policy <ChevronRight className="h-4 w-4" />
               </button>
            </div>
         </div>
      </div>

      {/* Recommended Tatkal Routes */}
      <section className="py-24 max-w-7xl mx-auto px-4">
         <div className="flex items-center justify-between mb-12">
            <div>
               <h2 className="text-3xl font-black text-primary mb-2">High Demand Routes</h2>
               <p className="text-muted-foreground font-medium">Routes where Tatkal seats sell out in seconds.</p>
            </div>
            <Link to="/" className="text-sm font-black text-secondary uppercase tracking-widest hover:underline">Book Now</Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { route: "Delhi → Mumbai", demand: "Critical", time: "16h" },
              { route: "Bangalore → Chennai", demand: "High", time: "6h" },
              { route: "Kolkata → Patna", demand: "High", time: "9h" }
            ].map((r, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-[40px] border border-transparent hover:bg-white hover:border-gray-100 hover:shadow-xl transition-all group">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Route Info</p>
                 <h4 className="text-xl font-black text-primary mb-6 group-hover:text-secondary transition-colors">{r.route}</h4>
                 <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="h-4 w-4 text-red-500" />
                       <span className="text-xs font-black uppercase text-red-600">{r.demand}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Clock className="h-4 w-4 text-muted-foreground" />
                       <span className="text-xs font-bold">{r.time}</span>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default TatkalSection;
