import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Plus,
  Search,
  Edit3,
  Trash2,
  Building2,
  Globe,
  Hash
} from "lucide-react";
import { useState } from "react";
import { authApi, publicApi } from "../../api/axios";
import { StationDto } from "../../types";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AdminStations = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStation, setNewStation] = useState({ name: "", stationCode: "", city: "", state: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: stations, isLoading } = useQuery<StationDto[]>({
    queryKey: ["admin", "stations"],
    queryFn: async () => {
      const { data } = await publicApi.get("/stations");
      return data.data || data || [];
    },
  });

  const handleCreateStation = async () => {
    if (!newStation.name || !newStation.stationCode || !newStation.city || !newStation.state) {
      toast.error("Please fill in all required fields (Name, Code, City, State).");
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.post("/internal/stations", {
        name: newStation.name,
        stationCode: newStation.stationCode.toUpperCase(),
        city: newStation.city,
        state: newStation.state,
      });
      toast.success("Station created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "stations"] });
      setNewStation({ name: "", stationCode: "", city: "", state: "" });
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create station.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStations = stations?.filter(s =>
    (s.name?.toLowerCase() || s.stationName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (s.stationCode?.toLowerCase() || "").includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-black text-primary tracking-tight">Station Directory</h1>
            <p className="text-sm text-muted-foreground font-medium">Manage railway stations across the network.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex bg-white p-3 rounded-2xl shadow-sm border border-gray-100 min-w-[300px]">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <input
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-semibold"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              <Plus className="h-5 w-5" /> Add Station
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-primary/5 p-4 rounded-2xl">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Total Stations</p>
                <h3 className="text-3xl font-black text-primary">{stations?.length || 0}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-secondary/5 p-4 rounded-2xl">
                <Globe className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Network Coverage</p>
                <h3 className="text-3xl font-black text-primary">Active</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-4 rounded-2xl">
                <Hash className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Search Results</p>
                <h3 className="text-3xl font-black text-primary">{filteredStations?.length || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Station Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStations?.map((station, idx) => (
            <motion.div
              key={station.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:shadow-primary/5 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary transition-colors">
                  <MapPin className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <span className="text-xs font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                  {station.stationCode}
                </span>
              </div>
              <h3 className="text-lg font-black text-primary mb-1 group-hover:text-secondary transition-colors">
                {station.name || station.stationName}
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                ID: {station.id}
              </p>
            </motion.div>
          ))}

          {/* Add New Station Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="min-h-[200px] border-4 border-dashed border-gray-100 rounded-[32px] p-8 flex flex-col items-center justify-center text-center gap-4 group hover:border-primary/20 transition-all"
          >
            <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-primary transition-colors">
              <Plus className="h-8 w-8 text-muted-foreground group-hover:text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-primary uppercase tracking-widest text-sm">Add Station</h4>
              <p className="text-xs text-muted-foreground font-medium">Register a new railway station</p>
            </div>
          </button>
        </div>

        {/* Add Station Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-primary/20 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-primary p-3 rounded-2xl">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-primary">Add New Station</h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Network Expansion</p>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Station Name</label>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi"
                      value={newStation.name}
                      onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                      className="w-full bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-4 rounded-2xl font-bold transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Station Code</label>
                    <input
                      type="text"
                      placeholder="e.g. NDLS"
                      maxLength={6}
                      value={newStation.stationCode}
                      onChange={(e) => setNewStation({ ...newStation, stationCode: e.target.value.toUpperCase() })}
                      className="w-full bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-4 rounded-2xl font-bold transition-all outline-none uppercase tracking-widest"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">City</label>
                       <input
                         type="text"
                         placeholder="e.g. New Delhi"
                         value={newStation.city}
                         onChange={(e) => setNewStation({ ...newStation, city: e.target.value })}
                         className="w-full bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-4 rounded-2xl font-bold transition-all outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">State</label>
                       <input
                         type="text"
                         placeholder="e.g. Delhi"
                         value={newStation.state}
                         onChange={(e) => setNewStation({ ...newStation, state: e.target.value })}
                         className="w-full bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-4 rounded-2xl font-bold transition-all outline-none"
                       />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateStation}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <><Plus className="h-4 w-4" /> Create Station</>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminStations;
