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
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-red-500">Producto no encontrado.</p>
        </div>
      </div>
    );
  }

  const tieneOferta = producto.ofertaActiva === true;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12 border-t-2 border-gray-200 pt-8">
        <GaleriaProducto imagenes={producto.imagenes} nombre={producto.nombre} />

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{producto.marca}</p>
          <h1 className="text-4xl font-bold mt-2 text-gray-900">{producto.nombre}</h1>
          {producto.codigo && (
            <p className="text-xs text-gray-400 mt-1">Codigo: {producto.codigo}</p>
          )}

          <div className="mt-6 flex items-center gap-4 pb-6 border-b-2 border-gray-200">
            {tieneOferta ? (
              <>
                <span className="text-3xl font-bold text-red-600">S/ {producto.precioOferta}</span>
                <span className="text-lg text-gray-400 line-through">S/ {producto.precio}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">S/ {producto.precio}</span>
            )}
          </div>

          {tieneOferta && producto.ofertaFin && (
            <div className="my-4">
              <ContadorOferta ofertaFin={producto.ofertaFin} />
            </div>
          )}

          {producto.descripcion && (
            <p className="text-gray-600 mt-6 leading-relaxed text-sm">{producto.descripcion}</p>
          )}

          {producto.colores && producto.colores.length > 0 && (
            <div className="mt-8">
              <p className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-900">Colores</p>
              <div className="flex gap-2 flex-wrap">
                {producto.colores.map((color) => (
                  <span
                    key={color}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 hover:bg-black hover:text-white hover:border-black transition"
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
                <p className="font-bold text-sm uppercase tracking-wide text-gray-900">Tallas disponibles</p>
                {producto.categoria === "hombre" && <GuiaTallas />}
              </div>
              <div className="flex flex-wrap gap-2">
                {producto.tallas.map((t) => (
                  <span
                    key={t.talla}
                    className={`border-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      t.stock > 0
                        ? "border-gray-300 text-gray-900 hover:bg-black hover:text-white hover:border-black"
                        : "border-gray-200 text-gray-400 line-through cursor-not-allowed"
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
    </div>
  );
}