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

export const crearReservaMayorista = async (token, payload) => {
  const res = await fetch(`${API_URL}/reservas/mayorista`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al crear reserva mayorista");
  return data;
};

export const obtenerMayoristas = async (token) => {
  const res = await fetch(`${API_URL}/usuarios/mayoristas`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al obtener mayoristas");
  return data;
};

export const crearMayorista = async (token, datos) => {
  const res = await fetch(`${API_URL}/usuarios/mayoristas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al crear mayorista");
  return data;
};

export const actualizarMayorista = async (token, id, datos) => {
  const res = await fetch(`${API_URL}/usuarios/mayoristas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al actualizar mayorista");
  return data;
};

export const eliminarMayorista = async (token, id) => {
  const res = await fetch(`${API_URL}/usuarios/mayoristas/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al eliminar mayorista");
  return data;
};

export const buscarPorCodigoModelo = async (token, codigoModelo) => {
  const res = await fetch(`${API_URL}/productos/codigo-modelo/${encodeURIComponent(codigoModelo)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "No encontrado");
  return data;
};

export const sumarStockTalla = async (token, id, talla, cantidad) => {
  const res = await fetch(`${API_URL}/productos/${id}/sumar-stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ talla, cantidad }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al sumar stock");
  return data;
};

export const obtenerConfigFacturacion = async (token) => {
  const res = await fetch(`${API_URL}/facturacion/configuracion`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al obtener configuracion de facturacion");
  return data;
};

export const guardarDatosEmpresaFacturacion = async (token, datos) => {
  const res = await fetch(`${API_URL}/facturacion/configuracion/empresa`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al guardar datos de la empresa");
  return data;
};

export const guardarCredencialesSolApi = async (token, usuarioSol, claveSol) => {
  const res = await fetch(`${API_URL}/facturacion/configuracion/credenciales-sol`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ usuarioSol, claveSol }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al guardar credenciales SOL");
  return data;
};

export const subirCertificadoFacturacion = async (token, archivo, claveCertificado) => {
  const formData = new FormData();
  formData.append("certificado", archivo);
  formData.append("claveCertificado", claveCertificado);

  const res = await fetch(`${API_URL}/facturacion/configuracion/certificado`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al subir el certificado");
  return data;
};

export const buscarDocumentoFacturacion = async (token, tipo, numero) => {
  const res = await fetch(`${API_URL}/facturacion/documento/${tipo}/${numero}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "No se encontro el documento");
  return data;
};

export const guardarClienteApi = async (token, documento, datos) => {
  const res = await fetch(`${API_URL}/facturacion/clientes/${documento}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al guardar el cliente");
  return data;
};

export const emitirComprobanteApi = async (token, payload) => {
  const res = await fetch(`${API_URL}/facturacion/emitir`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al emitir el comprobante");
  return data;
};

export const obtenerComprobantes = async (token) => {
  const res = await fetch(`${API_URL}/facturacion/comprobantes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al obtener comprobantes");
  return data;
};

export const emitirNotaCreditoApi = async (token, comprobanteId, motivoCodigo) => {
  const res = await fetch(`${API_URL}/facturacion/notas-credito`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ comprobanteId, motivoCodigo }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error al emitir la nota de credito");
  return data;
};

export { API_URL };