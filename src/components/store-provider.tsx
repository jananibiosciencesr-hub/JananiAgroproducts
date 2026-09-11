import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { products } from "@/lib/catalog";

type StoreContextValue = {
  cart: Record<number, number>;
  wishlist: number[];
  cartCount: number;
  subtotal: number;
  addToCart: (id: number, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  toggleWishlist: (id: number) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>({ 1: 1, 3: 1 });
  const [wishlist, setWishlist] = useState<number[]>([6, 10, 12]);

  const value = useMemo(() => ({
    cart,
    wishlist,
    cartCount: Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    subtotal: Object.entries(cart).reduce((sum, [id, qty]) => sum + (products.find((p) => p.id === Number(id))?.price ?? 0) * qty, 0),
    addToCart: (id: number, quantity = 1) => {
      setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + quantity }));
      toast.success("Added to your cart");
    },
    updateQuantity: (id: number, quantity: number) => setCart((current) => quantity <= 0 ? Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== id)) : ({ ...current, [id]: quantity })),
    removeFromCart: (id: number) => setCart((current) => Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== id))),
    toggleWishlist: (id: number) => setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
  }), [cart, wishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}