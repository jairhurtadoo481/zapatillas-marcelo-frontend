"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProtegerTrabajador from "../../../components/ProtegerTrabajador";
import {
  obtenerVentas,
  buscarProductoPorCodigo,
  registrarVentaPorCodigo,
  abrirTurno,
  cerrarTurno,
  turnoActual,
  obtenerActividadVentas,
} from "../../../lib/api";
import { obtenerToken, obtenerUsuario, eliminarToken } from "../../../lib/auth";

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatearHora = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
};

const reproducirSonidoEquipo = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // si el navegador bloquea audio automatico, lo ignoramos
  }
};

export default function TrabajadorVentasPage() {
  const router = useRouter();
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [turno, setTurno] = useState(null);
  const [cargandoTurno, setCargandoTurno] = useState(true);
  const [procesandoTurno, setProcesandoTurno] = useState(false);

  const [avisoEquipo, setAvisoEquipo] = useState(null);
  const ultimaVentaConocida = useRef(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [tallaElegida, setTallaElegida] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [descuento, setDescuento] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [registrando, setRegistrando] = useState(false);

  const usuario = obtenerUsuario();

  const cargar = async () => {
    setCargando(true);
    try {
      const token = obtenerToken();
      const data = await obtenerVentas(token);
      setVentas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarTurno = async () => {
    setCargandoTurno(true);
    try {
      const token = obtenerToken();
      const data = await turnoActual(token);
      setTurno(data);
    } catch (err) {
      setTurno(null);
    } finally {
      setCargandoTurno(false);
    }
  };

  const revisarActividad = async () => {
    try {
      const token = obtenerToken();
      const data = await obtenerActividadVentas(token);

      if (ultimaVentaConocida.current !== null && data.ultimaVentaId !== ultimaVentaConocida.current) {
        reproducirSonidoEquipo();
        setAvisoEquipo("Alguien del equipo acaba de registrar una venta!");
        setTimeout(() => setAvisoEquipo(null), 5000);
      }

      ultimaVentaConocida.current = data.ultimaVentaId;
    } catch (err) {
      // si falla, no interrumpimos el resto de la pagina
    }
  };

  useEffect(() => {
    cargar();
    cargarTurno();
    revisarActividad();
    const intervaloActividad = setInterval(revisarActividad, 15000);
    return () => clearInterval(intervaloActividad);
  }, []);

  const manejarAbrirTurno = async () => {
    setProcesandoTurno(true);
    try {
      const token = obtenerToken();
      const data = await abrirTurno(token);
      setTurno(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcesandoTurno(false);
    }
  };

  const manejarCerrarTurno = async () => {
    const confirmar = window.confirm("Cerrar tu turno del dia? Se calculara el total de ventas de este turno.");
    if (!confirmar) return;

    setProcesandoTurno(true);
    try {
      const token = obtenerToken();
      const data = await cerrarTurno(token);
      alert(`Turno cerrado. Ventas: ${data.cantidadVentas}, Total: S/ ${data.totalVentas}`);
      setTurno(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcesandoTurno(false);
    }
  };

  const buscarPorCodigo = async () => {
    if (!codigo.trim()) return;
    setErrorModal("");
    setBuscando(true);
    setProductoEncontrado(null);

    try {
      const token = obtenerToken();
      const producto = await buscarProductoPorCodigo(token, codigo.trim());
      setProductoEncontrado(producto);
      setTallaElegida("");
      setCantidad(1);
      setDescuento("");
    } catch (err) {
      setErrorModal(err.message);
    } finally {
      setBuscando(false);
    }
  };

  const confirmarVenta = async () => {
    if (!tallaElegida) {
      setErrorModal("Selecciona una talla");
      return;
    }

    setRegistrando(true);
    setErrorModal("");

    try {
      const token = obtenerToken();
      await registrarVentaPorCodigo(
        token,
        codigo.trim(),
        tallaElegida,
        Number(cantidad),
        Number(descuento) || 0
      );
      cerrarModal();
      cargar();
      revisarActividad();
    } catch (err) {
      setErrorModal(err.message);
    } finally {
      setRegistrando(false);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCodigo("");
    setProductoEncontrado(null);
    setTallaElegida("");
    setCantidad(1);
    setDescuento("");
    setErrorModal("");
  };

  const cerrarSesion = () => {
    eliminarToken();
    router.push("/trabajador/login");
  };

  const totalGeneral = ventas.reduce(
    (acc, v) => acc + (v.precioUnitario * v.cantidad - (v.descuento || 0)),
    0
  );

  const totalConDescuento = productoEncontrado
    ? productoEncontrado.precio * cantidad - (Number(descuento) || 0)
    : 0;

  return (
    <ProtegerTrabajador>
      {avisoEquipo && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white px-5 py-3 rounded-lg shadow-lg font-semibold animate-bounce">
          {avisoEquipo}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Mis ventas</h1>
            {usuario && <p className="text-sm text-gray-500">{usuario.nombre}</p>}
          </div>
          <button onClick={cerrarSesion} className="text-sm text-red-600 hover:underline">
            Cerrar sesion
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between bg-white text-gray-900">
          {cargandoTurno ? (
            <p className="text-sm text-gray-500">Verificando turno...</p>
          ) : turno ? (
            <>
              <div>
                <p className="text-sm font-semibold text-green-600">Turno abierto</p>
                <p className="text-xs text-gray-500">
                  Desde {formatearHora(turno.fechaApertura)}
                </p>
              </div>
              <button
                onClick={manejarCerrarTurno}
                disabled={procesandoTurno}
                className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
              >
                {procesandoTurno ? "Cerrando..." : "Cerrar turno"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">No tienes un turno abierto</p>
              <button
                onClick={manejarAbrirTurno}
                disabled={procesandoTurno}
                className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {procesandoTurno ? "Abriendo..." : "Abrir turno del dia"}
              </button>
            </>
          )}
        </div>

        {turno && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setModalAbierto(true)}
              className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              + Agregar venta
            </button>
          </div>
        )}

        {cargando && <p className="text-gray-500">Cargando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!cargando && ventas.length === 0 && (
          <p className="text-gray-500">Aun no has registrado ninguna venta.</p>
        )}

        {ventas.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Hora</th>
                    <th className="p-2">Codigo</th>
                    <th className="p-2">Producto</th>
                    <th className="p-2">Talla</th>
                    <th className="p-2">Cant.</th>
                    <th className="p-2">Precio</th>
                    <th className="p-2">Descuento</th>
                    <th className="p-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v._id} className="border-t border-gray-100">
                      <td className="p-2">{formatearFecha(v.createdAt)}</td>
                      <td className="p-2">{formatearHora(v.createdAt)}</td>
                      <td className="p-2">{v.codigo ? `#${v.codigo}` : "-"}</td>
                      <td className="p-2">{v.nombre}</td>
                      <td className="p-2">{v.talla}</td>
                      <td className="p-2">{v.cantidad}</td>
                      <td className="p-2">S/ {v.precioUnitario}</td>
                      <td className="p-2">
                        {v.descuento > 0 ? <span className="text-red-600">- S/ {v.descuento}</span> : "-"}
                      </td>
                      <td className="p-2 font-semibold">
                        S/ {v.precioUnitario * v.cantidad - (v.descuento || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <span className="text-lg font-bold">Total vendido: S/ {totalGeneral}</span>
            </div>
          </>
        )}
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModal}
        >
          <div
            className="bg-white rounded-lg max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Agregar venta</h2>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Numero del par (ej: 1)"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 flex-1"
              />
              <button
                onClick={buscarPorCodigo}
                disabled={buscando}
                className="bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-gray-900 transition disabled:opacity-50"
              >
                {buscando ? "..." : "Buscar"}
              </button>
            </div>

            {errorModal && <p className="text-red-600 text-sm mb-3">{errorModal}</p>}

            {productoEncontrado && (
              <div className="border border-gray-200 rounded p-3 mb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {productoEncontrado.imagenes?.[0] ? (
                      <img
                        src={productoEncontrado.imagenes[0]}
                        alt={productoEncontrado.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        Sin foto
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{productoEncontrado.nombre}</p>
                    <p className="text-xs text-gray-500">{productoEncontrado.marca} - S/ {productoEncontrado.precio}</p>
                  </div>
                </div>

                <p className="text-xs font-semibold mb-1">Talla</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {productoEncontrado.tallas
                    .filter((t) => t.stock > 0)
                    .map((t) => (
                      <button
                        key={t.talla}
                        onClick={() => setTallaElegida(t.talla)}
                        className={`text-xs border rounded px-2 py-1 ${
                          tallaElegida === t.talla ? "bg-black text-white border-black" : "border-gray-300"
                        }`}
                      >
                        {t.talla} (stock {t.stock})
                      </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-semibold">Cantidad</p>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-20 text-sm"
                  />
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1">Descuento (opcional)</p>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 1, 2, 5..."
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                  />
                </div>

                <p className="text-sm font-bold mb-3">
                  Total a cobrar: S/ {totalConDescuento >= 0 ? totalConDescuento : 0}
                </p>

                <button
                  onClick={confirmarVenta}
                  disabled={registrando}
                  className="w-full bg-green-600 text-white rounded py-2 text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {registrando ? "Registrando..." : "Confirmar venta"}
                </button>
              </div>
            )}

            <button onClick={cerrarModal} className="text-sm text-gray-500 hover:underline w-full text-center mt-2">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </ProtegerTrabajador>
  );
}