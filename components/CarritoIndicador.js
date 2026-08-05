"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { obtenerCarrito } from "../lib/carrito";

export default function CarritoIndicador() {
  const [cantidad, setCantidad] = useState(0);

  const actualizar = () => {
    const carrito = obtenerCarrito();
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    setCantidad(total);
  };

  useEffect(() => {
    actualizar();
    window.addEventListener("carritoActualizado", actualizar);
    return () => window.removeEventListener("carritoActualizado", actualizar);
  }, []);

  return (
    <Link href="/carrito" className="relative flex items-center hover:text-gray-300 transition">
      Carrito
      {cantidad > 0 && (
        <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cantidad}
        </span>
      )}
    </Link>
  );
}