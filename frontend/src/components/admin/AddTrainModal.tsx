import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
  Train as TrainIcon,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi, publicApi } from "../../api/axios";
import { StationDto } from "../../types";
import { toast } from "react-hot-toast";

interface AddTrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TRAIN_TYPES = ["Express", "Superfast", "Mail", "Duronto", "Rajdhani", "Shatabdi", "Passenger"];
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const CLASSES = ["SLEEPER", "AC3", "AC2", "AC1"];

const AddTrainModal = ({ isOpen, onClose, onSuccess }: AddTrainModalProps) => {
  const [step, setStep] = useState(1);
  const [stations, setStations] = useState<StationDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTrainId, setCreatedTrainId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    trainNumber: "",
    trainName: "",
    trainType: "Express",
    description: "",
    operatingDays: [] as string[],
    seatClasses: [] as any[],
    routes: [] as any[],
    schedules: [] as any[],
  });

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data } = await publicApi.get("/stations");
        setStations(data.data || data || []);
      } catch (err) {
        console.error("Failed to fetch stations", err);
      }
    };
    if (isOpen) {
      fetchStations();
      setStep(1);
      setCreatedTrainId(null);
    }
  }, [isOpen]);

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter(d => d !== day)
        : [...prev.operatingDays, day]
    }));
  };

  const addSeatClass = () => {
    setFormData(prev => ({
      ...prev,
      seatClasses: [...prev.seatClasses, { class_type: "SLEEPER", total_seats: 72, fare_per_km: 1.5, coach_count: 10 }]
    }));
  };

  const addRouteStop = () => {
    const firstStation = stations[0];
    setFormData(prev => ({
      ...prev,
      routes: [...prev.routes, {
        station_id: firstStation?.id,
        station_name: firstStation?.stationName,
        station_code: firstStation?.stationCode,
        stop_order: prev.routes.length + 1,
        arrival_time: "10:00:00",
        departure_time: "10:05:00",
        distance_from_source: 0
      }]
    }));
  };

  const addSchedule = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, { departure_date: dateStr, status: "ACTIVE", auto_generate_availability: true }]
    }));
  };

  const handleCreateTrain = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Train via Admin API
      const coachLayout: Record<string, number> = {};
      formData.seatClasses.forEach(sc => {
        coachLayout[sc.class_type] = sc.coach_count || 1;
      });

      const trainPayload = {
        train_number: formData.trainNumber,
        train_name: formData.trainName,
        train_type: formData.trainType,
        description: formData.description,
        operating_days: formData.operatingDays,
        coach_layout: coachLayout,
        seat_classes: formData.seatClasses.map(sc => ({
          class_type: sc.class_type,
          total_seats: sc.total_seats,
          fare_per_km: sc.fare_per_km
        }))
      };

      const { data: response } = await authApi.post("/admin/trains", trainPayload);
      const trainData = response.data || response;
      const trainId = trainData.id || trainData.trainId;
      setCreatedTrainId(trainId);

      toast.success("Train created successfully! Now add routes.");
      setStep(3);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create train. Please check all fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRoutes = async () => {
    if (!createdTrainId) {
      toast.error("Train must be created first.");
      return;
    }
    setIsSubmitting(true);
    try {
      for (const route of formData.routes) {
        const payload = {
          ...route,
          train_id: createdTrainId
        };
        await authApi.post(`/admin/trains/${createdTrainId}/routes`, payload);
      }
      toast.success("Routes added successfully! Now add schedules.");
      setStep(4);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add routes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSchedules = async () => {
    if (!createdTrainId) {
      toast.error("Train must be created first.");
      return;
    }
    setIsSubmitting(true);
    try {
      for (const schedule of formData.schedules) {
        await authApi.post(`/admin/trains/${createdTrainId}/schedules`, schedule);
      }
      toast.success("Train fully commissioned with schedules!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create schedules.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const STEP_LABELS = ["Configuration", "Capacity", "Route Plan", "Schedules"];

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
          className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl">
                <TrainIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary">Launch New Train</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Administrative Fleet Expansion</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
              <X className="h-5 w-5 text-primary" />
            </button>
          </div>

          {/* Stepper */}
          <div className="px-8 py-6 bg-white flex items-center gap-3 border-b border-gray-50 overflow-x-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2 shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step === s ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : step > s ? "bg-green-500 text-white" : "bg-gray-100 text-muted-foreground"}`}>
                  {step > s ? "✓" : s}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? "text-primary" : "text-muted-foreground"}`}>
                  {STEP_LABELS[s - 1]}
                </span>
                {s < 4 && <div className="w-8 h-px bg-gray-100" />}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto p-10">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Train Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 12951"
                      value={formData.trainNumber}
                      onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                      className="w-full bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-4 rounded-2xl font-bold transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Train Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajdhani Express"
                      value={formData.trainName}
                      onChange={(e) => setFormData({ ...formData, trainName: e.target.value })}
                      className="w-full bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-4 rounded-2xl font-bold transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Train Type</label>
                    <select
                      value={formData.trainType}
                      onChange={(e) => setFormData({ ...formData, trainType: e.target.value })}
                      className="w-full bg-gray-50/50 border-2 border-transparent p-4 rounded-2xl font-bold transition-all outline-none"
                    >
                      {TRAIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Operating Days</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${formData.operatingDays.includes(day) ? "bg-primary text-white" : "bg-gray-50 text-muted-foreground hover:bg-gray-100"}`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Description</label>
                    <textarea
                      rows={4}
                      placeholder="Enter train details, facilities, etc."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-4 rounded-2xl font-bold transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                  <div>
                    <h3 className="text-lg font-black text-primary">Class Configuration</h3>
                    <p className="text-xs text-muted-foreground font-medium">Define seating capacity and price per kilometer.</p>
                  </div>
                  <button
                    onClick={addSeatClass}
                    className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    <Plus className="h-4 w-4" /> Add Class
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {formData.seatClasses.map((sc, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 group hover:border-primary/20 transition-all">
                      <div className="flex-grow grid grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Type</label>
                          <select
                            value={sc.class_type}
                            onChange={(e) => {
                              const newClasses = [...formData.seatClasses];
                              newClasses[i].class_type = e.target.value;
                              setFormData({ ...formData, seatClasses: newClasses });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none"
                          >
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total Seats</label>
                          <input
                            type="number"
                            value={sc.total_seats}
                            onChange={(e) => {
                              const newClasses = [...formData.seatClasses];
                              newClasses[i].total_seats = parseInt(e.target.value);
                              setFormData({ ...formData, seatClasses: newClasses });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Fare per KM</label>
                          <input
                            type="number"
                            step="0.1"
                            value={sc.fare_per_km}
                            onChange={(e) => {
                              const newClasses = [...formData.seatClasses];
                              newClasses[i].fare_per_km = parseFloat(e.target.value);
                              setFormData({ ...formData, seatClasses: newClasses });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Coaches</label>
                          <input
                            type="number"
                            value={sc.coach_count}
                            onChange={(e) => {
                              const newClasses = [...formData.seatClasses];
                              newClasses[i].coach_count = parseInt(e.target.value);
                              setFormData({ ...formData, seatClasses: newClasses });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setFormData({ ...formData, seatClasses: formData.seatClasses.filter((_, idx) => idx !== i) })}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {formData.seatClasses.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/30 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                      <AlertCircle className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground font-medium">No seat classes configured. Click "Add Class" to start.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                  <div>
                    <h3 className="text-lg font-black text-primary">Route Stops</h3>
                    <p className="text-xs text-muted-foreground font-medium">Define stations, timings and stop sequence.</p>
                  </div>
                  <button
                    onClick={addRouteStop}
                    className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    <Plus className="h-4 w-4" /> Add Stop
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.routes.map((route, i) => (
                    <div key={i} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 group hover:border-primary/20 transition-all flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-primary border border-gray-100">
                        {i + 1}
                      </div>

                      <div className="flex-grow grid grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Station</label>
                          <select
                            value={route.station_id}
                            onChange={(e) => {
                              const stationId = parseInt(e.target.value);
                              const selectedStation = stations.find(s => s.id === stationId);
                              const newRoutes = [...formData.routes];
                              newRoutes[i] = {
                                ...newRoutes[i],
                                station_id: stationId,
                                station_name: selectedStation?.stationName,
                                station_code: selectedStation?.stationCode
                              };
                              setFormData({ ...formData, routes: newRoutes });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none text-xs"
                          >
                            {stations.map(s => <option key={s.id} value={s.id}>{s.stationName} ({s.stationCode})</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Arrival</label>
                          <input
                            type="text"
                            placeholder="hh:mm:ss"
                            value={route.arrival_time}
                            onChange={(e) => {
                              const newRoutes = [...formData.routes];
                              newRoutes[i].arrival_time = e.target.value;
                              setFormData({ ...formData, routes: newRoutes });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Departure</label>
                          <input
                            type="text"
                            placeholder="hh:mm:ss"
                            value={route.departure_time}
                            onChange={(e) => {
                              const newRoutes = [...formData.routes];
                              newRoutes[i].departure_time = e.target.value;
                              setFormData({ ...formData, routes: newRoutes });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Dist (KM)</label>
                          <input
                            type="number"
                            step="1"
                            value={route.distance_from_source}
                            onChange={(e) => {
                              const newRoutes = [...formData.routes];
                              newRoutes[i].distance_from_source = parseFloat(e.target.value);
                              setFormData({ ...formData, routes: newRoutes });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none text-xs"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setFormData({ ...formData, routes: formData.routes.filter((_, idx) => idx !== i) })}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {formData.routes.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/30 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                      <MapPin className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground font-medium">No route stops defined. Click "Add Stop" to start.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                  <div>
                    <h3 className="text-lg font-black text-primary">Schedule Dates</h3>
                    <p className="text-xs text-muted-foreground font-medium">Add departure dates when this train will run.</p>
                  </div>
                  <button
                    onClick={addSchedule}
                    className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    <Plus className="h-4 w-4" /> Add Schedule
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.schedules.map((schedule, i) => (
                    <div key={i} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 group hover:border-primary/20 transition-all flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary border border-gray-100">
                        <Calendar className="h-5 w-5" />
                      </div>

                      <div className="flex-grow grid grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Departure Date</label>
                          <input
                            type="date"
                            value={schedule.departure_date}
                            onChange={(e) => {
                              const newSchedules = [...formData.schedules];
                              newSchedules[i].departure_date = e.target.value;
                              setFormData({ ...formData, schedules: newSchedules });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Status</label>
                          <select
                            value={schedule.status}
                            onChange={(e) => {
                              const newSchedules = [...formData.schedules];
                              newSchedules[i].status = e.target.value;
                              setFormData({ ...formData, schedules: newSchedules });
                            }}
                            className="bg-white p-2 rounded-lg font-bold w-full outline-none text-xs"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Auto-generate Seats</label>
                          <div className="flex items-center gap-3 mt-1">
                            <input
                              type="checkbox"
                              checked={schedule.auto_generate_availability}
                              onChange={(e) => {
                                const newSchedules = [...formData.schedules];
                                newSchedules[i].auto_generate_availability = e.target.checked;
                                setFormData({ ...formData, schedules: newSchedules });
                              }}
                              className="h-5 w-5 rounded accent-primary"
                            />
                            <span className="text-xs font-bold text-muted-foreground">Yes</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setFormData({ ...formData, schedules: formData.schedules.filter((_, idx) => idx !== i) })}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {formData.schedules.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/30 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                      <Calendar className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground font-medium">No schedules added. Click "Add Schedule" to create departure dates.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className="px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-0"
            >
              Previous Step
            </button>
            <div className="flex gap-4">
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  Next: Capacity
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={handleCreateTrain}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  {isSubmitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                  {isSubmitting ? "Creating..." : "Create Train & Continue"}
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={handleAddRoutes}
                  disabled={isSubmitting || formData.routes.length === 0}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  {isSubmitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <MapPin className="h-4 w-4" />}
                  {isSubmitting ? "Saving..." : "Save Routes & Continue"}
                </button>
              )}
              {step === 4 && (
                <button
                  onClick={handleAddSchedules}
                  disabled={isSubmitting || formData.schedules.length === 0}
                  className="px-12 py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  {isSubmitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                  {isSubmitting ? "Finishing..." : "Commission Train"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddTrainModal;
