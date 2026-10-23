import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  Train,
  MapPin,
  Calendar,
  Layers,
  Info
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "../../store/useBookingStore";
import { useAuthStore } from "../../store/useAuthStore";
import { authApi, publicApi } from "../../api/axios";
import { cn, formatCurrency } from "../../lib/utils";
import { toast } from "react-hot-toast";

// Sub-components (could be in separate files)
import PassengerForm from "../../components/booking/PassengerForm";
import JourneySummary from "../../components/booking/JourneySummary";
import StripePayment from "../../components/payment/StripePayment";

const STEPS = [
  { id: 1, name: "Passengers", icon: UserPlus },
  { id: 2, name: "Review", icon: Layers },
  { id: 3, name: "Payment", icon: CreditCard },
];

const BookingWizard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scheduleIdFromUrl = searchParams.get("scheduleId");
  const classTypeFromUrl = searchParams.get("classType");
  const trainIdFromUrl = searchParams.get("trainId");

  const { 
    passengers, 
    bookingType, 
    setSelection, 
    currentBooking, 
    setBookingResponse,
    selectedTrainId,
    selectedScheduleId,
    selectedClassType,
    selectedSeatClassId,
    fromStationId,
    toStationId,
    fromStopOrder,
    toStopOrder
  } = useBookingStore();

  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolution Hook for Direct Navigation
  useEffect(() => {
    const resolveBookingData = async () => {
      // Case 1: Simple URL params (from Search Page)
      if (scheduleIdFromUrl && classTypeFromUrl && !selectedScheduleId) {
        setSelection({
          selectedScheduleId: parseInt(scheduleIdFromUrl),
          selectedClassType: classTypeFromUrl
        });
        return;
      }

      // Case 2: Deep Link or QuickBook from Home (only trainId)
      if (trainIdFromUrl && !selectedScheduleId && !isLoadingMetadata) {
        setIsLoadingMetadata(true);
        const tid = parseInt(trainIdFromUrl);

        try {
          // 1. Get Route to find station codes
          const { data: routeRes } = await publicApi.get(`/trains/${tid}/schedule`);
          const routes = routeRes.data || routeRes;
          
          if (!routes || routes.length < 2) {
            toast.error("This train has no configured stops. Please try another journey.", { duration: 5000 });
            navigate("/");
            return;
          }

          const source = routes[0];
          const dest = routes[routes.length - 1];

          // 2. Discover First Available Schedule (scanning next 7 days)
          let trainMatch = null;
          let discoveredDate = "";

          for (let i = 0; i < 7; i++) {
            const scanDate = new Date(new Date().getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            try {
              const { data: searchRes } = await publicApi.get(`/trains/search?from=${source.station_code}&to=${dest.station_code}&date=${scanDate}`);
              const searchData = searchRes.data || searchRes;
              const availableTrains = searchData.availableTrains || [];
              const match = availableTrains.find((t: any) => t.trainId === tid);
              if (match) {
                trainMatch = match;
                discoveredDate = scanDate;
                break;
              }
            } catch (searchErr) {
              console.warn(`Search failed for date ${scanDate}:`, searchErr);
            }
          }

          if (!trainMatch) {
            toast.error("No active schedules found for this train in the next 7 days.");
            navigate("/");
            return;
          }

          // 3. Populate everything
          try {
            const { data: availRes } = await publicApi.get(`/trains/${tid}/availability?date=${discoveredDate}`);
            const schedules = availRes.data || availRes;
            const chosenSchedule = schedules.find((s: any) => s.departureDate === discoveredDate) || schedules[0];

            if (!chosenSchedule) throw new Error("No schedule found even after discovery");

            setSelection({
              selectedTrainId: tid,
              selectedScheduleId: chosenSchedule.id,
              selectedClassType: trainMatch.seatAvailabilities?.[0]?.classType || "SL",
              fromStationId: source.station_id,
              toStationId: dest.station_id,
              fromStopOrder: source.stop_order,
              toStopOrder: dest.stop_order,
              selectedDate: discoveredDate,
            });
            
            if (discoveredDate !== new Date().toISOString().split('T')[0]) {
              toast.success(`Booking opened for next available date: ${discoveredDate}`);
            }
          } catch (availErr) {
            console.error("Availability Fetch Error:", availErr);
            toast.error("Train is currently unavailable for booking.");
            navigate("/");
          }
        } catch (err: any) {
          console.error("Resolution Error:", err);
          toast.error("Failed to load journey details. Please try searching manually.");
          navigate("/");
        } finally {
          setIsLoadingMetadata(false);
        }
      }
    };

    resolveBookingData();
  }, [trainIdFromUrl, scheduleIdFromUrl, classTypeFromUrl, selectedScheduleId, setSelection, navigate, isLoadingMetadata]);

  const handleNextStep = async () => {
    if (step === 1) {
      if (passengers.length === 0) {
        toast.error("Please add at least one passenger");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Create booking on backend
      setIsSubmitting(true);
      try {
        const { data } = await authApi.post("/bookings", {
          scheduleId: selectedScheduleId,
          trainId: selectedTrainId,
          seatClassId: selectedSeatClassId || 1,
          classType: selectedClassType,
          bookingType,
          passengers,
          fromStationId,
          toStationId,
          fromStopOrder,
          toStopOrder,
        });
        setBookingResponse(data);
        setStep(3);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to initiate booking");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const calculateTotal = () => {
    const baseFare = 450; // Mock fare calculation
    const tax = baseFare * 0.05;
    const tatkalSurcharge = bookingType === "TATKAL" ? 150 : 0;
    return (baseFare + tax + tatkalSurcharge) * passengers.length;
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-center max-w-3xl mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-secondary -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>

            <div className="relative z-10 w-full flex justify-between">
              {STEPS.map((s) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-gray-50 transition-all duration-300",
                    step >= s.id ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "bg-white text-muted-foreground"
                  )}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "mt-3 text-[10px] font-black uppercase tracking-widest",
                    step >= s.id ? "text-primary" : "text-muted-foreground"
                  )}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <PassengerForm />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-black text-primary mb-8">Review Journey Details</h3>
                    <JourneySummary />

                    <div className="mt-12 p-8 bg-primary/5 rounded-[32px] border border-primary/10">
                      <h4 className="font-bold text-lg mb-4 text-primary">Passenger Summary</h4>
                      <div className="space-y-4">
                        {passengers.map((p, i) => (
                          <div key={i} className="flex justify-between items-center py-3 border-b border-white">
                            <div>
                              <p className="font-bold">{p.firstName} {p.lastName}</p>
                              <p className="text-xs text-muted-foreground uppercase font-black">{p.gender} • Age {p.age}</p>
                            </div>
                            <span className="text-xs font-bold text-primary bg-white px-3 py-1 rounded-full border">
                              {p.berthPreference} Preference
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground font-medium">
                      <ShieldCheck className="h-6 w-6 text-green-500" />
                      <p>By clicking "Confirm & Pay", you agree to the RailBook terms of service and refund policy.</p>
                    </div>
                  </div>
                </motion.div>
              )}
              {step === 3 && currentBooking && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <StripePayment booking={currentBooking} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {step < 3 && (
              <div className="mt-10 flex justify-between items-center">
                <button
                  onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                  className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Go Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="bg-primary text-white py-5 px-10 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all flex items-center gap-3 group"
                >
                  {isSubmitting ? "Processing..." : step === 1 ? "Review Booking" : "Confirm & Pay"}
                  {!isSubmitting && <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            )}
          </div>

          {/* Fare Summary Sidebar (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-primary mb-6 uppercase tracking-tight">Fare Summary</h3>
                <div className="space-y-4 font-medium">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Fare ({passengers.length} Passengers)</span>
                    <span className="font-bold">{formatCurrency(450 * passengers.length)}</span>
                  </div>
                  {bookingType === "TATKAL" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary font-bold">Tatkal Surcharge</span>
                      <span className="font-bold">{formatCurrency(150 * passengers.length)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (5%)</span>
                    <span className="font-bold">{formatCurrency(calculateTotal() * 0.05)}</span>
                  </div>
                  <div className="pt-6 border-t flex justify-between items-center">
                    <span className="text-lg font-black text-primary">Total Amount</span>
                    <span className="text-2xl font-black text-secondary">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100 flex gap-4 items-center">
                <div className="bg-green-500 p-2 rounded-xl text-white">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-green-700">100% SECURE TRANSACTION</p>
                  <p className="text-[10px] text-green-600/70 font-bold">Encrypted with Stripe SSL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
