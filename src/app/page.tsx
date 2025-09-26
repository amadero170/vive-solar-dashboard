"use client";

import { useState, useEffect } from "react";
import { SalesData } from "@/types/sales";
import MonthlySalesChart from "@/components/MonthlySalesChart";
import MonthlySalesBySellerChart from "@/components/MonthlySalesBySellerChart";
import AnnualSalesBySellerBarChart from "@/components/AnnualSalesBySellerBarChart";
import CurrentMonthSalesBySellerBarChart from "@/components/CurrentMonthSalesBySellerBarChart";
import MonthlySalesByFuenteChart from "@/components/MonthlySalesByFuenteChart";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Clear any existing data first
      setData(null);

      // Ultra aggressive cache busting
      const timestamp = new Date().getTime();
      const randomId = Math.random().toString(36).substring(7);
      const sessionId = Math.random().toString(36).substring(7);

      // Clear browser cache to ensure fresh data
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        } catch {
          // Cache clearing failed, but continue anyway
        }
      }

      const response = await fetch(
        `/api/sales?v=2&t=${timestamp}&r=${randomId}&s=${sessionId}&nocache=true`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
            Pragma: "no-cache",
            Expires: "0",
            "If-None-Match": "*",
            "If-Modified-Since": "Thu, 01 Jan 1970 00:00:00 GMT",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }

      const salesData = await response.json();
      setData(salesData);
      console.log("salesData ===================================>", salesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Dashboard de Ventas 2025
                </div>
                <Link
                  href="/forms"
                  className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Formularios
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Dashboard de Ventas 2025
                </div>
                <Link
                  href="/forms"
                  className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Formularios
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate annual progress percentage
  const getAnnualProgress = () => {
    if (!data) return { percentage: 0, totalAnnualTarget: 0 };

    const annualTarget = data.sucursalData.Todas * 12;

    if (annualTarget === 0) return { percentage: 0, totalAnnualTarget: 0 };

    // Use total sales to date from API (data.totalAmount)
    const salesToDate = data.totalAmount;

    const percentage = (salesToDate / annualTarget) * 100;

    // Console log the 3 key values
    console.log("=== ANNUAL PROGRESS CALCULATION ===");
    console.log(
      "Annual Target (Sum of all vendor monthly goals × 12):",
      annualTarget
    );
    console.log("Sales to Date (data.totalAmount from API):", salesToDate);
    console.log(
      "Percentage ((Sales to Date ÷ Annual Target) × 100):",
      percentage
    );
    console.log("=======================================");

    return {
      percentage: Math.min(percentage, 100),
      totalAnnualTarget: annualTarget,
      salesToDate,
    };
  };

  // Calculate current month progress percentage
  const getCurrentMonthProgress = () => {
    if (!data)
      return {
        percentage: 0,
        currentMonth: "",
        monthlyTarget: 0,
        currentMonthSales: 0,
      };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // January = 1
    const monthNames = [
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
    const currentMonthName = monthNames[currentMonth - 1];

    // Find current month sales
    const currentMonthData = data.monthlySales.find(
      (month) => month.mes === String(currentMonth)
    );
    const currentMonthSales = currentMonthData?.totalAmount || 0;

    // Calculate total monthly target for all vendors
    const monthlyTarget = data.sucursalData.Todas;

    if (monthlyTarget === 0)
      return {
        percentage: 0,
        currentMonth: currentMonthName,
        monthlyTarget: 0,
        currentMonthSales: 0,
      };

    const percentage = (currentMonthSales / monthlyTarget) * 100;

    return {
      percentage: Math.min(percentage, 100),
      currentMonth: currentMonthName,
      monthlyTarget: monthlyTarget,
      currentMonthSales,
    };
  };

  const annualProgress = getAnnualProgress();
  const monthlyProgress = getCurrentMonthProgress();

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
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Dashboard de Ventas 2025
              </div>
              <Link
                href="/forms"
                className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Formularios
              </Link>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center px-3 py-1 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {loading ? "Actualizando..." : "Actualizar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                  {data?.vendors.length || 0}
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
                  {new Intl.NumberFormat("es-MX").format(data?.totalSales || 0)}
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
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(data?.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avance Anual
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {annualProgress.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avance {monthlyProgress.currentMonth}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlyProgress.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Show last update time */}
        {data?.timestamp && (
          <div className="mb-4 text-center text-sm text-gray-500">
            Última actualización:{" "}
            {new Date(data.timestamp).toLocaleString("es-MX")}
          </div>
        )}

        <MonthlySalesChart data={data} />

        {/* Bar Charts Row - Side by Side on Desktop */}
        <div className="my-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnnualSalesBySellerBarChart data={data} />
            <CurrentMonthSalesBySellerBarChart data={data} />
          </div>
        </div>

        <MonthlySalesBySellerChart data={data} />

        {/* Monthly Sales by Fuente Chart at the bottom */}
        <div className="my-8">
          <MonthlySalesByFuenteChart data={data} />
        </div>
      </div>
    </div>
  );
}
