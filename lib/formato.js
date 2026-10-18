// Precio para mostrar: enteros sin decimales (S/ 300) y el resto con dos (S/ 261.90).
// Tambien evita restos de coma flotante en sumas como 179.94 + 205.94.
export const formatearPrecio = (valor) => {
  const numero = Math.round(Number(valor) * 100) / 100;
  if (!Number.isFinite(numero)) return String(valor);
  return Number.isInteger(numero) ? String(numero) : numero.toFixed(2);
};
