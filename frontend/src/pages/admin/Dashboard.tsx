import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Train, 
  Ticket as TicketIcon, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  Clock,
  MoreVertical,
  Plus
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { authApi } from "../../api/axios";
import { AdminDashboardStats } from "../../types";
import { formatCurrency, formatDate } from "../../lib/utils";
import { cn } from "../../lib/utils";

const COLORS = ["#0F2D5E", "#F97316", "#16A34A", "#DC2626"];

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery<AdminDashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } = await authApi.get("/admin/dashboard");
      return data.data || data;
    },
  });

  const chartData = [
    { name: "Day 1", bookings: 400 },
    { name: "Day 2", bookings: 300 },
    { name: "Day 3", bookings: 500 },
    { name: "Day 4", bookings: 280 },
    { name: "Day 5", bookings: 590 },
    { name: "Day 6", bookings: 320 },
    { name: "Day 7", bookings: 480 },
  ];

  const pieData = [
    { name: "Normal", value: 400 },
    { name: "Tatkal", value: 300 },
  ];

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
            <h1 className="text-3xl font-black text-primary tracking-tight">Admin Console</h1>
            <p className="text-sm text-muted-foreground font-medium">Real-time system health and performance overview.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white border-2 border-gray-100 p-3 rounded-2xl hover:border-primary transition-all">
               <Clock className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
               <Plus className="h-4 w-4" /> Create New Train
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Total Users", value: stats?.totalUsers || 1240, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Active Trains", value: stats?.activeTrains || 42, icon: Train, color: "text-primary", bg: "bg-primary/5" },
            { title: "Total Bookings", value: stats?.totalBookingsToday || 320, icon: TicketIcon, color: "text-secondary", bg: "bg-secondary/5" },
            { title: "Revenue Today", value: formatCurrency(stats?.revenueToday || 84250), icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform", kpi.bg)}>
                    <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                 </div>
                 <div className="flex items-center gap-1 text-green-500 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">
                    <TrendingUp className="h-3 w-3" /> +12%
                 </div>
              </div>
              <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-black text-primary tracking-tighter">{kpi.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
           {/* Main Line Chart */}
           <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-10">
                 <h4 className="font-black text-primary uppercase tracking-widest text-sm">Booking Trends (Last 7 Days)</h4>
                 <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none">
                    <option>Weekly</option>
                    <option>Monthly</option>
                 </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 800, color: '#0F2D5E' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#0F2D5E" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#0F2D5E', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Pie Chart */}
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
              <h4 className="font-black text-primary uppercase tracking-widest text-sm mb-10 text-center">Booking Split</h4>
              <div className="h-[250px] w-full flex-grow">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {pieData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-4">
                 {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                       <span className="text-[10px] font-black uppercase text-muted-foreground">{d.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h4 className="font-black text-primary uppercase tracking-widest text-sm">Recent Activity</h4>
              <button className="text-xs font-black text-secondary hover:underline flex items-center gap-1">
                 View All Bookings <ArrowUpRight className="h-3 w-3" />
              </button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">PNR</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">User</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Train</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Amount</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {(stats?.recentBookings || [1,2,3,4]).map((booking: any, i) => (
                       <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 font-mono font-black text-primary">{booking.pnr || "8472910351"}</td>
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-gray-900">{booking.userName || "Alex Johnson"}</p>
                             <p className="text-[10px] text-muted-foreground font-medium">alex@example.com</p>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-primary">{booking.trainName || "Express 202"}</p>
                             <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Sleeper Class</p>
                          </td>
                          <td className="px-8 py-6 font-black text-sm">{formatCurrency(booking.totalFare || 850)}</td>
                          <td className="px-8 py-6 text-right">
                             <button className="p-2 hover:bg-white rounded-xl transition-colors">
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
