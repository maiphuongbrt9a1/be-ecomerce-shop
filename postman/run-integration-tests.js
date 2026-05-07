const newman = require("newman");
const path = require("path");

const collectionPath = path.join(__dirname, "postman-collection-with-tests.json");
const BASE = "https://be-ecomerce-shop-production.up.railway.app";

async function getToken() {
  const res = await fetch(BASE + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "vomaiphuonghhvt@gmail.com", password: "123456789" }),
  });
  return (await res.json()).data.access_token;
}

function runFolder(collection, folder, token) {
  return new Promise((resolve) => {
    newman.run({
      collection,
      folder: [folder],
      envVar: [
        { key: "access_token", value: token },
        { key: "baseUrl", value: BASE },
      ],
      reporters: ["cli"],
      timeoutRequest: 60000,
      delayRequest: 200,
    }, (err, summary) => {
      const s = summary?.run?.stats;
      resolve({
        assertions: s?.assertions?.total || 0,
        failed: s?.assertions?.failed || 0,
        requests: s?.requests?.total || 0,
      });
    });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("Authenticating...");
  const token = await getToken();
  console.log("Token obtained.\n");

  const collection = require(collectionPath);
  const modules = [
    "Auth", "Products", "Category", "Address", "Reviews",
    "Orders", "Vouchers", "User", "OrderItems", "Shipments",
    "Payments", "CartItems", "UserVouchers", "Requests",
    "ReturnRequests", "Media",
  ];

  const results = [];

  for (const mod of modules) {
    if (!collection.item.find(i => i.name === mod)) continue;

    const r = await runFolder(collection, mod, token);
    const passed = r.assertions - r.failed;
    results.push({ mod, ...r, passed });

    console.log("┌────────────────────────────────────────┐");
    console.log(`│ ${mod.padEnd(20)} ${String(passed).padStart(3)}/${String(r.assertions).padStart(3)} passed │`);
    console.log("└────────────────────────────────────────┘\n");

    await sleep(3000);
  }

  const totalPass = results.reduce((s, r) => s + r.passed, 0);
  const totalAssertions = results.reduce((s, r) => s + r.assertions, 0);
  const totalReqs = results.reduce((s, r) => s + r.requests, 0);

  console.log("╔════════════════════════════════════════════════╗");
  console.log("║          INTEGRATION TEST SUMMARY              ║");
  console.log("╠════════════════════════════════════════════════╣");
  for (const r of results) {
    const status = r.failed === 0 ? "PASS" : "FAIL";
    console.log(`║  ${r.mod.padEnd(20)} ${String(r.passed).padStart(3)}/${String(r.assertions).padStart(3)}    ${status}  ║`);
  }
  console.log("╠════════════════════════════════════════════════╣");
  console.log(`║  TOTAL: ${totalPass}/${totalAssertions} assertions passed              ║`);
  console.log(`║  Requests: ${totalReqs}  Modules: ${results.length}                    ║`);
  console.log("╚════════════════════════════════════════════════╝");
}

main();
