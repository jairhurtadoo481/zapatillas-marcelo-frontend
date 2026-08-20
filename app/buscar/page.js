import Link from "next/link";
import { obtenerProductos } from "../../lib/api";
import ProductoCard from "../../components/ProductoCard";

const categorias = [
  { valor: "", etiqueta: "Todos" },
  { valor: "hombre", etiqueta: "Hombre" },
  { valor: "mujer", etiqueta: "Mujer" },
  { valor: "ninios", etiqueta: "Ninios" },
];

export default async function BuscarPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || "";
  const categoria = params?.categoria || "";

  let productos = [];
  let error = null;

  if (q) {
    try {
      const apiParams = { q, limit: 100 };
      if (categoria) apiParams.categoria = categoria;
      const data = await obtenerProductos(apiParams);
      productos = data.productos;
    } catch (e) {
      error = e.message;
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          {q ? `Resultados para "${q}"` : "Buscar productos"}
        </h1>

        {q && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {categorias.map((c) => (
              <Link
                key={c.valor}
                href={`/buscar?q=${encodeURIComponent(q)}${c.valor ? `&categoria=${c.valor}` : ""}`}
                className={`text-sm px-4 py-2 rounded-full border transition ${
                  categoria === c.valor
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-600 hover:border-black bg-white"
                }`}
              >
                {c.etiqueta}
              </Link>
            ))}
          </div>
        )}

        {error && <p className="text-red-600">{error}</p>}

        {!error && q && productos.length === 0 && (
          <p className="text-gray-500">No se encontraron productos para "{q}".</p>
        )}

        {!q && <p className="text-gray-500">Escribe algo en el buscador de arriba.</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
          {productos.map((producto) => (
            <ProductoCard key={producto._id} producto={producto} />
          ))}
        </div>
      </div>
    </div>
  );
}