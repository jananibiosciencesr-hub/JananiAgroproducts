import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Truck,
  Printer,
  Package,
  CheckCircle2,
  Download,
  Search,
  ArrowRight,
  Sparkles,
  Command
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AdminTab } from "./admin-sidebar";

// 1. Add Product Modal
export function AddProductModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Organic Rice",
    price: "",
    originalPrice: "",
    stock: "50",
    sku: "",
    badge: "100% Organic",
    description: "",
    unit: "1 kg"
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground">Add New Organic Product</h3>
            <p className="text-xs text-muted-foreground">List a new product in the Janani Agro online store</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
          onClose();
        }} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Product Title</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Royal Traditional Aged Basmati Rice (5kg)"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold outline-none"
              >
                <option value="Cold Pressed Oils">Cold Pressed Oils</option>
                <option value="Organic Rice">Organic Rice</option>
                <option value="Pulses">Pulses</option>
                <option value="Spices">Spices</option>
                <option value="Flours">Flours</option>
                <option value="Millets">Millets</option>
                <option value="Organic Fertilizers">Organic Fertilizers</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Pack Size / Unit</label>
              <input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. 1 kg / 500 ml"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Selling Price (₹)</label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="249"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-emerald-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">MRP Price (₹)</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="299"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Initial Stock</label>
              <input
                required
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Certification Badge</label>
            <input
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              placeholder="e.g. 100% Certified Organic / Wood Pressed"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none font-semibold"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow">
              <Plus className="size-4" /> Save Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. Add Coupon Modal
