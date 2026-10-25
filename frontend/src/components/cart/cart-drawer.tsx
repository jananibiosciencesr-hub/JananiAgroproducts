import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Truck,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";
import { products, getProductImage, getProductVariantImage, pantryImage, type Product, parseCartItems } from "@/lib/catalog";
import { ALL_PESTICIDES } from "@/lib/crop-protection-data";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount, user, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  const cartItems = React.useMemo(() => {
    return parseCartItems(cart, allProducts);
  }, [cart, allProducts]);

  const actualCartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="relative flex h-full w-full max-w-md flex-col bg-background p-6 shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-5 text-brand-leaf" />
            <h3 className="font-display font-bold text-lg text-foreground">
              Your Basket ({actualCartCount})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-3 scrollbar-thin">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.cartKey}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/30 transition"
              >
                <img
                  src={getProductImage(item.product.name || item.product.category, item.variant?.image || getProductVariantImage(item.product, item.variantId) || item.product.image)}
                  alt={`${item.product.name} - ${item.unit}`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = item.product.image || "/products/harit.jpg";
                  }}
                  className="size-16 rounded-xl object-contain border border-border shrink-0 p-1 bg-white"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-leaf truncate block">
                    {item.product.category}
                  </span>
                  <Link
                    to="/products/$slug"
                    params={{ slug: item.product.slug }}
                    onClick={onClose}
                    className="font-bold text-xs text-foreground hover:text-primary transition truncate block"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    ₹{item.price} • {item.unit}
                  </p>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center rounded-lg border border-input bg-background p-0.5">
                      <button
                        onClick={() => updateQuantity(item.cartKey, item.qty - 1)}
                        className="size-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartKey, item.qty + 1)}
                        className="size-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-xs text-foreground">
                      ₹{item.lineTotal}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    removeFromCart(item.cartKey);
                    toast.info(`Removed ${item.product.name} (${item.unit})`);
                  }}
                  className="text-muted-foreground hover:text-destructive p-1 self-start cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <ShoppingBag className="size-8" />
              </div>
              <p className="font-display font-bold text-lg text-foreground">Your basket is empty</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Explore our certified bio-fertilizers, bio-pesticides, and soil boosters to protect your crops.
              </p>
              <Button
                asChild
                onClick={onClose}
                className="rounded-full px-6 text-xs font-bold mt-2"
              >
                <Link to="/products">Start Shopping</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Subtotal:</span>
              <strong className="font-mono font-bold text-foreground text-base">
                ₹{subtotal}
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                asChild
                variant="outline"
                className="rounded-xl text-xs font-bold h-11"
                onClick={onClose}
              >
                <Link to="/cart">View Cart Page</Link>
              </Button>

              <Button
                asChild
                variant="gold"
                className="rounded-xl text-xs font-bold h-11 shadow-md hover:shadow-lg"
                onClick={onClose}
              >
                <Link to={user ? "/checkout" : "/login"} search={user ? undefined : ({ redirect: "/checkout" } as any)}>
                  Checkout <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="size-3 text-brand-leaf" /> 100% Organic Certified • Safe Checkout
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
