"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  FileCheck2,
  Loader2,
  Send,
  Sparkles,
  SunMedium,
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

const RANGOS_PRECIO_MT = ["min", "med", "max", "NA"];

const FUENTES_PROSPECTO = [
  "Google",
  "Prospección",
  "Llamada",
  "Embajador",
  "Cliente Vive Solar",
  "Empleado Vive Solar",
  "Facebook",
];

const ASIGNADORES_LEAD = [
  "José Saenz",
  "Sebastián Ramírez",
  "Daniel Ortíz",
  "Areli Sánchez",
  "Otro",
];

const MOTIVOS_COMPRA = [
  "Pago a meses sin intereses",
  "Financiamiento",
  "Confianza en la empresa",
  "Garantías",
  "Calidad de los equipos",
  "Atención brindada",
  "Recomendación de alguien más",
  "Certificación de la empresa",
];

interface FormDataState {
  tipoNegocio: string;
  nroNegocio: string;
  nombreCliente: string;
  numeroPaneles: string;
  fechaCierre: string;
  tipoCambio: string;
  precioLista: string;
  montoVenta: string;
  rangoPrecioMT: string;
  montoPrimerPago: string;
  formaPago: string;
  conceptoPago: string;
  asesor: string;
  apoyoAreli: boolean;
  tarifaCFE: string;
  fuenteProspecto: string;
  quienAsignoLead: string;
  embajador: string;
  motivoCompra: string[];
  marcaPaneles: string;
  potenciaPaneles: string;
  numeroInversores: string;
  marcaInversores: string;
  modeloMonitoreo: string;
  siguientesPagos: string;
  visitaTecnica: string;
  fechaInstalacion: string;
  statusCFE: string;
  marcaBaterias: string;
  nroBaterias: string;
  capacidadBaterias: string;
  modeloBaterias: string;
  ventaOtroServicio: string;
}

const initialFormState: FormDataState = {
  tipoNegocio: "BT",
  nroNegocio: "",
  nombreCliente: "",
  numeroPaneles: "",
  fechaCierre: new Date().toISOString().split("T")[0],
  tipoCambio: "",
  precioLista: "",
  montoVenta: "",
  rangoPrecioMT: "NA",
  montoPrimerPago: "",
  formaPago: "Transferencia",
  conceptoPago: "Anticipo",
  asesor: "",
  apoyoAreli: false,
  tarifaCFE: "",
  fuenteProspecto: "",
  quienAsignoLead: "",
  embajador: "",
  motivoCompra: [],
  marcaPaneles: "",
  potenciaPaneles: "",
  numeroInversores: "",
  marcaInversores: "",
  modeloMonitoreo: "",
  siguientesPagos: "",
  visitaTecnica: "",
  fechaInstalacion: "",
  statusCFE: "",
  marcaBaterias: "",
  nroBaterias: "",
  capacidadBaterias: "",
  modeloBaterias: "",
  ventaOtroServicio: "",
};

