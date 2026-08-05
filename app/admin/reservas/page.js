"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerReservas, actualizarEstadoReserva } from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const UNA_HORA_MS = 60 * 60 * 1000;
const TRES_HORAS_MS = 3 * 60 * 60 * 1000;

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
};

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [, forzarRender] = useState(0);

  const cargar = async () => {
    setCargando(true);
    try {
      const token = obtenerToken();
      const data = await obtenerReservas(token, false);
      setReservas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    const intervaloDatos = setInterval(cargar, 30000);
    const intervaloReloj = setInterval(() => forzarRender((n) => n + 1), 10000);
    return () => {
      clearInterval(intervaloDatos);
      clearInterval(intervaloReloj);
    };
  }, []);

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
    suspendido: "bg-gray-200 text-gray-700",
  };

  return (
    <ProtegerAdmin>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Reservas</h1>
          <Link href="/admin/reservas/historial" className="text-sm text-blue-600 hover:underline">
            Ver historial
          </Link>
        </div>

        <div className="flex gap-4 text-xs text-gray-500 mb-4">
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

        {!cargando && reservas.length === 0 && (
          <p className="text-gray-500">No hay reservas pendientes.</p>
        )}

        <div className="flex flex-col gap-4">
          {reservas.map((reserva) => (
            <div
              key={reserva._id}
              className={`border rounded-lg p-4 ${claseParpadeo(reserva)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold">Reserva #{reserva.numero}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${colorEstado[reserva.estado] || ""}`}>
                    {reserva.estado}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{formatearFecha(reserva.createdAt)}</span>
              </div>

              <div className="text-sm mb-2">
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

              <div className="flex flex-col gap-2 mb-3">
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
                    </div>
                  </Link>
                ))}
                <p className="font-bold">Total: S/ {reserva.total}</p>
                {reserva.requierePagoCompleto && (
                  <p className="text-red-600 text-xs font-semibold">Requiere pago completo (Yape personal)</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => cambiarEstado(reserva._id, "atendido")}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                >
                  Atendido
                </button>
                <button
                  onClick={() => cambiarEstado(reserva._id, "suspendido")}
                  className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                >
                  Suspendido
                </button>
                <button
                  onClick={() => cambiarEstado(reserva._id, "compra_exitosa")}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                  Compra exitosa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtegerAdmin>
  );
}