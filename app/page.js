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

      <section className="max-w-7xl mx-auto px-4 py-20 border-t border-black/20 bg-white/50 backdrop-blur-sm">
        <h2 className="font-display text-4xl mb-2 font-bold">Destacados</h2>
        <p className="text-gray-500 text-sm mb-8 uppercase tracking-wide">Productos recomendados</p>

        {error && <p className="text-red-600">{error}</p>}

        {!error && destacados.length === 0 && (
          <p className="text-gray-500">Aun no hay productos destacados.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {destacados.map((producto) => (
            <ProductoCard key={producto._id} producto={producto} />
          ))}
        </div>
      </section>
    </div>
  );
}