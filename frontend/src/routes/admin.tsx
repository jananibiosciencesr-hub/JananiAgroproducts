import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AdminSidebar,
  type AdminTab
} from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminOverview } from "@/components/admin/admin-overview";
import { CategoriesManagement } from "@/components/admin/admin-categories";
import { ProductsManagement } from "@/components/admin/admin-products";
import { CustomersManagement } from "@/components/admin/admin-customers";
import { OrdersManagement } from "@/components/admin/admin-orders";
import { ShippingManagement } from "@/components/admin/admin-shipping";
import { PaymentsManagement } from "@/components/admin/admin-payments";
import { CouponsManagement } from "@/components/admin/admin-coupons";
import { ReferralsManagement } from "@/components/admin/admin-referrals";
import { ReviewsManagement } from "@/components/admin/admin-reviews";
import { CmsManagement } from "@/components/admin/admin-cms";
import { MarketingManagement } from "@/components/admin/admin-marketing";
import { ReportsManagement } from "@/components/admin/admin-reports";
import { SettingsManagement } from "@/components/admin/admin-settings";
import {
  OrdersView,
  InventoryView,
  CouponsView,
  ShippingView,
  ReturnsView,
  PaymentsView,
  CmsView,
  MarketingView,
  ReportsView,
  SettingsView,
  RolesView
} from "@/components/admin/admin-views";
import {
  AddProductModal,
  AddCouponModal,
  ShiprocketModal,
  RestockModal,
  InvoiceModal,
  GlobalSearchModal
} from "@/components/admin/admin-modals";
import {
  getAdminStats,
  getAdminCharts,
  getAdminWidgets,
  getAdminOrders,
  updateAdminOrderStatus,
  generateShiprocketAwb,
  getAdminProducts,
  createAdminProduct,
  deleteAdminProduct,
  getAdminCustomers,
  getAdminInventory,
  restockAdminInventory,
  getAdminCoupons,
  createAdminCoupon,
  toggleAdminCoupon,
  getAdminReviews,
  updateAdminReviewStatus,
  getAdminReturns,
  updateAdminReturnStatus,
  getAdminRoles,
  getAdminSettings,
  getCategories
} from "@/lib/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Seller Admin Command Center — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Production E-Commerce Admin Dashboard with analytics, inventory, Shiprocket logistics and orders management." },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Live Data States
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [widgets, setWidgets] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<any>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<any>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Load all initial data from backend API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [
          statsData,
          chartsData,
          widgetsData,
          ordersData,
          productsData,
          categoriesData,
          customersData,
          inventoryData,
          couponsData,
          reviewsData,
          returnsData,
          rolesData,
          settingsData
        ] = await Promise.all([
          getAdminStats(),
          getAdminCharts(),
          getAdminWidgets(),
          getAdminOrders(),
          getAdminProducts(),
          getCategories(),
          getAdminCustomers(),
          getAdminInventory(),
          getAdminCoupons(),
          getAdminReviews(),
          getAdminReturns(),
          getAdminRoles(),
          getAdminSettings()
        ]);

        setStats(statsData);
        setCharts(chartsData);
        setWidgets(widgetsData);
        setOrders(ordersData.data || (Array.isArray(ordersData) ? ordersData : []));
        setProducts(productsData.data || (Array.isArray(productsData) ? productsData : []));
        setCategories(categoriesData);
        setCustomers(customersData.data || (Array.isArray(customersData) ? customersData : []));
        setInventory(inventoryData);
        setCoupons(couponsData.data || []);
        setReviews(reviewsData.data || (Array.isArray(reviewsData) ? reviewsData : []));
        setReturns(returnsData);
        setRoles(rolesData);
        setSettings(settingsData);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handlers with Optimistic Updates & Toasts
  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o))
    );
    await updateAdminOrderStatus(id, { orderStatus: newStatus });
    toast.success(`Order ${id} updated to ${newStatus}`);
  };

  const handleGenerateShiprocketAwb = async (orderId: string, courierPartner: string) => {
    const res = await generateShiprocketAwb(orderId, courierPartner);
    if (res?.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, orderStatus: "Shipped", trackingId: res.data.awbCode, courier: res.data.courier }
            : o
        )
      );
      toast.success(`Shiprocket AWB ${res.data.awbCode} generated for ${orderId}`);
    }
  };

  const handleAddProduct = async (productData: any) => {
    const res = await createAdminProduct(productData);
    if (res?.success && res.data) {
      setProducts((prev) => [res.data, ...prev]);
      toast.success(`Product "${productData.name}" created successfully`);
    }
  };

  const handleDeleteProduct = async (id: any) => {
    await deleteAdminProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product removed from store");
  };

  const handleRestock = async (id: any, qty: number) => {
    await restockAdminInventory(id, qty);
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: (item.stock || 0) + qty } : item))
    );
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: (item.stock || 0) + qty } : item))
    );
    toast.success(`Added ${qty} units to inventory`);
  };

  const handleAddCoupon = async (couponData: any) => {
    const res = await createAdminCoupon(couponData);
    if (res?.success && res.data) {
      setCoupons((prev) => [res.data, ...prev]);
      toast.success(`Coupon ${couponData.code} created`);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    const res = await toggleAdminCoupon(id);
    if (res?.success && res.data) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: res.data.active } : c))
      );
      toast.success(`Coupon status updated`);
    }
  };

  const handleUpdateReview = async (id: string, status: string) => {
    await updateAdminReviewStatus(id, status);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    toast.success(`Review status set to ${status}`);
  };

  const handleUpdateReturn = async (id: string, status: string) => {
    await updateAdminReturnStatus(id, status);
    setReturns((prev) =>
      prev.map((ret) => (ret.id === id ? { ...ret, status } : ret))
    );
    toast.success(`Return request updated to ${status}`);
  };

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer", "Amount", "Status", "Date"];
    const rows = orders.map((o) => [o.id, `"${o.customer?.name}"`, o.total, o.orderStatus, `"${o.date}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Janani_Agro_Report_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground font-sans antialiased">
      {/* Collapsible Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        badgeCounts={{
          orders: orders.filter((o) => o.orderStatus === "Pending" || o.orderStatus === "Processing").length || 9,
          inventory: inventory.filter((i) => (i.stock ?? 45) < 20).length || 4,
          returns: returns.filter((r) => r.status === "Under Review").length || 3,
          reviews: reviews.filter((r) => r.status === "Pending").length || 1,
        }}
      />

      {/* Main Content Area */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        {/* Top Navbar */}
        <AdminNavbar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onNavigateTab={setActiveTab}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <AdminOverview
              stats={stats}
              charts={charts}
              widgets={widgets}
              orders={orders}
              onNavigateTab={setActiveTab}
              onOpenShiprocketModal={setSelectedOrderForShipping}
              onOpenRestockModal={setSelectedItemForRestock}
              onOpenInvoiceModal={setSelectedOrderForInvoice}
            />
          )}

          {activeTab === "categories" && <CategoriesManagement />}

          {activeTab === "products" && <ProductsManagement />}

          {activeTab === "orders" && <OrdersManagement />}

          {activeTab === "customers" && <CustomersManagement />}

          {activeTab === "inventory" && (
            <InventoryView
              inventory={inventory}
              onOpenRestockModal={setSelectedItemForRestock}
            />
          )}

          {activeTab === "payments" && <PaymentsManagement />}

          {activeTab === "coupons" && <CouponsManagement />}

          {activeTab === "referrals" && <ReferralsManagement />}

          {activeTab === "shipping" && <ShippingManagement />}

          {activeTab === "reviews" && <ReviewsManagement />}

          {activeTab === "returns" && (
            <ReturnsView
              returns={returns}
              onUpdateReturn={handleUpdateReturn}
            />
          )}

          {activeTab === "cms" && <CmsManagement />}

          {activeTab === "marketing" && <MarketingManagement />}

          {activeTab === "reports" && <ReportsManagement />}

          {activeTab === "settings" && <SettingsManagement defaultTab="store_branding" />}

          {activeTab === "roles" && <SettingsManagement defaultTab="roles_permissions" />}
        </main>
      </div>

      {/* Interactive Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleAddProduct}
      />

      <AddCouponModal
        isOpen={isAddCouponOpen}
        onClose={() => setIsAddCouponOpen(false)}
        onSubmit={handleAddCoupon}
      />

      <ShiprocketModal
        order={selectedOrderForShipping}
        isOpen={!!selectedOrderForShipping}
        onClose={() => setSelectedOrderForShipping(null)}
        onGenerateAwb={handleGenerateShiprocketAwb}
      />

      <RestockModal
        item={selectedItemForRestock}
        isOpen={!!selectedItemForRestock}
        onClose={() => setSelectedItemForRestock(null)}
        onRestock={handleRestock}
      />

      <InvoiceModal
        order={selectedOrderForInvoice}
        isOpen={!!selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
}
