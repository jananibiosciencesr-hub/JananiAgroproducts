import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { products as initialProducts, categories as initialCategories, type Product } from "@/lib/catalog";
import { type AuthUser, type UserPreferences, saveOnboardingPreferences, getProducts, getCategories, updateUserProfileApi } from "@/lib/api";

type StoreContextValue = {
  products: Product[];
  categories: any[];
  refreshProducts: () => Promise<void>;
  refreshUserProfile: (targetUser?: AuthUser | null) => Promise<void>;
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to parse stored cart", e);
      }
    }
    return {};
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("janani_user") || localStorage.getItem("janani_auth_user");
        if (storedUser) {
          const stored = localStorage.getItem("janani_wishlist");
          if (stored) return JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to parse stored wishlist", e);
      }
    }
    return [];
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          // Strictly prevent admin credentials from polluting customer storefront
          if (
            parsed?.role === "Super Admin" ||
            parsed?.role === "Admin" ||
            (typeof parsed?.email === "string" && parsed.email.toLowerCase() === "jananibiosciences.r@gmail.com")
          ) {
            return null;
          }
          if (
            parsed?.email?.toLowerCase().includes("neha.patel") ||
            parsed?.email?.toLowerCase().includes("example.com") ||
            parsed?.name?.toLowerCase().includes("neha patel") ||
            parsed?.id === "cust-101"
          ) {
            localStorage.removeItem("janani_user");
            localStorage.removeItem("janani_auth_user");
            localStorage.removeItem("janani_token");
            localStorage.removeItem("janani_auth_token");
            return null;
          }
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    return null;
  });

  const [liveProducts, setLiveProducts] = useState<Product[]>(initialProducts);
  const [liveCategories, setLiveCategories] = useState<any[]>(initialCategories);

  const refreshProducts = async () => {
    try {
      const [fetchedProds, fetchedCats] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      if (Array.isArray(fetchedProds) && fetchedProds.length > 0) {
        setLiveProducts(fetchedProds);
      }
      if (Array.isArray(fetchedCats) && fetchedCats.length > 0) {
        setLiveCategories(fetchedCats);
      }
    } catch (e) {
      console.warn("[StoreProvider] Background product sync:", e);
    }
  };

  const refreshUserProfile = async (currentUser?: AuthUser | null) => {
    let target = currentUser || user;
    if (!target && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_user") || localStorage.getItem("janani_auth_user");
        if (stored) target = JSON.parse(stored);
      } catch (e) {}
    }
    const identifier = target?.email || target?.id;
    if (!identifier) return;

    try {
      const res = await fetch(`/api.php?action=customers&id=${encodeURIComponent(identifier)}`);
      if (res.ok) {
        const data = await res.json();
        const serverUser = data?.customer || data?.user || data?.data;
        if (serverUser && serverUser.id) {
          setUser((prev) => {
            const base = prev || target;
            if (!base) return null;
            const updated: AuthUser = {
              ...base,
              id: serverUser.id || base.id,
              name: serverUser.name || base.name,
              email: serverUser.email || base.email,
              phone: serverUser.phone !== undefined && serverUser.phone !== null && serverUser.phone !== "" ? serverUser.phone : base.phone,
              gender: serverUser.gender || base.gender,
              dob: serverUser.dob || base.dob,
              bio: serverUser.bio || base.bio,
              walletBalance: Number(serverUser.walletBalance ?? serverUser.wallet_balance ?? base.walletBalance ?? 0),
              loyaltyPoints: Number(serverUser.loyaltyPoints ?? serverUser.loyalty_points ?? base.loyaltyPoints ?? 0),
              tier: serverUser.tier || base.tier,
              status: serverUser.status || base.status,
              preferences: serverUser.preferences || base.preferences,
            };
            if (typeof window !== "undefined") {
              localStorage.setItem("janani_user", JSON.stringify(updated));
              localStorage.setItem("janani_auth_user", JSON.stringify(updated));
            }
            return updated;
          });
        }
      }
    } catch (e) {
      console.warn("[StoreProvider] Background user profile sync note:", e);
    }
  };

  useEffect(() => {
    refreshProducts();
    refreshUserProfile();

    const handleSync = () => {
      refreshProducts();
      refreshUserProfile();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("janani-products-updated", handleSync);
      window.addEventListener("janani-categories-updated", handleSync);
      window.addEventListener("storage", handleSync);
      window.addEventListener("focus", handleSync);

      try {
        // Always purge legacy un-scoped shared orders and addresses to prevent cross-account pollution
        localStorage.removeItem("janani_saved_addresses");
        localStorage.removeItem("janani_customer_orders");

        const latestOrderRaw = localStorage.getItem("janani_latest_order");
        if (latestOrderRaw) {
          try {
            const latest = JSON.parse(latestOrderRaw);
            const currentUserStr = localStorage.getItem("janani_user") || localStorage.getItem("janani_auth_user");
            const parsedUser = currentUserStr ? JSON.parse(currentUserStr) : null;
            const currentEmail = (parsedUser?.email || "").toLowerCase().trim();
            const orderEmail = (latest?.customerEmail || "").toLowerCase().trim();
            if (currentEmail && orderEmail && currentEmail !== orderEmail) {
              localStorage.removeItem("janani_latest_order");
            }
          } catch (e) {
            localStorage.removeItem("janani_latest_order");
          }
        }

        const legacyKeys = ["janani_pending_checkout"];
        legacyKeys.forEach((key) => {
          const item = localStorage.getItem(key);
          if (item && (item.toLowerCase().includes("neha") || item.toLowerCase().includes("example.com") || item.includes("9311416225"))) {
            localStorage.removeItem(key);
          }
        });

        // Clean obsolete demo grocery products if present
        const storedProducts = localStorage.getItem("janani_admin_products");
        if (storedProducts && (storedProducts.includes("unpolished-toor-dal") || storedProducts.includes("lakadong-turmeric"))) {
          localStorage.removeItem("janani_admin_products");
          localStorage.removeItem("janani_admin_categories");
        }
      } catch (e) {}

      return () => {
        window.removeEventListener("janani-products-updated", handleSync);
        window.removeEventListener("janani-categories-updated", handleSync);
        window.removeEventListener("storage", handleSync);
        window.removeEventListener("focus", handleSync);
      };
    }
  }, []);

  // Sync customer user changes to localStorage (Customer only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user && user.role !== "Super Admin" && user.role !== "Admin") {
        localStorage.setItem("janani_user", JSON.stringify(user));
        localStorage.setItem("janani_auth_user", JSON.stringify(user));
      } else if (!user) {
        localStorage.removeItem("janani_user");
        localStorage.removeItem("janani_auth_user");
        localStorage.removeItem("janani_token");
        localStorage.removeItem("janani_auth_token");
        localStorage.removeItem("janani_wishlist");
        setWishlist([]);
      }
    }
  }, [user]);

  // Authoritative server reconciliation: sync real customer ID, name, phone, and wallet from MySQL
  useEffect(() => {
    if (!user?.email || typeof window === "undefined") return;
    const targetEmail = user.email.toLowerCase().trim();
    if (targetEmail === "jananibiosciences.r@gmail.com" || targetEmail.includes("admin")) return;

    let isMounted = true;
    fetch(`/api.php?action=customers&id=${encodeURIComponent(targetEmail)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.success) return;
        const srv = data.customer || data.data || data.user;
        if (!srv) return;

        setUser((prev) => {
          if (!prev) return null;
          const merged: AuthUser = {
            ...prev,
            id: srv.id || prev.id,
            name: (srv.name && !srv.name.includes("@") && srv.name !== "Valued Patron" && srv.name !== "Customer") ? srv.name : (prev.name || srv.name),
            phone: srv.phone || prev.phone,
            walletBalance: srv.walletBalance !== undefined ? Number(srv.walletBalance) : (srv.wallet_balance !== undefined ? Number(srv.wallet_balance) : prev.walletBalance),
            loyaltyPoints: srv.loyaltyPoints !== undefined ? Number(srv.loyaltyPoints) : (srv.loyalty_points !== undefined ? Number(srv.loyalty_points) : prev.loyaltyPoints),
          };
          localStorage.setItem("janani_user", JSON.stringify(merged));
          localStorage.setItem("janani_auth_user", JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // Sync cart to localStorage reliably
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
    const isAdmin =
      newUser?.role === "Super Admin" ||
      newUser?.role === "Admin" ||
      (typeof newUser?.email === "string" &&
        (newUser.email.toLowerCase() === "jananibiosciences.r@gmail.com" ||
          newUser.email.toLowerCase().includes("admin@jananiagro.com")));

    if (isAdmin) {
      if (typeof window !== "undefined") {
        localStorage.setItem("janani_admin_user", JSON.stringify(newUser));
        localStorage.setItem("janani_admin_session", "true");
        if (token) localStorage.setItem("janani_admin_token", token);
      }
      return;
    }

    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("janani_user", JSON.stringify(newUser));
      localStorage.setItem("janani_auth_user", JSON.stringify(newUser));
      if (token) {
        localStorage.setItem("janani_token", token);
        localStorage.setItem("janani_auth_token", token);
      }
    }
    toast.success(`Welcome back, ${newUser.name}!`);
  };

  const logoutUser = () => {
    setUser(null);
    setCart({});
    setWishlist([]);
    if (typeof window !== "undefined") {
      // Clear ONLY customer keys - preserve admin session untouched!
      localStorage.removeItem("janani_token");
      localStorage.removeItem("janani_auth_token");
      localStorage.removeItem("janani_user");
      localStorage.removeItem("janani_auth_user");
      localStorage.removeItem("janani_cart");
      localStorage.removeItem("janani_saved_for_later");
      localStorage.removeItem("janani_pending_checkout");
      localStorage.removeItem("janani_wishlist");
      localStorage.removeItem("janani_latest_order");
      localStorage.removeItem("janani_customer_orders");
    }
    toast.info("You have been signed out.");
  };

  const updateUserProfile = async (updates: Partial<AuthUser>) => {
    const current = user;
    const updated = current ? { ...current, ...updates } : (updates as AuthUser);
    setUser(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("janani_user", JSON.stringify(updated));
      localStorage.setItem("janani_auth_user", JSON.stringify(updated));
    }

    const idOrEmail = updated?.email || current?.email || updated?.id || current?.id;
    if (idOrEmail) {
      try {
        const res = await updateUserProfileApi(idOrEmail, {
          ...updates,
          id: updated?.id || current?.id,
          email: updated?.email || current?.email
        });
        if (res?.success && (res.customer || res.user || res.data)) {
          const srv = res.customer || res.user || res.data;
          setUser((prev) => {
            if (!prev) return null;
            const synced: AuthUser = {
              ...prev,
              id: srv.id || prev.id,
              name: srv.name || prev.name,
              phone: srv.phone || prev.phone
            };
            if (typeof window !== "undefined") {
              localStorage.setItem("janani_user", JSON.stringify(synced));
              localStorage.setItem("janani_auth_user", JSON.stringify(synced));
            }
            return synced;
          });
        }
      } catch (err) {
        console.warn("Could not sync profile update to server:", err);
      }
    }
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

  // Auto purge orphan/invalid product IDs & merge duplicate string/number keys in cart
  useEffect(() => {
    if (!liveProducts || liveProducts.length === 0) return;
    setCart((current) => {
      const entries = Object.entries(current);
      let changed = false;
      const cleaned: Record<number, number> = {};
      
      for (const [idStr, qty] of entries) {
        const q = Number(qty);
        if (isNaN(q) || q <= 0) {
          changed = true;
          continue;
        }
        const prod =
          liveProducts.find((p) => Number(p.id) === Number(idStr) || String(p.id) === idStr || p.slug === idStr) ||
          initialProducts.find((p) => Number(p.id) === Number(idStr) || String(p.id) === idStr || p.slug === idStr);
        
        if (prod) {
          const canonicalId = Number(prod.id);
          if (canonicalId !== Number(idStr) || cleaned[canonicalId] !== undefined) {
            changed = true;
          }
          cleaned[canonicalId] = (cleaned[canonicalId] || 0) + q;
        } else {
          changed = true;
        }
      }
      return changed ? cleaned : current;
    });
  }, [liveProducts]);

  const value = useMemo(() => ({
    products: liveProducts,
    categories: liveCategories,
    refreshProducts,
    refreshUserProfile,
    cart,
    wishlist,
    cartCount: Object.entries(cart).reduce((sum, [id, qty]) => {
      const q = Number(qty);
      if (isNaN(q) || q <= 0) return sum;
      const numId = Number(id);
      const prod =
        liveProducts.find((p) => Number(p.id) === numId || String(p.id) === String(id) || p.slug === String(id)) ||
        initialProducts.find((p) => Number(p.id) === numId || String(p.id) === String(id) || p.slug === String(id));
      return prod ? sum + q : sum;
    }, 0),
    subtotal: Object.entries(cart).reduce((sum, [id, qty]) => {
      const q = Number(qty);
      if (isNaN(q) || q <= 0) return sum;
      const numId = Number(id);
      const prod =
        liveProducts.find((p) => Number(p.id) === numId || String(p.id) === String(id) || p.slug === String(id)) ||
        initialProducts.find((p) => Number(p.id) === numId || String(p.id) === String(id) || p.slug === String(id));
      return prod ? sum + (prod?.price ?? 0) * q : sum;
    }, 0),
    user,
    isAuthenticated: !!user,
    addToCart: (id: number | string, quantity = 1) => {
      const prod =
        liveProducts.find((p) => Number(p.id) === Number(id) || String(p.id) === String(id) || p.slug === String(id)) ||
        initialProducts.find((p) => Number(p.id) === Number(id) || String(p.id) === String(id) || p.slug === String(id));
      
      const targetId = prod ? Number(prod.id) : Number(id);
      if (isNaN(targetId) || quantity <= 0) return;

      setCart((current) => ({
        ...current,
        [targetId]: (current[targetId] ?? 0) + quantity,
      }));
    },
    updateQuantity: (id: number | string, quantity: number) => {
      const prod =
        liveProducts.find((p) => Number(p.id) === Number(id) || String(p.id) === String(id) || p.slug === String(id)) ||
        initialProducts.find((p) => Number(p.id) === Number(id) || String(p.id) === String(id) || p.slug === String(id));
      
      const targetId = prod ? Number(prod.id) : Number(id);
      const strId = String(id);

      setCart((current) => {
        const next = { ...current };
        if (!isNaN(targetId)) delete next[targetId];
        delete (next as any)[strId];
        
        if (quantity > 0 && !isNaN(targetId)) {
          next[targetId] = quantity;
        }
        return next;
      });
    },
    removeFromCart: (id: number | string) => {
      const prod =
        liveProducts.find((p) => Number(p.id) === Number(id) || String(p.id) === String(id) || p.slug === String(id)) ||
        initialProducts.find((p) => Number(p.id) === Number(id) || String(p.id) === String(id) || p.slug === String(id));
      
      const targetId = prod ? Number(prod.id) : Number(id);
      const strId = String(id);

      setCart((current) => {
        const next = { ...current };
        if (!isNaN(targetId)) delete next[targetId];
        delete (next as any)[strId];
        return next;
      });
    },
    toggleWishlist: (id: number) => {
      if (!user) {
        toast.error("Please Sign In or Register to use Wishlist!", {
          description: "Wishlist is only available for registered patrons. Please sign in or register to save favourite crop solutions.",
          action: {
            label: "Sign In / Register",
            onClick: () => {
              window.location.href = "/login";
            },
          },
          duration: 5000,
        });
        return;
      }
      setWishlist((current) => {
        const isPresent = current.includes(id);
        if (isPresent) {
          toast.info("Removed from your saved wishlist");
          return current.filter((item) => item !== id);
        } else {
          toast.success("Saved to your wishlist!");
          return [...current, id];
        }
      });
    },
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
  }), [cart, wishlist, user, liveProducts, liveCategories]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}