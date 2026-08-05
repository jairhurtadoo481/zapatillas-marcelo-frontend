"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtegerAdmin from "../../../../components/ProtegerAdmin";
import { obtenerReservas } from "../../../../lib/api";
import { obtenerToken } from "../../../../lib/auth";

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
};

export default function HistorialReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = obtenerToken();
        const data = await obtenerReservas(token, true);
        setReservas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <ProtegerAdmin>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Historial de compras</h1>
          <Link href="/admin/reservas" className="text-sm text-blue-600 hover:underline">
            Volver a reservas
          </Link>
        </div>

        {cargando && <p className="text-gray-500">Cargando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!cargando && reservas.length === 0 && (
          <p className="text-gray-500">Aun no hay compras exitosas registradas.</p>
        )}

        <div className="flex flex-col gap-4">
          {reservas.map((reserva) => (
            <div key={reserva._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">Reserva #{reserva.numero}</span>
                <span className="text-sm text-gray-500">{formatearFecha(reserva.createdAt)}</span>
              </div>

              <div className="text-sm mb-2">
                <p><span className="font-semibold">Cliente:</span> {reserva.cliente.nombre}</p>
                <p><span className="font-semibold">Celular:</span> {reserva.cliente.celular}</p>
              </div>

              <div className="text-sm">
                {reserva.items.map((item, i) => (
                  <p key={i}>
                    {item.cantidad}x {item.nombre} - Talla {item.talla} - S/ {item.precioUnitario}
                  </p>
                ))}
                <p className="font-bold mt-1">Total: S/ {reserva.total}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtegerAdmin>
  );
}