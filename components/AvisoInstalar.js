"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const CLAVE = "aviso-instalar-cerrado";
const DIAS_OCULTO = 14;
// No se interrumpe a quien esta pagando, viendo un comprobante o llenando un formulario.
const RUTAS_SIN_AVISO = ["/carrito", "/c/", "/libro-de-reclamaciones"];

const yaInstalada = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const cerradoRecientemente = () => {
  try {
    const cuando = Number(localStorage.getItem(CLAVE));
    return Boolean(cuando) && Date.now() - cuando < DIAS_OCULTO * 86400000;
  } catch {
    return false;
  }
};

const esIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export default function AvisoInstalar() {
  const pathname = usePathname();
  const [modo, setModo] = useState(null); // null | "android" | "ios"
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    // Solo en celulares/tabletas (pantalla tactil), y si todavia no la instalaron.
    if (yaInstalada() || cerradoRecientemente() || !window.matchMedia("(pointer: coarse)").matches) return;

    const temporizadores = [];
    const alPreguntar = (e) => {
      e.preventDefault();
      setEvento(e);
      temporizadores.push(setTimeout(() => setModo("android"), 4000));
    };
    const alInstalar = () => {
      setModo(null);
      setEvento(null);
    };

    window.addEventListener("beforeinstallprompt", alPreguntar);
    window.addEventListener("appinstalled", alInstalar);
    if (esIOS()) temporizadores.push(setTimeout(() => setModo("ios"), 5000));

    return () => {
      window.removeEventListener("beforeinstallprompt", alPreguntar);
      window.removeEventListener("appinstalled", alInstalar);
      temporizadores.forEach(clearTimeout);
    };
  }, []);

  if (!modo || RUTAS_SIN_AVISO.some((ruta) => pathname.startsWith(ruta))) return null;

  const esPanel = pathname.startsWith("/admin") || pathname.startsWith("/trabajador");

  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, String(Date.now()));
    } catch {}
    setModo(null);
  };

  const instalar = async () => {
    if (!evento) return;
    evento.prompt();
    const { outcome } = await evento.userChoice;
    setEvento(null);
    setModo(null);
    if (outcome === "dismissed") cerrar();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-white/20 bg-gray-900/95 p-4 text-white shadow-xl backdrop-blur">
      <div className="flex items-start gap-3">
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 flex-shrink-0 rounded-lg" />
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {esPanel ? "Instala el panel como app" : "Instala la app de La Casa de Marcelo"}
          </p>
          {modo === "android" ? (
            <p className="mt-0.5 text-xs text-gray-300">Entra más rápido, con un solo toque desde tu pantalla de inicio.</p>
          ) : (
            <p className="mt-0.5 text-xs text-gray-300">
              Toca el botón <span className="font-semibold">Compartir</span> (el cuadrado con la flecha hacia arriba) y luego{" "}
              <span className="font-semibold">&quot;Agregar a pantalla de inicio&quot;</span>.
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {modo === "android" && (
              <button onClick={instalar} className="rounded bg-white px-4 py-1.5 text-sm font-semibold text-black">
                Instalar
              </button>
            )}
            <button onClick={cerrar} className="rounded border border-white/30 px-4 py-1.5 text-sm text-gray-200">
              {modo === "android" ? "Ahora no" : "Entendido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
