import { NextResponse } from "next/server";
import { getSalesData, getSucursalData } from "@/lib/googleSheets";

export async function GET() {
  try {
    const [salesData, sucursalData] = await Promise.all([
      getSalesData(),
      getSucursalData(),
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
    });
    console.log("================================");

    return NextResponse.json({
      ...salesData,
      sucursalData: Object.fromEntries(sucursalData),
    });
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
