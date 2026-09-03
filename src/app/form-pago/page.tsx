"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  DollarSign,
  Loader2,
  Send,
  Sparkles,
  Upload,
  UserCheck,
  X,
} from "lucide-react";

const FORMAS_DE_PAGO = [
  "Transferencia",
  "Cheque",
  "Deposito Bancario",
  "TDC Una sola exhibicion",
  "TDC 6 MSI",
  "TDC 12 MSI",
  "TDC 18 MSI",
  "TDC 24 MSI",
  "Otro",
];

const CONCEPTOS_PAGO = ["Anticipo", "Finiquito", "Trasinstalación", "Otro"];

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const ANIOS = ["2023", "2024", "2025", "2026"];

interface FormDataState {
  tipoNegocio: string;
  nroNegocio: string;
  fechaPago: string;
  montoPago: string;
  formaPago: string;
  conceptoPago: string;
  asesor: string;
  mesCierreNegocio: string;
  anioCierreNegocio: string;
}

const currentMonth = MESES[new Date().getMonth()];
const currentYear = new Date().getFullYear().toString();

const initialFormState: FormDataState = {
  tipoNegocio: "BT",
  nroNegocio: "",
  fechaPago: new Date().toISOString().split("T")[0],
  montoPago: "",
  formaPago: "Transferencia",
  conceptoPago: "Anticipo",
  asesor: "",
  mesCierreNegocio: currentMonth,
  anioCierreNegocio: ANIOS.includes(currentYear) ? currentYear : "2026",
};

