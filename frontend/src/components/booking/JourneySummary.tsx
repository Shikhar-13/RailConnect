import { 
  Train, 
  MapPin, 
  Clock, 
  ArrowRight,
  Info 
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useBookingStore } from "../../store/useBookingStore";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../api/axios";
import { RouteDto } from "../../types";

const JourneySummary = () => {
  const [searchParams] = useSearchParams();
  const classType = searchParams.get("classType");
  const { bookingType, selectedTrainId, selectedScheduleId, fromStationId, toStationId, selectedDate } = useBookingStore();

  // Fetch dynamic route data
  const { data: routeData } = useQuery<RouteDto[]>({
    queryKey: ["train-route", selectedTrainId],
    queryFn: async () => {
      const { data } = await publicApi.get(`/trains/${selectedTrainId}/schedule`);
      return data.data || data || [];
    },
    enabled: !!selectedTrainId,
  });

  const fromRoute = routeData?.find(r => r.station_id === fromStationId);
  const toRoute = routeData?.find(r => r.station_id === toStationId);

  const trainName = fromRoute ? `Train #${selectedTrainId}` : "Selected Train";
  const trainNumber = selectedTrainId ? String(selectedTrainId) : "--";
  const departureTime = fromRoute?.departure_time || "--:--";
  const arrivalTime = toRoute?.arrival_time || "--:--";
  const fromStationName = fromRoute ? `${fromRoute.station_name} (${fromRoute.station_code})` : "Departure Station";
  const toStationName = toRoute ? `${toRoute.station_name} (${toRoute.station_code})` : "Arrival Station";

  // Calculate duration
  const durationText = (() => {
    if (!fromRoute?.departure_time || !toRoute?.arrival_time) return "-- Duration";
    try {
      const [dH, dM] = fromRoute.departure_time.split(":").map(Number);
      const [aH, aM] = toRoute.arrival_time.split(":").map(Number);
      let diffMins = (aH * 60 + aM) - (dH * 60 + dM);
      if (diffMins < 0) diffMins += 24 * 60;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m Duration`;
    } catch {
      return "-- Duration";
    }
  })();

  return (
    <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-all"></div>
      
      {/* Train Info */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-5">
          <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20">
            <Train className="h-7 w-7 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-black text-primary mb-1 tracking-tight">{trainName}</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">#{trainNumber}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">{classType} Class</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="text-xs font-bold text-primary px-3 py-0.5 rounded-full border border-primary/20 bg-white shadow-sm uppercase tracking-tighter">
                {bookingType} BOOKING
              </span>
              {selectedDate && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-xs font-black text-secondary uppercase tracking-widest">{selectedDate}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-primary/5 shadow-sm">
           <Clock className="h-4 w-4 text-primary" />
           <span className="text-sm font-black text-primary tracking-tight">{durationText}</span>
        </div>
      </div>

      {/* Route Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-12 relative z-10 px-4">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Departure</span>
          </div>
          <p className="text-3xl font-black text-primary mb-1">{departureTime}</p>
          <p className="text-sm font-bold uppercase tracking-tight text-muted-foreground">{fromStationName}</p>
        </div>

        <div className="relative flex flex-col items-center justify-center py-4">
           <div className="w-full h-[3px] bg-primary/10 relative rounded-full">
              <div className="absolute top-1/2 left-0 w-3 h-3 bg-white border-[3px] border-primary rounded-full -translate-y-1/2 shadow-lg shadow-primary/30 animate-pulse"></div>
              <div className="absolute top-1/2 right-0 w-3 h-3 bg-white border-[3px] border-secondary rounded-full -translate-y-1/2 shadow-lg shadow-secondary/30 animate-pulse"></div>
           </div>
           <ArrowRight className="h-5 w-5 text-primary mt-4 opacity-30" />
        </div>

        <div className="text-center md:text-right">
          <div className="flex items-center gap-2 justify-center md:justify-end mb-2">
            <MapPin className="h-4 w-4 text-secondary" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Arrival</span>
          </div>
          <p className="text-3xl font-black text-primary mb-1">{arrivalTime}</p>
          <p className="text-sm font-bold uppercase tracking-tight text-muted-foreground">{toStationName}</p>
        </div>
      </div>
    </div>
  );
};

export default JourneySummary;
