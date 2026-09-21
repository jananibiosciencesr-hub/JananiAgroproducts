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
import { products, getProductImage, pantryImage } from "@/lib/catalog";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  const cartItems = Object.entries(cart)
    .map(([idStr, qty]) => {
      const product = allProducts.find((p) => p.id === Number(idStr));
      return { product, qty };
    })
    .filter(
      (item): item is { product: NonNullable<typeof item.product>; qty: number } =>
        item.product !== undefined
    );

  const freeShippingThreshold = 799;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

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
              Your Basket ({cartCount})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            aria-label="Close cart drawer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="py-3 px-3 rounded-2xl bg-primary/5 border border-primary/20 my-3">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-brand-leaf" />
              {amountToFreeShipping > 0 ? (
                <>
                  Add <strong className="text-primary font-mono">₹{amountToFreeShipping}</strong> for FREE Delivery!
                </>
              ) : (
                <span className="text-emerald-700 font-bold">🎉 FREE Farm Delivery Unlocked!</span>
              )}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold font-mono">
              {progressPercent}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-leaf transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2 scrollbar-thin">
          {cartItems.length > 0 ? (
            cartItems.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/30 transition"
              >
                <img
                  src={getProductImage(product.name || product.category, product.image)}
                  alt={product.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = pantryImage;
                  }}
                  className="size-16 rounded-xl object-cover border border-border shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-leaf truncate block">
                    {product.category}
                  </span>
                  <Link
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    onClick={onClose}
                    className="font-bold text-xs text-foreground hover:text-primary transition truncate block"
                  >
                    {product.name}
                  </Link>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    ₹{product.price} • {product.unit}
                  </p>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center rounded-lg border border-input bg-background p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        className="size-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, qty + 1)}
                        className="size-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-xs text-foreground">
                      ₹{product.price * qty}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    removeFromCart(product.id);
                    toast.info(`Removed ${product.name}`);
                  }}
                  className="text-muted-foreground hover:text-destructive p-1 self-start"
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
                Explore our pure cold-pressed oils, millets, and Vedic spices to fill your basket.
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
                <Link to="/checkout">
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
