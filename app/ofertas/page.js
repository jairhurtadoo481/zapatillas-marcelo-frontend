import { obtenerProductos } from "../../lib/api";
import ProductoCard from "../../components/ProductoCard";

export default async function OfertasPage() {
  let productos = [];
  let error = null;

  try {
    const data = await obtenerProductos({ enOferta: "true", limit: 24 });
    productos = data.productos;
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Ofertas</h1>
      <p className="text-gray-500 mb-6">Promociones por tiempo limitado</p>

      {error && <p className="text-red-600">{error}</p>}

      {!error && productos.length === 0 && (
        <p className="text-gray-500">No hay ofertas activas en este momento.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {productos.map((producto) => (
          <ProductoCard key={producto._id} producto={producto} />
        ))}
      </div>
    </div>
  );
}