export default function FormV2Page() {
  const [formData, setFormData] = useState<FormDataState>(initialFormState);
  const [asesoresList, setAsesoresList] = useState<string[]>([]);
  const [isLoadingAsesores, setIsLoadingAsesores] = useState<boolean>(true);

  const [pagoAnticipoFile, setPagoAnticipoFile] = useState<File | null>(null);
  const [contratoFile, setContratoFile] = useState<File | null>(null);
  const [csfFile, setCsfFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    cliente: string;
    nroNegocio: string;
    submittedAt: string;
  } | null>(null);

  // Cargar lista dinámica de Asesores 100% desde la pestaña "Colaboradores" de Google Sheets
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
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleMotivoCompra = (option: string) => {
    setFormData((prev) => {
      const exists = prev.motivoCompra.includes(option);
      return {
        ...prev,
        motivoCompra: exists
          ? prev.motivoCompra.filter((item) => item !== option)
          : [...prev.motivoCompra, option],
      };
    });
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setPagoAnticipoFile(null);
    setContratoFile(null);
    setCsfFile(null);
    setSubmittedData(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pagoAnticipoFile) {
      setErrorMessage("Por favor adjunta el comprobante de Pago Anticipo (Obligatorio).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const body = new FormData();

      // Campos de texto y numéricos con nombres exactos
      body.append("Tipo negocio", formData.tipoNegocio);
      body.append("Nro Negocio", formData.nroNegocio);
      body.append("Nombre del cliente", formData.nombreCliente);
      body.append("Numero de paneles", formData.numeroPaneles || "0");
      body.append("Fecha de cierre", formData.fechaCierre);
      body.append("Tipo de cambio", formData.tipoCambio || "0");
      body.append("Precio de lista (con IVA)", formData.precioLista || "");
      body.append("Monto Venta (con IVA)", formData.montoVenta);
      body.append("Rango precio (PARA NEGOCIOS MT)", formData.rangoPrecioMT);
      body.append("Monto total primer pago", formData.montoPrimerPago);
      body.append("Forma de Pago", formData.formaPago);
      body.append("Concepto de pago", formData.conceptoPago);
      body.append("Asesor", formData.asesor);
      body.append(
        "Apoyo Areli a Sebastián",
        formData.apoyoAreli ? JSON.stringify(["TRUE"]) : JSON.stringify([])
      );
      body.append("Tarifa CFE", formData.tarifaCFE || "");
      body.append("Fuente del prospecto", formData.fuenteProspecto || "");
      body.append("¿Quien asignó el lead?", formData.quienAsignoLead || "");
      body.append("Embajador", formData.embajador || "");
      body.append("Motivo de compra", JSON.stringify(formData.motivoCompra));
      body.append("Marca Paneles", formData.marcaPaneles || "");
      body.append("Potencia Paneles", formData.potenciaPaneles || "");
      body.append("Numero de Inversores", formData.numeroInversores || "");
      body.append("Marca de Inversores", formData.marcaInversores || "");
      body.append("Modelo de monitoreo", formData.modeloMonitoreo || "");
      body.append("Siguientes pagos", formData.siguientesPagos || "");
      body.append("Visita Técnica", formData.visitaTecnica || "");
      body.append("Fecha de instalación", formData.fechaInstalacion || "");
      body.append("Status CFE", formData.statusCFE || "");
      body.append("Marca de Baterías", formData.marcaBaterias || "");
      body.append("Nro de baterías", formData.nroBaterias || "");
      body.append("Capacidad de baterías", formData.capacidadBaterias || "");
      body.append("Modelo de baterías", formData.modeloBaterias || "");
      body.append(
        "Venta de Otro Servicio o Producto",
        formData.ventaOtroServicio || ""
      );
      body.append("submittedAt", new Date().toISOString());
      body.append("formMode", "production");

      // Metadatos de archivos para JSON
      if (pagoAnticipoFile) {
        body.append(
          "Pago Anticipo",
          JSON.stringify([
            {
              filename: pagoAnticipoFile.name,
              mimetype: pagoAnticipoFile.type || "application/octet-stream",
              size: pagoAnticipoFile.size,
            },
          ])
        );
      } else {
        body.append("Pago Anticipo", "null");
      }

      if (contratoFile) {
        body.append(
          "Contrato",
          JSON.stringify([
            {
              filename: contratoFile.name,
              mimetype: contratoFile.type || "application/octet-stream",
              size: contratoFile.size,
            },
          ])
        );
      } else {
        body.append("Contrato", "null");
      }

      if (csfFile) {
        body.append(
          "Constancia Situacion Fiscal",
          JSON.stringify([
            {
              filename: csfFile.name,
              mimetype: csfFile.type || "application/octet-stream",
              size: csfFile.size,
            },
          ])
        );
      } else {
        body.append("Constancia Situacion Fiscal", "null");
      }

      // Archivos binarios para $binary en n8n
      body.append("Pago_Anticipo", pagoAnticipoFile);
      if (contratoFile) {
        body.append("Contrato", contratoFile);
      }
      if (csfFile) {
        body.append("Constancia_Situacion_Fiscal", csfFile);
      }

      const res = await fetch("/api/forms/negocio-cerrado", {
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
        cliente: formData.nombreCliente,
        nroNegocio: formData.nroNegocio,
        submittedAt: new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });

      // Limpiar formulario para evitar envíos duplicados
      setFormData(initialFormState);
      setPagoAnticipoFile(null);
      setContratoFile(null);
      setCsfFile(null);

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
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                <Sparkles className="w-3 h-3 text-orange-500" />
                Negocio Cerrado v2
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-800 mb-3 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Formulario Oficial de Captura</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Negocio Cerrado
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Registra los datos generales, financieros, técnicos y documentos del nuevo contrato solar.
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
              ¡Negocio Capturado Exitosamente!
            </h3>
            <p className="text-emerald-800 text-sm mb-6">
              Se envió y procesó correctamente la información del cliente{" "}
              <strong>{submittedData.cliente}</strong> (Negocio #{submittedData.nroNegocio}) a las{" "}
              {submittedData.submittedAt}.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Capturar otro negocio
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
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">1. Información del Negocio</h2>
                <p className="text-xs text-slate-500">Datos principales de identificación del cliente y cierre</p>
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
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium cursor-pointer"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Nombre del cliente */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nombre del cliente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombreCliente"
                  value={formData.nombreCliente}
                  onChange={handleInputChange}
                  placeholder="Ej. Roberto Gómez / Comercializadora S.A."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Fecha de cierre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Fecha de cierre <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fechaCierre"
                  value={formData.fechaCierre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                />
              </div>

              {/* Tipo de cambio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Tipo de cambio (USD/MXN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tipoCambio"
                  value={formData.tipoCambio}
                  onChange={handleInputChange}
                  placeholder="Ej. 18.50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CONDICIONES FINANCIERAS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Montos y Condiciones Financieras</h2>
                <p className="text-xs text-slate-500">Valores pactados, anticipos y modalidad de liquidación</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Precio de lista (con IVA) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Precio de lista (con IVA)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
                  <input
                    type="text"
                    name="precioLista"
                    value={formData.precioLista}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Monto Venta (con IVA) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Monto Venta (con IVA) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
                  <input
                    type="text"
                    name="montoVenta"
                    value={formData.montoVenta}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Rango precio (PARA NEGOCIOS MT) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Rango precio (Negocios MT) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="rangoPrecioMT"
                    value={formData.rangoPrecioMT}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    {RANGOS_PRECIO_MT.map((rango) => (
                      <option key={rango} value={rango}>
                        {rango.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Monto total primer pago */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Monto total primer pago <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
                  <input
                    type="text"
                    name="montoPrimerPago"
                    value={formData.montoPrimerPago}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
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
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
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
                  Concepto de pago <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="conceptoPago"
                    value={formData.conceptoPago}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
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

          {/* SECCIÓN 3: ASESOR Y ORIGEN DEL LEAD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">3. Asesor y Asignación de Lead</h2>
                  <p className="text-xs text-slate-500">Responsables comerciales y fuentes de prospección</p>
                </div>
                {isLoadingAsesores && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                    Sincronizando Sheets...
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Asesor (Dinámico desde Sheets) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Asesor <span className="text-red-500">*</span></span>
                  <span className="text-[11px] font-normal text-slate-500 lowercase">
                    {asesoresList.length} colaboradores disponibles
                  </span>
                </label>
                <div className="relative">
                  <select
                    name="asesor"
                    value={formData.asesor}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer font-medium"
                  >
                    <option value="" disabled>
                      {isLoadingAsesores ? "Cargando colaboradores de Sheets..." : "Selecciona un asesor..."}
                    </option>
                    {asesoresList.map((asesor) => (
                      <option key={asesor} value={asesor}>
                        {asesor}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Fuente del prospecto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Fuente del prospecto
                </label>
                <div className="relative">
                  <select
                    name="fuenteProspecto"
                    value={formData.fuenteProspecto}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="">Selecciona fuente...</option>
                    {FUENTES_PROSPECTO.map((fuente) => (
                      <option key={fuente} value={fuente}>
                        {fuente}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* ¿Quién asignó el lead? */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  ¿Quién asignó el lead?
                </label>
                <div className="relative">
                  <select
                    name="quienAsignoLead"
                    value={formData.quienAsignoLead}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="">Seleccionar asignador...</option>
                    {ASIGNADORES_LEAD.map((asignador) => (
                      <option key={asignador} value={asignador}>
                        {asignador}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Embajador */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Embajador
                </label>
                <input
                  type="text"
                  name="embajador"
                  value={formData.embajador}
                  onChange={handleInputChange}
                  placeholder="N/A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Tarifa CFE */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Tarifa CFE
                </label>
                <input
                  type="text"
                  name="tarifaCFE"
                  value={formData.tarifaCFE}
                  onChange={handleInputChange}
                  placeholder="Ej. DAC, 01, GDMTO, GDMTH..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Checkbox: Apoyo Areli a Sebastián */}
              <div className="flex items-center pt-6">
                <label className="relative flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="apoyoAreli"
                    checked={formData.apoyoAreli}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded-lg border-slate-300 text-orange-600 focus:ring-orange-500 transition cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Apoyo Areli a Sebastián
                  </span>
                </label>
              </div>

              {/* Motivo de compra (Multiselect Pills) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Motivo de compra (Selecciona múltiples)
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOTIVOS_COMPRA.map((motivo) => {
                    const isSelected = formData.motivoCompra.includes(motivo);
                    return (
                      <button
                        type="button"
                        key={motivo}
                        onClick={() => toggleMotivoCompra(motivo)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {motivo}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: EQUIPAMIENTO Y ESPECIFICACIONES TÉCNICAS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <SunMedium className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">4. Equipamiento y Datos Técnicos</h2>
                <p className="text-xs text-slate-500">Paneles, inversores, baterías y estatus de instalación</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Paneles */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Numero de paneles
                </label>
                <input
                  type="number"
                  name="numeroPaneles"
                  value={formData.numeroPaneles}
                  onChange={handleInputChange}
                  placeholder="Ej. 12"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Marca Paneles
                </label>
                <input
                  type="text"
                  name="marcaPaneles"
                  value={formData.marcaPaneles}
                  onChange={handleInputChange}
                  placeholder="Ej. Longi, Canadian..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Potencia Paneles (W)
                </label>
                <input
                  type="text"
                  name="potenciaPaneles"
                  value={formData.potenciaPaneles}
                  onChange={handleInputChange}
                  placeholder="Ej. 550W"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Inversores */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Numero de Inversores
                </label>
                <input
                  type="text"
                  name="numeroInversores"
                  value={formData.numeroInversores}
                  onChange={handleInputChange}
                  placeholder="Ej. 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Marca de Inversores
                </label>
                <input
                  type="text"
                  name="marcaInversores"
                  value={formData.marcaInversores}
                  onChange={handleInputChange}
                  placeholder="Ej. Hoymiles, Fronius..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Modelo de monitoreo
                </label>
                <input
                  type="text"
                  name="modeloMonitoreo"
                  value={formData.modeloMonitoreo}
                  onChange={handleInputChange}
                  placeholder="Ej. DTU Pro, ShineWiFi..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Baterías */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Marca de Baterías
                </label>
                <input
                  type="text"
                  name="marcaBaterias"
                  value={formData.marcaBaterias}
                  onChange={handleInputChange}
                  placeholder="Ej. Enphase, Huawei, N/A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nro de baterías
                </label>
                <input
                  type="text"
                  name="nroBaterias"
                  value={formData.nroBaterias}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Capacidad / Modelo Baterías
                </label>
                <input
                  type="text"
                  name="capacidadBaterias"
                  value={formData.capacidadBaterias}
                  onChange={handleInputChange}
                  placeholder="Ej. 5 kWh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Logística y Operación */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Siguientes pagos
                </label>
                <input
                  type="text"
                  name="siguientesPagos"
                  value={formData.siguientesPagos}
                  onChange={handleInputChange}
                  placeholder="Esquema pactado"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Visita Técnica
                </label>
                <input
                  type="text"
                  name="visitaTecnica"
                  value={formData.visitaTecnica}
                  onChange={handleInputChange}
                  placeholder="Estatus o fecha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Fecha de instalación
                </label>
                <input
                  type="text"
                  name="fechaInstalacion"
                  value={formData.fechaInstalacion}
                  onChange={handleInputChange}
                  placeholder="Estimada o pactada"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Status CFE
                </label>
                <input
                  type="text"
                  name="statusCFE"
                  value={formData.statusCFE}
                  onChange={handleInputChange}
                  placeholder="Ej. Ingresado / En trámite"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Venta de Otro Servicio o Producto
                </label>
                <input
                  type="text"
                  name="ventaOtroServicio"
                  value={formData.ventaOtroServicio}
                  onChange={handleInputChange}
                  placeholder="Ej. Mantenimiento anual, subestación, trámite especial..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: ARCHIVOS Y DOCUMENTACIÓN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">5. Documentos y Comprobantes</h2>
                <p className="text-xs text-slate-500">Adjunta los archivos de soporte requeridos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Pago Anticipo (Requerido) */}
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center hover:border-orange-400 transition bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                  Pago Anticipo <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-3">(.jpg, .png, .jpeg, .pdf)</p>

                {pagoAnticipoFile ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="truncate max-w-[150px] font-medium text-slate-700">
                      {pagoAnticipoFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPagoAnticipoFile(null)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir archivo</span>
                    <input
                      type="file"
                      accept=".jpg,.png,.jpeg,.pdf"
                      onChange={(e) => setPagoAnticipoFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Contrato */}
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center hover:border-blue-400 transition bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                  Contrato
                </label>
                <p className="text-[11px] text-slate-500 mb-3">(.jpg, .png, .pdf, .doc)</p>

                {contratoFile ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="truncate max-w-[150px] font-medium text-slate-700">
                      {contratoFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setContratoFile(null)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir archivo</span>
                    <input
                      type="file"
                      accept=".jpg,.png,.jpeg,.pdf,.doc,.docx"
                      onChange={(e) => setContratoFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Constancia Situacion Fiscal */}
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center hover:border-purple-400 transition bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                  Constancia Sit. Fiscal
                </label>
                <p className="text-[11px] text-slate-500 mb-3">(.jpg, .png, .jpeg, .pdf)</p>

                {csfFile ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="truncate max-w-[150px] font-medium text-slate-700">
                      {csfFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCsfFile(null)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir archivo</span>
                    <input
                      type="file"
                      accept=".jpg,.png,.jpeg,.pdf"
                      onChange={(e) => setCsfFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* BARRA DE ACCIONES INFERIOR */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-red-500 font-bold">*</span>
              <span>Campos obligatorios marcados</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Limpiar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99] rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Guardando y enviando...</span>
                  </>
                ) : (
                  <>
                    <span>Cargar Negocio Cerrado</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        )}
      </main>
    </div>
  );
}
