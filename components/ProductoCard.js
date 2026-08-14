import Link from "next/link";

export default function ProductoCard({ producto }) {
  const imagen = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes[0]
    : null;

  const tieneOferta = producto.precioOferta !== null && producto.precioOferta !== undefined;

  return (
    <Link
      href={`/producto/${producto._id}`}
      className="group block"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        {imagen ? (
          <img
            src={imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">Sin imagen</span>
          </div>
        )}
        {tieneOferta && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 uppercase tracking-wide">
            Oferta
          </span>
        )}
      </div>
      <div className="pt-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{producto.marca}</p>
        <h3 className="font-semibold text-sm truncate mt-0.5">{producto.nombre}</h3>
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