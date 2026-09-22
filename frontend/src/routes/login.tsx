import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Gift,
  RefreshCw,
  KeyRound,
  Check,
  X,
  ChevronRight,
  Truck,
  Heart,
  Award,
  Leaf,
  Building,
  HelpCircle,
  Clock,
  ArrowLeft,
  Smartphone,
  MessageSquare,
  MapPin,
  Navigation,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";
import {
  loginWithEmail,
  sendAuthOtp,
  verifyAuthOtp,
  signupCustomer,
  loginWithGoogle,
  forgotPassword,
  resetPassword,
  saveOnboardingPreferences
} from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In & Create Account — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Sign in with Email, Mobile OTP, or Google to manage your organic pantry, harvest subscriptions, and exclusive member savings." },
    ],
  }),
  component: AuthenticationPage,
});

export function AuthenticationPage() {
  const navigate = useNavigate();
  const { user, loginUser } = useStore();

  // Auth Modes & Form State
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginMethod, setLoginMethod] = useState<"email_otp" | "phone" | "email">("email_otp");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form Inputs
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Address & Current Location State
  const [houseFlat, setHouseFlat] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Ahmedabad");
  const [state, setState] = useState("Gujarat");
  const [pincode, setPincode] = useState("380054");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [detectedAddressText, setDetectedAddressText] = useState("");

  // OTP Verification State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpTarget, setOtpTarget] = useState("");
  const [receivedDemoOtp, setReceivedDemoOtp] = useState<string>("123456");
  const [otpPurpose, setOtpPurpose] = useState<"login" | "signup" | "forgot_password">("login");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password Reset Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotStep, setForgotStep] = useState<"enter_id" | "verify_otp" | "new_password">("enter_id");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Terms & Privacy Modal
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Onboarding Wizard State (Triggers after first registration)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([
    "Cold-Pressed Oils",
    "Wood-Pressed Ghee"
  ]);
  const [deliveryPinCode, setDeliveryPinCode] = useState("560001");
  const [pinAvailable, setPinAvailable] = useState<boolean | null>(null);

  // Countdown timer for OTP Resend
  useEffect(() => {
    let interval: any = null;
    if (isOtpStep && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, resendTimer]);

  // Real-Time Password Strength Calculation
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-muted" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
      case 3:
        return { score: 3, label: "Good", color: "bg-blue-500", text: "text-blue-500" };
      case 4:
        return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
      default:
        return { score: 0, label: "Too Short", color: "bg-muted", text: "text-muted-foreground" };
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Use Current Location GPS Auto-fill
  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your device/browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const detCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || "Ahmedabad";
              const detState = addr.state || "Gujarat";
              const detPin = (addr.postcode || "").replace(/\s/g, "");
              const detStreet = [addr.house_number, addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(", ");

              if (detCity) setCity(detCity);
              if (detState) setState(detState);
              if (detPin && detPin.length >= 5) setPincode(detPin);
              if (detStreet) setStreet(detStreet);

              setLocationDetected(true);
              setDetectedAddressText(data.display_name?.split(",").slice(0, 3).join(",") || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
              toast.success("📍 Exact location detected and address auto-filled!");
              setIsLocating(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Reverse geocode fallback:", err);
        }

        setLocationDetected(true);
        setDetectedAddressText(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        toast.success(`📍 GPS Coordinates captured (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enter your address details manually.");
        } else {
          toast.error("Unable to retrieve GPS coordinates. Please type address manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // OTP Input Individual Handling (Auto-focus, Paste distribution, Backspace)
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newOtp = [...otpValues];
      newOtp[index] = "";
      setOtpValues(newOtp);
      return;
    }

    // Handle full paste into single cell
    if (cleaned.length > 1) {
      const pasteDigits = cleaned.slice(0, 6).split("");
      const newOtp = [...otpValues];
      pasteDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtpValues(newOtp);
      const nextFocus = Math.min(pasteDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otpValues];
    newOtp[index] = cleaned[0] || "";
    setOtpValues(newOtp);

    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleAutoFillOtp = (codeToFill?: string) => {
    const code = (codeToFill || receivedDemoOtp || "123456").trim().slice(0, 6);
    const digits = code.split("");
    while (digits.length < 6) digits.push("");
    setOtpValues(digits);
    toast.success(`Verification code ${code} auto-filled!`);
    setTimeout(() => {
      otpInputRefs.current[5]?.focus();
    }, 100);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 1. Handle Email + Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await loginWithEmail({ email, password, rememberMe });
      if (res?.success && res.user) {
        loginUser(res.user, res.token);
        if (res.user.role === "Super Admin" || res.user.role === "admin") {
          toast.success("Welcome Super Admin! Redirecting to Command Center...");
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/dashboard" });
        }
      } else {
        toast.error(res?.message || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      toast.error(err.message || "Email login failed.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Send OTP (Phone)
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = phone.replace(/\D/g, "");
    if (!target || target.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendAuthOtp({ phone: target, purpose: "login" });
      if (res?.success) {
        const otpCode = res.demoOtpCode || res.otp || "123456";
        setReceivedDemoOtp(otpCode);
        setOtpTarget(target);
        setOtpPurpose("login");
        setIsOtpStep(true);
        setResendTimer(res.resendCooldownSeconds || 60);
        setCanResend(false);
        setOtpValues(["", "", "", "", "", ""]);
        toast.success(`Verification code dispatched to +91 ${target}. (Test OTP: ${otpCode})`, {
          duration: 8000,
        });
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      } else {
        toast.error(res?.message || "Failed to dispatch OTP.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 2b. Handle Send OTP to Email (Real Gmail OTP)
  const handleRequestEmailOtp = async (targetEmail?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const emailToSend = (targetEmail || email).trim().toLowerCase();
    if (!emailToSend || !emailToSend.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendAuthOtp({ email: emailToSend, purpose: "login" });
      if (res?.success) {
        const otpCode = res.demoOtpCode || res.otp || "123456";
        setReceivedDemoOtp(otpCode);
        setOtpTarget(emailToSend);
        setOtpPurpose("login");
        setIsOtpStep(true);
        setResendTimer(res.resendCooldownSeconds || 60);
        setCanResend(false);
        setOtpValues(["", "", "", "", "", ""]);
        toast.success(res.message || `Real 6-digit OTP sent to ${emailToSend}. Please check your Gmail!`, {
          duration: 8000,
        });
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      } else {
        toast.error(res?.message || "Failed to dispatch OTP.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Verify OTP (Login or Signup completion)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join("");
    if (fullOtp.length < 4) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const isEmail = otpTarget.includes("@");
      const res = await verifyAuthOtp({
        phone: isEmail ? undefined : otpTarget,
        email: isEmail ? otpTarget : undefined,
        otp: fullOtp
      });

      if (res?.success) {
        if (otpPurpose === "signup") {
          // Complete registration with user address and location
          const cleanPhone = phone.replace(/\D/g, "");
          const signupRes = await signupCustomer({
            name,
            email: otpTarget,
            phone: cleanPhone || "+91 93114 16225",
            password,
            referralCode,
            agreeTerms,
            houseFlat,
            street,
            city,
            state,
            pincode,
            latitude: latitude || undefined,
            longitude: longitude || undefined
          });

          if (signupRes?.success && signupRes.user) {
            loginUser(signupRes.user, signupRes.token);
            setIsOnboardingOpen(true);
          } else {
            loginUser(res.user, res.token);
            setIsOnboardingOpen(true);
          }
        } else {
          // Login Flow
          if (res.user) {
            loginUser(res.user, res.token);
            if (res.user.role === "Super Admin" || res.user.role === "admin") {
              toast.success("Welcome Super Admin! Redirecting to Command Center...");
              navigate({ to: "/admin" });
            } else if (res.isNewUser) {
              setIsOnboardingOpen(true);
            } else {
              toast.success(`Welcome back, ${res.user.name}!`);
              navigate({ to: "/dashboard" });
            }
          }
        }
      } else {
        toast.error(res?.message || "Invalid verification code.");
      }
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Signup Form Submit (Dispatches Email OTP to confirm account)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!street.trim() && !houseFlat.trim()) {
      toast.error("Please provide your delivery address or click 'Use Current Location'.");
      return;
    }
    if (!pincode.trim() || pincode.length < 6) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }
    if (!agreeTerms) {
      toast.error("You must accept the Terms of Service & Privacy Policy.");
      return;
    }

    // Send verification OTP to the user's email
    setLoading(true);
    try {
      const emailToSend = email.trim().toLowerCase();
      const res = await sendAuthOtp({ email: emailToSend, purpose: "signup" });
      if (res?.success) {
        const otpCode = res.demoOtpCode || res.otp || "123456";
        setReceivedDemoOtp(otpCode);
        setOtpTarget(emailToSend);
        setOtpPurpose("signup");
        setIsOtpStep(true);
        setResendTimer(res.resendCooldownSeconds || 60);
        setCanResend(false);
        setOtpValues(["", "", "", "", "", ""]);
        toast.success(res.message || `Verification code sent to ${emailToSend}. (Test OTP: ${otpCode})`, {
          duration: 8000,
        });
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      } else {
        toast.error(res?.message || "Failed to dispatch verification code.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle Google Social Auth
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await loginWithGoogle({
        email: "patron.google@gmail.com",
        name: "Google Patron",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
      });
      if (res?.success && res.user) {
        loginUser(res.user, res.token);
        if (res.isNewUser) {
          setIsOnboardingOpen(true);
        } else {
          navigate({ to: "/dashboard" });
        }
      }
    } catch (err: any) {
      toast.error("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  // 7. Handle Forgot Password Steps
  const handleForgotSubmitId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier) {
      toast.error("Please enter your registered email or phone.");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword({ identifier: forgotIdentifier });
      if (res?.success) {
        toast.success(res.message);
        setForgotStep("verify_otp");
      } else {
        toast.error(res?.message || "Account not found.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to request reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword) {
      toast.error("Please enter the verification code and new password.");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword({
        phone: forgotIdentifier,
        otp: forgotOtp,
        newPassword
      });
      if (res?.success) {
        toast.success("Password reset successfully! Please log in.");
        setIsForgotModalOpen(false);
        setForgotStep("enter_id");
        setAuthMode("login");
        setLoginMethod("email");
      } else {
        toast.error(res?.message || "Failed to reset password.");
      }
    } catch (err: any) {
      toast.error(err.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  // 8. Onboarding PIN Check & Finish
  const handleCheckPinCode = () => {
    if (deliveryPinCode.length === 6) {
      const available = ["560001", "560034", "560102", "110001", "400001", "600001"].includes(deliveryPinCode) || deliveryPinCode.startsWith("560");
      setPinAvailable(available);
      if (available) {
        toast.success("🌟 Express 24-Hour Delivery available at your PIN Code!");
      } else {
        toast.info("Standard 48-Hour Heritage Shipping available at your PIN Code.");
      }
    }
  };

  const handleCompleteOnboarding = async () => {
    if (user) {
      try {
        await saveOnboardingPreferences({
          userId: user.id,
          dietary: selectedDietary,
          pinCode: deliveryPinCode
        });
      } catch (e) {
        console.error(e);
      }
    }
    setIsOnboardingOpen(false);
    toast.success("Welcome to the Janani Family! Your personalized harvest catalog is ready.");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-cream via-cream/80 to-amber-50/40 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto w-full max-w-5xl">
        {/* Main Dual-Pane Auth Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-[2.5rem] border border-border/70 bg-card/60 backdrop-blur-2xl shadow-2xl transition-all">
          
          {/* LEFT PANE: Premium Organic Heritage Banner (Desktop 5 cols) */}
          <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden bg-gradient-to-br from-forest via-[#1e3a29] to-[#0f2418] p-10 text-primary-foreground">
            {/* Background Texture & Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,160,54,0.18),transparent_60%)]" />
            <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-brand-leaf/20 blur-3xl pointer-events-none" />
            
            {/* Top Brand Header */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold backdrop-blur-md">
                <Sparkles className="size-3.5 text-brand-gold animate-pulse" />
                Pure Soil to Soul
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-cream">
                Nourish Your Family With Heritage Harvests.
              </h2>
              <p className="mt-2 text-xs text-primary-foreground/75 leading-relaxed">
                Join 50,000+ conscious households celebrating wood-pressed oils, native millets, and Vedic churned A2 ghee.
              </p>
            </div>

            {/* Middle Floating Trust Badges */}
            <div className="relative z-10 my-8 space-y-3.5">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md shadow-sm transition hover:bg-white/10">
                <div className="grid size-10 place-items-center rounded-xl bg-brand-gold/20 text-brand-gold">
                  <Award className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">100% Certified Organic</h4>
                  <p className="text-[11px] text-white/60">Zero chemicals, zero palm oil, wood-pressed purity.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md shadow-sm transition hover:bg-white/10">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Truck className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Farm Fresh Delivery</h4>
                  <p className="text-[11px] text-white/60">Express dispatch directly from 450+ grower clusters.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md shadow-sm transition hover:bg-white/10">
                <div className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Gift className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">₹150 Instant Welcome Bonus</h4>
                  <p className="text-[11px] text-white/60">Credited automatically upon creating your account.</p>
                </div>
              </div>
            </div>

            {/* Bottom Rating Pill */}
            <div className="relative z-10 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md flex items-center justify-between">
              <div className="flex -space-x-2">
                {["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80"
                ].map((img, i) => (
                  <img key={i} src={img} alt="User" className="size-7 rounded-full border-2 border-forest object-cover" />
                ))}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-bold text-brand-gold">
                  <span>★ 4.9 / 5.0</span>
                </div>
                <p className="text-[10px] text-white/60">from 18,400+ verified ratings</p>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: Interactive Glassmorphism Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-card/70 backdrop-blur-xl">
            
            {/* Top Navigation Mode Pill */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-leaf">
                    {authMode === "login" ? "Welcome Back" : "New Harvest Member"}
                  </span>
                  <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground">
                    {isOtpStep
                      ? "Verify Security Code"
                      : authMode === "login"
                      ? "Sign In to Your Account"
                      : "Create Your Janani Account"}
                  </h1>
                </div>

                {/* Quick tab toggle */}
                {!isOtpStep && (
                  <div className="flex rounded-xl bg-secondary p-1 border border-border/60">
                    <button
                      type="button"
                      onClick={() => { setAuthMode("login"); setIsOtpStep(false); }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        authMode === "login"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode("signup"); setIsOtpStep(false); }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        authMode === "signup"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>

              {/* 1-CLICK SOCIAL AUTH BUTTON (Google) */}
              {!isOtpStep && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/80 bg-background/80 py-3 px-4 text-xs font-semibold text-foreground shadow-sm transition hover:bg-secondary/60 hover:border-primary/30 active:scale-[0.99]"
                  >
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/80" />
                    </div>
                    <span className="relative bg-card/90 px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Or continue with
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* VIEW 1: OTP VERIFICATION SCREEN                           */}
              {/* ========================================================= */}
              {isOtpStep ? (
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-950 flex items-start gap-3">
                    {otpTarget.includes("@") ? (
                      <Mail className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Smartphone className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-emerald-800">
                          {otpTarget.includes("@")
                            ? `Enter OTP sent to ${otpTarget}`
                            : `Enter OTP sent to +91 ${otpTarget}`}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAutoFillOtp(receivedDemoOtp)}
                          className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition shadow-xs shrink-0 cursor-pointer"
                        >
                          ⚡ Auto-Fill ({receivedDemoOtp})
                        </button>
                      </div>
                      {otpTarget.toLowerCase() === "jananibiosciences.r@gmail.com" ? (
                        <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-700 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-sm">
                          🛡️ Super Admin Root Access
                        </span>
                      ) : (
                        <p className="text-[11px] text-emerald-700/80 mt-0.5">
                          {otpTarget.includes("@")
                            ? "Check your Gmail inbox & spam folder, or click Auto-Fill above."
                            : "SMS dispatched. Carrier delays? Use the instant test code above."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 6 Individual Interactive Input Cells */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground">
                        6-Digit Authentication Code
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAutoFillOtp(receivedDemoOtp)}
                        className="text-[11px] font-bold text-brand-leaf hover:underline cursor-pointer"
                      >
                        Paste Test Code ({receivedDemoOtp})
                      </button>
                    </div>
                    <div className="flex justify-between gap-2 sm:gap-3">
                      {otpValues.map((val, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { otpInputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={val}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="size-11 sm:size-13 rounded-2xl border border-input bg-background/90 text-center font-mono text-lg font-bold text-foreground shadow-sm transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Instant Verification Helper Card */}
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-medium">
                        Instant Access Code: <strong className="font-mono font-bold tracking-wider">{receivedDemoOtp}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutoFillOtp(receivedDemoOtp)}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs cursor-pointer transition shrink-0"
                    >
                      ⚡ Auto-Fill
                    </button>
                  </div>

                  {/* Resend OTP Section with 60s Countdown Timer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => { setIsOtpStep(false); setOtpValues(["", "", "", "", "", ""]); }}
                      className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                    >
                      <ArrowLeft className="size-3.5" /> Change {otpTarget.includes("@") ? "Email" : "Phone"}
                    </button>

                    <div className="flex items-center gap-2">
                      {!canResend ? (
                        <span className="flex items-center gap-1.5 font-medium text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full text-[11px]">
                          <Clock className="size-3" /> Resend OTP in {resendTimer}s
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => otpTarget.includes("@") ? handleRequestEmailOtp(otpTarget) : handleRequestOtp()}
                            className="font-semibold text-brand-leaf hover:underline text-xs cursor-pointer"
                          >
                            Resend Code
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    variant="gold"
                    className="w-full rounded-2xl font-bold text-sm shadow-md cursor-pointer"
                    disabled={loading || otpValues.join("").length < 4}
                  >
                    {loading ? "Verifying Token..." : "Verify & Continue"} <ArrowRight className="size-4 ml-1.5" />
                  </Button>

                  <div className="pt-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpStep(false);
                        setLoginMethod("email");
                      }}
                      className="text-muted-foreground hover:text-foreground hover:underline font-medium cursor-pointer"
                    >
                      Sign in with Password instead
                    </button>
                  </div>
                </form>
              ) : authMode === "login" ? (
                /* ========================================================= */
                /* VIEW 2: SIGN IN (Phone OTP, Email OTP, or Password)       */
                /* ========================================================= */
                <div>
                  {/* ADMIN GMAIL QUICK ACCESS CARD */}
                  <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                        🛡️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">Admin Fast Login via Gmail</span>
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">Root Access</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">jananibiosciences.r@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href="/admin"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600/40 bg-background/90 hover:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-3 py-2 text-xs font-semibold transition shadow-xs"
                        title="Go directly to restricted /admin portal"
                      >
                        <ShieldCheck className="size-3.5 text-emerald-600" />
                        <span>/admin Portal</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRequestEmailOtp("jananibiosciences.r@gmail.com")}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <Sparkles className="size-3.5 text-amber-300" />
                        <span>{loading ? "Sending..." : "Send Real OTP"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Switch between Phone OTP, Email OTP, and Password */}
                  <div className="mb-5 grid grid-cols-3 rounded-xl bg-secondary/80 p-1 border border-border/50">
                    <button
                      type="button"
                      onClick={() => setLoginMethod("phone")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                        loginMethod === "phone"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Phone className="size-3.5" /> Mobile OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod("email_otp")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                        loginMethod === "email_otp"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Mail className="size-3.5" /> Email OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod("email")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                        loginMethod === "email"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Lock className="size-3.5" /> Password
                    </button>
                  </div>

                  {loginMethod === "phone" ? (
                    /* Phone OTP Login Form */
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>Mobile Number *</span>
                          <span className="text-[10px] text-muted-foreground">Quick SMS Verification</span>
                        </label>
                        <div className="relative flex items-center rounded-2xl border border-input bg-background/90 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                          <span className="flex items-center gap-1.5 border-r border-border/70 px-3.5 py-2.5 text-xs font-semibold text-muted-foreground">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 93114 16225"
                            className="h-11 w-full rounded-r-2xl bg-transparent px-3 text-xs sm:text-sm font-medium outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="size-4 rounded border-input text-primary focus:ring-primary"
                          />
                          <span>Remember device</span>
                        </label>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        variant="gold"
                        className="w-full rounded-2xl font-bold text-sm shadow-md mt-2"
                        disabled={loading}
                      >
                        {loading ? "Sending OTP..." : "Get OTP on Mobile"} <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </form>
                  ) : loginMethod === "email_otp" ? (
                    /* Email / Gmail OTP Login Form */
                    <form onSubmit={(e) => handleRequestEmailOtp(undefined, e)} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>Email Address *</span>
                          <span className="text-[10px] text-emerald-600 font-semibold">Real Gmail OTP Delivery</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. jananibiosciences.r@gmail.com"
                            className="h-11 w-full rounded-2xl border border-input bg-background/90 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          A real 6-digit verification code will be sent to your Gmail inbox.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        variant="gold"
                        className="w-full rounded-2xl font-bold text-sm shadow-md mt-2"
                        disabled={loading}
                      >
                        {loading ? "Sending Real OTP..." : "Get OTP on Email"} <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </form>
                  ) : (
                    /* Email & Password Login Form */
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. jananibiosciences.r@gmail.com"
                            className="h-11 w-full rounded-2xl border border-input bg-background/90 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground">Password *</label>
                          <button
                            type="button"
                            onClick={() => {
                              setForgotIdentifier(email || phone);
                              setIsForgotModalOpen(true);
                              setForgotStep("enter_id");
                            }}
                            className="text-[11px] font-semibold text-brand-leaf hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="h-11 w-full rounded-2xl border border-input bg-background/90 pl-10 pr-11 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="size-4 rounded border-input text-primary focus:ring-primary"
                          />
                          <span>Keep me logged in</span>
                        </label>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        variant="gold"
                        className="w-full rounded-2xl font-bold text-sm shadow-md mt-2"
                        disabled={loading}
                      >
                        {loading ? "Signing in..." : "Sign In with Password"} <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </form>
                  )}
                </div>
              ) : (
                /* ========================================================= */
                /* VIEW 3: CREATE ACCOUNT (Signup with Strength Meter)       */
                /* ========================================================= */
                <form onSubmit={handleSignupSubmit} className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          className="h-11 w-full rounded-2xl border border-input bg-background/90 pl-10 pr-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="h-11 w-full rounded-2xl border border-input bg-background/90 pl-10 pr-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="h-11 w-full rounded-2xl border border-input bg-background/90 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      A 6-digit verification code will be sent to your Gmail/Email to verify your account.
                    </p>
                  </div>

                  {/* DELIVERY ADDRESS & CURRENT LOCATION CARD */}
                  <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-brand-leaf" />
                        <span className="text-xs font-bold text-foreground">Delivery Address & Location</span>
                      </div>
                      
                      {/* GPS AUTO-DETECT CURRENT LOCATION BUTTON */}
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-brand-leaf/40 bg-brand-leaf/10 hover:bg-brand-leaf/20 text-brand-leaf px-2.5 py-1 text-[11px] font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Auto-detect current GPS location and fill address"
                      >
                        <Compass className={`size-3.5 ${isLocating ? "animate-spin text-brand-gold" : "text-brand-leaf"}`} />
                        <span>{isLocating ? "Detecting GPS..." : "📍 Use Current Location"}</span>
                      </button>
                    </div>

                    {locationDetected && detectedAddressText && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-[11px] text-emerald-800 font-medium">
                        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Auto-detected: {detectedAddressText}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Flat / House / Building *
                        </label>
                        <input
                          type="text"
                          required
                          value={houseFlat}
                          onChange={(e) => setHouseFlat(e.target.value)}
                          placeholder="e.g. Flat 402, Green Acres"
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Street / Area / Landmark *
                        </label>
                        <input
                          type="text"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="e.g. Judges Bungalow Road, Bodakdev"
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Ahmedabad"
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="e.g. Gujarat"
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">PIN Code *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                          placeholder="380054"
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-mono font-bold outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Create Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="h-11 w-full rounded-2xl border border-input bg-background/90 pl-10 pr-10 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="h-11 w-full rounded-2xl border border-input bg-background/90 pl-10 pr-10 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PASSWORD STRENGTH METER */}
                  {password && (
                    <div className="rounded-2xl border border-border/80 bg-secondary/40 p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Password Security:</span>
                        <span className={`font-bold ${passwordStrength.text}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              passwordStrength.score >= step ? passwordStrength.color : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground pt-1">
                        <span className={password.length >= 8 ? "text-emerald-600 font-semibold" : ""}>
                          {password.length >= 8 ? "✓" : "○"} 8+ characters
                        </span>
                        <span className={/[A-Z]/.test(password) ? "text-emerald-600 font-semibold" : ""}>
                          {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase letter
                        </span>
                        <span className={/[0-9]/.test(password) ? "text-emerald-600 font-semibold" : ""}>
                          {/[0-9]/.test(password) ? "✓" : "○"} Number (0-9)
                        </span>
                        <span className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-600 font-semibold" : ""}>
                          {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} Special symbol (@#$)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Referral Code with Bonus Tag */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Referral / Invite Code (Optional)</span>
                      <span className="text-[10px] font-bold text-brand-leaf">+₹100 Extra Harvest Credit</span>
                    </label>
                    <div className="relative">
                      <Gift className="absolute left-3.5 top-3.5 size-4 text-brand-gold" />
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="e.g. HARVEST100"
                        className="h-11 w-full rounded-2xl border border-input bg-background/90 pl-10 pr-4 font-mono text-xs uppercase tracking-wider outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Terms & Privacy Acceptance */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                      I agree to Janani Agro's{" "}
                      <button
                        type="button"
                        onClick={() => setIsTermsModalOpen(true)}
                        className="font-semibold text-foreground underline hover:text-brand-leaf"
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => setIsTermsModalOpen(true)}
                        className="font-semibold text-foreground underline hover:text-brand-leaf"
                      >
                        Privacy Policy
                      </button>
                      .
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    variant="gold"
                    className="w-full rounded-2xl font-bold text-sm shadow-md mt-2"
                    disabled={loading}
                  >
                    {loading ? "Sending Verification Code..." : "Verify Email & Create Account"} <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </form>
              )}
            </div>

            {/* Bottom Security Trust Badges */}
            <div className="mt-8 border-t border-border/70 pt-5">
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>256-Bit Encrypted</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="size-4 text-brand-leaf" />
                  <span>Farm Fresh Dispatch</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Sparkles className="size-4 text-brand-gold" />
                  <span>100% Single Origin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: FORGOT PASSWORD & RESET                          */}
      {/* ========================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/50 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-brand-gold/20 text-brand-gold">
                  <KeyRound className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Password Recovery</h3>
                  <p className="text-xs text-muted-foreground">Reset your Janani account access</p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            {forgotStep === "enter_id" && (
              <form onSubmit={handleForgotSubmitId} className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Enter your registered mobile number or email address. We will send a secure verification code to reset your password.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mobile or Email *</label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. 98450 12345 or your.name@domain.com"
                    className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-xs sm:text-sm outline-none focus:border-primary"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending Code..." : "Send Reset Code"} <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </form>
            )}

            {forgotStep === "verify_otp" && (
              <form onSubmit={handleForgotResetPassword} className="space-y-4">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                  A 6-digit verification code has been dispatched to your email address.
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">6-Digit Verification Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="• • • • • •"
                    className="h-11 w-full rounded-2xl border border-input bg-background text-center font-mono text-base tracking-widest outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">New Secure Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-xs sm:text-sm outline-none focus:border-primary"
                  />
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                  {loading ? "Updating..." : "Update Password & Log In"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: TERMS OF SERVICE & PRIVACY POLICY                */}
      {/* ========================================================= */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/50 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-brand-leaf" />
                <h3 className="text-base font-bold text-foreground">Terms of Service & Privacy Policy</h3>
              </div>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-xs text-muted-foreground space-y-4 leading-relaxed">
              <div>
                <h4 className="font-bold text-foreground mb-1 text-sm">1. Pure Organic Quality Commitment</h4>
                <p>Janani Agro Products guarantees 100% genuine single-origin wood-pressed oils, unadulterated Vedic ghee, and farm-fresh heritage millets. All harvest items conform strictly to FSSAI standards.</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-1 text-sm">2. Account Security & Verification</h4>
                <p>Users are responsible for maintaining the confidentiality of login credentials. Mobile OTP codes sent during checkout or authentication are strictly for personal account validation.</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-1 text-sm">3. Referral Program Rules</h4>
                <p>Referral credits (₹250 advocate cashback and ₹150 friend discount) are granted automatically on valid orders above ₹999. Credits cannot be withdrawn as cash but are redeemable across the entire Janani Agro organic catalog.</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-1 text-sm">4. Privacy & Data Protection</h4>
                <p>We do not sell, rent, or trade your personal information. Delivery addresses and mobile numbers are utilized strictly for Shiprocket courier dispatch and live SMS/WhatsApp transit updates.</p>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-secondary/30 flex justify-end">
              <Button onClick={() => setIsTermsModalOpen(false)} variant="outline" size="sm">
                I Understand & Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: INTERACTIVE 3-STEP ONBOARDING PREFERENCE WIZARD  */}
      {/* ========================================================= */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/60 backdrop-blur-lg p-4">
          <div className="w-full max-w-xl rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
            
            {/* Progress indicator */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-brand-gold text-[11px] font-bold text-forest">
                  {onboardingStep}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Step {onboardingStep} of 3
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 w-8 rounded-full transition ${
                      onboardingStep >= s ? "bg-brand-gold" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: Welcome & Confetti Wallet Reward */}
            {onboardingStep === 1 && (
              <div className="text-center space-y-4 animate-in fade-in">
                <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
                  <Gift className="size-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Welcome to the Janani Family!
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We've credited your welcome harvest bonus directly to your wallet.
                  </p>
                </div>

                <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-r from-amber-500/10 via-brand-gold/20 to-amber-500/10 p-4 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-brand-gold">
                    Instant Wallet Balance
                  </span>
                  <div className="font-display text-3xl font-extrabold text-foreground mt-0.5">
                    ₹{user?.walletBalance || 150}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Redeemable on your first cold-pressed oil, ghee, or millet purchase.
                  </p>
                </div>

                <Button
                  onClick={() => setOnboardingStep(2)}
                  size="lg"
                  variant="gold"
                  className="w-full rounded-2xl font-bold"
                >
                  Personalize My Pantry <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </div>
            )}

            {/* STEP 2: Dietary & Pantry Preferences */}
            {onboardingStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    What does your household love?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select your preferred organic categories for tailored recommendations:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    "Cold-Pressed Oils",
                    "Wood-Pressed Ghee",
                    "Organic Millets",
                    "Stone-Ground Flours",
                    "Heritage Spices",
                    "Raw Forest Honey"
                  ].map((category) => {
                    const isSelected = selectedDietary.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedDietary((prev) =>
                            isSelected ? prev.filter((c) => c !== category) : [...prev, category]
                          );
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background hover:bg-secondary text-foreground"
                        }`}
                      >
                        <span>{category}</span>
                        {isSelected && <Check className="size-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setOnboardingStep(1)}
                    variant="outline"
                    className="w-1/3 rounded-2xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setOnboardingStep(3)}
                    variant="gold"
                    className="w-2/3 rounded-2xl font-bold"
                  >
                    Next: Delivery PIN <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Delivery PIN-Code Check */}
            {onboardingStep === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Where should we deliver?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Enter your primary 6-digit postal PIN code to check instant 24-hr express courier delivery:
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={deliveryPinCode}
                      onChange={(e) => setDeliveryPinCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 560001"
                      className="h-11 flex-1 rounded-2xl border border-input bg-background px-4 text-center font-mono text-base font-bold outline-none focus:border-primary"
                    />
                    <Button type="button" onClick={handleCheckPinCode} variant="outline">
                      Check PIN
                    </Button>
                  </div>

                  {pinAvailable !== null && (
                    <div className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                      pinAvailable ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                    }`}>
                      {pinAvailable ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Truck className="size-4 text-amber-600" />}
                      <span>
                        {pinAvailable
                          ? "✓ Express 24-Hour Delivery Active for this PIN Code"
                          : "Standard 48-72 Hour Delivery Active"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    onClick={() => setOnboardingStep(2)}
                    variant="outline"
                    className="w-1/3 rounded-2xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCompleteOnboarding}
                    variant="gold"
                    className="w-2/3 rounded-2xl font-bold"
                  >
                    Complete & Enter Store <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
