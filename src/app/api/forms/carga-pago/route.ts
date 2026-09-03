import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const incomingFormData = await request.formData();

    // URL del Webhook de n8n configurada en .env.local
    const webhookUrl =
      process.env.N8N_CARGA_PAGO_WEBHOOK_URL ||
      process.env.N8N_WEBHOOK_URL;

    // Si aún no está configurada la URL, devolvemos un mensaje descriptivo
    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No se ha configurado la variable N8N_CARGA_PAGO_WEBHOOK_URL en .env.local",
          message:
            "Por favor configura la URL del webhook en el archivo .env.local para recibir los envíos.",
        },
        { status: 500 }
      );
    }

    // Creamos el FormData multipart que se enviará al Webhook de n8n
    const n8nFormData = new FormData();

    for (const [key, value] of incomingFormData.entries()) {
      n8nFormData.append(key, value);
    }

    // Enviamos a n8n
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: n8nFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en respuesta de n8n webhook:", response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Error desde n8n (${response.status}): ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Intenta parsear la respuesta de n8n como JSON si existe
    let responseData = null;
    try {
      const text = await response.text();
      responseData = text ? JSON.parse(text) : { received: true };
    } catch {
      responseData = { received: true };
    }

    return NextResponse.json({
      success: true,
      message: "Pago enviado exitosamente a n8n",
      data: responseData,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error procesando envío de pago:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
