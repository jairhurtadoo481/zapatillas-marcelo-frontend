import { obtenerProductos } from "../lib/api";
import ProductoCard from "../components/ProductoCard";

export default async function Home() {
  let destacados = [];
  let error = null;

  try {
    const data = await obtenerProductos({ destacado: "true", limit: 8 });
    destacados = data.productos;
  } catch (e) {
    error = e.message;
  }

  return (
    <div>
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Zapatillas Marcelo</h1>
          <p className="text-gray-300 mt-3">Encuentra tu proximo par ideal</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Destacados</h2>

        {error && <p className="text-red-600">{error}</p>}

        {!error && destacados.length === 0 && (
          <p className="text-gray-500">Aun no hay productos destacados.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {destacados.map((producto) => (
            <ProductoCard key={producto._id} producto={producto} />
          ))}
        </div>
      </section>
    </div>
  );
}
