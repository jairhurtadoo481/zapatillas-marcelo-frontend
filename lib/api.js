const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const obtenerProductos = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/productos${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
};

export const obtenerProductoPorId = async (id) => {
  const res = await fetch(`${API_URL}/productos/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener producto");
  return res.json();
};

export const obtenerVariantes = async (id) => {
  const res = await fetch(`${API_URL}/productos/${id}/variantes`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener variantes");
  return res.json();
};

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al iniciar sesion");
  return data;
};

export const crearProducto = async (token, producto) => {
  const res = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(producto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al crear producto");
  return data;
};

export const actualizarProducto = async (token, id, producto) => {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(producto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al actualizar producto");
  return data;
};

export const eliminarProducto = async (token, id) => {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al eliminar producto");
  return data;
};

export const subirImagenesProducto = async (token, id, archivos) => {
  const formData = new FormData();
  for (const archivo of archivos) {
    formData.append("imagenes", archivo);
  }

  const res = await fetch(`${API_URL}/productos/${id}/imagenes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al subir imagenes");
  return data;
};

export const venderTalla = async (token, id, talla, cantidad) => {
  const res = await fetch(`${API_URL}/productos/${id}/vender`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ talla, cantidad }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al registrar venta");
  return data;
};

export const crearReserva = async (payload) => {
  const res = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al crear reserva");
  return data;
};

export const subirComprobante = async (id, archivo) => {
  const formData = new FormData();
  formData.append("imagen", archivo);

  const res = await fetch(`${API_URL}/reservas/${id}/comprobante`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al subir comprobante");
  return data;
};

export const seguimientoReserva = async (numero, celular) => {
  const res = await fetch(`${API_URL}/reservas/seguimiento?numero=${numero}&celular=${celular}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "No se encontro el pedido");
  return data;
};

export const obtenerReservas = async (token, historial = false) => {
  const query = historial ? "?historial=true" : "";
  const res = await fetch(`${API_URL}/reservas${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al obtener reservas");
  return data;
};

export const actualizarEstadoReserva = async (token, id, estado) => {
  const res = await fetch(`${API_URL}/reservas/${id}/estado`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ estado }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al actualizar reserva");
  return data;
};

export const buscarProductoPorCodigo = async (token, codigo) => {
  const res = await fetch(`${API_URL}/ventas/buscar/${codigo}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Producto no encontrado");
  return data;
};

export const registrarVentaPorCodigo = async (token, codigo, talla, cantidad, descuento = 0) => {
  const res = await fetch(`${API_URL}/ventas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ codigo, talla, cantidad, descuento }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al registrar venta");
  return data;
};

export const obtenerVentas = async (token) => {
  const res = await fetch(`${API_URL}/ventas`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al obtener ventas");
  return data;
};

export const obtenerConfiguracion = async () => {
  const res = await fetch(`${API_URL}/configuracion`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener configuracion");
  return res.json();
};

export const subirQr = async (token, tipo, archivo) => {
  const formData = new FormData();
  formData.append("imagen", archivo);

  const res = await fetch(`${API_URL}/configuracion/qr-${tipo}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al subir QR");
  return data;
};

export const obtenerTrabajadores = async (token) => {
  const res = await fetch(`${API_URL}/usuarios`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al obtener trabajadores");
  return data;
};

export const crearTrabajador = async (token, datos) => {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al crear trabajador");
  return data;
};

export const actualizarTrabajador = async (token, id, datos) => {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al actualizar trabajador");
  return data;
};

export const eliminarTrabajador = async (token, id) => {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al eliminar trabajador");
  return data;
};

export const abrirTurno = async (token) => {
  const res = await fetch(`${API_URL}/turnos/abrir`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al abrir turno");
  return data;
};

export const cerrarTurno = async (token) => {
  const res = await fetch(`${API_URL}/turnos/cerrar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al cerrar turno");
  return data;
};

export const turnoActual = async (token) => {
  const res = await fetch(`${API_URL}/turnos/actual`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al obtener turno actual");
  return data;
};

export const obtenerTurnos = async (token, trabajadorId) => {
  const query = trabajadorId ? `?trabajadorId=${trabajadorId}` : "";
  const res = await fetch(`${API_URL}/turnos${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al obtener turnos");
  return data;
};

export const eliminarImagenProducto = async (token, id, url) => {
  const res = await fetch(`${API_URL}/productos/${id}/imagenes`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al eliminar imagen");
  return data;
};

export const obtenerActividadVentas = async (token) => {
  const res = await fetch(`${API_URL}/ventas/actividad`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al obtener actividad");
  return data;
};

export const eliminarVenta = async (token, id) => {
  const res = await fetch(`${API_URL}/ventas/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al eliminar venta");
  return data;
};

export const eliminarReserva = async (token, id) => {
  const res = await fetch(`${API_URL}/reservas/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al eliminar la compra");
  return data;
};

export { API_URL };