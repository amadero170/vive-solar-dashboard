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

export async function GET() {
  try {
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
    console.log("================================");

    const res = NextResponse.json(
      {
        ...salesData,
        sucursalData: Object.fromEntries(sucursalData),
        vendorData: Object.fromEntries(vendorData),
      },
      { status: 200 }
    );

    // Explicitly disable caching at the edge and browser
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");

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
