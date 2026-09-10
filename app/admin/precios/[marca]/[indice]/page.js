"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtegerAdmin from "../../../../../components/ProtegerAdmin";
import { obtenerProductos, actualizarProducto } from "../../../../../lib/api";
import { obtenerToken } from "../../../../../lib/auth";

const TAMANIO_GRUPO = 5;

export default function AdminPreciosProductoPage() {
  const router = useRouter();
  const { marca, indice } = useParams();
  const marcaDecodificada = decodeURIComponent(marca);
  const inicioGrupo = Number(indice);

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [valores, setValores] = useState({});
  const [guardando, setGuardando] = useState({});
  const [guardadoExitoso, setGuardadoExitoso] = useState({});
  const [errores, setErrores] = useState({});

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

  const grupoActual = productos.slice(inicioGrupo, inicioGrupo + TAMANIO_GRUPO);

  useEffect(() => {
    if (grupoActual.length > 0) {
      const nuevosValores = {};
      grupoActual.forEach((p) => {
        nuevosValores[p._id] = {
          precioWeb: p.precio ?? "",
          precioPresencial: p.precioPresencial ?? "",
          precioMayorista: p.precioMayorista ?? "",
        };
      });
      setValores(nuevosValores);
      setGuardadoExitoso({});
      setErrores({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicioGrupo, productos.length]);

  const cambiarValor = (id, campo, valor) => {
    setValores((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));
  };

  const irAnterior = () => {
    if (inicioGrupo > 0) {
      router.push(`/admin/precios/${encodeURIComponent(marcaDecodificada)}/${Math.max(0, inicioGrupo - TAMANIO_GRUPO)}`);
    }
  };

  const irSiguiente = () => {
    if (inicioGrupo + TAMANIO_GRUPO < productos.length) {
      router.push(`/admin/precios/${encodeURIComponent(marcaDecodificada)}/${inicioGrupo + TAMANIO_GRUPO}`);
    }
  };

  const guardar = async (producto) => {
    const v = valores[producto._id];
    if (!v || v.precioWeb === "" || Number(v.precioWeb) <= 0) {
      setErrores((prev) => ({ ...prev, [producto._id]: "Ingresa un precio web valido" }));
      return;
    }
    setGuardando((prev) => ({ ...prev, [producto._id]: true }));
    setErrores((prev) => ({ ...prev, [producto._id]: "" }));
    try {
      const token = obtenerToken();
      const payload = {
        precio: Number(v.precioWeb),
        precioPresencial: v.precioPresencial === "" ? null : Number(v.precioPresencial),
        precioMayorista: v.precioMayorista === "" ? null : Number(v.precioMayorista),
      };
      await actualizarProducto(token, producto._id, payload);
      setProductos((prev) =>
        prev.map((p) => (p._id === producto._id ? { ...p, ...payload } : p))
      );
      setGuardadoExitoso((prev) => ({ ...prev, [producto._id]: true }));
      setTimeout(() => {
        setGuardadoExitoso((prev) => ({ ...prev, [producto._id]: false }));
      }, 2000);
    } catch (err) {
      setErrores((prev) => ({ ...prev, [producto._id]: err.message }));
    } finally {
      setGuardando((prev) => ({ ...prev, [producto._id]: false }));
    }
  };

  if (cargando) {
    return (
      <ProtegerAdmin>
        <div className="bg-white min-h-screen">
          <p className="text-center py-16 text-gray-500">Cargando...</p>
        </div>
      </ProtegerAdmin>
    );
  }

  if (grupoActual.length === 0) {
    return (
      <ProtegerAdmin>
        <div className="bg-white min-h-screen">
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <p className="text-gray-500 mb-4">No hay productos aqui.</p>
            <Link href={`/admin/precios/${encodeURIComponent(marcaDecodificada)}`} className="text-blue-600 hover:underline text-sm">
              Volver a {marcaDecodificada}
            </Link>
          </div>
        </div>
      </ProtegerAdmin>
    );
  }

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <Link href={`/admin/precios/${encodeURIComponent(marcaDecodificada)}`} className="text-sm text-gray-600 hover:underline">
              Volver a {marcaDecodificada}
            </Link>
            <p className="text-xs text-gray-400">
              Mostrando {inicioGrupo + 1}-{Math.min(inicioGrupo + TAMANIO_GRUPO, productos.length)} de {productos.length}
            </p>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="flex flex-col gap-6 mb-6">
            {grupoActual.map((producto) => {
              const v = valores[producto._id] || { precioWeb: "", precioPresencial: "", precioMayorista: "" };
              const exito = guardadoExitoso[producto._id];
              const cargandoGuardado = guardando[producto._id];
              const errorProducto = errores[producto._id];

              return (
                <div key={producto._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="flex gap-4 p-4">
                    <div className="w-40 h-40 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {producto.imagenes && producto.imagenes.length > 0 ? (
                        <img
                          src={producto.imagenes[0]}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{producto.marca}</p>
                      <h2 className="font-semibold text-gray-900">{producto.nombre}</h2>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-900 block mb-1">Precio web</label>
                        <input
                          type="number"
                          value={v.precioWeb}
                          onChange={(e) => cambiarValor(producto._id, "precioWeb", e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-900 block mb-1">Presencial (opcional)</label>
                        <input
                          type="number"
                          value={v.precioPresencial}
                          onChange={(e) => cambiarValor(producto._id, "precioPresencial", e.target.value)}
                          placeholder="Igual al web"
                          className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-900 block mb-1">Mayorista (opcional)</label>
                        <input
                          type="number"
                          value={v.precioMayorista}
                          onChange={(e) => cambiarValor(producto._id, "precioMayorista", e.target.value)}
                          placeholder="Por mayor"
                          className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 text-sm"
                        />
                      </div>
                    </div>

                    {errorProducto && <p className="text-red-600 text-xs mb-2">{errorProducto}</p>}

                    <button
                      onClick={() => guardar(producto)}
                      disabled={cargandoGuardado}
                      className={`w-full text-white rounded py-2 text-sm font-semibold transition disabled:opacity-50 ${
                        exito ? "bg-green-600 hover:bg-green-700" : "bg-black hover:bg-gray-800"
                      }`}
                    >
                      {cargandoGuardado ? "Guardando..." : exito ? "\u2713 Guardado" : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={irAnterior}
              disabled={inicioGrupo === 0}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {"\u2190"} Anterior
            </button>
            <button
              onClick={irSiguiente}
              disabled={inicioGrupo + TAMANIO_GRUPO >= productos.length}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Siguiente {"\u2192"}
            </button>
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}