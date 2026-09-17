import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { products } from "@/lib/catalog";
import { type AuthUser, type UserPreferences, saveOnboardingPreferences } from "@/lib/api";

type StoreContextValue = {
  cart: Record<number, number>;
  wishlist: number[];
  cartCount: number;
  subtotal: number;
  user: AuthUser | null;
  isAuthenticated: boolean;
  addToCart: (id: number, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  toggleWishlist: (id: number) => void;
  clearWishlist: () => void;
  moveToCart: (id: number, quantity?: number) => void;
  clearCart: () => void;
  deductWalletBalance: (amount: number) => void;
  addWalletBalance: (amount: number) => void;
  loginUser: (user: AuthUser, token?: string) => void;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<AuthUser>) => void;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const DEFAULT_DEMO_USER: AuthUser = {
  id: "cust-101",
  name: "Neha Patel",
  email: "neha.patel@example.com",
  phone: "9311416225",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  role: "customer",
  walletBalance: 250,
  referralCode: "NEHA250",
  isVerified: true,
  tier: "Gold Harvest Member",
  preferences: {
    dietary: ["Cold-Pressed Oils", "Organic Millets", "Wood-Pressed Ghee"],
    pinCode: "560001",
    notifications: { email: true, sms: true, whatsapp: true }
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_cart");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored cart", e);
      }
    }
    return { 1: 1, 3: 1 };
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_wishlist");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored wishlist", e);
      }
    }
    return [6, 10, 12];
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_user");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    return DEFAULT_DEMO_USER;
  });

  // Sync user changes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("janani_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("janani_user");
        localStorage.removeItem("janani_token");
      }
    }
  }, [user]);

  // Sync cart to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("janani_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("janani_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  // Auto-sync & auto-create database tables/columns in the background
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initDb = async () => {
        try {
          if (sessionStorage.getItem("janani_db_synced")) return;
          
          // Trigger Hostinger PHP migration engine
          const res = await fetch("/db_init.php");
          if (res.ok) {
            sessionStorage.setItem("janani_db_synced", "true");
            console.log(" Janani Agro Database & Columns automatically verified/created.");
          } else {
            // Fallback to Express endpoint
            await fetch("/api/db/init").catch(() => {});
          }
        } catch (e) {
          fetch("/api/db/init").catch(() => {});
        }
      };

      const timer = setTimeout(initDb, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const loginUser = (newUser: AuthUser, token?: string) => {
    setUser(newUser);
    if (token && typeof window !== "undefined") {
      localStorage.setItem("janani_token", token);
    }
    toast.success(`Welcome back, ${newUser.name}!`);
  };

  const logoutUser = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("janani_user");
      localStorage.removeItem("janani_token");
    }
    toast.info("You have been signed out.");
  };

  const updateUserProfile = (updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updatePreferences = async (preferences: UserPreferences) => {
    if (!user) return;
    try {
      await saveOnboardingPreferences({
        userId: user.id,
        dietary: preferences.dietary,
        pinCode: preferences.pinCode,
        ...(preferences.notifications ? { notifications: preferences.notifications } : {})
      });
      setUser((prev) => (prev ? { ...prev, preferences } : null));
      toast.success("Preferences updated successfully!");
    } catch (e) {
      console.error("Failed to update preferences", e);
      setUser((prev) => (prev ? { ...prev, preferences } : null));
    }
  };

  const value = useMemo(() => ({
    cart,
    wishlist,
    cartCount: Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    subtotal: Object.entries(cart).reduce((sum, [id, qty]) => sum + (products.find((p) => p.id === Number(id))?.price ?? 0) * qty, 0),
    user,
    isAuthenticated: !!user,
    addToCart: (id: number, quantity = 1) => {
      setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + quantity }));
      toast.success("Added to your cart");
    },
    updateQuantity: (id: number, quantity: number) => setCart((current) => quantity <= 0 ? Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== id)) : ({ ...current, [id]: quantity })),
    removeFromCart: (id: number) => setCart((current) => Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== id))),
    toggleWishlist: (id: number) => setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
    clearWishlist: () => {
      setWishlist([]);
      toast.info("Wishlist cleared");
    },
    moveToCart: (id: number, quantity = 1) => {
      setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + quantity }));
      setWishlist((current) => current.filter((item) => item !== id));
      toast.success("Moved harvest item to your cart!");
    },
    clearCart: () => {
      setCart({});
    },
    deductWalletBalance: (amount: number) => {
      setUser((prev) => prev ? { ...prev, walletBalance: Math.max(0, (prev.walletBalance || 0) - amount) } : null);
    },
    addWalletBalance: (amount: number) => {
      setUser((prev) => prev ? { ...prev, walletBalance: (prev.walletBalance || 0) + amount } : null);
    },
    loginUser,
    logoutUser,
    updateUserProfile,
    updatePreferences
  }), [cart, wishlist, user]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}