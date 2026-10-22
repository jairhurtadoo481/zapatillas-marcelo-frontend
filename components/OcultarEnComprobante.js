"use client";

import { usePathname } from "next/navigation";

// La pagina del comprobante (/c/...) se muestra sola, sin la barra de la tienda, el buscador,
// el pie de pagina ni el aviso de instalar la app: quien abre su factura no debe tener un
// camino directo a la tienda (se comparaban precios con lo que decia su comprobante).
export default function OcultarEnComprobante({ children }) {
  const ruta = usePathname();
  if (ruta && ruta.startsWith("/c/")) return null;
  return children;
}
