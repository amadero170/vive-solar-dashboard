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

interface AnnualSalesBySellerBarChartProps {
  data: SalesData;
}

export default function AnnualSalesBySellerBarChart({
  data,
}: AnnualSalesBySellerBarChartProps) {
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

  // Get all sellers (active and inactive) with their annual sales
  const getAnnualSalesData = () => {
    if (!data) return [];

    // Get all unique sellers from records
    const sellerMap = new Map();
    data.records.forEach((record) => {
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

    // Convert to array and add active status
    const sellersData = Array.from(sellerMap.values()).map((seller) => ({
      name: seller.name,
      sales: seller.sales,
      count: seller.count,
      isActive: seller.sales > 0,
    }));
    console.log(
      "sellersData ===================================>",
      sellersData
    );
    // Sort by sales amount (descending)
    return sellersData.sort((a, b) => b.sales - a.sales);
  };

  const chartData = getAnnualSalesData();

  // Custom tooltip
  const CustomTooltip = ({ payload, label }: TooltipProps) => {
    if (payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-black">{label}</p>
          <p className="text-blue-600">
            Ventas Anuales: {formatCurrency(data.sales)}
          </p>
        </div>
      );
    }
    return null;
  };

  console.log("chartData ===================================>", chartData);
  const chartDataWithNoCount = chartData.map((item) => ({
    name: item.name,
    sales: item.sales,
  }));

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
            <BarChart
              data={chartDataWithNoCount}
              margin={{
                top: 50,
                right: 50,
                left: isMobile ? 5 : 20,
                bottom: 60, // Extra space for rotated labels
              }}
              maxBarSize={120}
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
              <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="#3b82f6"></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
