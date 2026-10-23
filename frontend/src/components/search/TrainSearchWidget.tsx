import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Calendar, 
  Train, 
  ArrowRightLeft, 
  Search, 
  ChevronDown 
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { useBookingStore } from "../../store/useBookingStore";

import { publicApi } from "../../api/axios";
import { StationDto } from "../../types";

const CLASSES = [
  { id: "SL", name: "Sleeper (SL)" },
  { id: "3A", name: "AC 3 Tier (3A)" },
  { id: "2A", name: "AC 2 Tier (2A)" },
  { id: "1A", name: "AC First Class (1A)" },
];

const TrainSearchWidget = () => {
  const navigate = useNavigate();
  const setSelection = useBookingStore((state) => state.setSelection);
  
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedClass, setSelectedClass] = useState("SL");
  
  const [stations, setStations] = useState<StationDto[]>([]);
  const [fromSuggestions, setFromSuggestions] = useState<StationDto[]>([]);
  const [toSuggestions, setToSuggestions] = useState<StationDto[]>([]);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data } = await publicApi.get("/stations");
        setStations(data.data || []);
      } catch (error) {
        console.error("Failed to fetch stations", error);
      }
    };
    fetchStations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    
    // In a real app, you'd find the station ID from the name
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&class=${selectedClass}`);
  };

  const swapStations = () => {
    setFrom(to);
    setTo(from);
  };

  // Simple autocomplete logic
  useEffect(() => {
    if (from.length > 1) {
      setFromSuggestions(stations.filter(s => 
        (s.stationName?.toLowerCase() || "").includes(from.toLowerCase()) || 
        (s.stationCode?.toLowerCase() || "").includes(from.toLowerCase())
      ));
    } else {
      setFromSuggestions([]);
    }
  }, [from, stations]);

  useEffect(() => {
    if (to.length > 1) {
      setToSuggestions(stations.filter(s => 
        (s.stationName?.toLowerCase() || "").includes(to.toLowerCase()) || 
        (s.stationCode?.toLowerCase() || "").includes(to.toLowerCase())
      ));
    } else {
      setToSuggestions([]);
    }
  }, [to, stations]);

  return (
    <div className="w-full max-w-5xl mx-auto -mt-24 relative z-10 px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 transition-all hover:shadow-primary/5">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* From Station */}
          <div className="relative group">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block px-2">From</label>
            <div className="flex items-center gap-3 bg-gray-50/50 border-2 border-transparent group-focus-within:border-primary/20 group-focus-within:bg-white rounded-2xl p-4 transition-all">
              <MapPin className="h-5 w-5 text-primary" />
              <input
                type="text"
                placeholder="Living from"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setShowFrom(true); }}
                onFocus={() => setShowFrom(true)}
                className="bg-transparent border-none outline-none w-full font-semibold placeholder:text-gray-400"
              />
            </div>
            
            {showFrom && fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                {fromSuggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setFrom(s.stationCode); setShowFrom(false); }}
                    className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-none transition-colors"
                  >
                    <Train className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-primary">{s.stationName}</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase">{s.stationCode}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <button 
              type="button"
              onClick={swapStations}
              className="absolute -right-3 top-1/2 -translate-y-1/2 mt-3 z-10 bg-white border border-primary/10 shadow-md p-1.5 rounded-full hover:bg-primary hover:text-white transition-all transform hover:rotate-180 duration-500"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>

          {/* To Station */}
          <div className="relative group">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block px-2">To</label>
            <div className="flex items-center gap-3 bg-gray-50/50 border-2 border-transparent group-focus-within:border-primary/20 group-focus-within:bg-white rounded-2xl p-4 transition-all">
              <MapPin className="h-5 w-5 text-secondary" />
              <input
                type="text"
                placeholder="Going to"
                value={to}
                onChange={(e) => { setTo(e.target.value); setShowTo(true); }}
                onFocus={() => setShowTo(true)}
                className="bg-transparent border-none outline-none w-full font-semibold placeholder:text-gray-400"
              />
            </div>

            {showTo && toSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                {toSuggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setTo(s.stationCode); setShowTo(false); }}
                    className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-none transition-colors"
                  >
                    <Train className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-primary">{s.stationName}</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase">{s.stationCode}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="relative group">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block px-2">Travel Date</label>
            <div className="flex items-center gap-3 bg-gray-50/50 border-2 border-transparent group-focus-within:border-primary/20 group-focus-within:bg-white rounded-2xl p-4 transition-all h-[58px]">
              <Calendar className="h-5 w-5 text-primary" />
              <input
                type="date"
                min={format(new Date(), "yyyy-MM-dd")}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-semibold"
              />
            </div>
          </div>

          {/* Class Selector and Search button */}
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block px-2">Class</label>
            <div className="flex gap-2">
              <div className="flex-grow">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-gray-50/50 hover:bg-white border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 font-semibold appearance-none outline-none transition-all h-[58px]"
                >
                  {CLASSES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="bg-secondary text-white p-4 rounded-2xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:-translate-y-0.5"
              >
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainSearchWidget;
