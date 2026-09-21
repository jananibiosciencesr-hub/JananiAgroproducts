import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Home,
  Briefcase,
  Sprout,
  X,
  ShieldCheck,
  Check,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SavedAddress } from "./types";
import { useStore } from "@/components/store-provider";

export function AddressManagerTab() {
  const { user } = useStore();
  const [isLocating, setIsLocating] = useState(false);

  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_saved_addresses");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load saved addresses", e);
      }
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<SavedAddress, "id">>({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    landmark: "",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380054",
    isDefault: false,
    type: "home",
  });

  const saveToStorage = (newList: SavedAddress[]) => {
    setAddresses(newList);
    if (typeof window !== "undefined") {
      localStorage.setItem("janani_saved_addresses", JSON.stringify(newList));
    }
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

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
              const detCity = addr.city || addr.town || addr.village || addr.county || "Ahmedabad";
              const detState = addr.state || "Gujarat";
              const detPin = (addr.postcode || "").replace(/\s/g, "");
              const detStreet = [addr.house_number, addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(", ");

              setFormData((prev) => ({
                ...prev,
                street: detStreet || prev.street,
                city: detCity || prev.city,
                state: detState || prev.state,
                pincode: detPin || prev.pincode,
              }));
              toast.success("📍 Address details auto-filled from your GPS location!");
              setIsLocating(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Reverse geocode error:", err);
        }

        toast.success(`📍 GPS location captured (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        toast.error("Unable to get GPS location. Please enter address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      street: "",
      landmark: "",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380054",
      isDefault: addresses.length === 0,
      type: "home",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
      type: addr.type,
    });
    setIsModalOpen(true);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveToStorage(updated);
    toast.success("Default delivery address updated!");
  };

  const handleDelete = (id: string) => {
    if (addresses.length <= 1) {
      toast.error("You must maintain at least one delivery address.");
      return;
    }
    const updated = addresses.filter((a) => a.id !== id);
    // If we deleted the default, set the first one as default
    if (addresses.find((a) => a.id === id)?.isDefault && updated[0]) {
      updated[0].isDefault = true;
    }
    saveToStorage(updated);
    toast.success("Address removed.");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAddress) {
      // Update
      const updated = addresses.map((a) => {
        if (a.id === editingAddress.id) {
          return {
            ...a,
            ...formData,
          };
        }
        return formData.isDefault ? { ...a, isDefault: false } : a;
      });
      saveToStorage(updated);
      toast.success("Address updated successfully!");
    } else {
      // Create
      const newAddress: SavedAddress = {
        id: `addr-${Date.now()}`,
        ...formData,
      };
      const updated = formData.isDefault
        ? addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
        : [...addresses, newAddress];
      saveToStorage(updated);
      toast.success("New delivery address added!");
    }

    setIsModalOpen(false);
  };

  const getTypeIcon = (type: SavedAddress["type"]) => {
    switch (type) {
      case "home":
        return <Home className="size-3.5" />;
      case "work":
        return <Briefcase className="size-3.5" />;
      case "farm":
        return <Sprout className="size-3.5" />;
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Saved Delivery Addresses
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your doorstep shipping locations for fast, 1-click checkout dispatches.
          </p>
        </div>

        <Button
          type="button"
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          className="rounded-full text-xs font-bold gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="size-4" />
          <span>Add New Address</span>
        </Button>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`rounded-2xl border p-5 space-y-3 relative transition-all ${
              addr.isDefault
                ? "border-brand-leaf bg-brand-leaf/5 shadow-xs"
                : "border-border bg-secondary/40 hover:bg-secondary/70"
            }`}
          >
            {/* Header: Name + Type & Default Badges */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-foreground px-2.5 py-0.5 text-[11px] font-bold capitalize">
                  {getTypeIcon(addr.type)} {addr.type}
                </span>

                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-leaf/15 text-brand-leaf px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                    <CheckCircle2 className="size-3" /> Default Delivery
                  </span>
                )}
              </div>

              {/* Edit / Delete Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(addr)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition"
                  title="Edit address"
                >
                  <Edit2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition"
                  title="Delete address"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Address Content */}
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-foreground text-sm">{addr.name}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {addr.street}
                {addr.landmark ? `, Landmark: ${addr.landmark}` : ""}
              </p>
              <p className="text-foreground font-medium">
                {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
              </p>
              <p className="text-muted-foreground font-mono text-[11px]">Phone: {addr.phone}</p>
            </div>

            {/* Default toggle action if not default */}
            {!addr.isDefault && (
              <div className="pt-2 border-t border-border/70 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs font-bold text-brand-leaf hover:underline"
                >
                  Set as Default Address
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-luxe space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ensure accurate pin code for express Saurashtra farm dispatch.
                </p>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-leaf/40 bg-brand-leaf/10 hover:bg-brand-leaf/20 text-brand-leaf px-2.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                title="Auto-detect current GPS location and fill address"
              >
                <Compass className={`size-3.5 ${isLocating ? "animate-spin text-brand-gold" : "text-brand-leaf"}`} />
                <span>{isLocating ? "Detecting..." : "📍 Use Current Location"}</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Type Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Address Type
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { id: "home", label: "Home", icon: Home },
                    { id: "work", label: "Work", icon: Briefcase },
                    { id: "farm", label: "Farm / Warehouse", icon: Sprout },
                  ].map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold cursor-pointer transition ${
                        formData.type === t.id
                          ? "border-brand-leaf bg-brand-leaf/10 text-brand-leaf"
                          : "border-border hover:bg-secondary text-muted-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="addressType"
                        value={t.id}
                        checked={formData.type === t.id}
                        onChange={() => setFormData({ ...formData, type: t.id as any })}
                        className="sr-only"
                      />
                      <t.icon className="size-3.5" />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Recipient Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-brand-leaf"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Mobile Phone</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-brand-leaf font-mono"
                  />
                </div>
              </div>

              {/* Street & Landmark */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Flat / Street / Society</label>
                <input
                  required
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="e.g. Flat 402, Green Acre Heights, Bodakdev"
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-brand-leaf"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Landmark (Optional)</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Near Judges Bungalow Road"
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-brand-leaf"
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">City</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-brand-leaf"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">State</label>
                  <input
                    required
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-brand-leaf"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Pincode</label>
                  <input
                    required
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-brand-leaf font-mono"
                  />
                </div>
              </div>

              {/* Default checkbox */}
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="accent-brand-leaf size-4 rounded"
                />
                <span>Set as Default delivery address</span>
              </label>

              {/* Modal Buttons */}
              <div className="border-t border-border pt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
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
                  {editingAddress ? "Update Address" : "Save Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
