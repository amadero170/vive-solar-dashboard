"use client";

import Image from "next/image";
import Link from "next/link";

export default function FormsPage() {
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
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Formularios de Captura
              </div>
              <Link
                href="/"
                className="flex items-center px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Formularios de Captura
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona el formulario que necesitas completar
          </p>
        </div>

        {/* Form Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Button 1 - Cargar Negocio Cerrado */}
          <a
            href="https://wos-platform.app.n8n.cloud/form/4839a45f-929d-4328-a468-a9f86f73b170"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Cargar Negocio Cerrado
                </h2>
                <p className="text-gray-600 mb-6">
                  Registra un nuevo negocio que ha sido cerrado exitosamente
                </p>
                <div className="inline-flex items-center text-orange-600 font-medium group-hover:text-orange-700">
                  <span>Ir al formulario</span>
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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
          </a>

          {/* Button 2 - Cargar Pago */}
          <a
            href="https://wos-platform.app.n8n.cloud/form/9f4f8ca2-1c5d-46ad-99f2-758d42960d1e"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Cargar Pago
                </h2>
                <p className="text-gray-600 mb-6">
                  Registra un pago recibido de un negocio existente
                </p>
                <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  <span>Ir al formulario</span>
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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
          </a>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Información Importante
              </h3>
              <ul className="text-blue-800 space-y-1">
                <li>• Los formularios se abren en una nueva ventana</li>
                <li>• Asegúrate de completar todos los campos requeridos</li>
                <li>
                  • Los datos se sincronizarán automáticamente con el dashboard
                </li>
                <li>
                  • En caso de problemas técnicos, contacta al administrador
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
