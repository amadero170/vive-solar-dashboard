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

interface MonthlySalesChartProps {
  data: SalesData;
  selectedYear: number;
}

export default function MonthlySalesChart({ data, selectedYear }: MonthlySalesChartProps) {
  const [selectedSucursal, setSelectedSucursal] = useState<string>("Todas");
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

  // Filter data based on selected branch
  const getFilteredData = () => {
    if (!data || selectedSucursal === "Todas") {
      return data;
    }

    const filteredRecords = data.records.filter((record) => {
      // Handle accent variations for Querétaro
      if (selectedSucursal === "Querétaro") {
        return (
          record.sucursal === "Querétaro" || record.sucursal === "Queretaro"
        );
      }
      return record.sucursal === selectedSucursal;
    });

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

  // Get current meta based on selected branch
  const getCurrentMeta = () => {
    if (!data?.sucursalData) return null;

    if (selectedSucursal === "Todas") {
      const explicitAll = data.sucursalData["Todas"];
      if (typeof explicitAll === "number" && explicitAll > 0) {
        return explicitAll;
      }
      return Object.entries(data.sucursalData)
        .filter(([key]) => key !== "Todas")
        .reduce((sum, [, value]) => sum + (Number(value) || 0), 0);
    }

    // Handle accent variations for Querétaro
    let metaValue = data.sucursalData[selectedSucursal];
    if (!metaValue && selectedSucursal === "Querétaro") {
      metaValue = data.sucursalData["Queretaro"];
    }

    return metaValue;
  };

  const currentMeta = getCurrentMeta();

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

    // For 2025, show all months. For 2026, show up to current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = selectedYear === 2025 
      ? 12 // Todos los meses de 2025
      : selectedYear === currentYear
      ? currentDate.getMonth() + 1 // Hasta el mes actual para 2026
      : 12; // Default to December

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

  // Calculate Y-axis domain to ensure meta line is always visible
  const calculateYAxisDomain = () => {
    const maxSalesValue = Math.max(...chartData.map((d) => d.sales));
    const metaValue = currentMeta || 0;

    // Use the higher of max sales or meta value, then add 10% buffer
    const maxValue = Math.max(maxSalesValue, metaValue);
    const bufferedMax = maxValue * 1.1;

    return [0, bufferedMax];
  };

  const yAxisDomain = calculateYAxisDomain();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-black">{label}</p>
          <p className="text-orange-600">
            Ventas: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-600">
            Cantidad: {payload[0].payload.count} ventas
          </p>
          {currentMeta && (
            <p className="text-red-600">Meta: {formatCurrency(currentMeta)}</p>
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
          <CardTitle>Ventas Mensuales {selectedYear}</CardTitle>
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
            <span className="text-black">Ventas Mensuales 2025</span>{" "}
            {selectedSucursal !== "Todas" && `- ${selectedSucursal}`}
          </CardTitle>
          <Select
            value={selectedSucursal}
            onChange={(e) => setSelectedSucursal(e.target.value)}
          >
            <option value="Todas">Todas las Sucursales</option>
            <option value="Guadalajara">Guadalajara</option>
            <option value="Puerto Vallarta">Vallarta</option>
            <option value="Querétaro">Querétaro</option>
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
                  domain={yAxisDomain}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => formatCurrency(value)}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} />
              {currentMeta && (
                <ReferenceLine
                  y={currentMeta}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Meta: ${formatCurrency(currentMeta)}`,
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
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              <span>Monto de Ventas</span>
            </div>
            {currentMeta && (
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
