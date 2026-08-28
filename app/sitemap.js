import { obtenerProductos } from "../lib/api";

const SITE_URL = "https://lacasademarcelo.com";

export default async function sitemap() {
  const paginasPrincipales = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/hombre`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/mujer`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ninios`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ofertas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  let paginasProductos = [];
  try {
    const data = await obtenerProductos({ limit: 1000 });
    paginasProductos = (data.productos || []).map((producto) => ({
      url: `${SITE_URL}/producto/${producto._id}`,
      lastModified: new Date(producto.actualizadoEn || producto.creadoEn || Date.now()),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (err) {
    console.error("Error generando sitemap de productos:", err);
  }

  return [...paginasPrincipales, ...paginasProductos];
}