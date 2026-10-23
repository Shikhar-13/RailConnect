import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Train, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import { cn } from "../../lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      toast.success("Welcome back to RailBook!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto"
      >
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
              <Train className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black text-primary tracking-tighter">RailBook</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Login to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-secondary hover:underline font-bold">
              Join the journey today
            </Link>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-10 px-8 rounded-[40px] shadow-2xl shadow-primary/5 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-shake">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 focus-within:z-10">
              <label className="text-xs font-black uppercase text-muted-foreground tracking-widest px-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className={cn(
                    "block w-full pl-11 pr-4 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all font-semibold",
                    errors.email ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-primary/20 focus:bg-white"
                  )}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="text-xs font-bold text-red-500 px-2 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Password</label>
                <Link to="#" className="text-[10px] font-black uppercase text-secondary hover:underline tracking-widest">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "block w-full pl-11 pr-12 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all font-semibold",
                    errors.password ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-primary/20 focus:bg-white"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-bold text-red-500 px-2 mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Proceed to Login <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            {/* Social Placeholder */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                <span className="px-4 bg-white text-muted-foreground">Or connect with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button type="button" className="flex items-center justify-center py-4 border-2 border-gray-50 rounded-2xl bg-gray-50/50 opacity-50 cursor-not-allowed">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Google</span>
               </button>
               <button type="button" className="flex items-center justify-center py-4 border-2 border-gray-50 rounded-2xl bg-gray-50/50 opacity-50 cursor-not-allowed">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Facebook</span>
               </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