export default function FormPagoPage() {
  const [formData, setFormData] = useState<FormDataState>(initialFormState);
  const [asesoresList, setAsesoresList] = useState<string[]>([]);
  const [isLoadingAsesores, setIsLoadingAsesores] = useState<boolean>(true);

  const [pagoFile, setPagoFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    nroNegocio: string;
    monto: string;
    submittedAt: string;
  } | null>(null);

  // Cargar lista dinámica de Asesores desde la pestaña "Colaboradores" de Google Sheets
  useEffect(() => {
    async function fetchColaboradores() {
      try {
        const res = await fetch("/api/colaboradores");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setAsesoresList(json.data);
          }
        }
      } catch (error) {
        console.error("Error al cargar la lista de colaboradores desde Google Sheets:", error);
      } finally {
        setIsLoadingAsesores(false);
      }
    }
    fetchColaboradores();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setPagoFile(null);
    setSubmittedData(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pagoFile) {
      setErrorMessage("Por favor adjunta el comprobante de Pago (Obligatorio).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const body = new FormData();

      // Campos de texto y numéricos con nombres exactos que usa el workflow de n8n
      body.append("Tipo negocio", formData.tipoNegocio);
      body.append("Nro Negocio", formData.nroNegocio);
      body.append("Fecha de pago", formData.fechaPago);
      body.append("Monto pago (con IVA)", formData.montoPago);
      body.append("Forma de Pago", formData.formaPago);
      body.append("Concepto de pago", formData.conceptoPago);
      body.append("Asesor", formData.asesor);
      body.append("Mes cierre negocio", formData.mesCierreNegocio);
      body.append("Año cierre negocio", formData.anioCierreNegocio);
      body.append("submittedAt", new Date().toISOString());
      body.append("formMode", "production");

      // Metadatos del archivo para JSON
      if (pagoFile) {
        body.append(
          "Pago",
          JSON.stringify([
            {
              filename: pagoFile.name,
              mimetype: pagoFile.type || "application/octet-stream",
              size: pagoFile.size,
            },
          ])
        );
      }

      // Archivo binario para $binary en n8n
      body.append("Pago_comprobante", pagoFile);

      const res = await fetch("/api/forms/carga-pago", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Ocurrió un error al enviar el formulario a n8n."
        );
      }

      setSubmittedData({
        nroNegocio: formData.nroNegocio,
        monto: formData.montoPago,
        submittedAt: new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });

      // Limpiar formulario para evitar envíos duplicados
      setFormData(initialFormState);
      setPagoFile(null);
      const fileInput = document.getElementById("pago-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      setErrorMessage(error.message || "Error al enviar el formulario.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
                <Image
                  src="/logo.png"
                  alt="ViveSolar Logo"
                  width={160}
                  height={50}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-500" />
                Nuevo Pago
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/forms"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver a Formularios</span>
                <span className="sm:hidden">Volver</span>
              </Link>
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-sm"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Banner de Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-800 mb-3 shadow-sm">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Formulario Oficial de Captura</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Nuevo Pago
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Registra un nuevo pago asociado a un negocio cerrado.
          </p>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm animate-fade-in flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <h4 className="font-bold text-red-900">Atención al enviar formulario</h4>
              <p className="text-red-700 mt-1">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Feedback de Envío Exitoso */}
        {submittedData ? (
          <div className="mb-8 p-8 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm animate-fade-in text-center max-w-xl mx-auto">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-2xl font-extrabold text-emerald-950 mb-2">
              ¡Pago Registrado Exitosamente!
            </h3>
            <p className="text-emerald-800 text-sm mb-6">
              Se envió correctamente el pago de{" "}
              <strong>${submittedData.monto}</strong> para el negocio #{submittedData.nroNegocio} a las{" "}
              {submittedData.submittedAt}.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Registrar otro pago
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-white text-emerald-800 border border-emerald-300 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
              >
                Ir al Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECCIÓN 1: DATOS DEL NEGOCIO */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">1. Datos del Negocio</h2>
                <p className="text-xs text-slate-500">Identifica el negocio al que corresponde el pago</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Tipo negocio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Tipo negocio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="tipoNegocio"
                    value={formData.tipoNegocio}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="BT">BT (Baja Tensión)</option>
                    <option value="MT">MT (Media Tensión)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Nro Negocio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nro Negocio <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="nroNegocio"
                  value={formData.nroNegocio}
                  onChange={handleInputChange}
                  placeholder="1234"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL PAGO */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Información del Pago</h2>
                <p className="text-xs text-slate-500">Monto, fecha y modalidad del pago recibido</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Fecha de pago */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Fecha de pago <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fechaPago"
                  value={formData.fechaPago}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                />
              </div>

              {/* Monto pago (con IVA) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Monto pago (con IVA) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
                  <input
                    type="text"
                    name="montoPago"
                    value={formData.montoPago}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Forma de Pago */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Forma de Pago <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="formaPago"
                    value={formData.formaPago}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                  >
                    {FORMAS_DE_PAGO.map((fp) => (
                      <option key={fp} value={fp}>
                        {fp}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Concepto de pago */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Concepto de pago
                </label>
                <div className="relative">
                  <select
                    name="conceptoPago"
                    value={formData.conceptoPago}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                  >
                    {CONCEPTOS_PAGO.map((cp) => (
                      <option key={cp} value={cp}>
                        {cp}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: ASESOR Y CIERRE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">3. Asesor y Cierre</h2>
                <p className="text-xs text-slate-500">Asesor responsable y periodo de cierre del negocio</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Asesor */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Asesor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {isLoadingAsesores ? (
                    <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-400 text-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando asesores…
                    </div>
                  ) : (
                    <>
                      <select
                        name="asesor"
                        value={formData.asesor}
                        onChange={handleInputChange}
                        required
                        className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                      >
                        <option value="" disabled>
                          Selecciona un asesor
                        </option>
                        {asesoresList.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    </>
                  )}
                </div>
              </div>

              {/* Mes cierre negocio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Mes cierre negocio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="mesCierreNegocio"
                    value={formData.mesCierreNegocio}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer capitalize"
                  >
                    {MESES.map((m) => (
                      <option key={m} value={m} className="capitalize">
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Año cierre negocio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Año cierre negocio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="anioCierreNegocio"
                    value={formData.anioCierreNegocio}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                  >
                    {ANIOS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: COMPROBANTE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">4. Comprobante de Pago</h2>
                <p className="text-xs text-slate-500">Adjunta la imagen o PDF del comprobante</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Comprobante de Pago <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".jpg,.png,.jpeg,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPagoFile(file);
                  }}
                  className="hidden"
                  id="pago-file-input"
                />
                <label
                  htmlFor="pago-file-input"
                  className={`flex items-center gap-3 w-full px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    pagoFile
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {pagoFile ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-900 truncate">
                          {pagoFile.name}
                        </p>
                        <p className="text-xs text-emerald-700">
                          {(pagoFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setPagoFile(null);
                          const input = document.getElementById("pago-file-input") as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Haz clic para seleccionar archivo
                        </p>
                        <p className="text-xs text-slate-500">.jpg, .png, .jpeg, .pdf</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* BOTÓN DE ENVÍO */}
          <div className="flex justify-center pt-2 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando pago…
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  Enviar Pago
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </main>
    </div>
  );
}
