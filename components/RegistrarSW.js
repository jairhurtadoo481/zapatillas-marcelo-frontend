"use client";

import { useEffect } from "react";

// Registra el service worker solo en produccion (en desarrollo estorba al recargar).
export default function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    const registrar = () => navigator.serviceWorker.register("/sw.js").catch(() => {});

    if (document.readyState === "complete") {
      registrar();
      return;
    }
    window.addEventListener("load", registrar, { once: true });
    return () => window.removeEventListener("load", registrar);
  }, []);

  return null;
}
