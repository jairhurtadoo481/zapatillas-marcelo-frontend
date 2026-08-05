import { obtenerProductos } from "../lib/api";
import ProductoCard from "./ProductoCard";
import FiltroBar from "./FiltroBar";

export default async function GridCategoria({ categoria, titulo, searchParams }) {
  const params = { categoria, limit: 24 };
  if (searchParams?.tipo) params.tipo = searchParams.tipo;
  if (searchParams?.marca) params.marca = searchParams.marca;

  let productos = [];
  let error = null;

  try {
    const data = await obtenerProductos(params);
    productos = data.productos;
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">{titulo}</h1>

      <FiltroBar />

      {error && <p className="text-red-600">{error}</p>}

      {!error && productos.length === 0 && (
        <p className="text-gray-500">No hay productos con estos filtros.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {productos.map((producto) => (
          <ProductoCard key={producto._id} producto={producto} />
        ))}
      </div>
    </div>
  );
}