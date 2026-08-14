"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtegerAdmin from "../../components/ProtegerAdmin";
import { eliminarToken, obtenerToken } from "../../lib/auth";
import { obtenerVentas, obtenerReservas, obtenerProductos } from "../../lib/api";

const esHoy = (fecha) => {
  const d = new Date(fecha);
  const hoy = new Date();
  return d.toDateString() === hoy.toDateString();
};

export default function AdminPage() {
  const router = useRouter();
  const [resumen, setResumen] = useState({
    ventasHoy: 0,
    comprasPendientes: 0,
    stockBajo: 0,
  });
  const [cargandoResumen, setCargandoResumen] = useState(true);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const token = obtenerToken();

        const [ventas, reservasActivas, reservasHistorial, productosData] = await Promise.all([
          obtenerVentas(token),
          obtenerReservas(token, false),
          obtenerReservas(token, true),
          obtenerProductos({ limit: 200 }),
        ]);

        const ventasTiendaHoy = ventas
          .filter((v) => esHoy(v.createdAt))
          .reduce((acc, v) => acc + (v.precioUnitario * v.cantidad - (v.descuento || 0)), 0);

        const comprasWebHoy = reservasHistorial
          .filter((r) => esHoy(r.updatedAt))
          .reduce((acc, r) => acc + r.total, 0);

        const comprasPendientes = reservasActivas.filter((r) => r.estado === "pendiente").length;

        const stockBajo = productosData.productos.filter((p) =>
          p.tallas.some((t) => t.stock > 0 && t.stock <= 2)
        ).length;

        setResumen({
          ventasHoy: ventasTiendaHoy + comprasWebHoy,
          comprasPendientes,
          stockBajo,
        });
      } catch (err) {
        // si falla el resumen, no bloqueamos el panel
      } finally {
        setCargandoResumen(false);
      }
    };

    cargarResumen();
  }, []);

  const cerrarSesion = () => {
    eliminarToken();
    router.push("/admin/login");
  };

  return (
    <ProtegerAdmin>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Panel Admin</h1>
          <button
            onClick={cerrarSesion}
            className="text-sm text-red-600 hover:underline"
          >
            Cerrar sesion
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">Ventas de hoy</p>
            <p className="text-xl font-bold">
              {cargandoResumen ? "..." : `S/ ${resumen.ventasHoy}`}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">Compras pendientes</p>
            <p className={`text-xl font-bold ${resumen.comprasPendientes > 0 ? "text-yellow-600" : ""}`}>
              {cargandoResumen ? "..." : resumen.comprasPendientes}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">Stock bajo</p>
            <p className={`text-xl font-bold ${resumen.stockBajo > 0 ? "text-red-600" : ""}`}>
              {cargandoResumen ? "..." : resumen.stockBajo}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <Link
            href="/admin/productos"
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <p className="font-semibold text-lg">Productos</p>
            <p className="text-sm text-gray-500">Crear, editar y eliminar productos</p>
          </Link>

          <Link
            href="/admin/reservas"
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <p className="font-semibold text-lg">Compras</p>
            <p className="text-sm text-gray-500">Ver y atender compras pendientes</p>
          </Link>

          <Link
            href="/admin/ventas"
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <p className="font-semibold text-lg">Ventas</p>
            <p className="text-sm text-gray-500">Historial de ventas y ganancias</p>
          </Link>

          <Link
            href="/admin/trabajadores"
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <p className="font-semibold text-lg">Trabajadores</p>
            <p className="text-sm text-gray-500">Crear y administrar cuentas del personal</p>
          </Link>

          <Link
            href="/admin/configuracion"
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <p className="font-semibold text-lg">Configuracion</p>
            <p className="text-sm text-gray-500">QR de Yape y Plin para pagos</p>
          </Link>
        </div>
      </div>
    </ProtegerAdmin>
  );
}