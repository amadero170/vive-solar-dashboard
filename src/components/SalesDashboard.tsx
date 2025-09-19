"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SalesData } from "@/types/sales";

interface SalesDashboardProps {
  initialData?: SalesData;
}

export default function SalesDashboard({ initialData }: SalesDashboardProps) {
  const [data, setData] = useState<SalesData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [selectedSucursal, setSelectedSucursal] = useState<string>("Todas");

  useEffect(() => {
    if (!initialData) {
      fetchData();
    }
  }, [initialData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sales", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-store",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }
      const salesData = await response.json();
      setData(salesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-MX").format(num);
  };

  // Calculate rounded step values for charts
  const calculateRoundedSteps = (maxValue: number) => {
    if (maxValue <= 0) return { stepAmount: 0, steps: 0 };

    // Find appropriate step size based on the magnitude of the value
    let stepAmount: number;
    let steps: number;

    if (maxValue >= 10000000) {
      // For values >= 10M, use 1M, 2M, 5M steps
      if (maxValue <= 20000000) {
        stepAmount = 2000000; // 2M steps
      } else if (maxValue <= 50000000) {
        stepAmount = 5000000; // 5M steps
      } else {
        stepAmount = 10000000; // 10M steps
      }
    } else if (maxValue >= 1000000) {
      // For values >= 1M, use 100K, 200K, 500K, 1M steps
      if (maxValue <= 2000000) {
        stepAmount = 200000; // 200K steps
      } else if (maxValue <= 5000000) {
        stepAmount = 500000; // 500K steps
      } else {
        stepAmount = 1000000; // 1M steps
      }
    } else if (maxValue >= 100000) {
      // For values >= 100K, use 10K, 20K, 50K, 100K steps
      if (maxValue <= 200000) {
        stepAmount = 20000; // 20K steps
      } else if (maxValue <= 500000) {
        stepAmount = 50000; // 50K steps
      } else {
        stepAmount = 100000; // 100K steps
      }
    } else if (maxValue >= 10000) {
      // For values >= 10K, use 1K, 2K, 5K, 10K steps
      if (maxValue <= 20000) {
        stepAmount = 2000; // 2K steps
      } else if (maxValue <= 50000) {
        stepAmount = 5000; // 5K steps
      } else {
        stepAmount = 10000; // 10K steps
      }
    } else {
      // For smaller values, use 1K steps
      stepAmount = 1000; // 1K steps
    }

    // Calculate number of steps needed
    steps = Math.ceil(maxValue / stepAmount);

    // Round up the max value to the nearest step
    const roundedMax = Math.ceil(maxValue / stepAmount) * stepAmount;

    return { stepAmount, steps, roundedMax };
  };

  // Normalize month label to Spanish month name
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

    const filteredRecords = data.records.filter(
      (record) => record.sucursal === selectedSucursal
    );

    // Recalculate vendors based on filtered records
    const vendorMap = new Map();
    filteredRecords.forEach((record) => {
      if (!vendorMap.has(record.vendedor)) {
        vendorMap.set(record.vendedor, {
          vendedor: record.vendedor,
          totalSales: 0,
          totalAmount: 0,
          salesCount: 0,
          averageAmount: 0,
        });
      }

      const vendor = vendorMap.get(record.vendedor);
      vendor.totalSales += 1;
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
      vendors,
      monthlySales,
      totalSales,
      totalAmount,
    };
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Vive Solar styling */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="ViveSolar Logo"
                width={200}
                height={200}
                className="mr-3"
              />
            </div>
            <div className="text-sm text-gray-600">
              Dashboard de Ventas 2025
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Branch Filter with Vive Solar button styling */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <label
              htmlFor="sucursal-select"
              className="text-sm font-medium text-gray-700"
            >
              Filtrar por Sucursal:
            </label>
            <select
              id="sucursal-select"
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 transition-colors"
            >
              <option value="Todas">Todas las Sucursales</option>
              <option value="Guadalajara">Guadalajara</option>
              <option value="Puerto Vallarta">Vallarta</option>
              <option value="Querétaro">Querétaro</option>
            </select>
          </div>
        </div>

        {/* Summary Cards with Vive Solar styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Vendedores
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredData?.vendors.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Ventas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(filteredData?.totalSales || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(filteredData?.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Sales Chart with Vive Solar styling */}
        {filteredData?.monthlySales && filteredData.monthlySales.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Ventas Mensuales 2025{" "}
              {selectedSucursal !== "Todas" && `- ${selectedSucursal}`}
            </h3>
            <div className="relative">
              {(() => {
                // Calculate the maximum amount once and use it consistently
                // Determine current monthly meta: for "Todas" try explicit meta, otherwise sum of branches
                const currentMeta: number | undefined = (() => {
                  if (!data?.sucursalData) return undefined;
                  if (selectedSucursal === "Todas") {
                    const explicitAll = data.sucursalData["Todas"];
                    if (typeof explicitAll === "number" && explicitAll > 0) {
                      return explicitAll;
                    }
                    return Object.entries(data.sucursalData)
                      .filter(([key]) => key !== "Todas")
                      .reduce(
                        (sum, [, value]) => sum + (Number(value) || 0),
                        0
                      );
                  }
                  return data.sucursalData[selectedSucursal];
                })();

                const rawMaxAmount = Math.max(
                  ...filteredData.monthlySales.map((m) => m.totalAmount),
                  currentMeta ?? 0
                );
                const { stepAmount, steps, roundedMax } =
                  calculateRoundedSteps(rawMaxAmount);
                const maxAmount = roundedMax;
                const chartHeight = 200; // Chart height in pixels

                if (!maxAmount || !stepAmount || !steps) {
                  return null;
                }

                // TypeScript assertion - we know these are defined after the check above
                const safeMaxAmount = maxAmount as number;
                const safeStepAmount = stepAmount as number;
                const safeSteps = steps as number;

                return (
                  <>
                    {/* Y-axis labels and grid lines */}
                    <div className="absolute left-0 top-0 h-64 w-12 flex flex-col justify-between text-xs text-gray-500">
                      {Array.from({ length: safeSteps + 1 }, (_, i) => {
                        const value = safeMaxAmount - i * safeStepAmount;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-end pr-2 relative"
                            style={{ height: `${chartHeight / safeSteps}px` }}
                          >
                            {formatCurrency(value)}
                            {/* Grid line */}
                            <div className="absolute right-0 top-0 w-full border-t border-gray-200 opacity-30"></div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chart area with bars and meta line */}
                    <div className="relative ml-12 h-64">
                      {/* Meta line - rendered first so it's behind bars */}
                      {typeof currentMeta === "number" &&
                        currentMeta > 0 &&
                        currentMeta <= safeMaxAmount && (
                          <div
                            className="absolute w-full border-t-2 border-dashed border-red-500 opacity-70 pointer-events-none"
                            style={{
                              bottom: `${
                                ((safeMaxAmount - currentMeta) /
                                  safeMaxAmount) *
                                chartHeight
                              }px`,
                            }}
                          >
                            <div className="absolute -top-6 left-0 text-xs text-red-600 font-medium bg-white px-2 py-1 rounded shadow-sm">
                              Meta: {formatCurrency(currentMeta)}
                            </div>
                          </div>
                        )}

                      {/* Bars */}
                      <div className="flex items-end justify-between h-64 px-4">
                        {filteredData.monthlySales.map((month) => {
                          const barHeight =
                            (month.totalAmount / safeMaxAmount) * chartHeight;

                          return (
                            <div
                              key={month.mes}
                              className="flex flex-col items-center flex-1"
                            >
                              {/* Bar */}
                              <div className="relative w-full max-w-16 mx-1 group">
                                <div
                                  className="bg-gradient-to-t from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 rounded-t-lg shadow-sm"
                                  style={{
                                    height: `${Math.max(barHeight, 2)}px`,
                                  }}
                                ></div>

                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                  <div className="font-semibold">
                                    {formatCurrency(month.totalAmount)}
                                  </div>
                                  <div>{month.salesCount} ventas</div>
                                  {typeof currentMeta === "number" &&
                                    currentMeta > 0 && (
                                      <div className="text-red-300">
                                        Meta: {formatCurrency(currentMeta)}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* X-axis labels below chart area to avoid lifting bars */}
                    <div className="flex justify-between px-4 ml-12 mt-2">
                      {filteredData.monthlySales.map((month) => (
                        <div
                          key={`label-${month.mes}`}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div className="text-xs font-medium text-gray-600 text-center">
                            {getMonthName(month.mes)}
                          </div>
                          <div className="mt-1 text-xs text-gray-500 text-center">
                            {formatCurrency(month.totalAmount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Chart legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded mr-2"></div>
                  <span>Monto de Ventas</span>
                </div>
                {selectedSucursal !== "Todas" &&
                  data?.sucursalData[selectedSucursal] && (
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
                  Total: {formatCurrency(filteredData.totalAmount)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Performance Table with Vive Solar styling */}
        {filteredData?.vendors && filteredData.vendors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                Rendimiento por Vendedor{" "}
                {selectedSucursal !== "Todas" && `- ${selectedSucursal}`}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ventas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Monto Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Promedio por Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Promedio Venta Mensual
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.vendors.map((vendor, index) => (
                    <tr
                      key={vendor.vendedor}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vendor.vendedor}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vendor.salesCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(vendor.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(vendor.averageAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(() => {
                            const monthsWithSales =
                              new Set(
                                filteredData.records
                                  .filter((r) => r.vendedor === vendor.vendedor)
                                  .map((r) => r.mes)
                              ).size || 1;
                            const monthlyAverage =
                              vendor.totalAmount / monthsWithSales;
                            return formatCurrency(monthlyAverage);
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Chart with Vive Solar styling */}
        {filteredData?.vendors && filteredData.vendors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Comparativa de Montos por Vendedor{" "}
              {selectedSucursal !== "Todas" && `- ${selectedSucursal}`}
            </h3>
            <div className="space-y-4">
              {filteredData.vendors.map((vendor) => {
                const percentage =
                  (vendor.totalAmount / (filteredData.totalAmount || 1)) * 100;
                return (
                  <div key={vendor.vendedor} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {vendor.vendedor}
                      </span>
                      <span className="text-gray-600">
                        {formatCurrency(vendor.totalAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
