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
    <div className="flex flex-wrap items-center gap-4 mb-8 bg-white/10 backdrop-blur-sm p-4 rounded-lg border-2 border-white">
      <div className="flex flex-wrap gap-2 flex-1">
        <button
          onClick={() => actualizarFiltro("tipo", "")}
          className={`text-sm px-4 py-2 rounded-lg border-2 font-semibold transition ${
            tipoActivo === ""
              ? "bg-white text-black border-white shadow-md"
              : "border-white text-white hover:bg-white hover:text-black"
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
                ? "bg-white text-black border-white shadow-md"
                : "border-white text-white hover:bg-white hover:text-black"
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
        className="text-sm border-2 border-white rounded-lg px-4 py-2 w-48 focus:outline-none focus:shadow-md transition font-medium bg-white/10 text-white placeholder-white/60"
      />

      {(tipoActivo || marcaActiva) && (
        <button
          onClick={limpiarFiltros}
          className="text-sm font-semibold text-red-400 hover:text-red-300 hover:underline transition"
        >
          ✕ Limpiar
        </button>
      )}
    </div>
  );
}