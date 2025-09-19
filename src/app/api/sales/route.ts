import { NextResponse } from "next/server";
import {
  getSalesData,
  getSucursalData,
  getVendorData,
} from "@/lib/googleSheets";

// Ensure this route is always dynamic and never cached
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    // Force fresh data on every request
    const timestamp = new Date().toISOString();

    console.log(`=== API CALL ${timestamp} ===`);

    const [salesData, sucursalData, vendorData] = await Promise.all([
      getSalesData(),
      getSucursalData(),
      getVendorData(),
    ]);

    // Log the data being sent to frontend
    console.log("=== API RESPONSE DATA ===");
    console.log("Data structure:", {
      recordsCount: salesData.records.length,
      vendorsCount: salesData.vendors.length,
      monthlySalesCount: salesData.monthlySales.length,
      totalSales: salesData.totalSales,
      totalAmount: salesData.totalAmount,
      sucursalCount: sucursalData.size,
      vendorCount: vendorData.size,
    });

    // Log specific vendor names to check for cached data
    const uniqueVendors = [
      ...new Set(salesData.records.map((r) => r.vendedor)),
    ];
    console.log("Unique vendors in sales data:", uniqueVendors);
    console.log(
      "Vendor goals available for:",
      Object.keys(Object.fromEntries(vendorData))
    );

    console.log("================================");

    const responseData = {
      ...salesData,
      sucursalData: Object.fromEntries(sucursalData),
      vendorData: Object.fromEntries(vendorData),
      timestamp: new Date().toISOString(),
      cacheId: Math.random().toString(36).substring(7),
    };

    const res = NextResponse.json(responseData, { status: 200 });

    // Extremely aggressive cache disabling
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0"
    );
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    res.headers.set("Surrogate-Control", "no-store");
    res.headers.set("Vary", "*");
    res.headers.set("Last-Modified", new Date().toUTCString());

    return res;
  } catch (error) {
    console.error("Error in sales API:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch sales data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
