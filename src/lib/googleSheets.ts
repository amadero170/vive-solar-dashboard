import { google } from "googleapis";
import {
  SalesRecord,
  VendorSales,
  SalesData,
  MonthlySales,
} from "@/types/sales";

const project_id = process.env.GOOGLE_SHEETS_PROJECT_ID;
const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const service_account = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const sheet_id = process.env.SHEET_ID;

if (!project_id || !private_key || !service_account || !sheet_id) {
  throw new Error("Missing required Google Sheets environment variables");
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id,
    private_key,
    client_email: service_account,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

export async function getSalesData(): Promise<SalesData> {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Read from "ventas" sheet, columns A to F
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: "ventas!A:F",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error("No data found in sheet");
    }

    // Log raw data from Google Sheets
    console.log("=== RAW DATA FROM GOOGLE SHEETS ===");
    console.log("Total rows:", rows.length);
    console.log("First row (headers):", rows[0]);
    console.log("Sample data rows:", rows.slice(1, 4)); // Show first 3 data rows
    console.log("Last row:", rows[rows.length - 1]);
    console.log("================================");

    // Skip header row and process data
    const records: SalesRecord[] = rows.slice(1).map((row) => ({
      mes: row[1] || "", // Column B - Mes
      cliente: row[2] || "", // Column C - Cliente
      vendedor: row[3] || "", // Column D - Asesor
      sucursal: row[4] || "", // Column E - Sucursal
      monto_negocio: parseFloat(row[5]) || 0, // Column F - Monto (sin IVA)
    }));

    // Log processed records
    console.log("=== PROCESSED RECORDS ===");
    console.log("Total records:", records.length);
    console.log("Sample records:", records.slice(0, 3));
    console.log("Column mapping:");
    console.log(
      "- mes (row[1]):",
      records.slice(0, 3).map((r) => r.mes)
    );
    console.log(
      "- vendedor (row[3]):",
      records.slice(0, 3).map((r) => r.vendedor)
    );
    console.log(
      "- cliente (row[2]):",
      records.slice(0, 3).map((r) => r.cliente)
    );
    console.log(
      "- sucursal (row[4]):",
      records.slice(0, 3).map((r) => r.sucursal)
    );
    console.log(
      "- monto_negocio (row[5]):",
      records.slice(0, 3).map((r) => r.monto_negocio)
    );
    console.log("================================");

    // Group by vendor and calculate totals
    const vendorMap = new Map<string, VendorSales>();

    records.forEach((record) => {
      if (!vendorMap.has(record.vendedor)) {
        vendorMap.set(record.vendedor, {
          vendedor: record.vendedor,
          totalSales: 0,
          totalAmount: 0,
          salesCount: 0,
          averageAmount: 0,
        });
      }

      const vendor = vendorMap.get(record.vendedor)!;
      vendor.totalSales += 1; // Count each record as 1 sale
      vendor.totalAmount += record.monto_negocio;
      vendor.salesCount += 1;
    });

    // Calculate averages
    vendorMap.forEach((vendor) => {
      vendor.averageAmount = vendor.totalAmount / vendor.salesCount;
    });

    const vendors = Array.from(vendorMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    // Group by month and calculate totals
    const monthlyMap = new Map<string, MonthlySales>();

    records.forEach((record) => {
      if (!monthlyMap.has(record.mes)) {
        monthlyMap.set(record.mes, {
          mes: record.mes,
          totalAmount: 0,
          salesCount: 0,
        });
      }

      const month = monthlyMap.get(record.mes)!;
      month.totalAmount += record.monto_negocio;
      month.salesCount += 1;
    });

    const monthlySales = Array.from(monthlyMap.values()).sort((a, b) => {
      const monthOrder = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return monthOrder.indexOf(a.mes) - monthOrder.indexOf(b.mes);
    });

    const totalSales = records.length; // Total number of sales records
    const totalAmount = records.reduce(
      (sum, record) => sum + record.monto_negocio,
      0
    );

    // Log final processed data
    console.log("=== FINAL PROCESSED DATA ===");
    console.log(
      "Vendors found:",
      vendors.map((v) => v.vendedor)
    );
    console.log(
      "Months found:",
      monthlySales.map((m) => m.mes)
    );
    console.log("Total sales:", totalSales);
    console.log("Total amount:", totalAmount);
    console.log("================================");

    return {
      records,
      vendors,
      monthlySales,
      totalSales,
      totalAmount,
      sucursalData: {},
      vendorData: {},
    };
  } catch (error) {
    console.error("Error fetching sales data:", error);
    throw error;
  }
}

export async function getSucursalData(): Promise<Map<string, number>> {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Read from "Metas" sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: "Metas!A:B",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error("No data found in Metas sheet");
    }

    // Skip header row and process data
    const sucursalMap = new Map<string, number>();

    rows.slice(1).forEach((row) => {
      const sucursal = row[0] || ""; // Column A - Sucursal
      const metaMensual = parseFloat(row[1]) || 0; // Column B - Meta mensual

      if (sucursal && metaMensual > 0) {
        sucursalMap.set(sucursal, metaMensual);
      }
    });

    console.log("=== METAS DATA ===");
    console.log("Branch targets:", Object.fromEntries(sucursalMap));
    console.log("================================");

    return sucursalMap;
  } catch (error) {
    console.error("Error fetching metas data:", error);
    return new Map();
  }
}

export async function getVendorData(): Promise<Map<string, number>> {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Read from "Colaboradores" sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: "Colaboradores!A:B",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in Colaboradores sheet");
      return new Map();
    }

    // Skip header row and process data
    const vendorMap = new Map<string, number>();

    rows.slice(1).forEach((row) => {
      const vendedor = row[0] || ""; // Column A - Vendedor/Colaborador
      const metaMensual = parseFloat(row[1]) || 0; // Column B - Meta mensual

      if (vendedor && metaMensual > 0) {
        vendorMap.set(vendedor, metaMensual);
      }
    });

    console.log("=== VENDOR METAS DATA ===");
    console.log("Vendor targets:", Object.fromEntries(vendorMap));
    console.log("================================");

    return vendorMap;
  } catch (error) {
    console.error("Error fetching vendor metas data:", error);
    return new Map();
  }
}
