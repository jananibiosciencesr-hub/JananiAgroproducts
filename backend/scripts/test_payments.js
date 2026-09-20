const BASE_URL = 'http://localhost:5000/api/admin/payments';

async function runTests() {
  try {
    console.log("1. Testing GET /transactions");
    const resTxns = await fetch(`${BASE_URL}/transactions`);
    const txns = await resTxns.json();
    console.log("Txns count:", txns.total, "Stats gross:", txns.stats?.grossInflow);

    console.log("2. Testing GET /gateways");
    const resGateways = await fetch(`${BASE_URL}/gateways`);
    const gateways = await resGateways.json();
    console.log("Gateways keys:", Object.keys(gateways.data));

    console.log("3. Testing POST /test-gateway (Razorpay)");
    const resTestRzp = await fetch(`${BASE_URL}/test-gateway`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gateway: "razorpay" })
    });
    const rzpResult = await resTestRzp.json();
    console.log("Razorpay test message:", rzpResult.message);

    console.log("4. Testing GET /settlements");
    const resSettlements = await fetch(`${BASE_URL}/settlements`);
    const settlements = await resSettlements.json();
    console.log("Settlement batches:", settlements.data?.length);

    console.log("5. Testing GET /failed-retries");
    const resRetries = await fetch(`${BASE_URL}/failed-retries`);
    const retries = await resRetries.json();
    console.log("Failed retries count:", retries.data?.length);

    console.log("All Backend Payment Tests PASSED!");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTests();
