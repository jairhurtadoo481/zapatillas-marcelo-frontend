"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { agregarAlCarrito } from "../lib/carrito";

export default function AgregarCarrito({ producto }) {
  const router = useRouter();
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [mensaje, setMensaje] = useState("");

  const tallasConStock = (producto.tallas || []).filter((t) => t.stock > 0);

  const manejarAgregar = () => {
    if (!tallaSeleccionada) {
      setMensaje("Selecciona una talla primero");
      return;
    }

    agregarAlCarrito({
      productoId: producto._id,
      nombre: producto.nombre,
      marca: producto.marca,
      imagen: producto.imagenes?.[0] || null,
      talla: tallaSeleccionada,
      cantidad: 1,
      precioUnitario: producto.ofertaActiva ? producto.precioOferta : producto.precio,
      tieneOferta: producto.ofertaActiva === true,
    });

    setMensaje("Agregado al carrito");
    setTimeout(() => setMensaje(""), 2000);
  };

  if (tallasConStock.length === 0) {
    return <p className="text-sm text-gray-500 mt-4">Sin stock disponible por ahora.</p>;
  }

  return (
    <div className="mt-4">
      <p className="font-semibold mb-2">Selecciona tu talla</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {tallasConStock.map((t) => (
          <button
            key={t.talla}
            onClick={() => setTallaSeleccionada(t.talla)}
            className={`border rounded px-3 py-1 text-sm ${
              tallaSeleccionada === t.talla
                ? "bg-black text-white border-black"
                : "border-gray-300"
            }`}
          >
            {t.talla}
          </button>
        ))}
      </div>

      <button
        onClick={manejarAgregar}
        className="w-full bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition"
      >
        Agregar al carrito
      </button>

      {mensaje && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-green-600">{mensaje}</p>
          <button
            onClick={() => router.push("/carrito")}
            className="text-sm text-blue-600 hover:underline"
          >
            Ver carrito
          </button>
        </div>
      )}
    </div>
  );
}