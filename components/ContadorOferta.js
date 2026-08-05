"use client";

import { useEffect, useState } from "react";

const calcularTiempoRestante = (fechaFin) => {
  const ahora = new Date().getTime();
  const fin = new Date(fechaFin).getTime();
  const diferencia = fin - ahora;

  if (diferencia <= 0) return null;

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

  return { dias, horas, minutos, segundos };
};

export default function ContadorOferta({ ofertaFin }) {
  const [tiempo, setTiempo] = useState(() => calcularTiempoRestante(ofertaFin));

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempo(calcularTiempoRestante(ofertaFin));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [ofertaFin]);

  if (!tiempo) {
    return (
      <p className="text-sm text-gray-500 mt-1">La oferta ha finalizado.</p>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
        OFERTA
      </span>
      <span className="text-sm text-gray-700">
        Termina en {tiempo.dias}d {tiempo.horas}h {tiempo.minutos}m {tiempo.segundos}s
      </span>
    </div>
  );
}