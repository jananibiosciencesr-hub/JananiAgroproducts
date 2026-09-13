import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Heart, LogOut, MapPin, Package, RefreshCw, ShieldCheck, ShoppingBag, Truck, User } from "lucide-react";
import { orders, products } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Account & Orders — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Customer portal to manage orders, tracking, and addresses." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { wishlist, addToCart } = useStore();
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");

  const handleLogout = () => {
    toast.info("Logged out successfully");
    navigate({ to: "/" });
  };

  const handleReorder = (orderNum: string) => {
    addToCart(1, 2);
    addToCart(3, 1);
    toast.success(`Items from order ${orderNum} added to your cart!`);
    navigate({ to: "/cart" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Profile Header Card */}
      <div className="rounded-[2.5rem] bg-forest p-8 text-primary-foreground sm:p-12 shadow-luxe flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <span className="grid size-16 place-items-center rounded-full bg-brand-gold text-forest font-display text-2xl font-bold">
            NP
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Janani Member</span>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold">Neha Patel</h1>
            <p className="text-xs text-primary-foreground/70 mt-0.5">neha.patel@example.com · +91 93114 16225</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="gold" size="sm">
            <Link to="/products">Shop Harvest</Link>
          </Button>
          <Button onClick={handleLogout} variant="glass" size="sm" className="gap-1.5">
            <LogOut className="size-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Navigation Tabs */}
        <aside className="space-y-2 rounded-3xl border border-border bg-card p-4 shadow-soft h-fit">
          {[
            { id: "orders", label: "My Orders", icon: Package, count: orders.length },
            { id: "addresses", label: "Saved Addresses", icon: MapPin, count: 2 },
            { id: "profile", label: "Account Details", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4" /> {item.label}
                </span>
                {item.count !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="border-t border-border pt-3 mt-3 space-y-1">
            <Link
              to="/profile"
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold text-foreground hover:bg-secondary transition"
            >
              <span className="flex items-center gap-2.5">
                <User className="size-4 text-brand-leaf" /> Profile & Settings
              </span>
              <span className="text-[10px] text-brand-leaf font-bold">Hub</span>
            </Link>
            <Link
              to="/wishlist"
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold text-foreground hover:bg-secondary transition"
            >
              <span className="flex items-center gap-2.5">
                <Heart className="size-4 text-brand-leaf" /> My Wishlist
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                {wishlist.length}
              </span>
            </Link>
          </div>
        </aside>

        {/* Tab Panels */}
        <div>
          {/* 1. Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Past Orders & Dispatches</h2>
                  <span className="text-xs text-muted-foreground">Showing {orders.length} recent orders</span>
                </div>
                <Button asChild variant="gold" size="sm" className="rounded-full text-xs font-bold gap-1.5 shadow-sm self-start sm:self-auto">
                  <Link to="/orders">
                    <Package className="size-3.5" /> Full Orders Hub & Tracking
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.number}
                    className="rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <strong className="font-mono text-base text-foreground">{o.number}</strong>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            o.status === "Delivered" ? "bg-brand-leaf/15 text-brand-leaf" : "bg-brand-gold/20 text-brand-gold"
                          }`}>
                            {o.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Placed on {o.date} · {o.items} items</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <strong className="text-base font-bold text-foreground">₹{o.total}</strong>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Truck className="size-4 text-brand-leaf" />
                        <span>Dispatched via Delhivery Express (Gujarat Hub)</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="h-9 text-xs">
                          <Link to="/track-order">
                            Track Shipment <ArrowRight className="size-3.5 ml-1" />
                          </Link>
                        </Button>
                        <Button onClick={() => handleReorder(o.number)} variant="gold" size="sm" className="h-9 text-xs gap-1.5">
                          <RefreshCw className="size-3.5" /> Reorder
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Saved Delivery Addresses</h2>
                <Button size="sm" variant="outline" onClick={() => toast.success("New address form opened")}>
                  + Add New Address
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-soft relative">
                  <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                    Default
                  </span>
                  <p className="font-semibold text-sm">Home (Ahmedabad)</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-6">
                    Neha Patel<br />
                    A-304, Green Acres Apartments, Near SG Highway<br />
                    Ahmedabad, Gujarat – 380054<br />
                    Phone: +91 93114 16225
                  </p>
                  <div className="mt-4 flex gap-3 pt-3 border-t border-border">
                    <button className="text-xs font-semibold text-primary hover:underline">Edit</button>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <p className="font-semibold text-sm">Office (Rajkot)</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-6">
                    Patel Agro Trading Co.<br />
                    Plot 12, Sub Plots No.2/1/B, Lodhika GIDC<br />
                    Rajkot, Gujarat – 360024<br />
                    Phone: +91 96258 54967
                  </p>
                  <div className="mt-4 flex gap-3 pt-3 border-t border-border">
                    <button className="text-xs font-semibold text-primary hover:underline">Edit</button>
                    <button className="text-xs font-semibold text-muted-foreground hover:underline">Set Default</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Profile Tab */}
          {activeTab === "profile" && (
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-4">
                Personal Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <label className="grid gap-1.5 font-semibold">
                  <span>Full Name</span>
                  <input
                    defaultValue="Neha Patel"
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-1.5 font-semibold">
                  <span>Mobile Number</span>
                  <input
                    defaultValue="+91 93114 16225"
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-1.5 font-semibold sm:col-span-2">
                  <span>Email Address</span>
                  <input
                    defaultValue="neha.patel@example.com"
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>

              <Button onClick={() => toast.success("Profile changes saved successfully!")} size="sm" variant="gold">
                Save Profile Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
