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
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SalesData } from "@/types/sales";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      count: number;
    };
  }>;
  label?: string;
}

interface MonthlySalesBySellerChartProps {
  data: SalesData;
}

export default function MonthlySalesBySellerChart({
  data,
}: MonthlySalesBySellerChartProps) {
  const [selectedSeller, setSelectedSeller] = useState<string>("Todos");
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

  const getMonthName = (mes: string) => {
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
    const numeric = parseInt(mes, 10);
    if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 12) {
      return months[numeric - 1];
    }
    const idx = months.findIndex((m) => m.toLowerCase() === mes.toLowerCase());
    return idx >= 0 ? months[idx] : mes;
  };

  // Get all unique sellers for the dropdown
  const getAllSellers = () => {
    if (!data) return [];
    const uniqueSellers = Array.from(
      new Set(data.records.map((record) => record.vendedor))
    )
      .filter((seller) => seller && seller.trim() !== "")
      .sort();
    return uniqueSellers;
  };

  // Filter data based on selected seller
  const getFilteredData = () => {
    if (!data || selectedSeller === "Todos") {
      return data;
    }

    const filteredRecords = data.records.filter(
      (record) => record.vendedor === selectedSeller
    );

    // Recalculate monthly sales based on filtered records
    const monthlyMap = new Map();
    filteredRecords.forEach((record) => {
      if (!monthlyMap.has(record.mes)) {
        monthlyMap.set(record.mes, {
          mes: record.mes,
          totalAmount: 0,
          salesCount: 0,
        });
      }

      const month = monthlyMap.get(record.mes);
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

    const totalSales = filteredRecords.length;
    const totalAmount = filteredRecords.reduce(
      (sum, record) => sum + record.monto_negocio,
      0
    );

    return {
      records: filteredRecords,
      monthlySales,
      totalSales,
      totalAmount,
    };
  };

  const filteredData = getFilteredData();
  const allSellers = getAllSellers();

  // Get current seller meta based on selected seller
  const getCurrentSellerMeta = () => {
    if (!data?.vendorData || selectedSeller === "Todos") {
      return undefined;
    }
    return data.vendorData[selectedSeller];
  };

  const currentSellerMeta = getCurrentSellerMeta();

  // Generate complete month array from January to current month (dynamic)
  const generateCompleteMonthData = () => {
    const allMonths = [
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

    // Get current month (1-12) - Fixed to December 2025
    const currentMonth = 12; // Mostrar todos los meses de 2025

    // Get months from January to current month
    const monthsToShow = allMonths.slice(0, currentMonth);

    // Create map of existing data
    const existingData = new Map();
    filteredData?.monthlySales.forEach((month) => {
      const monthName = getMonthName(month.mes);
      existingData.set(monthName, {
        sales: month.totalAmount,
        count: month.salesCount,
      });
    });

    // Generate complete array with zeros for missing months
    return monthsToShow.map((monthName) => ({
      month: monthName,
      sales: existingData.get(monthName)?.sales || 0,
      count: existingData.get(monthName)?.count || 0,
    }));
  };

  const chartData = generateCompleteMonthData();

  // Calculate Y-axis domain to ensure meta line is visible
  const getYAxisDomain = (): [number, number] => {
    if (!chartData.length) return [0, 1000];

    const maxSales = Math.max(...chartData.map((item) => item.sales));
    let maxValue = maxSales;

    // If there's a meta and it's higher than max sales, use meta + 10% as max
    if (currentSellerMeta && currentSellerMeta > maxSales) {
      maxValue = currentSellerMeta * 1.1; // Add 10% padding above meta
    } else if (maxSales > 0) {
      // If max sales is higher than meta, add some padding
      maxValue = maxSales * 1.1;
    }

    // Ensure we always show at least the meta value
    if (currentSellerMeta && maxValue < currentSellerMeta) {
      maxValue = currentSellerMeta * 1.1;
    }

    // If maxValue is 0 (no sales and no meta), set a reasonable default
    if (maxValue === 0) {
      maxValue = currentSellerMeta || 1000;
    }

    return [0, Math.ceil(maxValue)];
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-black">{label}</p>
          <p className="text-blue-600">
            Ventas: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-600">
            Cantidad: {payload[0].payload.count} ventas
          </p>
          {currentSellerMeta && (
            <p className="text-red-600">
              Meta: {formatCurrency(currentSellerMeta)}
            </p>
          )}
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
            Ventas Mensuales por Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-black">
            <span className="text-black">Ventas Mensuales por Vendedor</span>{" "}
            {selectedSeller !== "Todos" && `- ${selectedSeller}`}
          </CardTitle>
          <Select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
          >
            <option value="Todos">Todos los Vendedores</option>
            {allSellers.map((seller) => (
              <option key={seller} value={seller}>
                {seller}
              </option>
            ))}
          </Select>
        </div>
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
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#666" />
              {!isMobile && (
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => formatCurrency(value)}
                  domain={getYAxisDomain()}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              {currentSellerMeta && (
                <ReferenceLine
                  y={currentSellerMeta}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Meta: ${formatCurrency(currentSellerMeta)}`,
                    position: "top",
                    style: { fill: "#ef4444", fontSize: "12px" },
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Monto de Ventas</span>
            </div>
            {currentSellerMeta && (
              <>
                <div className="text-gray-400">|</div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border-t-2 border-dashed border-red-500 mr-2"></div>
                  <span>Meta Mensual</span>
                </div>
              </>
            )}
            <div className="text-gray-400">|</div>
            <div className="text-gray-500">
              Total: {formatCurrency(filteredData?.totalAmount || 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
