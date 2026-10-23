import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  MoreVertical, 
  UserX, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Mail,
  Phone
} from "lucide-react";
import { useState } from "react";
import { authApi } from "../../api/axios";
import { UserResponse } from "../../types";
import { cn, formatDate } from "../../lib/utils";
import { toast } from "react-hot-toast";

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data: users, isLoading } = useQuery<UserResponse[]>({
    queryKey: ["admin", "users", { page, searchTerm }],
    queryFn: async () => {
      const { data } = await authApi.get("/admin/users");
      // Note: Backend might need pagination/search params
      return data.data || data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (userId: number) => {
      await authApi.put(`/admin/users/${userId}/toggle-status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User status updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update user status.");
    },
  });

  const filteredUsers = users?.filter(u => 
    (u.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (u.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-black text-primary tracking-tight">User Directory</h1>
            <p className="text-sm text-muted-foreground font-medium">Manage traveler accounts and platform permissions.</p>
          </div>
          <div className="flex bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex-grow max-w-md">
             <Search className="h-5 w-5 text-muted-foreground mr-3" />
             <input 
               type="text" 
               placeholder="Search by name, email or mobile..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-transparent border-none outline-none w-full text-sm font-semibold"
             />
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-4">
                 <div className="bg-primary p-2 rounded-xl">
                    <UsersIcon className="h-5 w-5 text-white" />
                 </div>
                 <h4 className="font-black text-primary uppercase tracking-widest text-sm">Registered Travelers</h4>
              </div>
              <button className="bg-white border p-2 rounded-xl hover:border-primary transition-all">
                 <Filter className="h-4 w-4 text-muted-foreground" />
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-white">
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b">Member</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b">Contact Info</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b">Joined Date</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b">Role</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b">Status</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredUsers?.map((u) => (
                       <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black uppercase tracking-tighter text-xs">
                                   {u.firstName[0]}{u.lastName[0]}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-primary">{u.firstName} {u.lastName}</p>
                                   <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{u.nationality}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                   <Mail className="h-3 w-3 text-secondary" /> {u.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                   <Phone className="h-3 w-3 text-secondary" /> {u.mobile}
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 font-bold text-xs text-muted-foreground">{formatDate(new Date().toISOString())}</td>
                          <td className="px-8 py-6">
                             <span className={cn(
                               "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                               u.role === "ADMIN" ? "bg-primary text-white" : "bg-gray-100 text-muted-foreground"
                             )}>
                                {u.role}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end items-center gap-3">
                                <button 
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to toggle status for this user?")) {
                                      toggleStatusMutation.mutate(u.id);
                                    }
                                  }}
                                  className="p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                  title="Disable User"
                                >
                                   <UserX className="h-5 w-5" />
                                </button>
                                <button className="p-2 text-muted-foreground hover:bg-gray-50 rounded-xl">
                                   <MoreVertical className="h-5 w-5" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Pagination */}
           <div className="p-8 bg-gray-50/30 flex items-center justify-between border-t border-gray-50">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Showing 1-10 of {filteredUsers?.length || 0} travelers</p>
              <div className="flex gap-2">
                 <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:border-primary opacity-50 cursor-not-allowed">
                    <ChevronLeft className="h-5 w-5" />
                 </button>
                 <button className="p-3 bg-white border border-gray-200 rounded-2xl hover:border-primary transition-all">
                    <ChevronRight className="h-5 w-5" />
                 </button>
              </div>
           </div>
        </div>

        {/* Admin Tip */}
        <div className="mt-12 bg-primary/5 p-8 rounded-[40px] border border-primary/10 flex items-center gap-6">
           <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/10">
              <ShieldCheck className="h-8 w-8 text-white" />
           </div>
           <div>
              <h5 className="font-bold text-primary mb-1">Administrative Privileges</h5>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                As an admin, you have the authority to manage user accounts, restrict access, and monitor platform usage. Ensure compliance with data privacy regulations.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
