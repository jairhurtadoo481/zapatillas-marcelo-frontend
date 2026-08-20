"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerReservas, actualizarEstadoReserva, eliminarReserva } from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const UNA_HORA_MS = 60 * 60 * 1000;
const TRES_HORAS_MS = 3 * 60 * 60 * 1000;

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
};

const nombreMetodo = {
  yape: "Yape",
  plin: "Plin",
};

const nombreSucursal = {
  sucursal1: "Sucursal 1",
  sucursal2: "Sucursal 2",
};

const filtros = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "atendido", etiqueta: "Atendido" },
  { valor: "listo_recoger", etiqueta: "Listo para recoger" },
  { valor: "suspendido", etiqueta: "Suspendido" },
];

export default function AdminComprasPage() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [, forzarRender] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroSucursal, setFiltroSucursal] = useState("todas");
  const [avisoNueva, setAvisoNueva] = useState(null);
  const [pausado, setPausado] = useState(false);

  const idsConocidos = useRef(null);
  const audioRef = useRef(null);

  const iniciarTimbre = () => {
    if (!audioRef.current) return;
    audioRef.current.loop = true;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
    setPausado(false);
  };

  const detenerTimbre = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPausado(false);
  };

  const alternarPausa = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setPausado(false);
    } else {
      audioRef.current.pause();
      setPausado(true);
    }
  };

  const cargar = async () => {
    try {
      const token = obtenerToken();
      const data = await obtenerReservas(token, false);

      if (idsConocidos.current !== null) {
        const nuevas = data.filter((r) => !idsConocidos.current.has(r._id));
        if (nuevas.length > 0) {
          iniciarTimbre();
          setAvisoNueva(`Nueva compra #${nuevas[0].numero} recibida!`);
        }
      }

      idsConocidos.current = new Set(data.map((r) => r._id));
      setReservas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    const intervaloDatos = setInterval(cargar, 15000);
    const intervaloReloj = setInterval(() => forzarRender((n) => n + 1), 10000);

    return () => {
      clearInterval(intervaloDatos);
      clearInterval(intervaloReloj);
      detenerTimbre();
    };
  }, []);

  const manejarEliminar = async (id, numero) => {
    const confirmar = window.confirm(`Eliminar la compra #${numero} por completo? Esta accion no se puede deshacer.`);
    if (!confirmar) return;

    try {
      const token = obtenerToken();
      await eliminarReserva(token, id);
      cargar();
    } catch (err) {
      alert(err.message);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      const token = obtenerToken();
      await actualizarEstadoReserva(token, id, estado);
      cargar();
    } catch (err) {
      alert(err.message);
    }
  };

  const claseParpadeo = (reserva) => {
    if (reserva.estado !== "pendiente") return "border-gray-200";

    const transcurrido = Date.now() - new Date(reserva.createdAt).getTime();

    if (transcurrido > TRES_HORAS_MS) return "parpadeo-rojo";
    if (transcurrido > UNA_HORA_MS) return "parpadeo-naranja";
    return "parpadeo-verde";
  };

  const colorEstado = {
    pendiente: "bg-yellow-100 text-yellow-700",
    atendido: "bg-blue-100 text-blue-700",
    listo_recoger: "bg-purple-100 text-purple-700",
    suspendido: "bg-gray-200 text-gray-700",
  };

  const etiquetaEstado = {
    pendiente: "pendiente",
    atendido: "atendido",
    listo_recoger: "listo para recoger",
    suspendido: "suspendido",
  };

  const reservasFiltradas = reservas.filter((r) => {
    if (filtroEstado !== "todos" && r.estado !== filtroEstado) return false;
    if (filtroSucursal !== "todas" && !r.items.some((i) => i.sucursal === filtroSucursal)) return false;
    return true;
  });

  const contarPorEstado = (estado) => {
    if (estado === "todos") return reservas.length;
    return reservas.filter((r) => r.estado === estado).length;
  };

  return (
    <ProtegerAdmin>
      <audio ref={audioRef} src="/timbre.mp3" preload="auto" />

      {avisoNueva && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-4 rounded-lg shadow-lg font-semibold flex flex-col gap-2 min-w-[220px]">
          <span>{avisoNueva}</span>
          <div className="flex gap-2">
            <button
              onClick={alternarPausa}
              className="text-xs bg-white text-green-700 px-3 py-1.5 rounded font-semibold hover:bg-gray-100 transition flex-1"
            >
              {pausado ? "Reanudar" : "Pausar"}
            </button>
            <button
              onClick={() => {
                detenerTimbre();
                setAvisoNueva(null);
              }}
              className="text-xs bg-black/20 text-white px-3 py-1.5 rounded font-semibold hover:bg-black/30 transition flex-1"
            >
              Silenciar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Compras</h1>
            <Link href="/admin/reservas/historial" className="text-sm text-blue-600 hover:underline">
              Ver historial
            </Link>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            {filtros.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltroEstado(f.valor)}
                className={`text-sm px-3 py-1.5 rounded-full border transition ${
                  filtroEstado === f.valor
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-300 text-gray-600 hover:border-black"
                }`}
              >
                {f.etiqueta} ({contarPorEstado(f.valor)})
              </button>
            ))}
          </div>

          <div className="mb-4">
            <select
              value={filtroSucursal}
              onChange={(e) => setFiltroSucursal(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            >
              <option value="todas">Todas las sucursales</option>
              <option value="sucursal1">Sucursal 1</option>
              <option value="sucursal2">Sucursal 2</option>
            </select>
          </div>

          <div className="flex gap-4 text-xs text-gray-500 mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Nueva (menos de 1h)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Mas de 1h sin atender
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span> Mas de 3h sin atender
            </span>
          </div>

          {cargando && <p className="text-gray-500">Cargando...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!cargando && reservasFiltradas.length === 0 && (
            <p className="text-gray-500">No hay compras con estos filtros.</p>
          )}

          <div className="flex flex-col gap-4">
            {reservasFiltradas.map((reserva) => (
              <div
                key={reserva._id}
                className={`border rounded-lg p-4 bg-white text-gray-900 ${claseParpadeo(reserva)}`}
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-gray-900">Compra #{reserva.numero}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${colorEstado[reserva.estado] || ""}`}>
                      {etiquetaEstado[reserva.estado] || reserva.estado}
                    </span>
                    {reserva.metodoPago && (
                      <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded">
                        {nombreMetodo[reserva.metodoPago] || reserva.metodoPago}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatearFecha(reserva.createdAt)}</span>
                </div>

                <div className="text-sm mb-2 text-gray-900">
                  <p><span className="font-semibold">Cliente:</span> {reserva.cliente.nombre}</p>
                  <p><span className="font-semibold">Celular:</span> {reserva.cliente.celular}</p>
                  <p>
                    <span className="font-semibold">Ciudad:</span>{" "}
                    {reserva.cliente.ciudad === "andahuaylas" ? "Andahuaylas" : "Fuera de Andahuaylas"}
                  </p>
                  {reserva.cliente.entregaDomicilio && (
                    <p><span className="font-semibold">Direccion:</span> {reserva.cliente.direccion}</p>
                  )}
                </div>

                <div className="flex gap-4 mb-3 flex-wrap">
                  <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                    {reserva.items.map((item, i) => (
                      <Link
                        key={i}
                        href={`/producto/${item.producto}`}
                        target="_blank"
                        className="flex items-center gap-3 bg-gray-50 rounded p-2 hover:bg-gray-100 transition"
                      >
                        <div className="w-14 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {item.imagen ? (
                            <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              Sin foto
                            </div>
                          )}
                        </div>
                        <div className="text-sm flex-1">
                          <p className="font-semibold text-blue-700 hover:underline">{item.nombre}</p>
                          <p className="text-gray-500">
                            {item.cantidad}x - Talla {item.talla} - S/ {item.precioUnitario}
                            {item.tieneOferta && <span className="text-red-600 font-semibold"> (Oferta)</span>}
                          </p>
                          <p className="text-xs text-gray-400">
                            {nombreSucursal[item.sucursal] || "Sucursal 1"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {reserva.comprobante && (
                    <a href={reserva.comprobante} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      <p className="text-xs font-semibold mb-1 text-center text-gray-900">Comprobante</p>
                      <img
                        src={reserva.comprobante}
                        alt="Comprobante de pago"
                        className="w-24 h-24 object-cover rounded border-2 border-green-400 hover:opacity-80 transition"
                      />
                    </a>
                  )}
                </div>

                <p className="font-bold text-gray-900">Total: S/ {reserva.total}</p>
                {reserva.requierePagoCompleto && (
                  <p className="text-red-600 text-xs font-semibold mb-3">Requiere pago completo (producto en oferta)</p>
                )}

                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => cambiarEstado(reserva._id, "atendido")}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Atendido
                  </button>
                  <button
                    onClick={() => cambiarEstado(reserva._id, "listo_recoger")}
                    className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition"
                  >
                    Listo para recoger
                  </button>
                  <button
                    onClick={() => cambiarEstado(reserva._id, "entregado")}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    Entregado
                  </button>
                  <button
                    onClick={() => cambiarEstado(reserva._id, "suspendido")}
                    className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                  >
                    Suspendido
                  </button>
                  <button
                    onClick={() => manejarEliminar(reserva._id, reserva.numero)}
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}