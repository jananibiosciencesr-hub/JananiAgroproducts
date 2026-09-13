import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Wallet,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentRazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  onPaymentSuccess: (details: { method: string; transactionId: string }) => void;
  onPaymentFailure: (reason: string) => void;
  simulateFailure: boolean;
}

export function PaymentRazorpayModal({
  isOpen,
  onClose,
  amount,
  orderNumber,
  customerName,
  customerPhone,
  onPaymentSuccess,
  onPaymentFailure,
  simulateFailure,
}: PaymentRazorpayModalProps) {
  const [activeTab, setActiveTab] = useState<"card" | "upi" | "netbanking" | "wallet">("card");
  const [step, setStep] = useState<"options" | "otp">("options");
  const [otpCode, setOtpCode] = useState("123456");
  const [isProcessing, setIsProcessing] = useState(false);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  useEffect(() => {
    if (isOpen) {
      setStep("options");
      setIsProcessing(false);
      setOtpCode("123456");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProceedToOtp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("otp");
      toast.info("Razorpay 3D Secure OTP dispatched to mobile.");
    }, 600);
  };

  const handleAuthorizeOtp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      if (simulateFailure) {
        onPaymentFailure("Razorpay Transaction declined by bank: Insufficient authorization or card blocked.");
      } else {
        const txnId = `pay_rzp_${Date.now().toString().slice(-8)}`;
        onPaymentSuccess({
          method: `Razorpay (${activeTab === "card" ? "Card" : activeTab === "upi" ? "UPI" : selectedBank})`,
          transactionId: txnId,
        });
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] p-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
              JA
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Janani Agro Products</h3>
              <p className="text-xs text-slate-300">Order: {orderNumber}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
            <span className="text-xs text-slate-300 font-medium">Amount to Pay</span>
            <strong className="text-2xl font-bold font-mono text-emerald-400">₹{amount}</strong>
          </div>
        </div>

        {/* Modal Body */}
        {step === "options" ? (
          <div>
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === "card"
                    ? "border-[#0c2340] text-[#0c2340] bg-white"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <CreditCard className="size-4" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === "upi"
                    ? "border-[#0c2340] text-[#0c2340] bg-white"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <QrCode className="size-4" /> UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("netbanking")}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === "netbanking"
                    ? "border-[#0c2340] text-[#0c2340] bg-white"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Building className="size-4" /> NetBanking
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("wallet")}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === "wallet"
                    ? "border-[#0c2340] text-[#0c2340] bg-white"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Wallet className="size-4" /> Wallets
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 space-y-4 text-xs">
              {activeTab === "card" && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-2.5 text-[11px] text-blue-900 flex items-center gap-2 font-medium">
                    <ShieldCheck className="size-4 text-blue-600 shrink-0" />
                    <span>Razorpay Standard Test Card Loaded</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-mono font-bold outline-none focus:border-[#0c2340]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-mono font-bold outline-none focus:border-[#0c2340]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-mono font-bold outline-none focus:border-[#0c2340]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "upi" && (
                <div className="text-center py-3 space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    Scan via Razorpay Instant UPI Gateway
                  </p>
                  <div className="size-36 mx-auto rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center p-3 shadow-inner">
                    <QrCode className="size-28 text-[#0c2340]" />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    VPA: jananiagro@razorpay
                  </span>
                </div>
              )}

              {activeTab === "netbanking" && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 block">Popular Banks</span>
                  <div className="grid grid-cols-2 gap-2">
                    {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"].map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition ${
                          selectedBank === b
                            ? "border-[#0c2340] bg-blue-50 text-[#0c2340] font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "wallet" && (
                <div className="space-y-2">
                  {["Airtel Money", "Mobikwik", "Freecharge", "JioMoney"].map((w) => (
                    <div
                      key={w}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <span className="font-bold text-xs text-slate-800">{w}</span>
                      <ArrowRight className="size-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                onClick={handleProceedToOtp}
                disabled={isProcessing}
                className="w-full bg-[#0c2340] hover:bg-[#12335c] text-white font-bold text-xs h-11 rounded-xl shadow-md gap-2"
              >
                {isProcessing ? "Connecting to Gateway..." : `Pay ₹${amount} with Razorpay`}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
                <Lock className="size-3 text-emerald-600" />
                <span>Secured by Razorpay • PCI-DSS Certified</span>
              </div>
            </div>
          </div>
        ) : (
          /* STEP: 3D SECURE OTP SIMULATOR */
          <div className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <span className="inline-block size-10 rounded-full bg-blue-100 text-[#0c2340] p-2 mb-1">
                <Lock className="size-6" />
              </span>
              <h4 className="font-bold text-base text-slate-900">Bank 3D-Secure Authentication</h4>
              <p className="text-xs text-slate-500">
                OTP sent to registered mobile ending in <strong>{customerPhone.slice(-4) || "6225"}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-center text-xs font-bold text-slate-700">
                Enter 6-Digit One-Time Password
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="h-12 w-48 mx-auto block rounded-xl border-2 border-slate-300 text-center font-mono text-xl font-bold tracking-widest outline-none focus:border-[#0c2340]"
              />
              <span className="block text-center text-[11px] text-slate-400">
                Test OTP is <strong>123456</strong>
              </span>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="button"
                onClick={handleAuthorizeOtp}
                disabled={isProcessing || otpCode.length < 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl shadow-md"
              >
                {isProcessing ? "Authorizing with Bank..." : "Verify & Complete Payment"}
              </Button>

              <button
                type="button"
                onClick={() => setStep("options")}
                className="w-full text-center text-xs text-slate-500 hover:underline font-medium"
              >
                Cancel & Change Method
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
