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
import { validatePhone } from "@/lib/validation";
import { useStore } from "@/components/store-provider";
import { loadUserSavedAddresses, saveUserSavedAddresses } from "@/lib/api";

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

// All 28 States and 8 Union Territories of India
export const ALL_INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
  "Other"
];

// PIN code auto-fill helper for common Indian hubs
const PIN_MAP: Record<string, { city: string; state: string }> = {
  // Andhra Pradesh & Telangana
  "530045": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "530001": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "530017": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "533001": { city: "Kakinada", state: "Andhra Pradesh" },
  "533101": { city: "Rajahmundry", state: "Andhra Pradesh" },
  "520001": { city: "Vijayawada", state: "Andhra Pradesh" },
  "522001": { city: "Guntur", state: "Andhra Pradesh" },
  "517501": { city: "Tirupati", state: "Andhra Pradesh" },
  "515001": { city: "Anantapur", state: "Andhra Pradesh" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "500081": { city: "Hyderabad (HITEC City)", state: "Telangana" },
  "506001": { city: "Warangal", state: "Telangana" },
  // Gujarat & Maharashtra
  "380054": { city: "Ahmedabad", state: "Gujarat" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "395001": { city: "Surat", state: "Gujarat" },
  "390001": { city: "Vadodara", state: "Gujarat" },
  "360001": { city: "Rajkot", state: "Gujarat" },
  "360024": { city: "Rajkot", state: "Gujarat" },
  "362001": { city: "Junagadh", state: "Gujarat" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "411057": { city: "Pune", state: "Maharashtra" },
  "440001": { city: "Nagpur", state: "Maharashtra" },
  // Karnataka & Tamil Nadu & Kerala
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "570001": { city: "Mysuru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "641001": { city: "Coimbatore", state: "Tamil Nadu" },
  "682001": { city: "Kochi", state: "Kerala" },
  "695001": { city: "Thiruvananthapuram", state: "Kerala" },
  // Delhi, North & East
  "110001": { city: "New Delhi", state: "Delhi" },
  "122001": { city: "Gurugram", state: "Haryana" },
  "201301": { city: "Noida", state: "Uttar Pradesh" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "751001": { city: "Bhubaneswar", state: "Odisha" },
  "800001": { city: "Patna", state: "Bihar" },
  "462001": { city: "Bhopal", state: "Madhya Pradesh" },
  "160001": { city: "Chandigarh", state: "Chandigarh" },
};

interface AddressManagerProps {
  selectedAddressId: string;
  onSelectAddress: (address: ShippingAddress) => void;
}

export function AddressManager({ selectedAddressId, onSelectAddress }: AddressManagerProps) {
  const { user } = useStore();
  const [isLocating, setIsLocating] = useState(false);

  const [addresses, setAddresses] = useState<ShippingAddress[]>(() => {
    return loadUserSavedAddresses(user?.email || user?.id);
  });

  useEffect(() => {
    setAddresses(loadUserSavedAddresses(user?.email || user?.id));
  }, [user]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<ShippingAddress, "id">>({
    fullName: user?.name || "",
    phone: user?.phone || "",
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

  // Sync to user-scoped localStorage
  useEffect(() => {
    saveUserSavedAddresses(user?.email || user?.id, addresses);
  }, [addresses, user]);

  // Ensure an address is always selected
  useEffect(() => {
    if (addresses.length > 0 && (!selectedAddressId || !addresses.some((a) => a.id === selectedAddressId))) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        onSelectAddress(defaultAddr);
      }
    }
  }, [addresses, selectedAddressId, onSelectAddress]);

  // PIN auto-lookup with postal API & prefix recognition
  const handlePincodeChange = async (pin: string) => {
    const cleaned = pin.replace(/\D/g, "").slice(0, 6);
    
    // Immediate state update & instant offline lookup
    setFormData((prev) => {
      const next = { ...prev, pincode: cleaned };
      
      if (PIN_MAP[cleaned]) {
        next.city = PIN_MAP[cleaned].city;
        next.state = PIN_MAP[cleaned].state;
        return next;
      }
      
      // Prefix range detection for Indian postal regions
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
      if (PIN_MAP[cleaned]) {
        toast.info(`📍 Auto-detected: ${PIN_MAP[cleaned].city}, ${PIN_MAP[cleaned].state}`);
        return;
      }
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
        // Fallback already in place
      }
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      fullName: user?.name || "",
      phone: user?.phone || "",
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

    const phoneCheck = validatePhone(formData.phone);
    if (!phoneCheck.isValid) {
      toast.error(phoneCheck.error || "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (formData.alternatePhone) {
      const altCheck = validatePhone(formData.alternatePhone);
      if (!altCheck.isValid) {
        toast.error(`Alternate mobile: ${altCheck.error}`);
        return;
      }
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
          <div className="relative w-full max-w-4xl rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-luxe max-h-[92vh] overflow-y-auto">
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
                  <Sparkles className="size-3.5" />
                  {editingAddress ? "Update Location" : "New Harvest Dispatch Location"}
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

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs font-semibold">
              {/* Row 1: Full Name, Primary Phone, Alternate Phone (3 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <span className="text-foreground">Full Name *</span>
                  <input
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground shadow-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <span className="text-foreground">Primary Mobile Number *</span>
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
                  <span className="text-muted-foreground">Alternate Phone (Optional)</span>
                  <div className="flex items-center rounded-xl border border-input bg-background shadow-xs focus-within:border-brand-leaf">
                    <span className="inline-flex items-center gap-1 border-r border-border/70 px-2.5 py-2 text-xs font-semibold text-muted-foreground select-none pointer-events-none shrink-0 whitespace-nowrap">
                      <span className="text-sm leading-none shrink-0">🇮🇳</span>
                      <span className="shrink-0 font-semibold">+91</span>
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Backup mobile"
                      value={formData.alternatePhone || ""}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      className="h-10 w-full min-w-0 rounded-r-xl bg-transparent px-3 text-xs outline-none text-foreground font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Flat/House, Area/Street, Landmark (3 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <span className="text-foreground">Flat, House No., Building, Apt *</span>
                  <input
                    required
                    placeholder="e.g. Flat 402, Shivalik Palms"
                    value={formData.houseFlat}
                    onChange={(e) => setFormData({ ...formData, houseFlat: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground shadow-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <span className="text-foreground">Area, Street, Sector, Village *</span>
                  <input
                    required
                    placeholder="e.g. Judges Bungalow Road, Bodakdev"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground shadow-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <span className="text-muted-foreground">Landmark (Optional)</span>
                  <input
                    placeholder="e.g. Near Pakwan Dining Hall"
                    value={formData.landmark || ""}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground shadow-xs"
                  />
                </div>
              </div>

              {/* Row 3: PIN Code, City, State (3 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <span className="text-foreground">PIN Code *</span>
                  <input
                    required
                    placeholder="6 digits (e.g. 380054)"
                    value={formData.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground font-mono shadow-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <span className="text-foreground">City *</span>
                  <input
                    required
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

              {/* Row 4: Address Type Selection, Default Toggle & Form Actions */}
              <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-foreground font-semibold mr-1">Type:</span>
                    {(["home", "work", "other"] as const).map((type) => {
                      const Icon = type === "home" ? Home : type === "work" ? Briefcase : Building;
                      const isActive = formData.type === type;
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setFormData({ ...formData, type })}
                          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-bold uppercase transition cursor-pointer ${
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

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded border-input text-brand-leaf focus:ring-brand-leaf size-4"
                    />
                    <span className="text-xs text-foreground font-medium">Set as default</span>
                  </label>
                </div>

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
