import { Router } from 'express';
import {
  getDashboardStats,
  getAnalyticsCharts,
  getWidgetsData,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  updateAdminOrderWarehouse,
  generateAwbShiprocket,
  addAdminOrderNote,
  cancelAdminOrder,
  refundAdminOrder,
  returnAdminOrder,
  exchangeAdminOrder,
  bulkUpdateOrderStatus,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  toggleAdminProduct,
  duplicateAdminProduct,
  deleteAdminProduct,
  restoreAdminProduct,
  permanentDeleteAdminProduct,
  bulkUpdateProductStatus,
  bulkUpdateProductPrice,
  bulkUpdateProductStock,
  bulkDeleteProducts,
  importProducts,
  getAdminCustomers,
  getAdminCustomerById,
  createAdminCustomer,
  updateAdminCustomer,
  toggleCustomerStatus,
  adjustCustomerWallet,
  deleteAdminCustomer,
  getAdminInventory,
  restockProduct,
  getAdminCoupons,
  getAdminCouponById,
  createAdminCoupon,
  updateAdminCoupon,
  toggleAdminCoupon,
  deleteAdminCoupon,
  generateBulkCoupons,
  getCouponUsageHistory,
  getCouponAnalytics,
  getAdminReviews,
  getAdminReviewById,
  createAdminReview,
  updateReviewStatus,
  toggleFeatureReview,
  addAdminReply,
  deleteAdminReply,
  addCustomerReply,
  reportReviewAbuse,
  dismissReviewAbuse,
  toggleReviewImageStatus,
  deleteAdminReview,
  getReviewAnalytics,
  getAdminReturns,
  updateReturnStatus,
  getAdminRoles,
  getAdminSettings,
  getHomepageCms,
  updateHomepageLayout,
  getHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  toggleHeroBanner,
  deleteHeroBanner,
  getOfferBanners,
  createOfferBanner,
  updateOfferBanner,
  toggleOfferBanner,
  deleteOfferBanner,
  getCategoryBanners,
  createCategoryBanner,
  updateCategoryBanner,
  toggleCategoryBanner,
  deleteCategoryBanner,
  getFlashSaleBanners,
  createFlashSaleBanner,
  updateFlashSaleBanner,
  toggleFlashSaleBanner,
  deleteFlashSaleBanner,
  getCuratedSections,
  updateCuratedSection,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  toggleAdminCategory,
  deleteAdminCategory,
  restoreAdminCategory,
  permanentDeleteAdminCategory,
  bulkUpdateCategoryStatus,
  bulkDeleteCategories,
  reorderCategories,
  importCategories,
  getShippingConfig,
  updateShippingConfig,
  testShiprocketConnection,
  getPickupLocations,
  createPickupLocation,
  updatePickupLocation,
  deletePickupLocation,
  getShipments,
  getShipmentByAwb,
  cancelShipment,
  calculateShippingRates,
  getCourierRecommendations,
  schedulePickup,
  getNdrList,
  handleNdrAction,
  generateManifest,
  getPaymentTransactions,
  getPaymentTransactionById,
  processPaymentRefund,
  getGatewayConfig,
  updateGatewayConfig,
  testGatewayConnection,
  getSettlementReports,
  getFailedPaymentRetries,
  sendPaymentRetryLink,
  convertFailedToCod,
  getReferralConfig,
  updateReferralConfig,
  getWalletConfig,
  updateWalletConfig,
  getReferralRecords,
  getReferralRecordById,
  approveReferralReward,
  rejectReferralReward,
  getGlobalWalletTransactions,
  manualWalletCredit,
  manualWalletDebit,
  getReferralAnalytics,
  getMarketingOverview,
  getMarketingCampaigns,
  getMarketingCampaignById,
  createMarketingCampaign,
  updateMarketingCampaign,
  deleteMarketingCampaign,
  triggerMarketingCampaignSend,
  toggleMarketingCampaignStatus,
  getAudienceSegments,
  createAudienceSegment,
  getNotificationHistory,
  getMarketingAnalytics,
  getReportsAnalytics,
  getGstTaxReport,
  exportReportData,
  updateStoreSettings,
  updateBrandingSettings,
  updateSeoSettings,
  updatePaymentSettings,
  updateShippingSettings,
  updateGstSettings,
  updateDeliveryFeeSettings,
  updateReferralRulesSettings,
  updateCouponRulesSettings,
  updateSmtpSettings,
  testSmtpConnection,
  updateSmsSettings,
  testSmsConnection,
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
  getAdminStaffList,
  createAdminStaff,
  updateAdminStaff,
  toggleAdminStaffStatus,
  deleteAdminStaff,
  getActivityLogs,
  clearActivityLogs,
  getLoginHistory,
  terminateLoginSession,
  updateSecuritySettings,
  getSystemBackups,
  createSystemBackup,
  restoreSystemBackup,
  downloadSystemBackup
} from '../controllers/adminController.js';

