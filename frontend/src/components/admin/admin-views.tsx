import React, { useState } from "react";
import {
  FolderTree,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  CreditCard,
  TicketPercent,
  Share2,
  Truck,
  Star,
  RotateCcw,
  Image as ImageIcon,
  Megaphone,
  BarChart3,
  Settings as SettingsIcon,
  ShieldCheck,
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Save,
  Send,
  Printer,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Categories View
export function CategoriesView({ categories }: { categories: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Categories & Hierarchy</h2>
          <p className="text-xs text-muted-foreground">Manage organic grain classifications, oil categories, and product counts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="h-9 rounded-xl border border-border bg-card pl-9 pr-3 text-xs outline-none focus:border-emerald-600"
            />
          </div>
          <Button size="sm" className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5">
            <Plus className="size-4" /> Add Category
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cat, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-5 shadow-soft hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{cat.icon || "🌾"}</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {cat.count || "12+ Items"}
              </span>
            </div>
            <h3 className="mt-3 text-base font-bold text-foreground">{cat.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description || "Farm fresh certified organic selection."}</p>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono text-[10px]">Slug: /{cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"><Edit className="size-3.5" /></button>
                <button className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Products View
export function ProductsView({
  products,
  onOpenAddProductModal,
  onDeleteProduct,
  onOpenRestockModal
}: {
  products: any[];
  onOpenAddProductModal: () => void;
  onDeleteProduct: (id: any) => void;
  onOpenRestockModal: (item: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Products Catalog ({products.length})</h2>
          <p className="text-xs text-muted-foreground">Manage SKUs, organic certification badges, pricing, and stock levels</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU..."
              className="h-9 rounded-xl border border-border bg-card pl-9 pr-3 text-xs outline-none focus:border-emerald-600"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-emerald-600 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="Cold Pressed Oils">Cold Pressed Oils</option>
            <option value="Organic Rice">Organic Rice</option>
            <option value="Spices">Spices</option>
            <option value="Pulses">Pulses</option>
            <option value="Flours">Flours</option>
          </select>
          <Button onClick={onOpenAddProductModal} size="sm" className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow-sm">
            <Plus className="size-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price (₹)</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Badge</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-muted/80 border border-border/60 overflow-hidden flex items-center justify-center font-bold text-xs text-muted-foreground">
                        {p.image ? <img src={p.image} alt={p.name} className="size-full object-cover" /> : "🌿"}
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground">{p.unit || "500g"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">{p.sku || `SKU-${p.id}`}</td>
                  <td className="px-6 py-4"><span className="rounded-lg bg-muted px-2 py-0.5 text-[11px] font-semibold">{p.category}</span></td>
                  <td className="px-6 py-4 font-bold text-foreground">₹{p.price} <span className="text-[10px] text-muted-foreground line-through font-normal">₹{p.oldPrice || p.originalPrice || Math.round(p.price * 1.2)}</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      (p.stock ?? 45) === 0 ? "bg-rose-500/10 text-rose-600" : (p.stock ?? 45) < 20 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      {p.stock ?? 45} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      {p.badge || "Organic Pure"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button onClick={() => onOpenRestockModal(p)} size="sm" variant="outline" className="rounded-xl text-[10px] h-7 font-bold">
                        Restock
                      </Button>
                      <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Orders View
export function OrdersView({
  orders,
  onOpenShiprocketModal,
  onOpenInvoiceModal,
  onUpdateStatus
}: {
  orders: any[];
  onOpenShiprocketModal: (order: any) => void;
  onOpenInvoiceModal: (order: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const matchSearch = o.id?.toLowerCase().includes(search.toLowerCase()) || o.customer?.name?.toLowerCase().includes(search.toLowerCase()) || o.customer?.phone?.includes(search);
    const matchStatus = statusFilter === "all" || o.orderStatus?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Orders Manager ({orders.length})</h2>
          <p className="text-xs text-muted-foreground">Fulfill orders, generate Shiprocket AWB labels, and print tax invoices</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, name, phone..."
              className="h-9 rounded-xl border border-border bg-card pl-9 pr-3 text-xs outline-none focus:border-emerald-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-emerald-600 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Order ID & Date</th>
                <th className="px-6 py-4">Customer & Address</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Shipping Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block">{o.id}</span>
                    <span className="text-[10px] text-muted-foreground">{o.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-foreground block">{o.customer?.name}</span>
                    <span className="text-[10px] text-muted-foreground">{o.customer?.phone} • {o.customer?.city}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-foreground">{o.items?.length || 1} Products</span>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{o.items?.map((i: any) => i.title || i.name).join(", ")}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">₹{(o.total || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-semibold text-foreground block">{o.paymentMethod}</span>
                    <span className={`text-[9px] font-bold ${o.paymentStatus === 'Paid' ? 'text-emerald-600' : o.paymentStatus === 'Refunded' ? 'text-rose-600' : 'text-amber-600'}`}>
                      ● {o.paymentStatus || 'Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                      className="rounded-xl border border-border bg-muted/60 px-2 py-1 text-[11px] font-bold outline-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {o.trackingId && (
                      <span className="block text-[9px] font-mono text-emerald-600 mt-1">AWB: {o.trackingId}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {o.orderStatus !== "Shipped" && o.orderStatus !== "Delivered" && (
                        <Button
                          onClick={() => onOpenShiprocketModal(o)}
                          size="sm"
                          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] h-7 font-bold gap-1"
                        >
                          <Truck className="size-3" /> Ship
                        </Button>
                      )}
                      <Button
                        onClick={() => onOpenInvoiceModal(o)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-[11px] h-7 font-semibold gap-1"
                      >
                        <Printer className="size-3" /> Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Customers View
export function CustomersView({ customers }: { customers: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Customer Database ({customers.length})</h2>
          <p className="text-xs text-muted-foreground">Patron profiles, lifetime expenditure, loyalty membership tiers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="h-9 rounded-xl border border-border bg-card pl-9 pr-3 text-xs outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-950 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {c.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{c.name}</h3>
                <p className="text-[11px] text-muted-foreground">{c.email}</p>
                <span className="mt-1 inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                  {c.tier || "Gold Patron"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Spent</span>
                <p className="text-sm font-extrabold text-foreground mt-0.5">₹{(c.totalSpent || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Orders Placed</span>
                <p className="text-sm font-extrabold text-foreground mt-0.5">{c.totalOrders || 1} orders</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>📍 {c.city}</span>
              <span>Joined: {c.joinDate || "2026"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inventory View
export function InventoryView({ inventory, onOpenRestockModal }: { inventory: any[]; onOpenRestockModal: (item: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Stock & Warehouse Inventory</h2>
          <p className="text-xs text-muted-foreground">Warehouse threshold monitoring, batch alerts, restock actions</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Current Stock</th>
              <th className="px-6 py-4">Min Threshold</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                <td className="px-6 py-4 font-bold text-foreground">{item.name}</td>
                <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">{item.sku}</td>
                <td className="px-6 py-4">{item.category}</td>
                <td className="px-6 py-4 font-extrabold text-foreground">{item.stock} units</td>
                <td className="px-6 py-4 text-muted-foreground">{item.threshold || 20} units</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    item.stock === 0 ? "bg-rose-500/10 text-rose-600" : item.stock < 20 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                  }`}>
                    {item.stock === 0 ? "Out of Stock" : item.stock < 20 ? "Low Stock Alert" : "Healthy Stock"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button onClick={() => onOpenRestockModal(item)} size="sm" className="rounded-xl bg-emerald-600 text-white font-bold text-xs h-7">
                    Restock
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Coupons View
export function CouponsView({ coupons, onOpenAddCouponModal, onToggleCoupon }: { coupons: any[]; onOpenAddCouponModal: () => void; onToggleCoupon: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Discount Coupons & Offers ({coupons.length})</h2>
          <p className="text-xs text-muted-foreground">Create promo codes, percentage discounts, and cart minimums</p>
        </div>
        <Button onClick={onOpenAddCouponModal} size="sm" className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5">
          <Plus className="size-4" /> Create Coupon
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                  {c.code}
                </span>
                <button
                  onClick={() => onToggleCoupon(c.id)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                    c.active ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.active ? "Active" : "Paused"}
                </button>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">
                {c.type === "percentage" ? `${c.discount}% OFF` : `₹${c.discount} Flat OFF`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Min cart value ₹{c.minCart} • Max off ₹{c.maxDiscount}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Uses: {c.uses} / {c.maxUses}</span>
              <span>Expires: {c.expiry}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Shipping / Shiprocket View
export function ShippingView({ orders, onOpenShiprocketModal }: { orders: any[]; onOpenShiprocketModal: (order: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Truck className="size-5 text-emerald-600" /> Shiprocket Logistics & Courier Partner Desk
          </h2>
          <p className="text-xs text-muted-foreground">Live courier dispatch integration (Bluedart, Delhivery, Xpressbees, Shadowfax)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { partner: "Bluedart Air Express", awbs: "142 Dispatched", time: "24-48 Hours", status: "Active" },
          { partner: "Delhivery Surface", awbs: "218 Dispatched", time: "2-4 Days", status: "Active" },
          { partner: "Xpressbees Surface", awbs: "84 Dispatched", time: "3-5 Days", status: "Active" },
          { partner: "Shadowfax Local", awbs: "45 Dispatched", time: "Same Day", status: "Active" },
        ].map((p, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <span className="text-xs font-bold text-foreground block">{p.partner}</span>
            <p className="text-sm font-extrabold text-emerald-600 mt-1">{p.awbs}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">SLA: {p.time}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h3 className="text-sm font-bold text-foreground mb-4">Pending Courier Pickup Requests</h3>
        <div className="space-y-3">
          {orders.filter(o => o.orderStatus === "Processing" || o.orderStatus === "Pending").map((o) => (
            <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/40 gap-3">
              <div>
                <span className="font-bold text-foreground">{o.id} • {o.customer?.name}</span>
                <p className="text-xs text-muted-foreground">{o.customer?.city} • {o.items?.length} items • ₹{o.total}</p>
              </div>
              <Button
                onClick={() => onOpenShiprocketModal(o)}
                size="sm"
                className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow"
              >
                <Truck className="size-3.5" /> Generate Shiprocket AWB
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reviews View
export function ReviewsView({ reviews, onUpdateReview }: { reviews: any[]; onUpdateReview: (id: string, status: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Customer Reviews & Ratings Moderation</h2>
        <p className="text-xs text-muted-foreground">Approve, hide or verify organic harvest testimonials</p>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{r.product}</span>
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-500" />
                  ))}
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Verified Purchase</span>
              </div>
              <p className="text-xs text-muted-foreground">"{r.comment}"</p>
              <p className="text-[10px] text-muted-foreground">By {r.customer} on {r.date}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => onUpdateReview(r.id, "Approved")}
                size="sm"
                variant={r.status === "Approved" ? "default" : "outline"}
                className="rounded-xl text-xs font-bold"
              >
                Approve
              </Button>
              <Button
                onClick={() => onUpdateReview(r.id, "Hidden")}
                size="sm"
                variant="outline"
                className="rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-500/10"
              >
                Hide
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Returns View
export function ReturnsView({ returns, onUpdateReturn }: { returns: any[]; onUpdateReturn: (id: string, status: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Returns & Refund Requests</h2>
        <p className="text-xs text-muted-foreground">Manage refund resolutions, replacement dispatches, and return reasons</p>
      </div>

      <div className="space-y-3">
        {returns.map((ret) => (
          <div key={ret.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-extrabold text-foreground">{ret.id} • Order {ret.orderId}</span>
              <p className="text-xs font-semibold text-foreground mt-0.5">{ret.product} (₹{ret.amount})</p>
              <p className="text-xs text-muted-foreground mt-0.5">Reason: {ret.reason}</p>
              <span className="inline-block mt-2 rounded-lg bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                Type: {ret.type}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={ret.status}
                onChange={(e) => onUpdateReturn(ret.id, e.target.value)}
                className="rounded-xl border border-border bg-muted px-3 py-1.5 text-xs font-bold outline-none"
              >
                <option value="Under Review">Under Review</option>
                <option value="Refund Completed">Refund Completed</option>
                <option value="Replacement Dispatched">Replacement Dispatched</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Payments View
export function PaymentsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Payments & Gateway Settlements</h2>
          <p className="text-xs text-muted-foreground">Razorpay UPI, CashFree, NetBanking and COD reconciliation</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { gateway: "Razorpay (UPI / Cards)", settled: "₹18,42,500", fee: "1.9%", status: "Connected" },
          { gateway: "CashFree Instant Payouts", settled: "₹6,43,100", fee: "1.75%", status: "Connected" },
          { gateway: "PhonePe PG Direct", settled: "₹4,12,000", fee: "0% UPI", status: "Active" },
          { gateway: "COD Courier Collection", settled: "₹5,36,890", fee: "₹35/order", status: "Active" },
        ].map((g, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <span className="text-xs font-bold text-foreground block">{g.gateway}</span>
            <p className="text-lg font-extrabold text-emerald-600 mt-1">{g.settled}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Gateway Fee: {g.fee}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Refer & Earn View
export function ReferralsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Refer & Earn Affiliate Network</h2>
        <p className="text-xs text-muted-foreground">Influencer codes, customer friend referral commissions, and wallet payouts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { code: "ORGANICLIFESTYLE", owner: "Kavya Wellness", totalReferrals: 142, revenueGenerated: "₹1,84,000", payout: "₹18,400" },
          { code: "NATURALHOMES", owner: "Pooja Hegde", totalReferrals: 98, revenueGenerated: "₹1,12,500", payout: "₹11,250" },
          { code: "HEALTHYGRAINS", owner: "Chef Sanjeev Kitchen", totalReferrals: 84, revenueGenerated: "₹96,000", payout: "₹9,600" }
        ].map((r, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">{r.code}</span>
            <h3 className="mt-2 text-sm font-bold text-foreground">{r.owner}</h3>
            <p className="text-xs text-muted-foreground mt-1">{r.totalReferrals} successful order referrals</p>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Generated: {r.revenueGenerated}</span>
              <span className="font-bold text-emerald-600">Earned: {r.payout}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// CMS & Banners View
export function CmsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Banners & Storefront CMS</h2>
          <p className="text-xs text-muted-foreground">Update homepage hero sliders, promotional tickers, and seasonal harvest highlights</p>
        </div>
        <Button size="sm" className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5">
          <Plus className="size-4" /> Add Banner Slide
        </Button>
      </div>

      <div className="space-y-4">
        {[
          { title: "Autumn Harvest Basmati Special (20% OFF)", tag: "Hero Carousel 1", status: "Active Live", date: "Sep 1 - Sep 30" },
          { title: "Cold-Pressed Wooden Expeller Kachi Ghani Oils", tag: "Hero Carousel 2", status: "Active Live", date: "Permanent" },
          { title: "Free Farm Fresh Shipping on Orders Above ₹799", tag: "Announcement Ticker", status: "Active Live", date: "Permanent" }
        ].map((b, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-5 shadow-soft flex items-center justify-between">
            <div>
              <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{b.tag}</span>
              <h3 className="text-sm font-bold text-foreground mt-1">{b.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Schedule: {b.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold">Edit Slide</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Marketing View
export function MarketingView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Marketing & Automation Hub</h2>
          <p className="text-xs text-muted-foreground">WhatsApp campaign broadcasts, abandoned cart recovery, flash sale triggers</p>
        </div>
        <Button size="sm" className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5">
          <Send className="size-4" /> New WhatsApp Broadcast
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { channel: "WhatsApp Business Broadcast", sent: "12,450 sent", opened: "94.2% Open rate", orders: "148 orders" },
          { channel: "Abandoned Cart Email Recovery", sent: "340 triggered", opened: "48.6% Open rate", orders: "39 orders" },
          { channel: "Flash Harvest Sale SMS", sent: "8,900 sent", opened: "88.1% Delivery", orders: "74 orders" }
        ].map((m, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <span className="text-xs font-bold text-foreground block">{m.channel}</span>
            <p className="text-base font-extrabold text-emerald-600 mt-2">{m.orders}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{m.sent} • {m.opened}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Reports View
export function ReportsView({ onExportCSV }: { onExportCSV: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Financial & GST Tax Reports</h2>
          <p className="text-xs text-muted-foreground">Monthly GSTR-1 sales summary, gross margins, and downloadable statements</p>
        </div>
        <Button onClick={onExportCSV} size="sm" className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5">
          <Download className="size-4" /> Download Sales Statement (CSV)
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <span className="text-xs font-bold text-muted-foreground uppercase">September Gross Sales</span>
          <p className="text-2xl font-extrabold text-foreground mt-1">₹24,85,600</p>
          <p className="text-xs text-emerald-600 font-bold mt-1">+24.5% vs August</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <span className="text-xs font-bold text-muted-foreground uppercase">GST Tax Collected (5%)</span>
          <p className="text-2xl font-extrabold text-foreground mt-1">₹1,18,360</p>
          <p className="text-xs text-muted-foreground mt-1">Ready for GSTR-1 filing</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <span className="text-xs font-bold text-muted-foreground uppercase">Average Profit Margin</span>
          <p className="text-2xl font-extrabold text-foreground mt-1">42.8%</p>
          <p className="text-xs text-emerald-600 font-bold mt-1">Direct from organic farmer clusters</p>
        </div>
      </div>
    </div>
  );
}

// Settings View
export function SettingsView({ settings }: { settings: any }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Store & Regulatory Settings</h2>
        <p className="text-xs text-muted-foreground">FSSAI food safety licenses, GST numbers, flat freight charges and API credentials</p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Company Trade Name</label>
            <input defaultValue={settings.storeName || "JANANI AGRO PRODUCTS PRIVATE LIMITED"} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold" />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">GSTIN Number</label>
            <input defaultValue={settings.gstin || "36AABCJ9481M1ZR"} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-mono font-semibold" />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">FSSAI Central License</label>
            <input defaultValue={settings.fssaiLicense || "10019047001428"} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-mono font-semibold" />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Customer Care Email</label>
            <input defaultValue={settings.contactEmail || "care@jananiagro.com"} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold" />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow">
            <Save className="size-4" /> Save Store Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// Admins & Roles View
export function RolesView({ roles }: { roles: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Admins & Staff Permissions</h2>
          <p className="text-xs text-muted-foreground">Manage administrative roles, warehouse dispatch team and support desk rights</p>
        </div>
        <Button size="sm" className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5">
          <Plus className="size-4" /> Add Staff Member
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((r) => (
          <div key={r.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">{r.role}</span>
              <span className="size-2 rounded-full bg-emerald-500"></span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-foreground">{r.name}</h3>
            <p className="text-xs text-muted-foreground">{r.email}</p>
            <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
              <span>Last active: {r.lastLogin || "Today"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
