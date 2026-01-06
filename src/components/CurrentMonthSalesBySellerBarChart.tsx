"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesData } from "@/types/sales";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
      sales: number;
      count: number;
      isActive: boolean;
    };
  }>;
  label?: string;
}

interface CurrentMonthSalesBySellerBarChartProps {
  data: SalesData;
  selectedYear: number;
}

export default function CurrentMonthSalesBySellerBarChart({
  data,
  selectedYear,
}: CurrentMonthSalesBySellerBarChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get current month name
  const getCurrentMonthName = () => {
    const months = [
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
    // For 2025, show December. For 2026, show current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = selectedYear === 2025 
      ? 11 // Diciembre (0-indexed) para 2025
      : selectedYear === currentYear
      ? currentDate.getMonth() // Mes actual (0-indexed) para 2026
      : 11; // Default to December
    return months[currentMonth];
  };

  // Get all sellers (active and inactive) with their current month sales
  const getCurrentMonthSalesData = () => {
    if (!data) return [];

    // For 2025, show December. For 2026, show current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = selectedYear === 2025 
      ? 12 // Diciembre para 2025
      : selectedYear === currentYear
      ? currentDate.getMonth() + 1 // Mes actual para 2026
      : 12; // Default to December
    // Get sellers with sales in current month
    const sellerMap = new Map();

    // Filter records for current month only
    const currentMonthRecords = data.records.filter(
      (record) => record.mes === String(currentMonth)
    );

    currentMonthRecords.forEach((record) => {
      if (!record.vendedor || record.vendedor.trim() === "") return;

      if (!sellerMap.has(record.vendedor)) {
        sellerMap.set(record.vendedor, {
          name: record.vendedor,
          sales: 0,
          count: 0,
        });
      }

      const seller = sellerMap.get(record.vendedor);
      seller.sales += record.monto_negocio;
      seller.count += 1;
    });

    // Get all sellers from vendorData (this includes inactive sellers with metas)
    if (data.vendorData) {
      Object.keys(data.vendorData).forEach((sellerName) => {
        if (!sellerMap.has(sellerName)) {
          sellerMap.set(sellerName, {
            name: sellerName,
            sales: 0,
            count: 0,
          });
        }
      });
    }

    // Convert to array and add active status for current month
    const sellersData = Array.from(sellerMap.values()).map((seller) => ({
      name: seller.name,
      sales: seller.sales,
      count: seller.count,
      isActive: seller.sales > 0, // Active if they have sales this month
    }));

    // Sort by sales amount (descending)
    return sellersData.sort((a, b) => b.sales - a.sales);
  };

  const chartData = getCurrentMonthSalesData();
  const currentMonthName = getCurrentMonthName();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-black">{label}</p>
          <p className="text-green-600">
            Ventas {currentMonthName}: {formatCurrency(data.sales)}
          </p>
          <p className="text-gray-600">Cantidad: {data.count} ventas</p>
          <p
            className={`text-sm ${
              data.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {data.isActive ? "Activo este mes" : "Sin ventas este mes"}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-black">
            Ventas de {currentMonthName} por Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            No hay datos disponibles para {currentMonthName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">
          Ventas de {currentMonthName} por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: isMobile ? 5 : 20,
                bottom: 60, // Extra space for rotated labels
              }}
              maxBarSize={80}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                stroke="#666"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              {!isMobile && (
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => formatCurrency(value)}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="#10b981"></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
