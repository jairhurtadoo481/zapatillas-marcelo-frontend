"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const TIPOS = ["running", "urbano", "casual", "deportivo", "botines"];

export default function FiltroBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tipoActivo = searchParams.get("tipo") || "";
  const marcaActiva = searchParams.get("marca") || "";

  const actualizarFiltro = (clave, valor) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const limpiarFiltros = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8 bg-gray-50 p-4 rounded-lg border-2 border-black">
      <div className="flex flex-wrap gap-2 flex-1">
        <button
          onClick={() => actualizarFiltro("tipo", "")}
          className={`text-sm px-4 py-2 rounded-lg border-2 font-semibold transition ${
            tipoActivo === ""
              ? "bg-black text-white border-black shadow-md"
              : "border-black text-black hover:bg-black hover:text-white"
          }`}
        >
          Todos
        </button>
        {TIPOS.map((tipo) => (
          <button
            key={tipo}
            onClick={() => actualizarFiltro("tipo", tipo)}
            className={`text-sm px-4 py-2 rounded-lg border-2 font-semibold capitalize transition ${
              tipoActivo === tipo
                ? "bg-black text-white border-black shadow-md"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Filtrar por marca"
        defaultValue={marcaActiva}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            actualizarFiltro("marca", e.target.value);
          }
        }}
        className="text-sm border-2 border-black rounded-lg px-4 py-2 w-48 focus:outline-none focus:shadow-md transition font-medium"
      />

      {(tipoActivo || marcaActiva) && (
        <button
          onClick={limpiarFiltros}
          className="text-sm font-semibold text-red-600 hover:text-red-800 hover:underline transition"
        >
          ✕ Limpiar
        </button>
      )}
    </div>
  );
}