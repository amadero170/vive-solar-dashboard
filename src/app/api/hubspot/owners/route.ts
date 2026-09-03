import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export interface HubSpotOwner {
  id: string;
  name: string;
  email: string;
  archived: boolean;
}

function getHubSpotToken(): string | undefined {
  if (process.env.HUBSPOT_ACCESS_TOKEN) {
    return process.env.HUBSPOT_ACCESS_TOKEN;
  }
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/HUBSPOT_ACCESS_TOKEN=["']?([^"'\n\r]+)["']?/);
      if (match) return match[1];
    }
  } catch (e) {
    console.error("Error leyendo .env.local:", e);
  }
  return undefined;
}

export async function GET() {
  try {
    const token = getHubSpotToken();

    if (!token) {
      console.warn("HUBSPOT_ACCESS_TOKEN no encontrado");
      return NextResponse.json(
        {
          success: false,
          error: "No se ha configurado HUBSPOT_ACCESS_TOKEN en las variables de entorno",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.hubapi.com/crm/v3/owners/?limit=100&archived=false",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HubSpot API error:", response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Error de HubSpot (${response.status}): ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const results = data.results || [];

    const owners: HubSpotOwner[] = results
      .map((o: { id: string; firstName?: string; lastName?: string; email?: string; archived?: boolean }) => ({
        id: o.id,
        name: `${o.firstName || ""} ${o.lastName || ""}`.trim() || o.email || "Sin nombre",
        email: o.email || "Sin email",
        archived: Boolean(o.archived),
      }))
      .sort((a: HubSpotOwner, b: HubSpotOwner) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      data: owners,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error en API /api/hubspot/owners:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Error al consultar los usuarios de HubSpot",
      },
      { status: 500 }
    );
  }
}
