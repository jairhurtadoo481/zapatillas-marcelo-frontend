"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtegerAdmin from "../../components/ProtegerAdmin";
import { eliminarToken } from "../../lib/auth";

export default function AdminPage() {
  const router = useRouter();

  const cerrarSesion = () => {
    eliminarToken();
    router.push("/admin/login");
  };

  return (
    <ProtegerAdmin>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Panel Admin</h1>
          <button
            onClick={cerrarSesion}
            className="text-sm text-red-600 hover:underline"
          >
            Cerrar sesion
          </button>
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
            <p className="font-semibold text-lg">Reservas</p>
            <p className="text-sm text-gray-500">Ver y atender reservas pendientes</p>
          </Link>

          <Link
            href="/admin/ventas"
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <p className="font-semibold text-lg">Ventas</p>
            <p className="text-sm text-gray-500">Historial de ventas y ganancias</p>
          </Link>
        </div>
      </div>
    </ProtegerAdmin>
  );
}