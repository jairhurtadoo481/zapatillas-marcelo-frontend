import { obtenerProductos } from "../lib/api";
import ProductoCard from "../components/ProductoCard";
import HeroInicio from "../components/HeroInicio";
import MarcasDestacadas from "../components/MarcasDestacadas";

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
      <HeroInicio />
      <MarcasDestacadas />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl mb-6">Destacados</h2>

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