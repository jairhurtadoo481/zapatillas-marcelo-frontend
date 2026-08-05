"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { obtenerVariantes } from "../lib/api";

export default function SelectorVariantes({ productoId }) {
  const [variantes, setVariantes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerVariantes(productoId);
        setVariantes(data);
      } catch (e) {
        setVariantes([]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [productoId]);

  if (cargando || variantes.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="font-semibold mb-2">Otros colores/versiones de este modelo</p>
      <div className="flex gap-2 flex-wrap">
        {variantes.map((v) => (
          <Link
            key={v._id}
            href={`/producto/${v._id}`}
            className="w-16 h-16 rounded overflow-hidden border-2 border-gray-200 hover:border-black transition"
          >
            {v.imagenes && v.imagenes.length > 0 ? (
              <img src={v.imagenes[0]} alt={v.nombre} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Sin foto
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}