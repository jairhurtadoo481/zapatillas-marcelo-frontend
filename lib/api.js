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

export { API_URL };