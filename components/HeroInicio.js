"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const IMAGENES = [
  "/andahuaylas.png",
  "/inicio1.png",
  "/inicio2.png",
  "/inicio3.png",
  "/inicio4.png",
];

export default function HeroInicio() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((i) => (i + 1) % IMAGENES.length);
    }, 2000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <section className="relative bg-black text-white overflow-hidden min-h-[600px] flex flex-col justify-center">
      <div className="absolute inset-0">
        {IMAGENES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === indice ? "opacity-70" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-28 md:py-36 text-center">
        <p className="text-blue-400 text-sm tracking-[0.3em] uppercase mb-4">
          Andahuaylas - Apurimac
        </p>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] mb-6">
          LA CASA<br />DE MARCELO
        </h1>
        <p className="text-gray-200 text-base md:text-lg max-w-xl mx-auto mb-10">
          Zapatillas originales para hombre, mujer y ninios. Marcas reales, precios justos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="#marcas"
            className="border border-white px-8 py-3 text-sm tracking-wide uppercase hover:bg-white hover:text-black transition"
          >
            Ver marcas
          </Link>
          <Link
            href="/ofertas"
            className="bg-blue-600 px-8 py-3 text-sm tracking-wide uppercase hover:bg-blue-500 transition"
          >
            Ver ofertas
          </Link>
        </div>
      </div>

      <div className="relative flex justify-center pb-8">
        <div className="motion-safe:rebote text-gray-400 text-xs tracking-widest">
          SCROLL
        </div>
      </div>
    </section>
  );
}