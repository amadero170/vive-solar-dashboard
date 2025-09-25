"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesData } from "@/types/sales";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    stroke: string;
    name: string;
  }>;
  label?: string;
}

interface MonthlySalesByFuenteChartProps {
  data: SalesData;
}

export default function MonthlySalesByFuenteChart({
  data,
}: MonthlySalesByFuenteChartProps) {
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

  // Generate colors for each fuente
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
      "#14b8a6", // teal-500
      "#f97176", // rose-500
    ];

    // If we need more colors than we have, generate additional ones
    if (count > colors.length) {
      for (let i = colors.length; i < count; i++) {
        const hue = (i * 137.508) % 360; // Golden angle approximation
        colors.push(`hsl(${hue}, 70%, 60%)`);
      }
    }

    return colors.slice(0, count);
  };

  // Process data to get monthly sales by fuente
  const getChartData = () => {
    if (!data || !data.records) return { chartData: [], fuentes: [] };

    // Filter for only Facebook and Google fuentes
    const allowedFuentes = ["Facebook", "Google"];
    const uniqueFuentes = allowedFuentes;

    // Create a map for month-fuente combinations
    const monthFuenteMap = new Map();

    data.records.forEach((record) => {
      if (!record.fuente || record.fuente.trim() === "") return;

      // Only process records for Facebook and Google
      if (!allowedFuentes.includes(record.fuente)) return;

      const monthName = getMonthName(record.mes);
      const key = `${monthName}-${record.fuente}`;

      if (!monthFuenteMap.has(key)) {
        monthFuenteMap.set(key, {
          month: monthName,
          fuente: record.fuente,
          totalAmount: 0,
          salesCount: 0,
        });
      }

      const entry = monthFuenteMap.get(key);
      entry.totalAmount += record.monto_negocio;
      entry.salesCount += 1;
    });

    // Get all months from January to current month
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

    const currentMonth = new Date().getMonth() + 1; // 1-12
    const monthsToShow = allMonths.slice(0, currentMonth);

    // Create chart data structure
    const chartData = monthsToShow.map((month) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const monthData: any = { month };

      uniqueFuentes.forEach((fuente) => {
        const key = `${month}-${fuente}`;
        const entry = monthFuenteMap.get(key);
        monthData[fuente] = entry ? entry.totalAmount : 0;
      });

      return monthData;
    });

    return { chartData, fuentes: uniqueFuentes };
  };

  const { chartData, fuentes } = getChartData();
  const colors = generateColors(fuentes.length);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-black">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.stroke }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!chartData.length || !fuentes.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-black">
            Ventas Mensuales por Fuente
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
          Ventas Mensuales Canales Digitales (Facebook y Google)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign={isMobile ? "bottom" : "top"}
                height={isMobile ? 60 : 36}
                wrapperStyle={{
                  fontSize: "12px",
                  paddingBottom: isMobile ? "20px" : "0px",
                }}
              />
              {fuentes.map((fuente, index) => (
                <Line
                  key={fuente}
                  type="monotone"
                  dataKey={fuente}
                  stroke={colors[index]}
                  strokeWidth={3}
                  dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <div className="font-semibold">
              Total por Fuentes:{" "}
              {formatCurrency(
                chartData.reduce((total, month) => {
                  return (
                    total +
                    fuentes.reduce((monthTotal, fuente) => {
                      return monthTotal + (month[fuente] || 0);
                    }, 0)
                  );
                }, 0)
              )}
            </div>
            <div className="text-gray-500 mt-2">
              <div className="flex flex-wrap justify-center gap-4">
                {fuentes.map((fuente, index) => {
                  const totalForFuente = chartData.reduce((total, month) => {
                    return total + (month[fuente] || 0);
                  }, 0);
                  return (
                    <div key={fuente} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded mr-1"
                        style={{ backgroundColor: colors[index] }}
                      ></div>
                      <span className="text-xs">
                        {fuente}: {formatCurrency(totalForFuente)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
