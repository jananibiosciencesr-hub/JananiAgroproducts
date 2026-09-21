import React, { useState, useEffect } from "react";
import {
  MapPin,
  Home,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Phone,
  Building,
  Sparkles,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  houseFlat: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
}

// PIN code auto-fill helper for common Indian hubs
const PIN_MAP: Record<string, { city: string; state: string }> = {
  "380054": { city: "Ahmedabad", state: "Gujarat" },
  "360024": { city: "Rajkot", state: "Gujarat" },
  "362001": { city: "Junagadh", state: "Gujarat" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "411057": { city: "Pune", state: "Maharashtra" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "500001": { city: "Hyderabad", state: "Telangana" },
};

interface AddressManagerProps {
  selectedAddressId: string;
  onSelectAddress: (address: ShippingAddress) => void;
}

export function AddressManager({ selectedAddressId, onSelectAddress }: AddressManagerProps) {
  const [isLocating, setIsLocating] = useState(false);

  const [addresses, setAddresses] = useState<ShippingAddress[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_saved_addresses");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load addresses", e);
      }
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<ShippingAddress, "id">>({
    fullName: "",
    phone: "",
    alternatePhone: "",
    houseFlat: "",
    street: "",
    landmark: "",
    city: "",
    state: "Gujarat",
    pincode: "",
    type: "home",
    isDefault: false,
  });

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

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("janani_saved_addresses", JSON.stringify(addresses));
    }
  }, [addresses]);

  // Ensure an address is always selected
  useEffect(() => {
    if (addresses.length > 0 && (!selectedAddressId || !addresses.some((a) => a.id === selectedAddressId))) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        onSelectAddress(defaultAddr);
      }
    }
  }, [addresses, selectedAddressId, onSelectAddress]);

  // PIN auto-lookup
  const handlePincodeChange = (pin: string) => {
    const cleaned = pin.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => {
      const next = { ...prev, pincode: cleaned };
      if (cleaned.length === 6 && PIN_MAP[cleaned]) {
        next.city = PIN_MAP[cleaned].city;
        next.state = PIN_MAP[cleaned].state;
        toast.info(`Auto-detected: ${PIN_MAP[cleaned].city}, ${PIN_MAP[cleaned].state}`);
      }
      return next;
    });
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      fullName: "",
      phone: "",
      alternatePhone: "",
      houseFlat: "",
      street: "",
      landmark: "",
      city: "",
      state: "Gujarat",
      pincode: "",
      type: "home",
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr: ShippingAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      alternatePhone: addr.alternatePhone || "",
      houseFlat: addr.houseFlat,
      street: addr.street,
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      toast.error("You must have at least one delivery address.");
      return;
    }
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    toast.success("Delivery address removed");
    if (selectedAddressId === id && updated[0]) {
      onSelectAddress(updated[0]);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.pincode.trim()) {
      toast.error("Please fill in all mandatory address fields.");
      return;
    }

    if (editingAddress) {
      const updated = addresses.map((a) => {
        if (a.id === editingAddress.id) {
          return {
            ...editingAddress,
            ...formData,
          };
        }
        return formData.isDefault ? { ...a, isDefault: false } : a;
      });
      setAddresses(updated);
      const updatedItem = updated.find((a) => a.id === editingAddress.id);
      if (updatedItem && selectedAddressId === editingAddress.id) {
        onSelectAddress(updatedItem);
      }
      toast.success("Address updated successfully!");
    } else {
      const newAddress: ShippingAddress = {
        id: `addr-${Date.now()}`,
        ...formData,
      };
      let updated = [...addresses];
      if (newAddress.isDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: false }));
      }
      updated.push(newAddress);
      setAddresses(updated);
      onSelectAddress(newAddress);
      toast.success("New delivery address added & selected!");
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <MapPin className="size-5 text-brand-leaf" />
          Delivery Address
        </h3>
        <Button
          type="button"
          onClick={openAddModal}
          variant="outline"
          size="sm"
          className="rounded-full text-xs font-semibold gap-1.5 border-brand-leaf/30 text-brand-leaf hover:bg-brand-leaf/10"
        >
          <Plus className="size-3.5" /> Add New Address
        </Button>
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => {
          const isSelected = addr.id === selectedAddressId;
          const TypeIcon = addr.type === "home" ? Home : addr.type === "work" ? Briefcase : Building;

          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr)}
              className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 text-left ${
                isSelected
                  ? "border-brand-leaf bg-brand-leaf/5 shadow-soft ring-2 ring-brand-leaf/20"
                  : "border-border bg-card hover:border-brand-leaf/40 hover:bg-secondary/40"
              }`}
            >
              {/* Header with Type badge and Radio */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isSelected
                        ? "bg-brand-leaf text-white"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <TypeIcon className="size-3" />
                    {addr.type}
                  </span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-brand-gold/15 text-brand-gold px-2 py-0.5 text-[10px] font-bold">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div
                  className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-brand-leaf bg-brand-leaf text-white"
                      : "border-muted-foreground/30 bg-background"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="size-3.5" />}
                </div>
              </div>

              {/* Recipient info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground">{addr.fullName}</h4>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3" /> {addr.phone}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                  {addr.houseFlat}, {addr.street}
                </p>
                {addr.landmark && (
                  <p className="text-[11px] text-muted-foreground/80 italic">
                    Landmark: {addr.landmark}
                  </p>
                )}
                <p className="text-xs font-semibold text-foreground">
                  {addr.city}, {addr.state} — <span className="font-mono">{addr.pincode}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-brand-leaf font-semibold">
                  {isSelected ? "✓ Active Delivery Target" : "Click to Deliver Here"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => openEditModal(addr, e)}
                    className="p-1 text-muted-foreground hover:text-foreground transition rounded-md hover:bg-secondary"
                    title="Edit address"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteAddress(addr.id, e)}
                    className="p-1 text-muted-foreground hover:text-destructive transition rounded-md hover:bg-destructive/10"
                    title="Delete address"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Quick Add Button Card */}
        <button
          type="button"
          onClick={openAddModal}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 p-6 text-center text-muted-foreground hover:border-brand-leaf hover:bg-brand-leaf/5 hover:text-brand-leaf transition-all duration-200 min-h-[140px]"
        >
          <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-foreground group-hover:bg-brand-leaf/10">
            <Plus className="size-5" />
          </div>
          <span className="text-xs font-bold">Add Another Delivery Location</span>
          <span className="text-[10px] text-muted-foreground">Home, Office, or Family Farm</span>
        </button>
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-luxe max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  {editingAddress ? "Update Location" : "New Harvest Dispatch Location"}
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground mt-1">
                  {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-leaf/40 bg-brand-leaf/10 hover:bg-brand-leaf/20 text-brand-leaf px-2.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 mr-8"
                title="Auto-detect current GPS location and fill address"
              >
                <Compass className={`size-3.5 ${isLocating ? "animate-spin text-brand-gold" : "text-brand-leaf"}`} />
                <span>{isLocating ? "Detecting..." : "📍 Use Current Location"}</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs font-semibold">
              {/* Recipient Full Name */}
              <label className="grid gap-1.5">
                <span className="text-foreground">Full Name *</span>
                <input
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground"
                />
              </label>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="grid gap-1.5">
                  <span className="text-foreground">Primary Mobile Number *</span>
                  <input
                    required
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-muted-foreground">Alternate Phone (Optional)</span>
                  <input
                    type="tel"
                    placeholder="Backup contact number"
                    value={formData.alternatePhone || ""}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground"
                  />
                </label>
              </div>

              {/* House / Flat & Street */}
              <label className="grid gap-1.5">
                <span className="text-foreground">Flat, House No., Building, Apartment *</span>
                <input
                  required
                  placeholder="e.g. Flat 402, Shivalik Palms"
                  value={formData.houseFlat}
                  onChange={(e) => setFormData({ ...formData, houseFlat: e.target.value })}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-foreground">Area, Street, Sector, Village *</span>
                <input
                  required
                  placeholder="e.g. Judges Bungalow Road, Bodakdev"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground"
                />
              </label>

              {/* Landmark */}
              <label className="grid gap-1.5">
                <span className="text-muted-foreground">Landmark (Optional)</span>
                <input
                  placeholder="e.g. Near Pakwan Dining Hall or Water Tank"
                  value={formData.landmark || ""}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground"
                />
              </label>

              {/* Pincode, City, State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="grid gap-1.5">
                  <span className="text-foreground">PIN Code *</span>
                  <input
                    required
                    placeholder="6 digits"
                    value={formData.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground font-mono"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-foreground">City *</span>
                  <input
                    required
                    placeholder="e.g. Ahmedabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-foreground">State *</span>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-2 text-xs outline-none focus:border-brand-leaf text-foreground"
                  >
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Other">Other State</option>
                  </select>
                </label>
              </div>

              {/* Address Type selection */}
              <div>
                <span className="block text-foreground mb-2">Address Type:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["home", "work", "other"] as const).map((type) => {
                    const Icon = type === "home" ? Home : type === "work" ? Briefcase : Building;
                    const isActive = formData.type === type;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setFormData({ ...formData, type })}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold uppercase transition ${
                          isActive
                            ? "border-brand-leaf bg-brand-leaf text-white shadow-xs"
                            : "border-border bg-background text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-input text-brand-leaf focus:ring-brand-leaf size-4"
                />
                <span className="text-xs text-foreground">Set as default delivery address</span>
              </label>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="rounded-full text-xs font-semibold px-6"
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
