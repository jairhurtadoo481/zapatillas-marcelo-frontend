"use client";

import { useState, useRef } from "react";

export default function GaleriaProducto({ imagenes, nombre }) {
  const [activa, setActiva] = useState(0);
  const [zoomActivo, setZoomActivo] = useState(false);
  const [posicion, setPosicion] = useState({ x: 50, y: 50 });
  const contenedorRef = useRef(null);

  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 flex items-center justify-center rounded-lg">
        <span className="text-gray-400">Sin imagenes</span>
      </div>
    );
  }

  const manejarMovimiento = (e) => {
    const rect = contenedorRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosicion({ x, y });
  };

  return (
    <div>
      <div
        ref={contenedorRef}
        className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setZoomActivo(true)}
        onMouseLeave={() => setZoomActivo(false)}
        onMouseMove={manejarMovimiento}
      >
        <img
          src={imagenes[activa]}
          alt={nombre}
          className="w-full h-full object-cover transition-transform duration-150"
          style={
            zoomActivo
              ? {
                  transform: "scale(2)",
                  transformOrigin: `${posicion.x}% ${posicion.y}%`,
                }
              : { transform: "scale(1)" }
          }
        />
      </div>
      {imagenes.length > 1 && (
        <div className="flex gap-2 mt-3">
          {imagenes.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiva(i)}
              className={`w-16 h-16 rounded overflow-hidden border-2 ${
                i === activa ? "border-black" : "border-transparent"
              }`}
            >
              <img src={img} alt={`${nombre} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}