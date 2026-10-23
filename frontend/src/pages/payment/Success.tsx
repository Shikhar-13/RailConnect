import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Download, 
  Home, 
  Ticket as TicketIcon, 
  ArrowRight,
  Printer,
  Copy,
  Check,
  ChevronRight,
  Train
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { authApi, publicApi } from "../../api/axios";
import { BookingResponse, TrainSummaryDto, Station } from "../../types";
import { formatCurrency, formatDate } from "../../lib/utils";
import { toast } from "react-hot-toast";
import TicketPDF from "../../components/booking/TicketPDF";
import { useMemo } from "react";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pnr = searchParams.get("pnr");
  const paymentIntentId = searchParams.get("payment_intent");
  
  const [copied, setCopied] = useState(false);

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

  // 2. Verify Payment & Confirm Booking
  const { data: booking, isLoading, error } = useQuery<BookingResponse>({
    queryKey: ["bookings", "verify", pnr],
    queryFn: async () => {
      // First verify payment
      await authApi.get(`/payments/verify/${pnr}?paymentIntentId=${paymentIntentId}`);
      // Then confirm booking
      const { data } = await authApi.post<any>(`/bookings/${pnr}/confirm`);
      return data.data || data;
    },
    enabled: !!pnr && !!paymentIntentId,
    retry: 2,
  });

  // 3. Resolve names
  const enrichedData = useMemo(() => {
    if (!booking) return null;
    const train = trains?.find(t => t.trainId === booking.trainId);
    const fromStation = stations?.find(s => s.id === booking.fromStationId);
    const toStation = stations?.find(s => s.id === booking.toStationId);

    return {
      trainName: train?.trainName || booking.trainName || "Express Train",
      trainNumber: train?.trainNumber || booking.trainNumber || "00000",
      fromStationName: fromStation?.name || booking.fromStation || "Source Station",
      toStationName: toStation?.name || booking.toStation || "Destination Station",
    };
  }, [booking, trains, stations]);

  const handleCopyPNR = () => {
    if (pnr) {
      navigator.clipboard.writeText(pnr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("PNR copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="relative">
           <div className="h-24 w-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
           <Train className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
        </div>
        <h2 className="mt-8 text-2xl font-black text-primary">Verifying Payment...</h2>
        <p className="text-muted-foreground font-medium">Please do not refresh or close this window.</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-6">
           <CheckCircle2 className="h-16 w-16 text-red-500 rotate-180" />
        </div>
        <h2 className="text-3xl font-black text-primary mb-4">Verification Incomplete</h2>
        <p className="text-muted-foreground max-w-md mb-10 font-medium">
          We couldn't verify your payment automatically. If the amount was deducted, your booking will be confirmed within 1 hour.
        </p>
        <div className="flex gap-4">
           <Link to="/my-bookings" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20">
              Check Booking Status
           </Link>
           <Link to="/" className="bg-white border text-primary px-8 py-4 rounded-2xl font-bold">
              Return Home
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Success Header Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[48px] p-12 shadow-2xl shadow-primary/5 border border-gray-100 text-center mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50"></div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
            className="inline-flex items-center justify-center bg-green-500 p-6 rounded-[32px] text-white shadow-xl shadow-green-500/20 mb-8"
          >
            <CheckCircle2 className="h-12 w-12" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">Booking Confirmed!</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto mb-10">
            A copy of your e-ticket has been sent to your registered email address. Have a safe and pleasant journey!
          </p>

          <div className="inline-flex items-center gap-4 bg-gray-50 border-2 border-dashed border-gray-200 px-8 py-5 rounded-[28px] group transition-all hover:bg-white hover:border-primary/20">
            <div className="text-left">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Your PNR Number</p>
               <p className="text-3xl font-mono font-black text-primary tracking-widest">{booking.pnrNumber}</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <button 
              onClick={handleCopyPNR}
              className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary transition-all active:scale-95"
            >
              {copied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6 text-primary" />}
            </button>
          </div>
        </motion.div>

        {/* E-Ticket Card Layout */}
        <div className="bg-white rounded-[48px] overflow-hidden shadow-sm border border-gray-100 mb-12">
          {/* Ticket Header */}
          <div className="bg-primary p-10 text-white flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                   <Train className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight">{enrichedData?.trainName}</h4>
                  <p className="text-sm font-black text-white/60 tracking-widest uppercase">#{enrichedData?.trainNumber}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-xs font-black uppercase text-white/50 tracking-widest mb-1">Status</p>
                <span className="bg-green-500 px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg shadow-black/20">
                  {booking.status}
                </span>
             </div>
          </div>

          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
               <div>
                  <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Journey Details</h5>
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                           <div className="w-3 h-3 rounded-full border-2 border-primary bg-white"></div>
                           <div className="w-px h-full bg-gray-100 my-1 border-dashed"></div>
                           <div className="w-3 h-3 rounded-full border-2 border-secondary bg-white"></div>
                        </div>
                        <div className="space-y-6 flex-grow">
                           <div>
                              <p className="text-xl font-black text-primary leading-none">06:00 AM</p>
                              <p className="text-xs font-bold text-muted-foreground uppercase">{enrichedData?.fromStationName}</p>
                           </div>
                           <div>
                              <p className="text-xl font-black text-primary leading-none">10:30 PM</p>
                              <p className="text-xs font-bold text-muted-foreground uppercase">{enrichedData?.toStationName}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Fare & Booking</h5>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
                       <span className="text-sm font-bold text-muted-foreground">Class</span>
                       <span className="text-sm font-black text-primary uppercase tracking-widest">{booking.classType}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
                       <span className="text-sm font-bold text-muted-foreground">Category</span>
                       <span className="text-sm font-black text-secondary uppercase tracking-widest">{booking.bookingType}</span>
                    </div>
                    <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                       <span className="text-sm font-bold text-primary">Total Paid</span>
                       <span className="text-lg font-black text-primary">{formatCurrency(booking.totalFare)}</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Passenger Table */}
            <div>
               <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Passenger Details</h5>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-gray-100">
                       <th className="py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Name</th>
                       <th className="py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Age/Sex</th>
                       <th className="py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Seat/Berth</th>
                       <th className="py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {booking.passengers.map((p) => (
                       <tr key={p.ticketPassengerId}>
                         <td className="py-5 font-bold text-primary">{p.firstName} {p.lastName}</td>
                         <td className="py-5 text-sm font-medium text-muted-foreground">{p.age} / {p.gender?.[0] || "?"}</td>
                         <td className="py-5">
                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-black text-primary uppercase">{p.allocatedBerth || "Awaited"}</span>
                         </td>
                         <td className="py-5 text-right">
                            <span className="text-xs font-black text-green-600 uppercase">{p.passengerStatus}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-10 py-6 border-t border-gray-100 flex justify-between items-center italic">
             <p className="text-[10px] font-bold text-muted-foreground">Booked on: {formatDate(booking.bookedAt)}</p>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">RailBook Digital ID: RB-{booking.pnrNumber}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <PDFDownloadLink 
              document={<TicketPDF booking={booking} />} 
              fileName={`ticket-${booking.pnrNumber}.pdf`}
              className="bg-primary text-white p-6 rounded-[32px] font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group hover:scale-[1.02] transition-all"
           >
              {((params: any) => (
                <div className="flex items-center gap-3">
                  {params.loading ? "Preparing..." : "Download E-Ticket"}
                  <Download className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
                </div>
              )) as any}
           </PDFDownloadLink>

           <Link 
              to="/my-bookings"
              className="bg-white border text-primary p-6 rounded-[32px] font-black uppercase text-sm tracking-widest shadow-sm hover:border-primary transition-all flex items-center justify-center gap-3"
           >
              View My Bookings <ChevronRight className="h-5 w-5" />
           </Link>

           <Link 
              to="/"
              className="bg-white border text-primary p-6 rounded-[32px] font-black uppercase text-sm tracking-widest shadow-sm hover:border-primary transition-all flex items-center justify-center gap-3"
           >
              Book Another Journey <Home className="h-5 w-5" />
           </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
