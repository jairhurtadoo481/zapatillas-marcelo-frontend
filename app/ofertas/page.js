import { obtenerProductos, obtenerRecientes } from "../../lib/api";
import ProductoCard from "../../components/ProductoCard";

export const metadata = {
  title: "Ofertas y novedades | La Casa de Marcelo",
  description: "Promociones vigentes y las zapatillas más recientes que llegaron a La Casa de Marcelo.",
};

export default async function OfertasPage() {
  // Se piden por separado: si falla una parte, la otra igual se muestra.
  const [ofertasRes, recientesRes] = await Promise.allSettled([
    obtenerProductos({ enOferta: "true", limit: 24 }),
    obtenerRecientes({ dias: 30, limit: 12, maxPorMarca: 4 }),
  ]);

  const ofertas = ofertasRes.status === "fulfilled" ? ofertasRes.value.productos : [];
  const errorOfertas = ofertasRes.status === "rejected" ? ofertasRes.reason.message : null;
  const recientes = recientesRes.status === "fulfilled" ? recientesRes.value.productos : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <section>
        <h1 className="text-2xl font-bold mb-2 text-white">Ofertas</h1>
        <p className="text-gray-300 mb-6">Promociones por tiempo limitado</p>

        {errorOfertas && <p className="text-red-400">{errorOfertas}</p>}

        {!errorOfertas && ofertas.length === 0 && (
          <p className="text-gray-300">No hay ofertas activas en este momento.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ofertas.map((producto) => (
            <ProductoCard key={producto._id} producto={producto} />
          ))}
        </div>
      </section>

      {recientes.length > 0 && (
        <section id="recien-llegados" className="mt-14 pt-10 border-t border-white/20">
          <h2 className="text-2xl font-bold mb-2 text-white">Recién llegados</h2>
          <p className="text-gray-300 mb-6">Lo último que subimos, con stock disponible</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recientes.map((producto) => (
              <ProductoCard key={producto._id} producto={producto} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
