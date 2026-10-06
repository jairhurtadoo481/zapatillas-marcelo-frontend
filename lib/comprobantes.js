// Los PDF de los comprobantes viven en Cloudinary (carpeta fija). El enlace directo
// obliga a descargar un archivo sin extension, que en muchos celulares no abre.
// Por eso se comparte un enlace a la pagina /c/<nombre>, que lo muestra en pantalla.
export const URL_BASE_PDF = "https://res.cloudinary.com/eduylwhc/raw/upload/zapatillas-marcelo/facturacion/pdf/";

// Nombre de archivo del comprobante: <RUC>-<tipo>-<serie>-<correlativo>
export const FORMATO_NOMBRE = /^\d{11}-(01|03|07)-[A-Z0-9]{4}-\d+$/;

export const nombreDesdePdfUrl = (pdfUrl) => (pdfUrl ? pdfUrl.split("?")[0].split("/").pop() : "");

export const enlaceComprobante = (pdfUrl) => {
  const nombre = nombreDesdePdfUrl(pdfUrl);
  if (!FORMATO_NOMBRE.test(nombre)) return pdfUrl;
  return `${window.location.origin}/c/${nombre}`;
};

const TIPOS = { "01": "Factura electrónica", "03": "Boleta de venta electrónica", "07": "Nota de crédito electrónica" };

export const describirNombre = (nombre) => {
  const [, tipo, serie, correlativo] = nombre.split("-");
  return { titulo: TIPOS[tipo] || "Comprobante electrónico", numero: `${serie}-${correlativo}` };
};
