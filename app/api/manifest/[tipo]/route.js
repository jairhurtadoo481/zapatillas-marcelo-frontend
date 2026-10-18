import { manifiestos } from "../../../../lib/pwa";

// Manifiestos de las apps del equipo: /api/manifest/admin y /api/manifest/trabajador
export async function GET(request, { params }) {
  const { tipo } = await params;
  const manifiesto = tipo === "admin" || tipo === "trabajador" ? manifiestos[tipo] : null;

  if (!manifiesto) {
    return Response.json({ mensaje: "No encontrado" }, { status: 404 });
  }

  return new Response(JSON.stringify(manifiesto), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
