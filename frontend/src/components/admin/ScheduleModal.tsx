import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Calendar,
  AlertCircle,
  Save,
  Trash2,
  History,
  CheckCircle2,
  XCircle,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi, publicApi } from "../../api/axios";
import { ScheduleDto } from "../../types";
import { toast } from "react-hot-toast";
import { cn, formatDate } from "../../lib/utils";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainId: number;
  trainName: string;
}

const ScheduleModal = ({ isOpen, onClose, trainId, trainName }: ScheduleModalProps) => {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const { data } = await publicApi.get(`/trains/${trainId}/availability`);
      setSchedules(data.data || data || []);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
      toast.error("Could not load existing schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && trainId) {
      fetchSchedules();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setNewDate(tomorrow.toISOString().split("T")[0]);
      setStatus("ACTIVE");
    }
  }, [isOpen, trainId]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      toast.error("Please select a date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        departure_date: newDate,
        status: status,
        auto_generate_availability: true
      };
      
      await authApi.post(`/admin/trains/${trainId}/schedules`, payload);
      toast.success("Schedule created successfully!");
      fetchSchedules();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/20 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/10">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary">{trainName}</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Schedule Management Board</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
              <X className="h-5 w-5 text-primary" />
            </button>
          </div>

          <div className="flex-grow overflow-hidden flex">
            {/* Left: Schedule List */}
            <div className="w-2/3 border-r border-gray-100 bg-white overflow-y-auto p-8">
              <div className="flex items-center gap-3 mb-8">
                 <History className="h-5 w-5 text-secondary" />
                 <h3 className="text-sm font-black text-primary uppercase tracking-tighter">Existing Runs</h3>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Synchronizing...</p>
                </div>
              ) : schedules.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {schedules.sort((a, b) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime()).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-primary/10 hover:bg-white transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                            s.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                          )}>
                             {s.status === "ACTIVE" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          </div>
                          <div>
                             <p className="font-extrabold text-primary">{formatDate(s.departure_date)}</p>
                             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Run ID: #{s.id}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter",
                            s.status === "ACTIVE" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                          )}>
                             {s.status}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50/30 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                  <AlertCircle className="h-10 w-10 text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground font-medium">No active schedules discovered for this train.</p>
                </div>
              )}
            </div>

            {/* Right: Add Schedule Form */}
            <div className="w-1/3 bg-gray-50/50 p-8 flex flex-col">
               <div className="flex items-center gap-3 mb-8">
                  <Plus className="h-5 w-5 text-secondary" />
                  <h3 className="text-sm font-black text-primary uppercase tracking-tighter">Add New Date</h3>
               </div>

               <form onSubmit={handleAddSchedule} className="space-y-6 flex-grow flex flex-col">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Departure Date</label>
                     <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50 group-focus-within:text-primary transition-colors" />
                        <input 
                           type="date"
                           value={newDate}
                           onChange={(e) => setNewDate(e.target.value)}
                           className="w-full bg-white border-2 border-transparent focus:border-primary/20 p-4 pl-12 rounded-2xl font-bold transition-all outline-none shadow-sm"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Service Status</label>
                     <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-white border-2 border-transparent focus:border-primary/20 p-4 rounded-2xl font-bold transition-all outline-none shadow-sm appearance-none"
                     >
                        <option value="ACTIVE">ACTIVE SERVICE</option>
                        <option value="CANCELLED">CANCELLED/MAINTENANCE</option>
                     </select>
                  </div>

                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mt-4">
                     <div className="flex gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tighter">
                           Automation Note: Creating this schedule will generate seat inventory for all configured classes automatically.
                        </p>
                     </div>
                  </div>

                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full bg-primary text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group mt-auto"
                  >
                     {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                        <>
                           Authorize Run <Save className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        </>
                     )}
                  </button>
               </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScheduleModal;
