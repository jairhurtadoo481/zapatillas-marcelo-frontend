"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtegerAdmin from "../../../../components/ProtegerAdmin";
import { obtenerProductos } from "../../../../lib/api";

export default function AdminPreciosMarcaPage() {
  const { marca } = useParams();
  const marcaDecodificada = decodeURIComponent(marca);

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerProductos({ marca: marcaDecodificada, limit: 1000 });
        setProductos(data.productos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [marcaDecodificada]);

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{marcaDecodificada}</h1>
            <Link href="/admin/precios" className="text-sm text-gray-600 hover:underline">
              Volver a marcas
            </Link>
          </div>

          {cargando && <p className="text-gray-500">Cargando...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!cargando && productos.length === 0 && (
            <p className="text-gray-500">No hay productos de esta marca todavia.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {productos.map((producto, index) => (
              <Link
                key={producto._id}
                href={`/admin/precios/${encodeURIComponent(marcaDecodificada)}/${Math.floor(index / 5) * 5}`}
                className="group block h-full"
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:scale-105 border-2 border-white">
                  <div className="aspect-square bg-gray-100 overflow-hidden relative flex-shrink-0">
                    {producto.imagenes && producto.imagenes.length > 0 ? (
                      <img
                        src={producto.imagenes[0]}
                        alt={producto.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{producto.marca}</p>
                      <h3 className="font-semibold text-sm text-gray-800 mt-2 line-clamp-2">{producto.nombre}</h3>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">S/ {producto.precio}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}