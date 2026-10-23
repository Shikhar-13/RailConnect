import { useState } from "react";
import { 
  UserPlus, 
  Trash2, 
  Users, 
  ChevronRight, 
  Plus,
  Info
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "../../store/useBookingStore";
import { useAuthStore } from "../../store/useAuthStore";
import { authApi } from "../../api/axios";
import { PassengerDetail, UserResponse } from "../../types";
import { cn } from "../../lib/utils";

const PassengerForm = () => {
  const { passengers, addPassenger, removePassenger, updatePassenger, bookingType, setSelection } = useBookingStore();
  const { user } = useAuthStore();

  const { data: savedPassengers } = useQuery<PassengerDetail[]>({
    queryKey: ["users", "me", "passengers"],
    queryFn: async () => {
      const { data } = await authApi.get("/users/me/passengers");
      return data;
    },
    enabled: !!user,
  });

  const handleAddEmpty = () => {
    if (passengers.length < 6) {
      addPassenger({
        firstName: "",
        lastName: "",
        age: 0,
        gender: "MALE",
        berthPreference: "NONE",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Journey Stats Header */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="bg-primary/5 p-4 rounded-2xl">
               <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
               <h3 className="text-xl font-black text-primary">Passenger Details</h3>
               <p className="text-sm text-muted-foreground font-medium">Add up to 6 passengers per booking</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase text-secondary">Normal Booking</span>
            <div className="w-12 h-6 bg-gray-100 rounded-full relative p-1 cursor-not-allowed">
               <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            </div>
         </div>
      </div>

      {/* Quick Add from Saved */}
      {savedPassengers && savedPassengers.length > 0 && (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Quick Add Saved Passengers
          </h4>
          <div className="flex flex-wrap gap-3">
            {savedPassengers.map((p, i) => (
              <button
                key={i}
                onClick={() => addPassenger(p)}
                disabled={passengers.length >= 6}
                className="px-5 py-3 rounded-2xl border-2 border-gray-50 hover:border-primary/20 hover:bg-primary/5 transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
              >
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                {p.firstName} {p.lastName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Individual Passenger Cards */}
      <div className="space-y-6">
        {passengers.map((p, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative group animate-in slide-in-from-bottom-4 duration-300">
            <div className="absolute -top-3 left-8 px-4 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest">
              Passenger {i + 1}
            </div>
            
            <button 
              onClick={() => removePassenger(i)}
              className="absolute top-6 right-8 p-2 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">First Name</label>
                <input
                  value={p.firstName}
                  onChange={(e) => updatePassenger(i, { ...p, firstName: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white font-semibold transition-all"
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Last Name</label>
                <input
                  value={p.lastName}
                  onChange={(e) => updatePassenger(i, { ...p, lastName: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white font-semibold transition-all"
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Age</label>
                <input
                  type="number"
                  value={p.age || ""}
                  onChange={(e) => updatePassenger(i, { ...p, age: parseInt(e.target.value || "0") })}
                  className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white font-semibold transition-all"
                  placeholder="Enter age"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Gender</label>
                <select
                  value={p.gender}
                  onChange={(e) => updatePassenger(i, { ...p, gender: e.target.value as any })}
                  className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white font-semibold appearance-none transition-all"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Berth Preference</label>
                <select
                  value={p.berthPreference}
                  onChange={(e) => updatePassenger(i, { ...p, berthPreference: e.target.value as any })}
                  className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white font-semibold appearance-none transition-all"
                >
                  <option value="NONE">No Preference</option>
                  <option value="LOWER">Lower</option>
                  <option value="MIDDLE">Middle</option>
                  <option value="UPPER">Upper</option>
                  <option value="SIDE_LOWER">Side Lower</option>
                  <option value="SIDE_UPPER">Side Upper</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {passengers.length < 6 ? (
          <button
            onClick={handleAddEmpty}
            className="w-full py-10 border-4 border-dashed border-gray-200 rounded-[48px] text-muted-foreground hover:border-primary hover:text-primary transition-all flex flex-col items-center justify-center gap-4 group"
          >
            <div className="p-4 bg-gray-100 rounded-2xl group-hover:bg-primary transition-colors">
              <UserPlus className="h-8 w-8 group-hover:text-white" />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">Add Passenger</span>
          </button>
        ) : (
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4 items-center">
             <div className="bg-amber-500 p-2 rounded-xl text-white">
                <Info className="h-6 w-6" />
             </div>
             <p className="text-sm font-bold text-amber-700">You've reached the maximum limit of 6 passengers per booking.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerForm;
