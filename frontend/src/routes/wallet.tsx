import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Account & Orders — JANANI AGRO PRODUCTS" },
    ],
  }),
  component: WalletRedirectPage,
});

function WalletRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/dashboard" });
  }, [navigate]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4 animate-in fade-in duration-300">
      <div className="size-16 mx-auto rounded-3xl bg-primary/10 text-primary grid place-items-center">
        <ShieldCheck className="size-8" />
      </div>
      <h2 className="text-xl font-bold font-display text-foreground">
        Redirecting to Your Account...
      </h2>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
        The wallet option has been removed. You are being redirected to your customer dashboard.
      </p>
      <div className="pt-2">
        <Button asChild variant="gold" size="sm" className="rounded-full px-6 font-semibold">
          <Link to="/dashboard">
            <ArrowLeft className="size-3.5 mr-1.5" /> Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

