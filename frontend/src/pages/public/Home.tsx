import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Map, 
  Clock, 
  ChevronRight, 
  Star, 
  TrendingUp,
  CreditCard,
  Train as TrainIcon
} from "lucide-react";
import TrainSearchWidget from "../../components/search/TrainSearchWidget";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../api/axios";
import { TrainSummaryDto } from "../../types";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../../store/useBookingStore";
import { toast } from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const { setSelection } = useBookingStore();

  const { data: allTrains, isLoading } = useQuery<TrainSummaryDto[]>({
    queryKey: ["trains", "all"],
    queryFn: async () => {
      const { data } = await publicApi.get("/trains");
      return data.data || data || [];
    },
  });

  const handleQuickBook = (train: TrainSummaryDto) => {
    // Clear previous selection and navigate with trainId
    setSelection({
      selectedTrainId: train.trainId,
      selectedScheduleId: null,
      selectedClassType: train.seatAvailabilities?.[0]?.classType || "SL",
    });
    navigate(`/book?trainId=${train.trainId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[550px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=2000" 
            alt="Moving Train"
            className="w-full h-full object-cover scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 backdrop-blur-[2px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              The Smarter Way to <span className="text-secondary">Explore</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 font-medium">
              Book train tickets instantly, track live status, and enjoy seamless journeys across India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Widget Container */}
      <TrainSearchWidget />

      {/* Stats Quick Row */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-b pb-12">
            {[
              { icon: Map, title: "10,000+ Trains", desc: "Connecting every corner of the nation" },
              { icon: TrendingUp, title: "500+ Stations", desc: "Direct routes to major cities" },
              { icon: Clock, title: "Book in 60s", desc: "Fastest checkout experience" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="bg-primary/5 p-4 rounded-2xl mb-4 group-hover:bg-primary transition-colors">
                  <item.icon className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 animate-pulse h-[250px]"></div>
              ))
            ) : (
              allTrains?.map((train) => (
                <motion.div
                  key={train.trainId}
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer group flex flex-col justify-between"
                  onClick={() => handleQuickBook(train)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-secondary/10 p-3 rounded-2xl group-hover:bg-secondary transition-all">
                        <TrainIcon className="h-6 w-6 text-secondary group-hover:text-white" />
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">4.9 Preferred</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-primary text-xl tracking-tight group-hover:text-secondary transition-colors line-clamp-1">{train.trainName}</h4>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{train.trainNumber}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Starts from</span>
                        <span className="font-black text-secondary text-lg">₹{train.seatAvailabilities?.[0]?.estimatedFare || "450"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</span>
                        <span className="block font-bold text-primary text-sm">~{train.totalDistance ? (train.totalDistance / 60).toFixed(1) : "8.5"}h</span>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-lg shadow-primary/10">
                      Book Journey Now
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
              <img 
                src="https://images.unsplash.com/photo-1594264539091-fe64f16cc363?auto=format&fit=crop&q=80&w=1000"
                alt="Safe Travel"
                className="rounded-[40px] shadow-2xl relative z-10 w-full object-cover h-[500px]"
              />
              <div className="absolute bottom-10 right-10 bg-white p-6 rounded-3xl shadow-xl z-20 flex items-center gap-4 border border-primary/5 animate-bounce-slow">
                <div className="bg-green-100 p-3 rounded-2xl">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h5 className="font-bold text-primary">IRCTC Authorized</h5>
                  <p className="text-xs text-muted-foreground">Certified booking partner</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-primary leading-tight">
                Why choosing <span className="text-secondary">RailBook</span> is the best decision for your journey
              </h2>
              <div className="space-y-6">
                {[
                  { icon: ShieldCheck, title: "Secure Payments", desc: "Your transactions are protected by industry-leading Stripe encryption." },
                  { icon: Clock, title: "Real-time Updates", desc: "Get instant notifications for PNR status upgrades and train delays." },
                  { icon: CreditCard, title: "Instant Refunds", desc: "Fastest refund processing on tickets cancellation, directly to source." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary transition-colors shrink-0">
                      <item.icon className="h-6 w-6 text-primary group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="bg-primary text-white py-4 px-10 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                Explore All Features
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
