import Link from "next/link";

export default function ProductoCard({ producto }) {
  const imagen = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes[0]
    : null;

  const tieneOferta = producto.precioOferta !== null && producto.precioOferta !== undefined;

  return (
    <Link
      href={`/producto/${producto._id}`}
      className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {imagen ? (
          <img
            src={imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <span className="text-gray-400 text-sm">Sin imagen</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500 uppercase">{producto.marca}</p>
        <h3 className="font-semibold text-sm truncate">{producto.nombre}</h3>
        <div className="mt-1 flex items-center gap-2">
          {tieneOferta ? (
            <>
              <span className="text-red-600 font-bold">S/ {producto.precioOferta}</span>
              <span className="text-gray-400 line-through text-sm">S/ {producto.precio}</span>
            </>
          ) : (
            <span className="font-bold">S/ {producto.precio}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
