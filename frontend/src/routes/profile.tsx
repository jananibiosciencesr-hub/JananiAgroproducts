import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { useStore } from "@/components/store-provider";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard",
      search: { tab: "profile" },
      replace: true,
    });
  },
  head: () => ({
    meta: [
      { title: "My Account Dashboard — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Manage personal details, saved shipping addresses, saved products, and account security.",
      },
    ],
  }),
  component: ProfileRedirectFallback,
});

function ProfileRedirectFallback() {
  const navigate = useNavigate();
  const { user } = useStore();

  useEffect(() => {
    if (user) {
      navigate({ to: "/dashboard", search: { tab: "profile" }, replace: true });
    } else {
      navigate({ to: "/login", search: { redirect: "/dashboard?tab=profile" }, replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
      <div className="size-10 mx-auto rounded-full border-2 border-brand-leaf border-t-transparent animate-spin" />
      <p className="text-sm font-semibold text-muted-foreground">Opening your Account Dashboard...</p>
    </div>
  );
}
