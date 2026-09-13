import React, { useState } from "react";
import { X, AlertTriangle, ShieldAlert, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { useNavigate } from "@tanstack/react-router";

interface AccountDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountDeleteModal({ isOpen, onClose }: AccountDeleteModalProps) {
  const { user, logoutUser } = useStore();
  const navigate = useNavigate();

  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const walletBalance = user?.walletBalance ?? 250;
  const isPhraseValid = confirmationPhrase.trim() === "DELETE MY ACCOUNT";

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAcknowledged || !isPhraseValid) return;

    setIsDeleting(true);
    setTimeout(() => {
      // Clear all user persistent keys
      if (typeof window !== "undefined") {
        localStorage.removeItem("janani_user");
        localStorage.removeItem("janani_token");
        localStorage.removeItem("janani_saved_addresses");
        localStorage.removeItem("janani_saved_cards");
        localStorage.removeItem("janani_saved_upis");
        localStorage.removeItem("janani_customer_orders");
      }
      logoutUser();
      setIsDeleting(false);
      onClose();
      toast.success("Account and personal data successfully erased per DPDP Act compliance.");
      navigate({ to: "/" });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-destructive/30 p-6 sm:p-8 shadow-luxe space-y-5 text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
        >
          <X className="size-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-3.5 border-b border-border pb-4">
          <div className="size-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2.5 py-0.5 rounded-full">
              Irreversible Action
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mt-1">
              Delete Patron Account
            </h3>
            <p className="text-xs text-muted-foreground">
              Indian DPDP Act & Privacy Rights Request
            </p>
          </div>
        </div>

        {/* Impact Warning */}
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 space-y-2 text-xs text-destructive">
          <p className="font-bold">Please review the consequences of account erasure:</p>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-muted-foreground">
            <li>
              You will permanently forfeit your <strong>₹{walletBalance} Farm Wallet balance</strong>.
            </li>
            <li>
              All saved delivery addresses, tokenized cards, and UPI handles will be wiped.
            </li>
            <li>
              Your past order history and GST Tax Invoices will be expunged from the patron portal.
            </li>
          </ul>
        </div>

        <form onSubmit={handleDeleteAccount} className="space-y-4">
          {/* Acknowledge Checkbox */}
          <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              className="accent-destructive size-4 mt-0.5 shrink-0"
            />
            <span className="leading-snug">
              I understand that this action is permanent and my account data cannot be recovered.
            </span>
          </label>

          {/* Typing confirmation prompt */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-muted-foreground block">
              To confirm, please type <strong className="text-destructive font-mono">DELETE MY ACCOUNT</strong> below:
            </label>
            <input
              type="text"
              value={confirmationPhrase}
              onChange={(e) => setConfirmationPhrase(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-mono outline-none focus:border-destructive font-bold text-destructive"
            />
          </div>

          {/* Action Buttons */}
          <div className="border-t border-border pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!hasAcknowledged || !isPhraseValid || isDeleting}
              className="rounded-full text-xs font-bold gap-1.5"
            >
              <Trash2 className="size-3.5" />
              {isDeleting ? "Erasing Account..." : "Permanently Delete"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
