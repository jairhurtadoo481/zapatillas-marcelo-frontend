"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtegerMayorista from "../../../components/ProtegerMayorista";
import { obtenerProductos, obtenerConfiguracion, crearReservaMayorista } from "../../../lib/api";
import { obtenerToken, eliminarToken } from "../../../lib/auth";

export default function CatalogoMayoristaPage() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [minimo, setMinimo] = useState(10);

  const [seleccion, setSeleccion] = useState({});
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorReserva, setErrorReserva] = useState("");
  const [exito, setExito] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dataProductos, config] = await Promise.all([
          obtenerProductos({ limit: 1000 }),
          obtenerConfiguracion(),
        ]);
        const conPrecioMayorista = dataProductos.productos.filter(
          (p) => p.precioMayorista !== null && p.precioMayorista !== undefined
        );
        setProductos(conPrecioMayorista);
        setMinimo(config.minimoMayorista || 10);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const cambiarCantidad = (producto, talla, cantidad) => {
    const clave = `${producto._id}-${talla}`;
    const cant = Number(cantidad);
    setSeleccion((prev) => {
      const nuevo = { ...prev };
      if (!cant || cant <= 0) {
        delete nuevo[clave];
      } else {
        nuevo[clave] = {
          producto,
          talla,
          cantidad: cant,
        };
      }
      return nuevo;
    });
  };

  const items = Object.values(seleccion);
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
  const totalPrecio = items.reduce((acc, i) => acc + i.cantidad * i.producto.precioMayorista, 0);
  const faltante = Math.max(0, minimo - cantidadTotal);

  const confirmarReserva = async () => {
    if (faltante > 0) {
      setErrorReserva(`Te faltan ${faltante} pares para llegar al minimo de ${minimo}.`);
      return;
    }

    const confirmar = window.confirm(
      `Estas por reservar ${cantidadTotal} pares por un total de S/ ${totalPrecio}. Esta accion notificara al vendedor y no debe hacerse "por gusto". Confirmas?`
    );
    if (!confirmar) return;

    setEnviando(true);
    setErrorReserva("");
    try {
      const token = obtenerToken();
      const payload = {
        items: items.map((i) => ({
          producto: i.producto._id,
          talla: i.talla,
          cantidad: i.cantidad,
        })),
        notas,
      };
      const reserva = await crearReservaMayorista(token, payload);
      setExito(reserva.numero);
      setSeleccion({});
      setNotas("");
    } catch (err) {
      setErrorReserva(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const cerrarSesion = () => {
    eliminarToken();
    router.push("/mayorista/login");
  };

  if (exito) {
    return (
      <ProtegerMayorista>
        <div className="bg-white min-h-screen">
          <div className="max-w-lg mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-green-600 mb-3">Reserva enviada!</h1>
            <p className="text-gray-700 mb-2">Tu numero de reserva es #{exito}</p>
            <p className="text-gray-700 mb-6">Nos comunicaremos contigo para coordinar el pago y la entrega.</p>
            <button
              onClick={() => setExito(null)}
              className="bg-black text-white rounded px-6 py-2 font-semibold hover:bg-gray-800 transition"
            >
              Seguir viendo el catalogo
            </button>
          </div>
        </div>
      </ProtegerMayorista>
    );
  }

  return (
    <ProtegerMayorista>
      <div className="bg-white min-h-screen pb-40">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Catalogo mayorista</h1>
            <button onClick={cerrarSesion} className="text-sm text-red-600 hover:underline">
              Cerrar sesion
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Selecciona la cantidad de cada talla que quieres reservar. Necesitas un minimo de{" "}
            <span className="font-semibold text-gray-900">{minimo} pares en total</span> (mezclando modelos) para
            poder reservar.
          </p>

          {cargando && <p className="text-gray-500">Cargando catalogo...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!cargando && productos.length === 0 && (
            <p className="text-gray-500">Aun no hay productos con precio mayorista configurado.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map((producto) => (
              <div key={producto._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-100">
                  {producto.imagenes && producto.imagenes.length > 0 ? (
                    <img
                      src={producto.imagenes[0]}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{producto.marca}</p>
                  <h3 className="font-semibold text-gray-900 mb-1">{producto.nombre}</h3>
                  <p className="text-lg font-bold text-gray-900 mb-3">S/ {producto.precioMayorista} <span className="text-xs font-normal text-gray-400">por par</span></p>

                  <div className="flex flex-col gap-2">
                    {producto.tallas
                      .filter((t) => t.stock > 0)
                      .map((t) => {
                        const clave = `${producto._id}-${t.talla}`;
                        const valorActual = seleccion[clave]?.cantidad || "";
                        return (
                          <div key={t.talla} className="flex items-center justify-between gap-2">
                            <span className="text-sm text-gray-700">
                              Talla {t.talla} <span className="text-xs text-gray-400">(stock: {t.stock})</span>
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={t.stock}
                              value={valorActual}
                              onChange={(e) => cambiarCantidad(producto, t.talla, e.target.value)}
                              placeholder="0"
                              className="border border-gray-300 rounded px-2 py-1 w-16 text-sm text-right bg-white text-gray-900"
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-2xl">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-gray-900">{cantidadTotal}</span> pares seleccionados
                    {faltante > 0 && (
                      <span className="text-red-600"> - faltan {faltante} para el minimo</span>
                    )}
                  </p>
                  <p className="text-lg font-bold text-gray-900">Total: S/ {totalPrecio}</p>
                </div>
                <input
                  type="text"
                  placeholder="Notas (opcional)"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 sm:w-64"
                />
              </div>

              {errorReserva && <p className="text-red-600 text-sm mb-2">{errorReserva}</p>}

              <button
                onClick={confirmarReserva}
                disabled={enviando || faltante > 0}
                className="w-full bg-black text-white rounded py-3 font-semibold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {enviando ? "Enviando..." : "Confirmar reserva"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtegerMayorista>
  );
}