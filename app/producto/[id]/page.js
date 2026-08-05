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
        <p className="text-red-600">Producto no encontrado.</p>
      </div>
    );
  }

  const tieneOferta = producto.ofertaActiva === true;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <GaleriaProducto imagenes={producto.imagenes} nombre={producto.nombre} />

      <div>
        <p className="text-sm text-gray-500 uppercase">{producto.marca}</p>
        <h1 className="text-3xl font-bold mt-1">{producto.nombre}</h1>

        <div className="mt-4 flex items-center gap-3">
          {tieneOferta ? (
            <>
              <span className="text-2xl font-bold text-red-600">S/ {producto.precioOferta}</span>
              <span className="text-lg text-gray-400 line-through">S/ {producto.precio}</span>
            </>
          ) : (
            <span className="text-2xl font-bold">S/ {producto.precio}</span>
          )}
        </div>

        {tieneOferta && producto.ofertaFin && (
          <ContadorOferta ofertaFin={producto.ofertaFin} />
        )}

        {producto.descripcion && (
          <p className="text-gray-600 mt-4">{producto.descripcion}</p>
        )}

        {producto.colores && producto.colores.length > 0 && (
          <div className="mt-6">
            <p className="font-semibold mb-2">Colores</p>
            <div className="flex gap-2">
              {producto.colores.map((color) => (
                <span
                  key={color}
                  className="border border-gray-300 rounded-full px-3 py-1 text-sm"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}

        {producto.tallas && producto.tallas.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Tallas disponibles</p>
              {producto.categoria === "hombre" && <GuiaTallas />}
            </div>
            <div className="flex flex-wrap gap-2">
              {producto.tallas.map((t) => (
                <span
                  key={t.talla}
                  className={`border rounded px-3 py-1 text-sm ${
                    t.stock > 0
                      ? "border-gray-300"
                      : "border-gray-200 text-gray-300 line-through"
                  }`}
                >
                  {t.talla}
                </span>
              ))}
            </div>
          </div>
        )}

        <SelectorVariantes productoId={producto._id} />

        <AgregarCarrito producto={producto} />

        <BotonWhatsapp producto={producto} />
        <BotonCompartir producto={producto} />
      </div>
    </div>
  );
}