"use client";

import { useState } from "react";
import { NEGOCIO } from "../lib/negocio";

const distanciaKm = (a, b) => {
  const rad = (grados) => (grados * Math.PI) / 180;
  const R = 6371;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const textoDistancia = (km) => {
  if (km < 0.15) return "Estás a pasos de nuestras tiendas";
  if (km < 1) return `Estás a unos ${Math.round(km * 10) * 100} m de nuestras tiendas`;
  return `Estás a unos ${km.toFixed(1)} km de nuestras tiendas`;
};

const MENSAJES_ERROR = {
  1: "No pudimos acceder a tu ubicación. Activa el permiso de ubicación del navegador e inténtalo de nuevo.",
  2: "Tu teléfono no pudo determinar tu ubicación. Inténtalo de nuevo en un lugar con mejor señal.",
  3: "Tardó demasiado en obtener tu ubicación. Inténtalo de nuevo.",
};

export default function Ubicacion() {
  const [seleccionada, setSeleccionada] = useState(NEGOCIO.sucursales[0].id);
  const [estado, setEstado] = useState({ cargando: false, mensaje: "", error: "" });

  const sucursal = NEGOCIO.sucursales.find((s) => s.id === seleccionada);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;

  const urlMapa = `https://www.google.com/maps?q=${encodeURIComponent(sucursal.direccion)}&hl=es&z=18&output=embed`;
  const urlRuta = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(sucursal.direccion)}&travelmode=walking`;
  const urlWhatsapp = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola! Quisiera consultar por unas zapatillas.")}`
    : null;

  const calcularDistancia = () => {
    if (!navigator.geolocation) {
      setEstado({ cargando: false, mensaje: "", error: "Tu navegador no permite usar la ubicación." });
      return;
    }
    setEstado({ cargando: true, mensaje: "", error: "" });
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const km = distanciaKm(
          { lat: posicion.coords.latitude, lng: posicion.coords.longitude },
          NEGOCIO.coordenadasAprox
        );
        setEstado({ cargando: false, mensaje: textoDistancia(km), error: "" });
      },
      (err) => {
        setEstado({
          cargando: false,
          mensaje: "",
          error: MENSAJES_ERROR[err.code] || "No pudimos obtener tu ubicación.",
        });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  return (
    <section id="ubicacion" className="max-w-7xl mx-auto px-4 py-20 border-t border-white/20 bg-black/20 backdrop-blur-sm">
      <h2 className="font-display text-4xl mb-2 font-bold text-white">Visítanos</h2>
      <p className="text-gray-400 text-sm mb-8 uppercase tracking-wide">Nuestras tiendas en Andahuaylas</p>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="flex gap-2 mb-3">
            {NEGOCIO.sucursales.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeleccionada(s.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                  seleccionada === s.id
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/40 hover:border-white"
                }`}
              >
                {s.nombre}
              </button>
            ))}
          </div>
          <iframe
            key={sucursal.id}
            title={`Mapa de ${sucursal.nombre}`}
            src={urlMapa}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="w-full h-72 sm:h-96 rounded-lg border border-white/20 bg-white/10"
          />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4 text-white">
          <div>
            <p className="font-semibold text-lg">{sucursal.nombre}</p>
            <p className="text-gray-300 text-sm">{sucursal.direccion}</p>
            {sucursal.referencia && <p className="text-gray-400 text-xs mt-1">{sucursal.referencia}</p>}
          </div>

          <div className="text-sm text-gray-300">
            <p className="font-semibold text-white mb-1">Horario</p>
            {NEGOCIO.horario.map((linea) => (
              <p key={linea}>{linea}</p>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={urlRuta}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black text-center rounded py-3 font-semibold hover:bg-gray-200 transition"
            >
              Cómo llegar
            </a>
            <button
              onClick={calcularDistancia}
              disabled={estado.cargando}
              className="border border-white/50 text-white rounded py-3 font-semibold hover:border-white transition disabled:opacity-50"
            >
              {estado.cargando ? "Buscando tu ubicación..." : "¿A cuánto estoy de la tienda?"}
            </button>
            {estado.mensaje && <p className="text-green-400 text-sm">{estado.mensaje}</p>}
            {estado.error && <p className="text-red-400 text-sm">{estado.error}</p>}
          </div>

          <div className="flex gap-2">
            <a
              href={`tel:${NEGOCIO.telefonoPrincipal.tel}`}
              className="flex-1 text-center border border-white/30 rounded py-2 text-sm hover:border-white transition"
            >
              Llamar
            </a>
            {urlWhatsapp && (
              <a
                href={urlWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-green-600 hover:bg-green-700 rounded py-2 text-sm font-semibold transition"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
