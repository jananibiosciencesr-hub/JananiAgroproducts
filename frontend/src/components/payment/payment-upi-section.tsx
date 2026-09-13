import React, { useState, useEffect } from "react";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentUpiSectionProps {
  amount: number;
  orderNumber: string;
  onPaymentSuccess: (details: { method: string; transactionId: string }) => void;
  onPaymentFailure: (reason: string) => void;
  simulateFailure: boolean;
}

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", color: "#4285F4", iconText: "GPay" },
  { id: "phonepe", name: "PhonePe", color: "#5f259f", iconText: "Pe" },
  { id: "paytm", name: "Paytm", color: "#00b9f5", iconText: "Paytm" },
  { id: "cred", name: "CRED UPI", color: "#000000", iconText: "CRED" },
  { id: "bhim", name: "BHIM UPI", color: "#005a9c", iconText: "BHIM" },
];

export function PaymentUpiSection({
  amount,
  orderNumber,
  onPaymentSuccess,
  onPaymentFailure,
  simulateFailure,
}: PaymentUpiSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<"qr" | "vpa" | "intent">("qr");
  const [vpa, setVpa] = useState("");
  const [isVpaVerified, setIsVpaVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 10:00 Timer for QR code validity
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRefreshQr = () => {
    setTimeLeft(600);
    toast.success("Dynamic UPI QR Code refreshed!");
  };

  // VPA verification
  const handleVerifyVpa = () => {
    const trimmed = vpa.trim().toLowerCase();
    if (!trimmed.includes("@") || trimmed.length < 5) {
      toast.error("Please enter a valid UPI ID (e.g. name@okhdfcbank).");
      return;
    }
    setIsVpaVerified(true);
    toast.success(`Verified: ${trimmed} (Registered to Valued Patron)`);
  };

  const processUpiPayment = (appName?: string) => {
    setIsProcessing(true);
    toast.info(
      appName
        ? `Opening ${appName} UPI intent request...`
        : "Awaiting UPI payment authorization..."
    );

    setTimeout(() => {
      setIsProcessing(false);
      if (simulateFailure) {
        onPaymentFailure("UPI Payment timed out or was cancelled by user on bank mobile app.");
      } else {
        const txnId = `UPI-${Date.now().toString().slice(-8)}`;
        onPaymentSuccess({
          method: appName ? `UPI (${appName})` : "Instant UPI / QR",
          transactionId: txnId,
        });
      }
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs: QR Code, UPI ID, Popular Apps */}
      <div className="flex rounded-2xl bg-secondary/80 p-1 border border-border">
        <button
          type="button"
          onClick={() => setActiveSubTab("qr")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === "qr"
              ? "bg-card text-brand-leaf shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <QrCode className="size-3.5" /> Scan QR Code
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("vpa")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === "vpa"
              ? "bg-card text-brand-leaf shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone className="size-3.5" /> UPI ID / VPA
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("intent")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === "intent"
              ? "bg-card text-brand-leaf shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-3.5" /> UPI Apps
        </button>
      </div>

      {/* 1. QR CODE SUB-TAB */}
      {activeSubTab === "qr" && (
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          {/* QR Code Container */}
          <div className="relative rounded-3xl border-2 border-brand-leaf/30 bg-white p-5 shadow-soft">
            {/* SVG QR Code Simulation */}
            <svg
              className="size-48 sm:size-56"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background grid */}
              <rect width="200" height="200" fill="#ffffff" rx="16" />
              {/* Top-left locator */}
              <rect x="15" y="15" width="50" height="50" rx="8" fill="#1e3a1e" />
              <rect x="23" y="23" width="34" height="34" rx="4" fill="#ffffff" />
              <rect x="31" y="31" width="18" height="18" rx="2" fill="#1e3a1e" />
              {/* Top-right locator */}
              <rect x="135" y="15" width="50" height="50" rx="8" fill="#1e3a1e" />
              <rect x="143" y="23" width="34" height="34" rx="4" fill="#ffffff" />
              <rect x="151" y="31" width="18" height="18" rx="2" fill="#1e3a1e" />
              {/* Bottom-left locator */}
              <rect x="15" y="135" width="50" height="50" rx="8" fill="#1e3a1e" />
              <rect x="23" y="143" width="34" height="34" rx="4" fill="#ffffff" />
              <rect x="31" y="151" width="18" height="18" rx="2" fill="#1e3a1e" />
              {/* Data Blocks */}
              <rect x="75" y="20" width="12" height="12" fill="#2d5a27" />
              <rect x="95" y="20" width="12" height="24" fill="#1e3a1e" />
              <rect x="115" y="30" width="12" height="12" fill="#2d5a27" />
              <rect x="75" y="45" width="24" height="12" fill="#1e3a1e" />
              <rect x="20" y="75" width="12" height="24" fill="#1e3a1e" />
              <rect x="40" y="85" width="24" height="12" fill="#2d5a27" />
              <rect x="75" y="75" width="50" height="50" rx="6" fill="#1e3a1e" />
              <rect x="83" y="83" width="34" height="34" rx="4" fill="#ffffff" />
              {/* Janani Agro Seed Icon in Center */}
              <circle cx="100" cy="100" r="12" fill="#22c55e" />
              <path
                d="M96 103C96 98 100 95 104 95C104 100 100 103 96 103Z"
                fill="#ffffff"
              />
              {/* Bottom right data blocks */}
              <rect x="135" y="75" width="24" height="12" fill="#1e3a1e" />
              <rect x="165" y="85" width="15" height="15" fill="#2d5a27" />
              <rect x="135" y="105" width="15" height="25" fill="#1e3a1e" />
              <rect x="75" y="135" width="15" height="15" fill="#2d5a27" />
              <rect x="95" y="145" width="25" height="15" fill="#1e3a1e" />
              <rect x="135" y="135" width="15" height="35" fill="#1e3a1e" />
              <rect x="155" y="145" width="25" height="15" fill="#2d5a27" />
              <rect x="155" y="165" width="25" height="15" fill="#1e3a1e" />
            </svg>

            {/* Overlaid status if expired */}
            {timeLeft <= 0 && (
              <div className="absolute inset-0 bg-black/80 rounded-3xl flex flex-col items-center justify-center p-4 text-white">
                <AlertCircle className="size-8 text-amber-400 mb-2" />
                <p className="text-xs font-bold">QR Code Expired</p>
                <Button
                  onClick={handleRefreshQr}
                  size="sm"
                  variant="gold"
                  className="mt-3 rounded-full text-xs font-bold gap-1.5"
                >
                  <RotateCcw className="size-3" /> Refresh QR
                </Button>
              </div>
            )}
          </div>

          {/* Amount & Expiry Timer */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="font-display text-2xl font-bold text-foreground">
                ₹{amount}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                • Ref: {orderNumber}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
              <Clock className="size-3.5 text-brand-leaf" />
              <span>QR expires in</span>
              <span
                className={`font-mono font-bold ${
                  timeLeft < 60 ? "text-destructive" : "text-brand-leaf"
                }`}
              >
                {formatTimer(timeLeft)}
              </span>
              {timeLeft > 0 && (
                <button
                  type="button"
                  onClick={handleRefreshQr}
                  className="text-muted-foreground hover:text-foreground p-0.5 ml-1 transition"
                  title="Refresh QR"
                >
                  <RotateCcw className="size-3" />
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground max-w-sm">
            Scan this dynamic UPI QR using <strong>Google Pay, PhonePe, Paytm, CRED, or BHIM</strong> to authorize payment instantly.
          </p>

          {/* Test Trigger Button for QA */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={() => processUpiPayment()}
              disabled={isProcessing || timeLeft <= 0}
              variant="outline"
              size="sm"
              className="rounded-full text-xs font-bold border-brand-leaf/40 text-brand-leaf hover:bg-brand-leaf/10 gap-1.5"
            >
              {isProcessing ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Verifying Payment on UPI Network...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" /> Simulate Scan & Approval (₹{amount})
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 2. VPA / UPI ID SUB-TAB */}
      {activeSubTab === "vpa" && (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Enter Your Virtual Payment Address (UPI ID)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="username@okhdfcbank / mobile@paytm"
                value={vpa}
                onChange={(e) => {
                  setVpa(e.target.value);
                  setIsVpaVerified(false);
                }}
                className="h-11 flex-1 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground font-mono"
              />
              <Button
                type="button"
                onClick={handleVerifyVpa}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold px-4"
              >
                {isVpaVerified ? "✓ Verified" : "Verify VPA"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              A collect request of <strong>₹{amount}</strong> will be sent to your UPI app.
            </p>
          </div>

          {/* Quick domain chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["@okhdfcbank", "@okaxis", "@paytm", "@ybl", "@ibl"].map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => {
                  const base = vpa.split("@")[0] || "patel";
                  setVpa(`${base}${domain}`);
                  setIsVpaVerified(true);
                }}
                className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-mono text-muted-foreground hover:bg-brand-leaf/10 hover:text-brand-leaf transition"
              >
                {domain}
              </button>
            ))}
          </div>

          <Button
            type="button"
            onClick={() => processUpiPayment()}
            disabled={isProcessing || !vpa.trim()}
            variant="gold"
            size="lg"
            className="w-full text-xs font-bold rounded-2xl h-11 shadow-sm gap-2"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Awaiting Authorization on Mobile...
              </span>
            ) : (
              <>
                Send Collect Request • ₹{amount}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* 3. POPULAR APPS INTENT SUB-TAB */}
      {activeSubTab === "intent" && (
        <div className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground">
            Tap your preferred UPI application to complete payment on this device:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UPI_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => processUpiPayment(app.name)}
                disabled={isProcessing}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:border-brand-leaf/40 hover:bg-secondary/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="size-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
                    style={{ backgroundColor: app.color }}
                  >
                    {app.iconText}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-foreground group-hover:text-brand-leaf transition">
                      {app.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">Instant App Redirect</span>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-leaf group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
        <ShieldCheck className="size-3.5 text-brand-leaf" />
        <span>NPCI / UPI 2.0 Encrypted Transaction</span>
      </div>
    </div>
  );
}
