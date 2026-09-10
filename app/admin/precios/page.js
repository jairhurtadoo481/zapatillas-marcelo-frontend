"use client";

import Link from "next/link";
import ProtegerAdmin from "../../../components/ProtegerAdmin";

const marcas = [
  "Joma",
  "Nike",
  "Adidas",
  "Puma",
  "Lacoste",
  "Punto Original",
  "CRforward",
  "VD-Dariems",
  "New Athletic",
  "Michelin",
  "Underarmour",
  "Nacionales (Marcelo)",
  "Ni Air Running",
];

export default function AdminPreciosPage() {
  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Editar precios</h1>
            <Link href="/admin" className="text-sm text-gray-600 hover:underline">
              Volver al panel
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Selecciona una marca para ver sus productos y editar el precio web y el precio presencial.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {marcas.map((marca) => (
              <Link
                key={marca}
                href={`/admin/precios/${encodeURIComponent(marca)}`}
                className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md hover:border-gray-400 transition bg-white"
              >
                <p className="font-semibold text-gray-900">{marca}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}