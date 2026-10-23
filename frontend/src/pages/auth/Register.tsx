import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Train, 
  Mail, 
  Lock, 
  ArrowRight, 
  User, 
  Phone, 
  Calendar,
  Globe,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import { cn } from "../../lib/utils";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be 10 digits"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  nationality: z.string().min(1, "Nationality is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data);
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error("Registration failed. Email might already exist.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full mx-auto"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
              <Train className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black text-primary tracking-tighter">RailBook</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-secondary hover:underline font-bold">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="bg-white py-12 px-10 rounded-[48px] shadow-2xl shadow-primary/5 border border-gray-100">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 focus-within:z-10">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">First Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("firstName")}
                    className={cn(
                      "block w-full pl-11 pr-4 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all font-semibold",
                      errors.firstName ? "border-red-500" : "border-transparent focus:border-primary/20 focus:bg-white"
                    )}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && <p className="text-[10px] font-bold text-red-500 px-2 mt-1">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-1.5 focus-within:z-10">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Last Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("lastName")}
                    className={cn(
                      "block w-full pl-11 pr-4 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all font-semibold",
                      errors.lastName ? "border-red-500" : "border-transparent focus:border-primary/20 focus:bg-white"
                    )}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && <p className="text-[10px] font-bold text-red-500 px-2 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email and Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 focus-within:z-10">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email")}
                    className={cn(
                      "block w-full pl-11 pr-4 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all font-semibold",
                      errors.email ? "border-red-500" : "border-transparent focus:border-primary/20 focus:bg-white"
                    )}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5 focus-within:z-10">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Mobile Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("mobile")}
                    className={cn(
                      "block w-full pl-11 pr-4 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all font-semibold",
                      errors.mobile ? "border-red-500" : "border-transparent focus:border-primary/20 focus:bg-white"
                    )}
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
               {/* Password */}
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Password</label>
                  <input
                    {...register("password")}
                    type="password"
                    className={cn(
                      "block w-full px-4 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all font-semibold",
                      errors.password ? "border-red-500" : "border-transparent focus:border-primary/20 focus:bg-white"
                    )}
                    placeholder="••••••••"
                  />
                  {/* Strength Indicator */}
                  <div className="px-2 mt-2">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength}%` }}
                        className={cn(
                          "h-full transition-all duration-500",
                          passwordStrength <= 25 && "bg-red-500",
                          passwordStrength <= 50 && passwordStrength > 25 && "bg-orange-500",
                          passwordStrength <= 75 && passwordStrength > 50 && "bg-yellow-500",
                          passwordStrength > 75 && "bg-green-500"
                        )}
                      />
                    </div>
                  </div>
               </div>

               {/* Confirm Password */}
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Confirm Password</label>
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    className={cn(
                      "block w-full px-4 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all font-semibold",
                      errors.confirmPassword ? "border-red-500" : "border-transparent focus:border-primary/20 focus:bg-white"
                    )}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 px-2 mt-1">{errors.confirmPassword.message}</p>}
               </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-2 uppercase tracking-widest">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <label className="text-[10px] font-black text-muted-foreground">Birth Date</label>
                  </div>
                  <input
                    {...register("dob")}
                    type="date"
                    className="block w-full px-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white font-semibold"
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Gender</label>
                  <select
                    {...register("gender")}
                    className="block w-full px-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white font-semibold appearance-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
               </div>

               <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-2 uppercase tracking-widest">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <label className="text-[10px] font-black text-muted-foreground">Nationality</label>
                  </div>
                  <input
                    {...register("nationality")}
                    className="block w-full px-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white font-semibold"
                    placeholder="Indian"
                  />
               </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create RailBook Account <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
