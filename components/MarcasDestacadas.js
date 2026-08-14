"use client";

import { useEffect, useRef, useState } from "react";

const MARCAS = [
  { nombre: "Nike", archivo: "/nike.png" },
  { nombre: "Adidas", archivo: "/adidas3.png" },
  { nombre: "Puma", archivo: "/puma.png" },
  { nombre: "Joma", archivo: "/joma.png" },
  { nombre: "Lacoste", archivo: "/lacoste.png" },
  { nombre: "Punto Original", archivo: "/punto2.png" },
  { nombre: "CRforward", archivo: "/forward2.png" },
  { nombre: "VD-Dariems", archivo: "/dariems2.png" },
  { nombre: "New Athletic", archivo: "/newathletic2.png" },
  { nombre: "Michelin", archivo: "/michelin2.png" },
  { nombre: "Underarmour", archivo: "/underarmour.png" },
];

export default function MarcasDestacadas() {
  const [visible, setVisible] = useState(false);
  const contenedorRef = useRef(null);

  useEffect(() => {
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (contenedorRef.current) observador.observe(contenedorRef.current);
    return () => observador.disconnect();
  }, []);

  return (
    <section id="marcas" className="bg-white py-20 border-t-2 border-b-2 border-black" ref={contenedorRef}>
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">
          Trabajamos con
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-center mb-12">
          Marcas originales
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {MARCAS.map((marca, i) => (
            <div
              key={marca.nombre}
              className={`reveal-item ${visible ? "visible" : ""} border-2 border-black rounded-lg p-6 flex items-center justify-center h-24 grayscale hover:grayscale-0 transition-all duration-300`}
              style={{ animationDelay: visible ? `${i * 90}ms` : "0ms" }}
            >
              <img
                src={marca.archivo}
                alt={marca.nombre}
                className="max-h-12 max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}