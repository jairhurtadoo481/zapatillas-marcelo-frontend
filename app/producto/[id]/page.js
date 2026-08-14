import { obtenerProductoPorId } from "../../../lib/api";
import GaleriaProducto from "../../../components/GaleriaProducto";
import GuiaTallas from "../../../components/GuiaTallas";
import ContadorOferta from "../../../components/ContadorOferta";
import BotonWhatsapp from "../../../components/BotonWhatsapp";
import BotonCompartir from "../../../components/BotonCompartir";
import AgregarCarrito from "../../../components/AgregarCarrito";
import SelectorVariantes from "../../../components/SelectorVariantes";

export default async function ProductoPage({ params }) {
  const { id } = await params;

  let producto = null;
  let error = null;

  try {
    producto = await obtenerProductoPorId(id);
  } catch (e) {
    error = e.message;
  }

  if (error || !producto) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">Producto no encontrado.</p>
      </div>
    );
  }

  const tieneOferta = producto.ofertaActiva === true;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12 border-t-2 border-white pt-8">
      <GaleriaProducto imagenes={producto.imagenes} nombre={producto.nombre} />

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{producto.marca}</p>
        <h1 className="text-4xl font-bold mt-2 text-white">{producto.nombre}</h1>

        <div className="mt-6 flex items-center gap-4 pb-6 border-b-2 border-white/20">
          {tieneOferta ? (
            <>
              <span className="text-3xl font-bold text-red-400">S/ {producto.precioOferta}</span>
              <span className="text-lg text-gray-500 line-through">S/ {producto.precio}</span>
            </>
          ) : (
            <span className="text-3xl font-bold text-white">S/ {producto.precio}</span>
          )}
        </div>

        {tieneOferta && producto.ofertaFin && (
          <div className="my-4">
            <ContadorOferta ofertaFin={producto.ofertaFin} />
          </div>
        )}

        {producto.descripcion && (
          <p className="text-gray-300 mt-6 leading-relaxed text-sm">{producto.descripcion}</p>
        )}

        {producto.colores && producto.colores.length > 0 && (
          <div className="mt-8">
            <p className="font-bold mb-3 text-sm uppercase tracking-wide text-white">Colores</p>
            <div className="flex gap-2 flex-wrap">
              {producto.colores.map((color) => (
                <span
                  key={color}
                  className="border-2 border-white rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-white hover:text-black transition"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}

        {producto.tallas && producto.tallas.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-sm uppercase tracking-wide text-white">Tallas disponibles</p>
              {producto.categoria === "hombre" && <GuiaTallas />}
            </div>
            <div className="flex flex-wrap gap-2">
              {producto.tallas.map((t) => (
                <span
                  key={t.talla}
                  className={`border-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    t.stock > 0
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-gray-600 text-gray-600 line-through cursor-not-allowed"
                  }`}
                >
                  {t.talla}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <SelectorVariantes productoId={producto._id} />
        </div>

        <div className="mt-6">
          <AgregarCarrito producto={producto} />
        </div>

        <div className="mt-6 flex gap-3">
          <BotonWhatsapp producto={producto} />
          <BotonCompartir producto={producto} />
        </div>
      </div>
    </div>
  );
}