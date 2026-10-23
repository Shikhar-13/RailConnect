import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Filter,
  Clock,
  ArrowRight,
  ChevronRight,
  Search,
  Info,
  Calendar,
  AlertCircle,
  Train
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { publicApi } from "../../api/axios";
import { TrainSearchDto, TrainSearchResponse, SeatAvailabilitySummaryDto, RouteDto, ScheduleDto } from "../../types";
import { cn, formatCurrency } from "../../lib/utils";
import { useBookingStore } from "../../store/useBookingStore";
import { toast } from "react-hot-toast";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSelection = useBookingStore(state => state.setSelection);
  const [isEnriching, setIsEnriching] = useState<number | null>(null);

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

  const [filters, setFilters] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
    sleeper: false,
    ac: false,
  });

  const { data: searchResponse, isLoading, error } = useQuery<TrainSearchResponse>({
    queryKey: ["trains", "search", { from, to, date }],
    queryFn: async () => {
      const { data } = await publicApi.get(`/trains/search?from=${from}&to=${to}&date=${date}`);
      return data.data || data;
    },
    enabled: !!from && !!to,
  });

  const trains = searchResponse?.availableTrains || [];

  const handleBookNow = async (train: TrainSearchDto, availability: SeatAvailabilitySummaryDto) => {
    setIsEnriching(train.trainId);
    try {
      // 1. Fetch Routes for Stop Orders & Station IDs
      const { data: routesResponse } = await publicApi.get(`/trains/${train.trainId}/schedule`);
      const routes: RouteDto[] = routesResponse.data;

      const fromRoute = routes.find(r => r.station_code?.toUpperCase() === from.toUpperCase());
      const toRoute = routes.find(r => r.station_code?.toUpperCase() === to.toUpperCase());

      if (!fromRoute || !toRoute) {
        throw new Error("Could not find route segment details for this train.");
      }

      // 2. Fetch/Verify Schedule
      let scheduleId = availability.scheduleId;
      if (!scheduleId) {
        const { data: scheduleResponse } = await publicApi.get(`/trains/${train.trainId}/availability?date=${date}`);
        const schedules: ScheduleDto[] = scheduleResponse.data;
        const matchingSchedule = schedules.find(s => s.departure_date === date);
        scheduleId = matchingSchedule?.id || 1; // Fallback to 1 if not found, but backend should have it
      }

      // 3. Update Store with Full Enriched Data
      setSelection({
        selectedTrainId: train.trainId,
        selectedScheduleId: scheduleId,
        selectedClassType: availability.classType,
        selectedSeatClassId: availability.seatClassId,
        fromStationId: fromRoute.station_id,
        toStationId: toRoute.station_id,
        fromStopOrder: fromRoute.stop_order,
        toStopOrder: toRoute.stop_order,
      });

      navigate(`/book?scheduleId=${scheduleId}&classType=${availability.classType}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to prepare booking. Please try again.");
    } finally {
      setIsEnriching(null);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground font-medium">Finding best trains for your journey...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Strip */}
        <div className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/20 mb-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">From</span>
              <span className="text-xl font-bold">{from}</span>
            </div>
            <ArrowRight className="h-6 w-6 text-secondary" />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">To</span>
              <span className="text-xl font-bold">{to}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/20 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-secondary" />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">Date of Journey</span>
              <span className="text-lg font-bold">{format(new Date(date), "dd MMM yyyy")}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold transition-all"
          >
            Modify Search
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" /> Filters
                </h3>
                <button className="text-xs font-bold text-secondary">Clear All</button>
              </div>

              <div className="space-y-8">
                {/* Departure Time */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Departure Time</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                      <button
                        key={time}
                        className="px-3 py-3 border-2 border-gray-100 rounded-xl text-xs font-bold hover:border-primary transition-all text-center"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class Type */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Class</h4>
                  <div className="space-y-3">
                    {['Sleeper (SL)', 'AC 3 Tier (3A)', 'AC 2 Tier (2A)', 'AC First Class (1A)'].map((cls) => (
                      <label key={cls} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="h-5 w-5 rounded-lg accent-primary" />
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{cls}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Support Tooltip */}
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
              <div className="flex gap-3 items-start">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Prices include all applicable taxes and 5% GST. Tatkal bookings are subject to availability window.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Results List */}
          <main className="lg:col-span-3 space-y-6">
            {trains && trains.length > 0 ? (
              trains.map((train) => (
                <div
                  key={train.trainId}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="p-8">
                    {/* Header: Train Info */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors underline-offset-4 mb-1">
                          {train.trainName}
                        </h3>
                        <p className="text-sm font-black text-muted-foreground tracking-widest uppercase">#{train.trainNumber}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">~{train.totalDistance ? (train.totalDistance / 60).toFixed(1) : "8.5"}h</span>
                      </div>
                    </div>

                    {/* Body: Stations and Times */}
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 mb-10">
                      <div className="text-center md:text-left">
                        <p className="text-2xl font-black text-primary mb-1">{train.departureTime}</p>
                        <p className="text-sm font-bold text-muted-foreground uppercase">{searchResponse?.sourceStation}</p>
                      </div>

                      <div className="relative flex flex-col items-center justify-center">
                        <div className="w-full h-px bg-dashed-border relative">
                          <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-gray-300 -translate-y-1/2"></div>
                          <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-gray-300 -translate-y-1/2"></div>
                        </div>
                        <Train className="h-6 w-6 text-gray-200 mt-2" />
                      </div>

                      <div className="text-center md:text-right">
                        <p className="text-2xl font-black text-primary mb-1">{train.arrivalTime}</p>
                        <p className="text-sm font-bold text-muted-foreground uppercase">{searchResponse?.destinationStation}</p>
                      </div>
                    </div>

                    {/* Classes Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {train.seatAvailabilities.map((cls) => (
                        <div
                          key={cls.classType}
                          className="relative p-4 rounded-2xl border-2 border-gray-50 flex flex-col items-center justify-center gap-1 transition-all hover:border-primary/20 bg-gray-50/30"
                        >
                          <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">{cls.classType}</span>
                          <span className="text-xl font-bold text-primary">{formatCurrency(cls.estimatedFare)}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              cls.availableSeats > 20 ? "bg-green-500" : cls.availableSeats > 0 ? "bg-amber-500" : "bg-red-500"
                            )}></div>
                            <span className={cn(
                              "text-[10px] font-bold uppercase",
                              cls.availableSeats > 20 ? "text-green-600" : cls.availableSeats > 0 ? "text-amber-600" : "text-red-600"
                            )}>
                              {cls.availableSeats > 0 ? `${cls.availableSeats} Available` : "Sold Out"}
                            </span>
                          </div>

                          <button
                            disabled={cls.availableSeats <= 0 || isEnriching === train.trainId}
                            onClick={() => handleBookNow(train, cls)}
                            className="mt-3 w-full bg-white text-primary border border-primary/20 py-2 rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-primary flex items-center justify-center gap-2"
                          >
                            {isEnriching === train.trainId ? (
                              <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            ) : "BOOK NOW"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expandable Schedule Row */}
                  <div className="bg-gray-50/50 px-8 py-3 flex items-center justify-between border-t border-gray-100 italic">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Info className="h-3 w-3" /> Runs on all days
                    </span>
                    <button className="text-[10px] font-bold text-secondary uppercase flex items-center gap-1 hover:underline">
                      View Route <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[32px] p-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-100">
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-extrabold text-primary mb-2">No Trains Found</h3>
                <p className="text-muted-foreground max-w-sm mb-8 font-medium">
                  We couldn't find any trains for this route on the selected date. Try searching for adjacent dates or changing stations.
                </p>
                <div className="flex gap-4">
                  <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">
                    Next Available Date
                  </button>
                  <button className="px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-primary">
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
