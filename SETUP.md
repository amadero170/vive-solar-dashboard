# Configuración del Dashboard de Ventas

## Variables de Entorno Requeridas

Para que el dashboard funcione correctamente, necesitas configurar las siguientes variables de entorno en un archivo `.env.local`:

```bash
# Google Sheets API Configuration
GOOGLE_SHEETS_PROJECT_ID=tu-project-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu clave privada aquí\n-----END PRIVATE KEY-----"
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@tu-project.iam.gserviceaccount.com
SHEET_ID=id-de-tu-google-sheet
```

## Configuración de Google Sheets

1. **Crear un proyecto en Google Cloud Console**
2. **Habilitar Google Sheets API**
3. **Crear una cuenta de servicio**
4. **Descargar la clave privada JSON**
5. **Compartir tu Google Sheet con la cuenta de servicio**

## Estructura de la Hoja

El dashboard espera que tu hoja "Reporte Ventas 2025" tenga la siguiente estructura:

| A (Fecha)  | B (Vendedor) | C (Cliente) | D (Producto) | E (Cantidad) | F (Precio Unitario) | G (Estado) | H (Monto Negocio) | I (Comisión) |
| ---------- | ------------ | ----------- | ------------ | ------------ | ------------------- | ---------- | ----------------- | ------------ |
| 01/01/2025 | Juan Pérez   | Cliente A   | Producto 1   | 5            | 100                 | Activo     | 500               | 50           |

## Características del Dashboard

- **Resumen General**: Total de vendedores, ventas y monto total
- **Tabla de Rendimiento**: Detalle por vendedor con métricas clave
- **Gráfico de Comparación**: Visualización del porcentaje de contribución por vendedor
- **Diseño Responsivo**: Funciona en dispositivos móviles y desktop
- **Formato de Moneda**: Moneda mexicana (MXN) con formato apropiado

## Instalación

1. Instalar dependencias: `npm install`
2. Configurar variables de entorno
3. Ejecutar en desarrollo: `npm run dev`
4. Abrir http://localhost:3000
