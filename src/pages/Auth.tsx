import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OtpInput from "@/components/OtpInput";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  shopName: z.string().trim().min(1, "Shop name is required").max(100, "Shop name too long"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(15, "Phone number too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthStep = "login" | "signup" | "otp";

const Auth = () => {
  const [step, setStep] = useState<AuthStep>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState({
    shopName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp, signIn } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validateForm = (isSignup: boolean) => {
    try {
      if (isSignup) {
        signupSchema.parse(formData);
      } else {
        loginSchema.parse({ email: formData.email, password: formData.password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const sendOtp = async () => {
    if (!validateForm(true)) return;
    
    setIsSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: formData.phone, action: 'signup' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "OTP Sent",
        description: "We've sent a verification code to your phone.",
      });
      setStep("otp");
      setResendTimer(60);
    } catch (err: any) {
      toast({
        title: "Failed to send OTP",
        description: err.message || "Please check your phone number and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtpAndSignup = async () => {
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Verify OTP
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-otp', {
        body: { phone: formData.phone, otp: otpValue }
      });

      if (verifyError) throw verifyError;
      if (verifyData.error) throw new Error(verifyData.error);

      // OTP verified, now create account
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.shopName,
        formData.phone
      );

      if (signUpError) {
        let message = signUpError.message;
        if (signUpError.message.includes("User already registered")) {
          message = "An account with this email already exists. Please login instead.";
        }
        throw new Error(message);
      }

      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(false)) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        let message = error.message;
        if (error.message.includes("Invalid login credentials")) {
          message = "Invalid email or password. Please check your credentials or create an account first.";
        }
        toast({
          title: "Login failed",
          description: message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp();
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="you@example.com"
            className={`pl-10 h-12 ${errors.email ? "border-destructive" : ""}`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={`pl-10 pr-10 h-12 ${errors.password ? "border-destructive" : ""}`}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <Button 
        type="submit" 
        variant="accent" 
        size="lg" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => { setStep("signup"); setErrors({}); }}
          className="text-primary hover:underline font-medium"
        >
          Create one
        </button>
      </p>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleSignupSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Shop Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your shop name"
            className={`pl-10 h-12 ${errors.shopName ? "border-destructive" : ""}`}
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
          />
        </div>
        {errors.shopName && <p className="text-xs text-destructive">{errors.shopName}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="you@example.com"
            className={`pl-10 h-12 ${errors.email ? "border-destructive" : ""}`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="+91 98765 43210"
            className={`pl-10 h-12 ${errors.phone ? "border-destructive" : ""}`}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className={`pl-10 pr-10 h-12 ${errors.password ? "border-destructive" : ""}`}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <Button 
        type="submit" 
        variant="accent" 
        size="lg" 
        className="w-full"
        disabled={isSendingOtp}
      >
        {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {isSendingOtp ? "Sending OTP..." : "Continue"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => { setStep("login"); setErrors({}); }}
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </button>
      </p>
    </form>
  );

  const renderOtpForm = () => (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => { setStep("signup"); setOtpValue(""); }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Verify your phone</h2>
        <p className="text-muted-foreground text-sm">
          We've sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{formData.phone}</span>
        </p>
      </div>

      <OtpInput
        value={otpValue}
        onChange={setOtpValue}
        disabled={isSubmitting}
      />

      <Button
        variant="accent"
        size="lg"
        className="w-full"
        onClick={verifyOtpAndSignup}
        disabled={isSubmitting || otpValue.length !== 6}
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {isSubmitting ? "Verifying..." : "Verify & Create Account"}
      </Button>

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in <span className="font-medium">{resendTimer}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={sendOtp}
            disabled={isSendingOtp}
            className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
          >
            {isSendingOtp ? "Sending..." : "Resend Code"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">LODR</span>
          </Link>

          {/* Header */}
          {step !== "otp" && (
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {step === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {step === "login"
                  ? "Enter your credentials to access your dashboard"
                  : "Start booking vehicles for your shop today"}
              </p>
            </div>
          )}

          {/* Render appropriate form based on step */}
          {step === "login" && renderLoginForm()}
          {step === "signup" && renderSignupForm()}
          {step === "otp" && renderOtpForm()}

          {step !== "otp" && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              By continuing, you agree to LODR's{" "}
              <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{" "}
              and{" "}
              <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
            </p>
          )}
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-primary-foreground/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center p-16">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Transport made simple for shopkeepers
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Book autos, tempos, and mini-trucks in minutes. Track your deliveries in real-time.
              Save time and money with LODR.
            </p>

            <div className="mt-10 space-y-4">
              {["Instant booking", "Verified drivers", "Real-time tracking", "Best prices"].map(
                (feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <span className="text-primary-foreground text-sm">✓</span>
                    </div>
                    <span className="text-primary-foreground">{feature}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
