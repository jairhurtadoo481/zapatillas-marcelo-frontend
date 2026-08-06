"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerProductos, eliminarProducto } from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const nombreSucursal = {
  sucursal1: "Sucursal 1",
  sucursal2: "Sucursal 2",
};

export default function AdminProductosPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const data = await obtenerProductos({ limit: 100 });
      setProductos(data.productos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const manejarEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`Eliminar "${nombre}"? Esta accion no se puede deshacer.`);
    if (!confirmar) return;

    try {
      const token = obtenerToken();
      await eliminarProducto(token, id);
      setProductos(productos.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ProtegerAdmin>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestion de productos</h1>
          <Link
            href="/admin/productos/nuevo"
            className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            + Nuevo producto
          </Link>
        </div>

        {cargando && <p className="text-gray-500">Cargando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!cargando && productos.length === 0 && (
          <p className="text-gray-500">No hay productos todavia.</p>
        )}

        <div className="flex flex-col gap-3">
          {productos.map((producto) => (
            <div
              key={producto._id}
              className="border border-gray-200 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {producto.imagenes && producto.imagenes.length > 0 ? (
                  <img
                    src={producto.imagenes[0]}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {producto.codigo && (
                    <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-bold">
                      #{producto.codigo}
                    </span>
                  )}
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                    {nombreSucursal[producto.sucursal] || "Sucursal 1"}
                  </span>
                  <p className="text-xs text-gray-500 uppercase">{producto.marca}</p>
                </div>
                <p className="font-semibold">{producto.nombre}</p>
                <p className="text-sm text-gray-500">
                  {producto.categoria} / {producto.tipo} - S/ {producto.precio}
                </p>
              </div>

              <div className="flex gap-3 text-sm">
                <Link
                  href={`/admin/productos/${producto._id}`}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </Link>
                <button
                  onClick={() => manejarEliminar(producto._id, producto.nombre)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtegerAdmin>
  );
}