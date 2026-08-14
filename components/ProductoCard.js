import Link from "next/link";

export default function ProductoCard({ producto }) {
  const imagen = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes[0]
    : null;

  const tieneOferta = producto.precioOferta !== null && producto.precioOferta !== undefined;

  return (
    <Link
      href={`/producto/${producto._id}`}
      className="group block h-full"
    >
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:scale-105 border-2 border-white">
        <div className="aspect-square bg-gray-100 overflow-hidden relative flex-shrink-0">
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
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1.5 uppercase tracking-wide font-bold rounded-md shadow-lg">
              Oferta
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{producto.marca}</p>
            <h3 className="font-semibold text-sm text-gray-800 mt-2 line-clamp-2 hover:text-blue-600 transition-colors">{producto.nombre}</h3>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {tieneOferta ? (
                <>
                  <span className="text-lg font-bold text-red-600">S/ {producto.precioOferta}</span>
                  <span className="text-gray-400 line-through text-xs">S/ {producto.precio}</span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">S/ {producto.precio}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}