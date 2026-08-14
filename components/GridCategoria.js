import { obtenerProductos } from "../lib/api";
import ProductoCard from "./ProductoCard";
import FiltroBar from "./FiltroBar";

export default async function GridCategoria({ categoria, titulo, searchParams, video }) {
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
    <div className="relative">
      {video && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 w-full h-full object-cover -z-10"
        >
          <source src={video} type="video/mp4" />
        </video>
      )}
      {video && <div className="fixed inset-0 bg-black/30 -z-10" />}

      <div className={`${video ? "text-white" : ""} py-24 md:py-32 text-center`}>
        <h1 className="font-display text-5xl md:text-6xl tracking-wide">{titulo}</h1>
      </div>

      <div
        className={`max-w-6xl mx-auto px-4 pb-20 ${
          video ? "" : ""
        }`}
      >
        <div className={video ? "bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20" : ""}>
          <FiltroBar />

          {error && <p className="text-red-400">{error}</p>}

          {!error && productos.length === 0 && (
            <p className="text-gray-400">Aun no hay productos en esta categoria.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {productos.map((producto) => (
              <ProductoCard key={producto._id} producto={producto} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}