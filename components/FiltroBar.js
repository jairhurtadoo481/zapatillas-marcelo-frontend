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
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => actualizarFiltro("tipo", "")}
          className={`text-sm px-3 py-1 rounded-full border ${
            tipoActivo === ""
              ? "bg-black text-white border-black"
              : "border-gray-300 text-gray-600 hover:border-black"
          }`}
        >
          Todos
        </button>
        {TIPOS.map((tipo) => (
          <button
            key={tipo}
            onClick={() => actualizarFiltro("tipo", tipo)}
            className={`text-sm px-3 py-1 rounded-full border capitalize ${
              tipoActivo === tipo
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-600 hover:border-black"
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
        className="text-sm border border-gray-300 rounded-full px-3 py-1 w-48"
      />

      {(tipoActivo || marcaActiva) && (
        <button
          onClick={limpiarFiltros}
          className="text-sm text-red-600 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}