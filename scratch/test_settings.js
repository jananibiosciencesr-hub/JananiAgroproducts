// Test script for Settings, Roles, Staff, Logs, Security & Backup API endpoints
const BASE_URL = "http://localhost:5000/api/admin";

async function runTests() {
  console.log("🚀 Running Settings & Administration API Test Suite...\n");
  let passed = 0;
  let failed = 0;

  async function testEndpoint(name, url, options = {}) {
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (res.ok && data.success) {
        console.log(`✅ [PASS] ${name}`);
        passed++;
        return data;
      } else {
        console.error(`❌ [FAIL] ${name}:`, data);
        failed++;
        return null;
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${name}:`, err.message);
      failed++;
      return null;
    }
  }

  // 1. GET Settings
  const settingsData = await testEndpoint("GET /settings", `${BASE_URL}/settings`);
  if (settingsData && settingsData.data) {
    console.log(`   👉 Store: ${settingsData.data.store.storeName}`);
    console.log(`   👉 GSTIN: ${settingsData.data.gst.gstin}`);
    console.log(`   👉 Shiprocket Warehouse: ${settingsData.data.shiprocket.defaultWarehouse}`);
  }

  // 2. PUT Store Settings
  await testEndpoint("PUT /settings/store", `${BASE_URL}/settings/store`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storeTagline: "Ancient Grains, Pure Bilona Ghee & Cold-Pressed Forest Naturals" })
  });

  // 3. PUT SEO Settings
  await testEndpoint("PUT /settings/seo", `${BASE_URL}/settings/seo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metaTitle: "Janani Agro | 100% Pure Organic Farm Direct Harvest" })
  });

  // 4. Test SMTP Diagnostic
  await testEndpoint("POST /settings/smtp/test", `${BASE_URL}/settings/smtp/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipientEmail: "admin@jananiagro.com" })
  });

  // 5. Test SMS Diagnostic
  await testEndpoint("POST /settings/sms/test", `${BASE_URL}/settings/sms/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipientPhone: "+91 98451 22345" })
  });

  // 6. GET Roles
  const rolesData = await testEndpoint("GET /roles", `${BASE_URL}/roles`);
  console.log(`   👉 Total Roles: ${rolesData?.roles?.length || 0}`);

  // 7. GET Staff
  const staffData = await testEndpoint("GET /staff", `${BASE_URL}/staff`);
  console.log(`   👉 Total Staff Members: ${staffData?.staff?.length || 0}`);

  // 8. POST Staff (Create new staff member)
  const newStaff = await testEndpoint("POST /staff (Create)", `${BASE_URL}/staff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Radha Krishnan",
      email: "radha.k@jananiagro.com",
      phone: "+91 98765 43210",
      roleId: "role_customer_support",
      department: "Customer Support & Patron Care",
      assignedWarehouses: ["Remote Hub"]
    })
  });

  // 9. PATCH Staff (Toggle Status)
  if (newStaff && newStaff.staff) {
    await testEndpoint("PATCH /staff/:id/toggle", `${BASE_URL}/staff/${newStaff.staff.id}/toggle`, {
      method: "PATCH"
    });
  }

  // 10. GET Activity Logs
  const logsData = await testEndpoint("GET /logs/activity", `${BASE_URL}/logs/activity`);
  console.log(`   👉 Total Activity Audit Logs: ${logsData?.logs?.length || 0}`);

  // 11. GET Login History
  const loginsData = await testEndpoint("GET /logs/logins", `${BASE_URL}/logs/logins`);
  console.log(`   👉 Active Login Sessions: ${loginsData?.activeSessionsCount || 0}`);

  // 12. GET Backups
  const backupsData = await testEndpoint("GET /backups", `${BASE_URL}/backups`);
  console.log(`   👉 Stored Snapshots: ${backupsData?.backups?.length || 0}`);

  // 13. POST Create Backup Snapshot
  await testEndpoint("POST /backups/create", `${BASE_URL}/backups/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "Manual Pre-Deployment Snapshot", notes: "Verified clean state" })
  });

  console.log(`\n========================================`);
  console.log(`🏁 Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);
}

runTests();
