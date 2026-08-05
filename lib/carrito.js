const CLAVE = "carrito_zapatillas_marcelo";

const notificarCambio = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("carritoActualizado"));
  }
};

export const obtenerCarrito = () => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CLAVE);
  return data ? JSON.parse(data) : [];
};

export const guardarCarrito = (items) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CLAVE, JSON.stringify(items));
    notificarCambio();
  }
};

export const agregarAlCarrito = (item) => {
  const carrito = obtenerCarrito();
  const existente = carrito.find(
    (i) => i.productoId === item.productoId && i.talla === item.talla
  );

  if (existente) {
    existente.cantidad += item.cantidad;
  } else {
    carrito.push(item);
  }

  guardarCarrito(carrito);
  return carrito;
};

export const quitarDelCarrito = (productoId, talla) => {
  const carrito = obtenerCarrito().filter(
    (i) => !(i.productoId === productoId && i.talla === talla)
  );
  guardarCarrito(carrito);
  return carrito;
};

export const vaciarCarrito = () => {
  guardarCarrito([]);
};