const router = Router();

// Overview & Analytics
router.get('/stats', getDashboardStats);
router.get('/charts', getAnalyticsCharts);
router.get('/widgets', getWidgetsData);

// 3-Tier Categories Management
router.get('/categories', getAdminCategories);
router.post('/categories', createAdminCategory);
router.put('/categories/:id', updateAdminCategory);
router.patch('/categories/:id/toggle', toggleAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);
router.post('/categories/:id/restore', restoreAdminCategory);
router.delete('/categories/:id/permanent', permanentDeleteAdminCategory);
router.post('/categories/bulk-status', bulkUpdateCategoryStatus);
router.post('/categories/bulk-delete', bulkDeleteCategories);
router.post('/categories/reorder', reorderCategories);
router.post('/categories/import', importCategories);

// Orders Management & Logistics
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/warehouse', updateAdminOrderWarehouse);
router.post('/orders/:id/shiprocket', generateAwbShiprocket);
router.post('/orders/:id/notes', addAdminOrderNote);
router.post('/orders/:id/cancel', cancelAdminOrder);
router.post('/orders/:id/refund', refundAdminOrder);
router.post('/orders/:id/return', returnAdminOrder);
router.post('/orders/:id/exchange', exchangeAdminOrder);
router.post('/orders/bulk-status', bulkUpdateOrderStatus);

