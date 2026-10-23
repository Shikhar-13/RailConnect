import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Train as TrainIcon, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  ChevronRight,
  MoreVertical,
  Info,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { authApi } from "../../api/axios";
import { TrainResponse } from "../../types";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";
import AddTrainModal from "../../components/admin/AddTrainModal";
import ScheduleModal from "../../components/admin/ScheduleModal";

const AdminTrains = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleModalInfo, setScheduleModalInfo] = useState<{isOpen: boolean, trainId: number, trainName: string}>({
    isOpen: false,
    trainId: 0,
    trainName: ""
  });

  const { data: trains, isLoading } = useQuery<TrainResponse[]>({
    queryKey: ["admin", "trains"],
    queryFn: async () => {
      const { data } = await authApi.get("/admin/trains");
      return data.data || data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (trainId: number) => {
      await authApi.delete(`/admin/trains/${trainId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "trains"] });
      toast.success("Train decommissioned successfully.");
    },
    onError: () => {
      toast.error("Failed to delete train. It might have active bookings.");
    },
  });

  const filteredTrains = trains?.filter(t => 
    (t.trainName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (t.trainNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">Fleet Management</h1>
            <p className="text-sm text-muted-foreground font-medium">Control train configurations, routes, and operational status.</p>
          </div>
          <div className="flex gap-4 items-center">
             <div className="hidden md:flex bg-white p-3 rounded-2xl shadow-sm border border-gray-100 min-w-[300px]">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <input 
                  type="text" 
                  placeholder="ID or Train Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm font-semibold"
                />
             </div>
             <button 
               onClick={() => setIsModalOpen(true)}
               className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
             >
                <Plus className="h-5 w-5" /> Launch New Train
             </button>
          </div>
        </div>

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrains?.map((train) => (
            <div 
              key={train.id || train.trainId}
              className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all group relative animate-in zoom-in-95 duration-300"
            >
              <div className="p-8">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                   <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary transition-colors">
                      <TrainIcon className="h-6 w-6 text-primary group-hover:text-white" />
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2.5 bg-gray-50 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors">
                         <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm("CRITICAL: This will remove the train from the system. Proceed?")) {
                            deleteMutation.mutate(train.id || train.trainId);
                          }
                        }}
                        className="p-2.5 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                         <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                </div>

                {/* Train Info */}
                <div className="space-y-1 mb-8">
                  <h3 className="text-xl font-black text-primary group-hover:text-secondary transition-colors underline-offset-4">
                    {train.trainName}
                  </h3>
                  <div className="flex items-center gap-3">
                     <span className="text-xs font-black text-muted-foreground tracking-widest uppercase">#{train.trainNumber}</span>
                     <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                     <span className="text-[10px] font-black text-primary uppercase tracking-tighter bg-primary/5 px-2 py-0.5 rounded-full">ACTIVE SERVICE</span>
                  </div>
                </div>

                {/* Route Summary */}
                <div className="space-y-6 pt-6 border-t border-gray-50">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      <span>Base Route</span>
                      <span className="text-secondary">Express Line</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-primary" />
                         <span className="text-sm font-bold text-primary">Station A</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-200" />
                      <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-secondary" />
                         <span className="text-sm font-bold text-primary">Station B</span>
                      </div>
                   </div>
                </div>

                {/* Capacity Meters */}
                <div className="mt-8 space-y-4">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-muted-foreground">Class SL Capacity</span>
                         <span className="text-primary">450 Units</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-4/5 rounded-full"></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-muted-foreground">Class 3A Capacity</span>
                         <span className="text-primary">120 Units</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-secondary w-3/5 rounded-full"></div>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setScheduleModalInfo({ 
                    isOpen: true, 
                    trainId: train.id || train.trainId, 
                    trainName: train.trainName 
                  })}
                  className="mt-10 w-full py-4 bg-gray-50 rounded-[20px] font-black uppercase text-[10px] tracking-widest text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20"
                >
                   Manage Schedules <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* New Train Placeholder */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-full min-h-[450px] border-4 border-dashed border-gray-100 rounded-[48px] p-12 flex flex-col items-center justify-center text-center gap-6 group hover:border-primary/20 transition-all"
          >
             <div className="bg-gray-50 p-6 rounded-[28px] group-hover:bg-primary transition-colors">
                <Plus className="h-10 w-10 text-muted-foreground group-hover:text-white" />
             </div>
             <div className="space-y-2">
                <h4 className="font-black text-primary uppercase tracking-widest text-sm">Expand the Fleet</h4>
                <p className="text-xs text-muted-foreground font-medium max-w-[200px]">Add a new locomotive and configure its base route and classes.</p>
             </div>
          </button>
        </div>

        {/* Add Train Modal */}
        <AddTrainModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "trains"] });
          }}
        />

        <ScheduleModal 
          isOpen={scheduleModalInfo.isOpen}
          onClose={() => setScheduleModalInfo({ ...scheduleModalInfo, isOpen: false })}
          trainId={scheduleModalInfo.trainId}
          trainName={scheduleModalInfo.trainName}
        />

        {/* Operational Banner */}
        <div className="mt-16 bg-amber-50 rounded-[40px] p-10 border border-amber-100 flex flex-wrap items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="bg-amber-100 p-4 rounded-3xl">
                 <ShieldAlert className="h-8 w-8 text-amber-600" />
              </div>
              <div className="max-w-xl">
                 <h5 className="text-lg font-black text-amber-800 mb-1">Operational Safety Protocol</h5>
                 <p className="text-sm text-amber-700 font-medium leading-relaxed">
                   Modifying live schedules from this panel will affect all active bookings. High-traffic routes require secondary confirmation before decommissioning trains.
                 </p>
              </div>
           </div>
           <button className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all">
              Acknowledge & Sync
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTrains;
