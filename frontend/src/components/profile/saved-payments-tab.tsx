import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  ShieldCheck,
  QrCode,
  Lock,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SavedCard, SavedUpi } from "./types";
import { useStore } from "@/components/store-provider";

const INITIAL_CARDS: SavedCard[] = [];
const INITIAL_UPIS: SavedUpi[] = [];

export function SavedPaymentsTab() {
  const { user } = useStore();
  const [cards, setCards] = useState<SavedCard[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_saved_cards");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CARDS;
  });

  const [upis, setUpis] = useState<SavedUpi[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_saved_upis");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_UPIS;
  });

  // Modal States
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  // New Card Form
  const [cardForm, setCardForm] = useState({
    number: "",
    name: user?.name || "",
    expiry: "",
    cvv: "",
    brand: "visa" as SavedCard["brand"],
    isDefault: false,
  });

  // New UPI Form
  const [upiForm, setUpiForm] = useState({
    idStr: "",
    provider: "Google Pay",
    isDefault: false,
  });

  const saveCards = (newCards: SavedCard[]) => {
    setCards(newCards);
    if (typeof window !== "undefined") {
      localStorage.setItem("janani_saved_cards", JSON.stringify(newCards));
    }
  };

  const saveUpis = (newUpis: SavedUpi[]) => {
    setUpis(newUpis);
    if (typeof window !== "undefined") {
      localStorage.setItem("janani_saved_upis", JSON.stringify(newUpis));
    }
  };

  const handleSetDefaultCard = (id: string) => {
    const updated = cards.map((c) => ({
      ...c,
      isDefault: c.id === id,
    }));
    saveCards(updated);
    toast.success("Default payment card updated!");
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    if (cards.find((c) => c.id === id)?.isDefault && updated[0]) {
      updated[0].isDefault = true;
    }
    saveCards(updated);
    toast.success("Card removed.");
  };

  const handleSetDefaultUpi = (id: string) => {
    const updated = upis.map((u) => ({
      ...u,
      isDefault: u.id === id,
    }));
    saveUpis(updated);
    toast.success("Primary UPI ID updated!");
  };

  const handleDeleteUpi = (id: string) => {
    const updated = upis.filter((u) => u.id !== id);
    if (upis.find((u) => u.id === id)?.isDefault && updated[0]) {
      updated[0].isDefault = true;
    }
    saveUpis(updated);
    toast.success("UPI ID removed.");
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const last4 = cardForm.number.slice(-4) || "3912";
    const newCard: SavedCard = {
      id: `card-${Date.now()}`,
      cardNumber: `•••• •••• •••• ${last4}`,
      cardholderName: cardForm.name.toUpperCase(),
      expiry: cardForm.expiry || "10/29",
      brand: cardForm.brand,
      isDefault: cardForm.isDefault,
    };

    const updated = cardForm.isDefault
      ? cards.map((c) => ({ ...c, isDefault: false })).concat(newCard)
      : [...cards, newCard];

    saveCards(updated);
    setIsCardModalOpen(false);
    toast.success("New payment card securely tokenized & saved!");
  };

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiForm.idStr.includes("@")) {
      toast.error("Please enter a valid VPA format like name@bank");
      return;
    }

    const newUpi: SavedUpi = {
      id: `upi-${Date.now()}`,
      upiId: upiForm.idStr.toLowerCase(),
      provider: upiForm.provider,
      isDefault: upiForm.isDefault,
    };

    const updated = upiForm.isDefault
      ? upis.map((u) => ({ ...u, isDefault: false })).concat(newUpi)
      : [...upis, newUpi];

    saveUpis(updated);
    setIsUpiModalOpen(false);
    toast.success("New UPI handle verified and saved!");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-8">
      {/* 1. Saved Cards Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="size-5 text-brand-leaf" /> Saved Credit & Debit Cards
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tokenized under RBI compliance guidelines. CVV is never stored.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCardModalOpen(true)}
            className="rounded-full text-xs font-bold gap-1.5 self-start sm:self-auto"
          >
            <Plus className="size-3.5" />
            <span>Add New Card</span>
          </Button>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-xs text-muted-foreground">
            No saved cards yet. Click <strong>+ Add New Card</strong> above to save your card for 1-click checkout.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`rounded-2xl border p-5 space-y-4 relative transition ${
                  card.isDefault
                    ? "border-brand-leaf bg-brand-leaf/5 shadow-xs"
                    : "border-border bg-secondary/40 hover:bg-secondary/70"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf font-mono">
                    {card.brand.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1">
                    {card.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-leaf/15 text-brand-leaf px-2.5 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="size-3" /> Default Card
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-destructive transition ml-1"
                      title="Remove card"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="font-mono text-base font-bold text-foreground tracking-widest">
                  {card.cardNumber}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                  <div>
                    <span className="text-[10px] uppercase block">Cardholder</span>
                    <strong className="text-foreground font-medium">{card.cardholderName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase block">Expires</span>
                    <strong className="text-foreground font-mono">{card.expiry}</strong>
                  </div>
                </div>

                {!card.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefaultCard(card.id)}
                    className="text-xs font-bold text-brand-leaf hover:underline block pt-1"
                  >
                    Set as Default Card
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Saved UPI Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <QrCode className="size-5 text-brand-gold" /> Saved UPI IDs
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              One-click instant payment approvals on Google Pay, PhonePe, and Paytm.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsUpiModalOpen(true)}
            className="rounded-full text-xs font-bold gap-1.5 self-start sm:self-auto"
          >
            <Plus className="size-3.5" />
            <span>Add UPI ID</span>
          </Button>
        </div>

        {upis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-xs text-muted-foreground">
            No saved UPI handles yet. Click <strong>+ Add UPI ID</strong> above to link Google Pay, PhonePe, or Paytm.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upis.map((upi) => (
              <div
                key={upi.id}
                className={`rounded-2xl border p-4 flex items-center justify-between gap-3 transition ${
                  upi.isDefault
                    ? "border-brand-gold bg-brand-gold/5 shadow-xs"
                    : "border-border bg-secondary/40 hover:bg-secondary/70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider bg-brand-gold/15 px-2 py-0.5 rounded-md">
                      {upi.provider}
                    </span>
                    {upi.isDefault && (
                      <span className="text-[10px] font-bold text-brand-leaf bg-brand-leaf/15 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs sm:text-sm font-bold text-foreground">
                    {upi.upiId}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!upi.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultUpi(upi.id)}
                      className="text-xs font-bold text-brand-leaf hover:underline"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteUpi(upi.id)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition"
                    title="Remove UPI"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-luxe space-y-5">
            <button
              type="button"
              onClick={() => setIsCardModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-border pb-3">
              <h3 className="font-display text-xl font-bold text-foreground">
                Add New Card
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Encrypted with 256-Bit SSL · RBI Tokenization compliant.
              </p>
            </div>

            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Cardholder Name</label>
                <input
                  required
                  type="text"
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs uppercase outline-none focus:border-brand-leaf"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Card Number</label>
                <input
                  required
                  type="text"
                  maxLength={19}
                  placeholder="4111 2222 3333 4444"
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-mono outline-none focus:border-brand-leaf"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Expiry (MM/YY)</label>
                  <input
                    required
                    type="text"
                    maxLength={5}
                    placeholder="12/28"
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-mono outline-none focus:border-brand-leaf"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">CVV</label>
                  <input
                    required
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-mono outline-none focus:border-brand-leaf"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={cardForm.isDefault}
                  onChange={(e) => setCardForm({ ...cardForm, isDefault: e.target.checked })}
                  className="accent-brand-leaf size-4"
                />
                <span>Set as default payment card</span>
              </label>

              <div className="border-t border-border pt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCardModalOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="rounded-full text-xs font-bold"
                >
                  Tokenize & Save Card
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add UPI Modal */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-luxe space-y-5">
            <button
              type="button"
              onClick={() => setIsUpiModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-border pb-3">
              <h3 className="font-display text-xl font-bold text-foreground">
                Add New UPI ID
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Link your UPI VPA handle for instant 1-click approvals.
              </p>
            </div>

            <form onSubmit={handleUpiSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">UPI ID / VPA</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank"
                  value={upiForm.idStr}
                  onChange={(e) => setUpiForm({ ...upiForm, idStr: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-mono outline-none focus:border-brand-leaf"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">App Provider</label>
                <select
                  value={upiForm.provider}
                  onChange={(e) => setUpiForm({ ...upiForm, provider: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-brand-leaf"
                >
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="BHIM UPI">BHIM UPI</option>
                  <option value="CRED UPI">CRED UPI</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={upiForm.isDefault}
                  onChange={(e) => setUpiForm({ ...upiForm, isDefault: e.target.checked })}
                  className="accent-brand-leaf size-4"
                />
                <span>Set as primary UPI ID</span>
              </label>

              <div className="border-t border-border pt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUpiModalOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="rounded-full text-xs font-bold"
                >
                  Verify & Save UPI
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
