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
import { validatePhone } from "@/lib/validation";
import { loadUserSavedAddresses, saveUserSavedAddresses } from "@/lib/api";
import { ALL_INDIAN_STATES } from "@/components/checkout/address-manager";

export function AddressManagerTab() {
  const { user } = useStore();
  const [isLocating, setIsLocating] = useState(false);

  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    return loadUserSavedAddresses(user?.email || user?.id);
  });

  React.useEffect(() => {
    setAddresses(loadUserSavedAddresses(user?.email || user?.id));
  }, [user]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<SavedAddress, "id">>({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    landmark: "",
    city: "",
    state: "Andhra Pradesh",
    pincode: "",
    isDefault: false,
    type: "home",
  });

  const saveToStorage = (newList: SavedAddress[]) => {
    setAddresses(newList);
    saveUserSavedAddresses(user?.email || user?.id, newList);
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

  const handlePincodeChange = async (pin: string) => {
    const cleaned = pin.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => {
      const next = { ...prev, pincode: cleaned };
      if (cleaned.length >= 2) {
        const p2 = parseInt(cleaned.slice(0, 2), 10);
        if (p2 >= 51 && p2 <= 53) next.state = "Andhra Pradesh";
        else if (p2 === 50) next.state = "Telangana";
        else if (p2 >= 36 && p2 <= 39) next.state = "Gujarat";
        else if (p2 >= 40 && p2 <= 44) next.state = "Maharashtra";
        else if (p2 >= 56 && p2 <= 59) next.state = "Karnataka";
        else if (p2 >= 60 && p2 <= 64) next.state = "Tamil Nadu";
        else if (p2 >= 67 && p2 <= 69) next.state = "Kerala";
        else if (p2 === 11) next.state = "Delhi";
        else if (p2 >= 12 && p2 <= 13) next.state = "Haryana";
        else if (p2 >= 14 && p2 <= 16) next.state = "Punjab";
        else if (p2 === 17) next.state = "Himachal Pradesh";
        else if (p2 >= 18 && p2 <= 19) next.state = "Jammu and Kashmir";
        else if (p2 >= 20 && p2 <= 28) next.state = "Uttar Pradesh";
        else if (p2 >= 30 && p2 <= 34) next.state = "Rajasthan";
        else if (p2 >= 45 && p2 <= 48) next.state = "Madhya Pradesh";
        else if (p2 === 49) next.state = "Chhattisgarh";
        else if (p2 >= 70 && p2 <= 74) next.state = "West Bengal";
        else if (p2 >= 75 && p2 <= 77) next.state = "Odisha";
        else if (p2 === 78) next.state = "Assam";
        else if (p2 >= 80 && p2 <= 83) next.state = "Bihar";
        else if (p2 >= 84 && p2 <= 85) next.state = "Jharkhand";
      }
      return next;
    });

    if (cleaned.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const detectedCity = po.District || po.Name;
          const detectedState = po.State;
          if (detectedCity || detectedState) {
            setFormData((prev) => ({
              ...prev,
              city: prev.city || detectedCity || "",
              state: detectedState || prev.state,
            }));
            toast.info(`📍 Auto-detected: ${detectedCity}, ${detectedState}`);
          }
        }
      } catch (e) {
        // Fallback in place
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      street: "",
      landmark: "",
      city: "",
      state: "Andhra Pradesh",
      pincode: "",
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

    const phoneCheck = validatePhone(formData.phone);
    if (!phoneCheck.isValid) {
      toast.error(phoneCheck.error || "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-card border border-border p-5 sm:p-7 shadow-luxe max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3 pr-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1.5">
                  <Sprout className="size-3.5" />
                  {editingAddress ? "Update Location" : "New Delivery Address"}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                  {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-leaf/40 bg-brand-leaf/10 hover:bg-brand-leaf/20 text-brand-leaf px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                title="Auto-detect current GPS location and fill address"
              >
                <Compass className={`size-3.5 ${isLocating ? "animate-spin text-brand-gold" : "text-brand-leaf"}`} />
                <span>{isLocating ? "Detecting..." : "📍 Use Current Location"}</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs font-semibold">
              {/* Row 1: Recipient Name, Primary Mobile, Alternate Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <span className="text-foreground">Recipient Name *</span>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground shadow-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <span className="text-foreground">Mobile Phone *</span>
                  <div className="flex items-center rounded-xl border border-input bg-background shadow-xs focus-within:border-brand-leaf">
                    <span className="inline-flex items-center gap-1 border-r border-border/70 px-2.5 py-2 text-xs font-semibold text-muted-foreground select-none pointer-events-none shrink-0 whitespace-nowrap">
                      <span className="text-sm leading-none shrink-0">🇮🇳</span>
                      <span className="shrink-0 font-semibold">+91</span>
                    </span>
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="93114 16225"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      className="h-10 w-full min-w-0 rounded-r-xl bg-transparent px-3 text-xs outline-none text-foreground font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="grid gap-1">
                  <span className="text-foreground">Flat / House / Building *</span>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Flat 402, Green Acres"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground shadow-xs"
                  />
                </div>
              </div>

              {/* Row 2: Landmark, City, State */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Landmark (Optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. Near Pakwan Dining Hall"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground shadow-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <span className="text-foreground">City *</span>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ahmedabad / Hyderabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground shadow-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <span className="text-foreground">State *</span>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-2.5 text-xs outline-none focus:border-brand-leaf text-foreground shadow-xs cursor-pointer font-medium"
                  >
                    <option value="">-- Select State / UT --</option>
                    {ALL_INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Pincode, Address Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <span className="text-foreground">PIN Code *</span>
                  <input
                    required
                    type="text"
                    placeholder="6 digits (e.g. 380054)"
                    value={formData.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground font-mono shadow-xs"
                  />
                </div>

                <div className="md:col-span-2 grid gap-1">
                  <span className="text-foreground">Address Type</span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: "home", label: "Home", icon: Home },
                      { id: "work", label: "Work", icon: Briefcase },
                      { id: "farm", label: "Farm / Warehouse", icon: Sprout },
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setFormData({ ...formData, type: t.id as any })}
                        className={`flex items-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold uppercase transition cursor-pointer ${
                          formData.type === t.id
                            ? "border-brand-leaf bg-brand-leaf text-white shadow-xs"
                            : "border-border bg-background text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <t.icon className="size-3.5" />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Default toggle & Buttons */}
              <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="accent-brand-leaf size-4 rounded"
                  />
                  <span>Set as Default delivery address</span>
                </label>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl text-xs font-semibold px-4 h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gold"
                    size="sm"
                    className="rounded-xl text-xs font-bold px-6 h-9 shadow-sm"
                  >
                    {editingAddress ? "Update Address" : "Save Address"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
