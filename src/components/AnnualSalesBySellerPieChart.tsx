"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesData } from "@/types/sales";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: {
      value: number;
      percentage: number;
    };
  }>;
}

interface AnnualSalesBySellerPieChartProps {
  data: SalesData;
}

export default function AnnualSalesBySellerPieChart({
  data,
}: AnnualSalesBySellerPieChartProps) {
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

  // Generate colors for each seller
  const generateColors = (count: number) => {
    const colors = [
      "#f97316", // orange-500
      "#3b82f6", // blue-500
      "#ef4444", // red-500
      "#10b981", // emerald-500
      "#8b5cf6", // violet-500
      "#f59e0b", // amber-500
      "#06b6d4", // cyan-500
      "#84cc16", // lime-500
      "#ec4899", // pink-500
      "#6366f1", // indigo-500
    ];

    // If we need more colors than we have, generate additional ones
    if (count > colors.length) {
      for (let i = colors.length; i < count; i++) {
        const hue = (i * 137.508) % 360; // Golden angle approximation for good distribution
        colors.push(`hsl(${hue}, 70%, 60%)`);
      }
    }

    return colors.slice(0, count);
  };

  // Calculate annual sales by seller
  const getAnnualSalesBySellerData = () => {
    if (!data) return [];

    const sellerMap = new Map();
    data.records.forEach((record) => {
      if (!record.vendedor || record.vendedor.trim() === "") return;

      if (!sellerMap.has(record.vendedor)) {
        sellerMap.set(record.vendedor, {
          name: record.vendedor,
          value: 0,
          count: 0,
        });
      }

      const seller = sellerMap.get(record.vendedor);
      seller.value += record.monto_negocio;
      seller.count += 1;
    });

    const sellersData = Array.from(sellerMap.values())
      .filter((seller) => seller.value > 0)
      .sort((a, b) => b.value - a.value);

    // Calculate percentages
    const total = sellersData.reduce((sum, seller) => sum + seller.value, 0);
    return sellersData.map((seller) => ({
      ...seller,
      percentage: total > 0 ? (seller.value / total) * 100 : 0,
    }));
  };

  const chartData = getAnnualSalesBySellerData();
  const colors = generateColors(chartData.length);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-black">{data.name}</p>
          <p className="text-blue-600">Ventas: {formatCurrency(data.value)}</p>
          <p className="text-gray-600">
            Porcentaje: {data.payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label function for pie slices
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (entry: any) => {
    if (entry.percentage < 5) return ""; // Don't show label if slice is too small
    return `${entry.percentage.toFixed(1)}%`;
  };

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-black">
            Ventas Anuales por Vendedor
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
        <CardTitle className="text-black">
          Ventas Anuales por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={isMobile ? 60 : 80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {!isMobile && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value} ({formatCurrency(entry.payload?.value || 0)})
                    </span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mobile legend */}
        {isMobile && (
          <div className="mt-4 space-y-2">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span className="text-gray-700">
                  {entry.name}: {formatCurrency(entry.value)} (
                  {entry.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
      </CardContent>
    </Card>
  );
}