// Products Catalog
router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.post('/products/:id', updateAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.patch('/products/:id/toggle', toggleAdminProduct);
router.post('/products/:id/duplicate', duplicateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);
router.post('/products/:id/restore', restoreAdminProduct);
router.delete('/products/:id/permanent', permanentDeleteAdminProduct);
router.post('/products/bulk-status', bulkUpdateProductStatus);
router.post('/products/bulk-price', bulkUpdateProductPrice);
router.post('/products/bulk-stock', bulkUpdateProductStock);
router.post('/products/bulk-delete', bulkDeleteProducts);

// Inventory
router.get('/inventory', getAdminInventory);
router.post('/inventory/restock', restockProduct);
router.post('/products/import', importProducts);

// Customers Management
router.get('/customers', getAdminCustomers);
router.get('/customers/:id', getAdminCustomerById);
router.post('/customers', createAdminCustomer);
router.put('/customers/:id', updateAdminCustomer);
router.patch('/customers/:id/status', toggleCustomerStatus);
router.post('/customers/:id/wallet', adjustCustomerWallet);
router.delete('/customers/:id', deleteAdminCustomer);

// Coupons & Promotions Management (Shopify Plus Standard)
router.get('/coupons', getAdminCoupons);
router.get('/coupons/history/usage', getCouponUsageHistory);
router.get('/coupons/reports/analytics', getCouponAnalytics);
router.get('/coupons/:id', getAdminCouponById);
router.post('/coupons', createAdminCoupon);
router.post('/coupons/bulk-generate', generateBulkCoupons);
router.put('/coupons/:id', updateAdminCoupon);
router.patch('/coupons/:id/toggle', toggleAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);

// Reviews & Ratings Management
router.get('/reviews', getAdminReviews);
router.get('/reviews/analytics', getReviewAnalytics);
router.get('/reviews/:id', getAdminReviewById);
router.post('/reviews', createAdminReview);
router.patch('/reviews/:id/status', updateReviewStatus);
router.patch('/reviews/:id/feature', toggleFeatureReview);
router.post('/reviews/:id/admin-reply', addAdminReply);
router.delete('/reviews/:id/admin-reply', deleteAdminReply);
router.post('/reviews/:id/customer-reply', addCustomerReply);
router.post('/reviews/:id/report-abuse', reportReviewAbuse);
router.patch('/reviews/:id/dismiss-abuse', dismissReviewAbuse);
router.patch('/reviews/:id/images/:imageId/toggle', toggleReviewImageStatus);
router.delete('/reviews/:id', deleteAdminReview);

router.get('/returns', getAdminReturns);
router.patch('/returns/:id/status', updateReturnStatus);

// ==========================================
// STORE SETTINGS & CONFIGURATION ENGINE
// ==========================================
router.get('/settings', getAdminSettings);
router.put('/settings/store', updateStoreSettings);
router.put('/settings/branding', updateBrandingSettings);
router.put('/settings/seo', updateSeoSettings);
router.put('/settings/payments', updatePaymentSettings);
router.put('/settings/shipping', updateShippingSettings);
router.put('/settings/gst', updateGstSettings);
router.put('/settings/delivery', updateDeliveryFeeSettings);
router.put('/settings/referrals', updateReferralRulesSettings);
router.put('/settings/coupons', updateCouponRulesSettings);
router.put('/settings/smtp', updateSmtpSettings);
router.post('/settings/smtp/test', testSmtpConnection);
router.put('/settings/sms', updateSmsSettings);
router.post('/settings/sms/test', testSmsConnection);

// ==========================================
// ROLES & PERMISSIONS MANAGEMENT
// ==========================================
router.get('/roles', getAdminRoles);
router.post('/roles', createAdminRole);
router.put('/roles/:id', updateAdminRole);
router.delete('/roles/:id', deleteAdminRole);

// ==========================================
// ADMIN STAFF USERS CRUD
// ==========================================
router.get('/staff', getAdminStaffList);
router.post('/staff', createAdminStaff);
router.put('/staff/:id', updateAdminStaff);
router.patch('/staff/:id/toggle', toggleAdminStaffStatus);
router.delete('/staff/:id', deleteAdminStaff);

// ==========================================
// AUDIT ACTIVITY LOGS
// ==========================================
router.get('/logs/activity', getActivityLogs);
router.post('/logs/activity/clear', clearActivityLogs);

// ==========================================
// LOGIN HISTORY & SESSION TERMINATION
// ==========================================
router.get('/logs/logins', getLoginHistory);
router.post('/logs/logins/:id/terminate', terminateLoginSession);

// ==========================================
// SECURITY POLICIES
// ==========================================
router.put('/security', updateSecuritySettings);

// ==========================================
// BACKUP & DISASTER RECOVERY
// ==========================================
router.get('/backups', getSystemBackups);
router.post('/backups/create', createSystemBackup);
router.post('/backups/restore', restoreSystemBackup);
router.get('/backups/download/:id', downloadSystemBackup);

// Shiprocket Shipping Logistics Management
router.get('/shipping/config', getShippingConfig);
router.put('/shipping/config', updateShippingConfig);
router.post('/shipping/test-connection', testShiprocketConnection);

router.get('/shipping/pickup-locations', getPickupLocations);
router.post('/shipping/pickup-locations', createPickupLocation);
router.put('/shipping/pickup-locations/:id', updatePickupLocation);
router.delete('/shipping/pickup-locations/:id', deletePickupLocation);

router.get('/shipping/shipments', getShipments);
router.get('/shipping/track/:awb', getShipmentByAwb);
router.post('/shipping/cancel/:awb', cancelShipment);

router.post('/shipping/calculate-rate', calculateShippingRates);
router.post('/shipping/recommendations', getCourierRecommendations);
router.post('/shipping/schedule-pickup', schedulePickup);

router.get('/shipping/ndr', getNdrList);
router.post('/shipping/ndr/:id/action', handleNdrAction);
router.post('/shipping/manifest', generateManifest);

// Payment Management & Gateway Integrations
router.get('/payments/transactions', getPaymentTransactions);
router.get('/payments/transactions/:id', getPaymentTransactionById);
router.post('/payments/refund', processPaymentRefund);

router.get('/payments/gateways', getGatewayConfig);
router.put('/payments/gateways', updateGatewayConfig);
router.post('/payments/test-gateway', testGatewayConnection);

router.get('/payments/settlements', getSettlementReports);
router.get('/payments/failed-retries', getFailedPaymentRetries);
router.post('/payments/failed-retries/:id/send-link', sendPaymentRetryLink);
router.post('/payments/failed-retries/:id/convert-cod', convertFailedToCod);

// Refer & Earn and Customer Wallet Management
router.get('/referrals/config', getReferralConfig);
router.put('/referrals/config', updateReferralConfig);
router.get('/referrals/wallet-config', getWalletConfig);
router.put('/referrals/wallet-config', updateWalletConfig);
router.get('/referrals/records', getReferralRecords);
router.get('/referrals/records/:id', getReferralRecordById);
router.post('/referrals/records/:id/approve', approveReferralReward);
router.post('/referrals/records/:id/reject', rejectReferralReward);
router.get('/referrals/wallet-transactions', getGlobalWalletTransactions);
router.post('/referrals/wallet/credit', manualWalletCredit);
router.post('/referrals/wallet/debit', manualWalletDebit);
router.get('/referrals/analytics', getReferralAnalytics);

// Homepage CMS & Storefront Layout Builder
router.get('/cms/all', getHomepageCms);
router.put('/cms/layout', updateHomepageLayout);

router.get('/cms/hero-banners', getHeroBanners);
router.post('/cms/hero-banners', createHeroBanner);
router.put('/cms/hero-banners/:id', updateHeroBanner);
router.patch('/cms/hero-banners/:id/toggle', toggleHeroBanner);
router.delete('/cms/hero-banners/:id', deleteHeroBanner);

router.get('/cms/offer-banners', getOfferBanners);
router.post('/cms/offer-banners', createOfferBanner);
router.put('/cms/offer-banners/:id', updateOfferBanner);
router.patch('/cms/offer-banners/:id/toggle', toggleOfferBanner);
router.delete('/cms/offer-banners/:id', deleteOfferBanner);

router.get('/cms/category-banners', getCategoryBanners);
router.post('/cms/category-banners', createCategoryBanner);
router.put('/cms/category-banners/:id', updateCategoryBanner);
router.patch('/cms/category-banners/:id/toggle', toggleCategoryBanner);
router.delete('/cms/category-banners/:id', deleteCategoryBanner);

router.get('/cms/flash-sale', getFlashSaleBanners);
router.post('/cms/flash-sale', createFlashSaleBanner);
router.put('/cms/flash-sale/:id', updateFlashSaleBanner);
router.patch('/cms/flash-sale/:id/toggle', toggleFlashSaleBanner);
router.delete('/cms/flash-sale/:id', deleteFlashSaleBanner);

router.get('/cms/curated-sections', getCuratedSections);
router.put('/cms/curated-sections/:sectionKey', updateCuratedSection);

// Marketing Management & Omnichannel Automation Hub
router.get('/marketing/overview', getMarketingOverview);
router.get('/marketing/campaigns', getMarketingCampaigns);
router.get('/marketing/campaigns/:id', getMarketingCampaignById);
router.post('/marketing/campaigns', createMarketingCampaign);
router.put('/marketing/campaigns/:id', updateMarketingCampaign);
router.delete('/marketing/campaigns/:id', deleteMarketingCampaign);
router.post('/marketing/campaigns/:id/send', triggerMarketingCampaignSend);
router.patch('/marketing/campaigns/:id/toggle', toggleMarketingCampaignStatus);
router.get('/marketing/segments', getAudienceSegments);
router.post('/marketing/segments', createAudienceSegment);
router.get('/marketing/history', getNotificationHistory);
router.get('/marketing/analytics', getMarketingAnalytics);

// Reports & Analytics Enterprise Command Center
router.get('/reports/analytics', getReportsAnalytics);
router.get('/reports/gst', getGstTaxReport);
router.get('/reports/export', exportReportData);

export default router;