export function AddCouponModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (couponData: any) => void;
}) {
  const [formData, setFormData] = useState({
    code: "HARVEST20",
    discount: "20",
    type: "percentage",
    minCart: "1499",
    maxDiscount: "500",
    maxUses: "500",
    expiry: "2026-12-31"
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Create Discount Coupon</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
          onClose();
        }} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Coupon Code</label>
            <input
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. JANANI15"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-mono font-bold text-emerald-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Discount Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold outline-none"
              >
                <option value="percentage">% Percentage Off</option>
                <option value="flat">₹ Flat Off</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Value ({formData.type === 'percentage' ? '%' : '₹'})</label>
              <input
                required
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Min Cart Value (₹)</label>
              <input
                type="number"
                value={formData.minCart}
                onChange={(e) => setFormData({ ...formData, minCart: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Max Cap (₹)</label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl bg-emerald-600 text-white font-bold text-xs shadow">
              Create Coupon
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. Shiprocket AWB Dispatch Modal
export function ShiprocketModal({
  order,
  isOpen,
  onClose,
  onGenerateAwb
}: {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onGenerateAwb: (orderId: string, courier: string) => void;
}) {
  const [courier, setCourier] = useState("Bluedart Air Express");
  const [generatedAwb, setGeneratedAwb] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleDispatch = () => {
    const awb = `SR-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedAwb(awb);
    onGenerateAwb(order.id, courier);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center">
              <Truck className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Shiprocket Courier Dispatch</h3>
              <p className="text-xs text-muted-foreground">Order: {order.id} • {order.customer?.name}</p>
            </div>
          </div>
          <button onClick={() => { setGeneratedAwb(null); onClose(); }} className="p-1 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        {!generatedAwb ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-muted/40 p-4 text-xs space-y-1">
              <p className="font-bold text-foreground">Delivery Destination:</p>
              <p className="text-muted-foreground">{order.customer?.city || "Bengaluru, Karnataka"}</p>
              <p className="text-muted-foreground">Phone: {order.customer?.phone || "+91 98451 22345"}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Select Courier Partner</label>
              <div className="grid gap-2">
                {[
                  { name: "Bluedart Air Express", eta: "24-48 Hours", cost: "₹72.00", rating: "4.8" },
                  { name: "Delhivery Surface Express", eta: "2-3 Days", cost: "₹54.00", rating: "4.6" },
                  { name: "Xpressbees Direct", eta: "3-4 Days", cost: "₹48.00", rating: "4.4" }
                ].map((c) => (
                  <label
                    key={c.name}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      courier === c.name ? "border-emerald-600 bg-emerald-500/10 font-bold" : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="courier"
                        checked={courier === c.name}
                        onChange={() => setCourier(c.name)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{c.name}</span>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="font-extrabold text-foreground">{c.cost}</span>
                      <span className="text-muted-foreground block">{c.eta}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
                Cancel
              </Button>
              <Button onClick={handleDispatch} className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow">
                <Truck className="size-4" /> Generate AWB & Schedule Pickup
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center space-y-4">
            <div className="size-16 rounded-full bg-emerald-500/15 text-emerald-600 mx-auto grid place-items-center">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">AWB Assigned: {generatedAwb}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Courier pickup requested via {courier}. Manifest has been synced.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button onClick={() => window.print()} variant="outline" className="rounded-xl text-xs font-bold gap-1.5">
                <Printer className="size-3.5" /> Print Shipping Label
              </Button>
              <Button onClick={() => { setGeneratedAwb(null); onClose(); }} className="rounded-xl bg-emerald-600 text-white text-xs font-bold">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 4. Restock Modal
export function RestockModal({
  item,
  isOpen,
  onClose,
  onRestock
}: {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onRestock: (id: any, qty: number) => void;
}) {
  const [qty, setQty] = useState("50");

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Restock Product</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs font-bold text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">Current Stock: <strong className="text-foreground">{item.stock ?? 0} units</strong></p>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Add Inbound Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-emerald-600 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onRestock(item.id, Number(qty));
                onClose();
              }}
              className="rounded-xl bg-emerald-600 text-white font-bold text-xs shadow"
            >
              Add to Stock
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Tax Invoice Modal
export function InvoiceModal({
  order,
  isOpen,
  onClose
}: {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground">Tax Invoice Preview</h3>
            <p className="text-xs text-muted-foreground">GSTIN: 36AABCJ9481M1ZR • FSSAI: 10019047001428</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        <div className="mt-6 space-y-6 text-xs text-foreground">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400">JANANI AGRO PRODUCTS PVT LTD</p>
              <p className="text-muted-foreground mt-0.5">Plot No. 42, GIDC Lodhika Industrial Estate, Metoda, Rajkot - 360021</p>
              <p className="text-muted-foreground">care@jananiagro.com • +91 93114 16225</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-foreground text-sm block">Invoice #{order.id}</span>
              <span className="text-muted-foreground">{order.date || "2026-09-11"}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-muted/40 p-4">
            <span className="font-bold block uppercase text-[10px] text-muted-foreground">Billed To:</span>
            <p className="font-bold text-sm mt-0.5">{order.customer?.name}</p>
            <p className="text-muted-foreground">{order.customer?.city || "Bengaluru, Karnataka"}</p>
            <p className="text-muted-foreground">Phone: {order.customer?.phone}</p>
          </div>

          <table className="w-full text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="py-2 px-3 font-bold">Item Description</th>
                <th className="py-2 px-3 font-bold text-center">Qty</th>
                <th className="py-2 px-3 font-bold text-right">Price (₹)</th>
                <th className="py-2 px-3 font-bold text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(order.items || [{ title: "Royal Aged Basmati Rice (5kg)", qty: 1, price: order.total }]).map((item: any, i: number) => (
                <tr key={i}>
                  <td className="py-3 px-3 font-medium">{item.title || item.name}</td>
                  <td className="py-3 px-3 text-center">{item.qty || 1}</td>
                  <td className="py-3 px-3 text-right font-mono">₹{item.price}</td>
                  <td className="py-3 px-3 text-right font-bold font-mono">₹{(item.price || 0) * (item.qty || 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">₹{order.total}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (5% included):</span>
                <span className="font-mono">₹{Math.round(order.total * 0.05)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping:</span>
                <span className="font-mono text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border">
                <span>Total Paid:</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
            Close
          </Button>
          <Button onClick={() => window.print()} className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow">
            <Printer className="size-4" /> Print Tax Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}

// 6. Global Command Search Modal (Ctrl + K)
export function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigateTab
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AdminTab) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // toggle search modal
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const quickNavs = [
    { label: "Products Catalog", tab: "products" as AdminTab, icon: Package },
    { label: "Orders Manager", tab: "orders" as AdminTab, icon: Truck },
    { label: "Warehouse Inventory", tab: "inventory" as AdminTab, icon: Package },
    { label: "Customer Inquiries & Dealership", tab: "customers" as AdminTab, icon: Sparkles },
    { label: "Discount Coupons & Offers", tab: "coupons" as AdminTab, icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-4 shadow-2xl">
        <div className="flex items-center gap-3 px-3 border-b border-border pb-3">
          <Search className="size-5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (e.g. Orders, Basmati, Inventory)..."
            className="w-full bg-transparent text-sm font-semibold outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground px-3 uppercase tracking-wider">Quick Navigation</p>
          {quickNavs.map((nav, idx) => {
            const Icon = nav.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  onNavigateTab(nav.tab);
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-2xl p-3 text-xs font-semibold text-foreground hover:bg-emerald-500/10 hover:text-emerald-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{nav.label}</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
