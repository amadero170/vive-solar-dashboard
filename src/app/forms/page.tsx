"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Loader2,
  Search,
  Users,
  X,
} from "lucide-react";

interface HubSpotOwner {
  id: string;
  name: string;
  email: string;
  archived: boolean;
}

export default function FormsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [owners, setOwners] = useState<HubSpotOwner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    if (owners.length === 0) {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hubspot/owners");
        const json = await res.json();
        if (res.ok && json.success) {
          setOwners(json.data || []);
        } else {
          setError(json.error || "No se pudieron obtener los usuarios de HubSpot");
        }
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message || "Error de red al consultar HubSpot");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const filteredOwners = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Vive Solar styling */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="ViveSolar Logo"
                  width={200}
                  height={200}
                  className="mr-3"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleOpenModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4 text-orange-600" />
                <span>Directorio HubSpot</span>
              </button>
              <Link
                href="/"
                className="flex items-center px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
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
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Formularios de Captura
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Selecciona el formulario que necesitas completar o consulta los identificadores de HubSpot.
          </p>
        </div>

        {/* Form Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Button 1 - Cargar Negocio Cerrado */}
          <Link href="/formv2" className="group">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full flex flex-col justify-between">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Cargar Negocio Cerrado
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Registra un nuevo negocio que ha sido cerrado exitosamente (contrato, anticipo y CSF)
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center text-orange-600 font-medium group-hover:text-orange-700 text-sm">
                  <span>Ir al formulario</span>
                  <svg
                    className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Button 2 - Cargar Pago */}
          <Link href="/form-pago" className="group">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full flex flex-col justify-between">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Cargar Pago
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Registra un pago recibido (anticipo, finiquito o trasinstalación) asociado a un negocio
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 text-sm">
                  <span>Ir al formulario</span>
                  <svg
                    className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Banner para Asesores y HubSpot */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Vas a registrar o editar un asesor en Google Sheets?
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Consulta el identificador numérico oficial de HubSpot para pegarlo en la columna <code className="bg-white px-1.5 py-0.5 rounded border border-orange-200 font-semibold text-orange-800">hs_id</code> de la pestaña Colaboradores.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar IDs de HubSpot</span>
          </button>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            </div>
            <div className="ml-3 text-xs sm:text-sm">
              <h3 className="font-bold text-blue-900 mb-2">
                Información del Sistema
              </h3>
              <ul className="text-blue-800 space-y-1.5">
                <li>• Los asesores se cargan automáticamente desde la pestaña <strong>Colaboradores</strong> de Google Sheets.</li>
                <li>• Los formularios cuentan con protección anti-duplicados y envían los datos de inmediato a los workflows de n8n.</li>
                <li>• En caso de dudas o incidencias técnicas, contacta al administrador del sistema.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Directorio HubSpot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Directorio de Propietarios de HubSpot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Copia el ID y pégalo en la columna <code className="text-orange-700 font-semibold">hs_id</code> de Google Sheets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Content / Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <span className="text-sm">Consultando usuarios en HubSpot...</span>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              ) : filteredOwners.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No se encontraron usuarios que coincidan con &ldquo;{searchTerm}&rdquo;
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Correo</th>
                        <th className="px-4 py-3 text-right">HubSpot ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredOwners.map((owner) => {
                        const isCopied = copiedId === owner.id;
                        return (
                          <tr
                            key={owner.id}
                            className="hover:bg-orange-50/40 transition-colors"
                          >
                            <td className="px-4 py-2.5 font-medium text-slate-900">
                              {owner.name}
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                              {owner.email}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleCopy(owner.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                  isCopied
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : "bg-slate-100 text-slate-800 hover:bg-orange-100 hover:text-orange-900 border border-slate-200"
                                }`}
                                title="Copiar ID"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>¡Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <span>{owner.id}</span>
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Total: {filteredOwners.length} usuarios</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
