"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtegerAdmin from "../../../../components/ProtegerAdmin";
import { obtenerTurnos } from "../../../../lib/api";
import { obtenerToken } from "../../../../lib/auth";

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
};

export default function HistorialTrabajadorPage() {
  const router = useRouter();
  const { id } = useParams();
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = obtenerToken();
        const data = await obtenerTurnos(token, id);
        setTurnos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const totalGeneral = turnos.reduce((acc, t) => acc + (t.totalVentas || 0), 0);
  const ventasGeneral = turnos.reduce((acc, t) => acc + (t.cantidadVentas || 0), 0);

  return (
    <ProtegerAdmin>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Historial de turnos {turnos.length > 0 && `- ${turnos[0].trabajadorNombre}`}
          </h1>
          <button
            onClick={() => router.push("/admin/trabajadores")}
            className="text-sm text-gray-600 hover:underline"
          >
            Volver
          </button>
        </div>

        {cargando && <p className="text-gray-500">Cargando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!cargando && turnos.length === 0 && (
          <p className="text-gray-500">Este trabajador aun no ha abierto ningun turno.</p>
        )}

        {turnos.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Total vendido (todos los turnos)</p>
                <p className="text-2xl font-bold">S/ {totalGeneral}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Ventas totales</p>
                <p className="text-2xl font-bold">{ventasGeneral}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {turnos.map((t) => (
                <div key={t._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${t.abierto ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {t.abierto ? "Abierto" : "Cerrado"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatearFecha(t.fechaApertura)}
                      {t.fechaCierre && ` - ${formatearFecha(t.fechaCierre)}`}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold">Ventas:</span> {t.cantidadVentas} -{" "}
                    <span className="font-semibold">Total:</span> S/ {t.totalVentas}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ProtegerAdmin>
  );
}