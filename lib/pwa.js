// Definicion de las apps instalables (PWA). Hay tres, para que el equipo de la
// tienda pueda instalar su panel aparte, con su propio ícono y entrada directa:
//   - tienda:     la web para clientes
//   - admin:      panel del administrador
//   - trabajador: panel de ventas del personal
const COLOR = "#000000";
// Fondo de la pantalla de inicio de Android: blanco, porque el logo trae fondo blanco
// y sobre negro se veia como un cuadro blanco.
const FONDO = "#ffffff";

const iconos = [
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];

const base = {
  display: "standalone",
  orientation: "portrait",
  background_color: FONDO,
  theme_color: COLOR,
  lang: "es-PE",
  icons: iconos,
};

export const manifiestos = {
  tienda: {
    ...base,
    id: "/",
    name: "La Casa de Marcelo",
    short_name: "Casa de Marcelo",
    description: "Zapatillas originales en Andahuaylas. Marcas reales, precios justos.",
    start_url: "/?origen=app",
    scope: "/",
    categories: ["shopping"],
  },
  admin: {
    ...base,
    id: "/admin",
    name: "La Casa de Marcelo - Administración",
    short_name: "Marcelo Admin",
    description: "Panel de administración de La Casa de Marcelo.",
    start_url: "/admin?origen=app",
    scope: "/admin",
    categories: ["business"],
    shortcuts: [
      { name: "Facturación", url: "/admin/facturacion", icons: [iconos[0]] },
      { name: "Inventario rápido", url: "/admin/inventario-rapido", icons: [iconos[0]] },
      { name: "Ventas", url: "/admin/ventas", icons: [iconos[0]] },
      { name: "Compras", url: "/admin/reservas", icons: [iconos[0]] },
    ],
  },
  trabajador: {
    ...base,
    id: "/trabajador",
    name: "La Casa de Marcelo - Ventas",
    short_name: "Marcelo Ventas",
    description: "Registro de ventas para el personal de La Casa de Marcelo.",
    start_url: "/trabajador/ventas?origen=app",
    scope: "/trabajador",
    categories: ["business"],
  },
};
