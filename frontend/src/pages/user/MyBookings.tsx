import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Download, 
  XCircle, 
  AlertCircle,
  Train,
  Filter,
  Ticket as TicketIcon,
  ArrowRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { authApi, publicApi } from "../../api/axios";
import { BookingResponse, TrainSummaryDto, Station } from "../../types";
import { cn, formatCurrency, formatDate } from "../../lib/utils";
import { toast } from "react-hot-toast";
import TicketPDF from "../../components/booking/TicketPDF";

const MyBookings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "COMPLETED" | "CANCELLED">("UPCOMING");

  // 1. Fetch metadata for enrichment
  const { data: trains } = useQuery<TrainSummaryDto[]>({
    queryKey: ["trains", "all"],
    queryFn: async () => {
      const { data } = await publicApi.get("/trains");
      return data.data || data || [];
    },
  });

  const { data: stations } = useQuery<Station[]>({
    queryKey: ["stations"],
    queryFn: async () => {
      const { data } = await publicApi.get("/stations");
      return data.data || data || [];
    },
  });

  const { data: bookings, isLoading: isBookingsLoading } = useQuery<BookingResponse[]>({
    queryKey: ["bookings", "my"],
    queryFn: async () => {
      const { data } = await authApi.get("/bookings/my");
      return data.data || data;
    },
  });

  const enrichedBookings = useMemo(() => {
    if (!bookings || !trains || !stations) return bookings;
    return bookings.map(b => {
      const train = trains.find(t => t.trainId === b.trainId);
      const fromSt = stations.find(s => s.id === b.fromStationId);
      const toSt = stations.find(s => s.id === b.toStationId);
      return {
        ...b,
        trainName: train?.trainName || b.trainName || "Express Train",
        trainNumber: train?.trainNumber || b.trainNumber || "00000",
        fromStation: fromSt?.name || b.fromStation || "Source",
        toStation: toSt?.name || b.toStation || "Destination",
      };
    });
  }, [bookings, trains, stations]);

  const cancelMutation = useMutation({
    mutationFn: async (pnrNumber: string) => {
      await authApi.post(`/bookings/${pnrNumber}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "my"] });
      toast.success("Booking cancelled successfully.");
    },
    onError: () => {
      toast.error("Failed to cancel booking. Please try again.");
    },
  });

  const filteredBookings = enrichedBookings?.filter((b) => {
     if (activeTab === "CANCELLED") return b.status === "CANCELLED";
     if (activeTab === "UPCOMING") return b.status === "CONFIRMED" || b.status === "PENDING_PAYMENT" || b.status === "WAITLISTED";
     // Note: In real app, you'd compare current date to journey date for COMPLETED
     return b.status === "CONFIRMED"; 
  });

  const isLoading = isBookingsLoading || !enrichedBookings;

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground font-medium">Fetching your journeys...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
           <div>
             <h1 className="text-4xl font-black text-primary tracking-tight mb-2">My Bookings</h1>
             <p className="text-muted-foreground font-medium">Manage your upcoming trips and travel history.</p>
           </div>
           
           {/* Tabs */}
           <div className="flex bg-white p-1.5 rounded-[22px] border border-gray-100 shadow-sm">
             {["UPCOMING", "COMPLETED", "CANCELLED"].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={cn(
                   "px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all",
                   activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-gray-50"
                 )}
               >
                 {tab}
               </button>
             ))}
           </div>
        </div>

        {/* Bookings List */}
        <div className="grid grid-cols-1 gap-8">
          {filteredBookings && filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div 
                key={booking.ticketId}
                className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                <div className="p-10 flex flex-wrap items-center justify-between gap-10">
                  {/* Left: Journey Info */}
                  <div className="flex-grow space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary p-3 rounded-2xl group-hover:bg-secondary transition-colors">
                        <Train className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-primary group-hover:text-secondary transition-colors underline-offset-4">
                          {booking.trainName}
                        </h3>
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-black text-muted-foreground tracking-widest uppercase">#{booking.trainNumber}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                           <span className="text-xs font-bold text-primary uppercase">{booking.classType} Class</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-2xl px-4">
                       <div className="text-center md:text-left">
                          <p className="text-2xl font-black text-primary leading-none">06:00 AM</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase">{booking.fromStation}</p>
                       </div>
                       
                       <div className="flex flex-col items-center">
                          <div className="w-full h-px bg-dashed-border opacity-30"></div>
                          <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-primary/50">Scheduled Voyage</p>
                       </div>

                       <div className="text-center md:text-right">
                          <p className="text-2xl font-black text-primary leading-none">10:30 PM</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase">{booking.toStation}</p>
                       </div>
                    </div>
                  </div>

                  {/* Middle: Status & PNR */}
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-[32px] border border-gray-100 min-w-[220px]">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">PNR Status</p>
                     <p className="text-2xl font-mono font-black text-primary mb-4 tracking-widest">{booking.pnrNumber}</p>
                     <span className={cn(
                       "px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg shadow-black/10",
                       booking.status === "CONFIRMED" ? "bg-green-500 text-white" : 
                       booking.status === "CANCELLED" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                     )}>
                       {booking.status}
                     </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-3 min-w-[180px]">
                     {booking.status === "CONFIRMED" && (
                       <>
                         <PDFDownloadLink 
                            document={<TicketPDF booking={booking} />} 
                            fileName={`ticket-${booking.pnrNumber}.pdf`}
                            className="bg-primary text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/95 transition-all"
                         >
                            {((params: any) => (
                               <div className="flex items-center gap-2">
                                  <Download className="h-4 w-4" /> E-Ticket
                               </div>
                            )) as any}
                         </PDFDownloadLink>
                         <button 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to cancel this booking? Special refund rules apply.")) {
                                cancelMutation.mutate(booking.pnrNumber);
                              }
                            }}
                            className="bg-white border-2 border-red-50 text-red-600 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                         >
                            <XCircle className="h-4 w-4" /> Cancel Voyage
                         </button>
                       </>
                     )}
                     <Link 
                        to={`/pnr/${booking.pnrNumber}`}
                        className="bg-gray-50 text-muted-foreground p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                     >
                        View More Info <ChevronRight className="h-4 w-4" />
                     </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[48px] p-24 text-center border-2 border-dashed border-gray-100">
               <div className="bg-primary/5 p-8 rounded-full inline-flex mb-8">
                  <TicketIcon className="h-16 w-16 text-primary opacity-30" />
               </div>
               <h3 className="text-3xl font-black text-primary mb-4">No Journeys Discovered</h3>
               <p className="text-muted-foreground font-medium max-w-sm mx-auto mb-12">
                 You haven't booked any trips in this category yet. Your next adventure is just a click away!
               </p>
               <Link to="/" className="bg-secondary text-white px-10 py-5 rounded-[22px] font-black uppercase text-sm tracking-widest shadow-xl shadow-secondary/20 hover:-translate-y-1 transition-all inline-flex items-center gap-3">
                 Plan Your Next Journey <ArrowRight className="h-5 w-5" />
               </Link>
            </div>
          )}
        </div>

        {/* Assistance Tooltip */}
        <div className="mt-16 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-6">
           <div className="bg-amber-100 p-4 rounded-2xl">
              <AlertCircle className="h-8 w-8 text-amber-600" />
           </div>
           <div>
              <h5 className="font-bold text-primary mb-1">Need help with your booking?</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Check our <Link to="#" className="text-secondary font-bold hover:underline">Support Center</Link> for questions regarding Tatkal window timings, Waitlist upgrades, and Cancellation refunds.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
