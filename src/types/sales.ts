export interface SalesRecord {
  mes: string;
  cliente: string;
  vendedor: string;
  sucursal: string;
  monto_negocio: number;
}

export interface VendorSales {
  vendedor: string;
  totalSales: number;
  totalAmount: number;
  salesCount: number;
  averageAmount: number;
}

export interface MonthlySales {
  mes: string;
  totalAmount: number;
  salesCount: number;
}

export interface SalesData {
  records: SalesRecord[];
  vendors: VendorSales[];
  monthlySales: MonthlySales[];
  totalSales: number;
  totalAmount: number;
  sucursalData: Record<string, number>;
  vendorData: Record<string, number>;
}
