import { NextResponse } from "next/server";
import { getColaboradores } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const colaboradores = await getColaboradores();
    return NextResponse.json({
      success: true,
      data: colaboradores,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error en API /api/colaboradores:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Error al obtener colaboradores",
      },
      { status: 500 }
    );
  }
}
