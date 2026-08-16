"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import {
  obtenerReservas,
  obtenerVentas,
  buscarProductoPorCodigo,
  registrarVentaPorCodigo,
  eliminarVenta,
  eliminarReserva,
} from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatearHora = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
};

const nombreMetodo = { yape: "Yape", plin: "Plin" };
const nombreSucursal = { sucursal1: "Sucursal 1", sucursal2: "Sucursal 2" };
const COLORES = ["#000000", "#6b7280", "#a855f7", "#f97316"];

const esHoy = (fecha) => new Date(fecha).toDateString() === new Date().toDateString();

const inicioSemana = () => {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);
  const lunes = new Date(hoy.setDate(diff));
  lunes.setHours(0, 0, 0, 0);
  return lunes;
};

const inicioMes = () => {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
};

const ultimos7Dias = () => {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dias.push(d);
  }
  return dias;
};

const descargarCSV = (filas) => {
  const encabezados = ["Fecha", "Hora", "Origen", "Vendedor", "Metodo", "Codigo", "Producto", "Cantidad", "Descuento", "Subtotal"];
  const filasCSV = filas.map((f) => [
    formatearFecha(f.fecha),
    formatearHora(f.fecha),
    f.origen,
    f.vendedor,
    f.metodo,
    f.codigo,
    `"${f.nombre.replace(/"/g, '""')}"`,
    f.cantidad,
    f.descuento,
    f.subtotal,
  ]);

  const csv = [encabezados.join(","), ...filasCSV.map((fila) => fila.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
};

export default function VentasPage() {
  const [filas, setFilas] = useState([]);
  const [itemsDetalle, setItemsDetalle] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [tallaElegida, setTallaElegida] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [descuento, setDescuento] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  const cargarTodo = async () => {
    setCargando(true);
    try {
      const token = obtenerToken();
      const [reservas, ventas] = await Promise.all([
        obtenerReservas(token, true),
        obtenerVentas(token),
      ]);

      const filasExpandidas = [];
      const itemsExpandidos = [];

      reservas.forEach((reserva) => {
        const productosTexto = reserva.items
          .map((item) => `${item.nombre} (T${item.talla} x${item.cantidad})`)
          .join(", ");
        const codigosTexto = reserva.items
          .map((item) => item.codigo)
          .filter(Boolean)
          .map((c) => `#${c}`)
          .join(", ");
        const cantidadTotal = reserva.items.reduce((acc, item) => acc + item.cantidad, 0);

        filasExpandidas.push({
          id: reserva._id,
          tipo: "reserva",
          origen: "Compra web",
          metodo: nombreMetodo[reserva.metodoPago] || "-",
          vendedor: reserva.cliente.nombre + " (cliente)",
          fecha: reserva.updatedAt,
          codigo: codigosTexto || "-",
          nombre: productosTexto,
          cantidad: cantidadTotal,
          descuento: 0,
          subtotal: reserva.total,
          cliente: reserva.cliente.nombre,
        });

        reserva.items.forEach((item) => {
          itemsExpandidos.push({
            origen: "Compra web",
            nombre: item.nombre,
            cantidad: item.cantidad,
            subtotal: item.precioUnitario * item.cantidad,
            sucursal: item.sucursal || "sucursal1",
            vendedor: null,
            fecha: reserva.updatedAt,
          });
        });
      });

      ventas.forEach((venta) => {
        filasExpandidas.push({
          id: venta._id,
          tipo: "venta",
          origen: "Tienda",
          metodo: "-",
          vendedor: venta.vendedorNombre || "-",
          fecha: venta.createdAt,
          codigo: venta.codigo ? `#${venta.codigo}` : "-",
          nombre: `${venta.nombre} (T${venta.talla} x${venta.cantidad})`,
          cantidad: venta.cantidad,
          descuento: venta.descuento || 0,
          subtotal: venta.precioUnitario * venta.cantidad - (venta.descuento || 0),
          cliente: "-",
        });

        itemsExpandidos.push({
          origen: "Tienda",
          nombre: venta.nombre,
          cantidad: venta.cantidad,
          subtotal: venta.precioUnitario * venta.cantidad - (venta.descuento || 0),
          sucursal: venta.sucursal || "sucursal1",
          vendedor: venta.vendedorNombre || "Sin asignar",
          fecha: venta.createdAt,
        });
      });

      filasExpandidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setFilas(filasExpandidas);
      setItemsDetalle(itemsExpandidos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const buscarPorCodigo = async () => {
    if (!codigo.trim()) return;
    setErrorModal("");
    setBuscando(true);
    setProductoEncontrado(null);

    try {
      const token = obtenerToken();
      const producto = await buscarProductoPorCodigo(token, codigo.trim());
      setProductoEncontrado(producto);
      setTallaElegida("");
      setCantidad(1);
      setDescuento("");
    } catch (err) {
      setErrorModal(err.message);
    } finally {
      setBuscando(false);
    }
  };

  const confirmarVenta = async () => {
    if (!tallaElegida) {
      setErrorModal("Selecciona una talla");
      return;
    }

    setRegistrando(true);
    setErrorModal("");

    try {
      const token = obtenerToken();
      await registrarVentaPorCodigo(
        token,
        codigo.trim(),
        tallaElegida,
        Number(cantidad),
        Number(descuento) || 0
      );
      cerrarModal();
      cargarTodo();
    } catch (err) {
      setErrorModal(err.message);
    } finally {
      setRegistrando(false);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCodigo("");
    setProductoEncontrado(null);
    setTallaElegida("");
    setCantidad(1);
    setDescuento("");
    setErrorModal("");
  };

  const manejarEliminarVenta = async (id, nombre) => {
    const confirmar = window.confirm(`Eliminar esta venta (${nombre})? El stock se va a restaurar automaticamente.`);
    if (!confirmar) return;

    setEliminandoId(id);
    try {
      const token = obtenerToken();
      await eliminarVenta(token, id);
      cargarTodo();
    } catch (err) {
      alert(err.message);
    } finally {
      setEliminandoId(null);
    }
  };

  const manejarEliminarReserva = async (id, nombre) => {
    const confirmar = window.confirm(`Eliminar esta compra web (${nombre}) por completo?`);
    if (!confirmar) return;

    setEliminandoId(id);
    try {
      const token = obtenerToken();
      await eliminarReserva(token, id);
      cargarTodo();
    } catch (err) {
      alert(err.message);
    } finally {
      setEliminandoId(null);
    }
  };

  const totalGeneral = filas.reduce((acc, f) => acc + f.subtotal, 0);

  const totalConDescuento = productoEncontrado
    ? productoEncontrado.precio * cantidad - (Number(descuento) || 0)
    : 0;

  const totalHoy = filas.filter((f) => esHoy(f.fecha)).reduce((acc, f) => acc + f.subtotal, 0);
  const totalSemana = filas
    .filter((f) => new Date(f.fecha) >= inicioSemana())
    .reduce((acc, f) => acc + f.subtotal, 0);
  const totalMes = filas
    .filter((f) => new Date(f.fecha) >= inicioMes())
    .reduce((acc, f) => acc + f.subtotal, 0);

  const datosGrafico = ultimos7Dias().map((dia) => {
    const total = filas
      .filter((f) => new Date(f.fecha).toDateString() === dia.toDateString())
      .reduce((acc, f) => acc + f.subtotal, 0);
    return {
      dia: dia.toLocaleDateString("es-PE", { weekday: "short", day: "numeric" }),
      total,
    };
  });

  const topProductos = Object.values(
    itemsDetalle.reduce((acc, item) => {
      if (!acc[item.nombre]) acc[item.nombre] = { nombre: item.nombre, cantidad: 0, total: 0 };
      acc[item.nombre].cantidad += item.cantidad;
      acc[item.nombre].total += item.subtotal;
      return acc;
    }, {})
  )
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const rankingVendedores = Object.values(
    itemsDetalle
      .filter((item) => item.origen === "Tienda")
      .reduce((acc, item) => {
        if (!acc[item.vendedor]) acc[item.vendedor] = { vendedor: item.vendedor, cantidad: 0, total: 0 };
        acc[item.vendedor].cantidad += item.cantidad;
        acc[item.vendedor].total += item.subtotal;
        return acc;
      }, {})
  ).sort((a, b) => b.total - a.total);

  const datosOrigen = ["Compra web", "Tienda"].map((origen) => ({
    name: origen,
    value: itemsDetalle.filter((i) => i.origen === origen).reduce((acc, i) => acc + i.subtotal, 0),
  }));

  const datosSucursal = ["sucursal1", "sucursal2"].map((suc) => ({
    name: nombreSucursal[suc],
    value: itemsDetalle.filter((i) => i.sucursal === suc).reduce((acc, i) => acc + i.subtotal, 0),
  }));

  return (
    <ProtegerAdmin>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Ventas</h1>
          <div className="flex gap-3">
            <button
              onClick={() => descargarCSV(filas)}
              className="text-sm bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => setModalAbierto(true)}
              className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              + Agregar venta
            </button>
            <Link href="/admin/reservas" className="text-sm text-blue-600 hover:underline self-center">
              Volver a compras
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">Hoy</p>
            <p className="text-xl font-bold">S/ {totalHoy}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">Esta semana</p>
            <p className="text-xl font-bold">S/ {totalSemana}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">Este mes</p>
            <p className="text-xl font-bold">S/ {totalMes}</p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <p className="font-semibold mb-3 text-sm">Ventas de los ultimos 7 dias</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`S/ ${value}`, "Total"]} />
              <Bar dataKey="total" fill="#000000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-semibold mb-3 text-sm">Compra web vs Tienda</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={datosOrigen} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {datosOrigen.map((entry, index) => (
                    <Cell key={index} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `S/ ${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-semibold mb-3 text-sm">Sucursal 1 vs Sucursal 2</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={datosSucursal} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {datosSucursal.map((entry, index) => (
                    <Cell key={index} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `S/ ${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-semibold mb-3 text-sm">Top 5 productos mas vendidos</p>
            {topProductos.length === 0 && <p className="text-xs text-gray-400">Sin datos aun.</p>}
            <div className="flex flex-col gap-2">
              {topProductos.map((p, i) => (
                <div key={p.nombre} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. {p.nombre}</span>
                  <span className="font-semibold">{p.cantidad} vendidos</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-semibold mb-3 text-sm">Ranking de vendedores (tienda)</p>
            {rankingVendedores.length === 0 && <p className="text-xs text-gray-400">Sin datos aun.</p>}
            <div className="flex flex-col gap-2">
              {rankingVendedores.map((v, i) => (
                <div key={v.vendedor} className="flex items-center justify-between text-sm">
                  <span>{i === 0 ? "1st" : i === 1 ? "2nd" : `${i + 1}.`} {v.vendedor}</span>
                  <span className="font-semibold">S/ {v.total} ({v.cantidad} pares)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-200 border border-blue-400 inline-block"></span> Compra web
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-200 border border-green-400 inline-block"></span> Venta en tienda
          </span>
        </div>

        {cargando && <p className="text-gray-500">Cargando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!cargando && filas.length === 0 && (
          <p className="text-gray-500">Aun no hay ventas registradas.</p>
        )}

        {filas.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden text-gray-900">
                <thead className="bg-gray-800 text-white text-left">
                  <tr>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Hora</th>
                    <th className="p-2">Origen</th>
                    <th className="p-2">Vendedor</th>
                    <th className="p-2">Metodo</th>
                    <th className="p-2">Codigo</th>
                    <th className="p-2">Producto(s)</th>
                    <th className="p-2">Cant.</th>
                    <th className="p-2">Descuento</th>
                    <th className="p-2">Subtotal</th>
                    <th className="p-2">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, i) => (
                    <tr
                      key={i}
                      className={`border-t border-gray-300 align-top border-l-4 font-medium ${
                        f.origen === "Compra web" ? "bg-blue-200 border-l-blue-700" : "bg-green-200 border-l-green-700"
                      }`}
                    >
                      <td className="p-2">{formatearFecha(f.fecha)}</td>
                      <td className="p-2">{formatearHora(f.fecha)}</td>
                      <td className="p-2">{f.origen}</td>
                      <td className="p-2">{f.vendedor}</td>
                      <td className="p-2">{f.metodo}</td>
                      <td className="p-2">{f.codigo}</td>
                      <td className="p-2">{f.nombre}</td>
                      <td className="p-2">{f.cantidad}</td>
                      <td className="p-2">
                        {f.descuento > 0 ? (
                          <span className="text-red-700">- S/ {f.descuento}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2 font-bold">S/ {f.subtotal}</td>
                      <td className="p-2">
                        <button
                          onClick={() =>
                            f.tipo === "venta"
                              ? manejarEliminarVenta(f.id, f.nombre)
                              : manejarEliminarReserva(f.id, f.nombre)
                          }
                          disabled={eliminandoId === f.id}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {eliminandoId === f.id ? "..." : "Eliminar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <span className="text-lg font-bold">Total vendido: S/ {totalGeneral}</span>
            </div>
          </>
        )}
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModal}
        >
          <div
            className="bg-white rounded-lg max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Agregar venta</h2>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Numero del par (ej: 1)"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 flex-1"
              />
              <button
                onClick={buscarPorCodigo}
                disabled={buscando}
                className="bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-gray-900 transition disabled:opacity-50"
              >
                {buscando ? "..." : "Buscar"}
              </button>
            </div>

            {errorModal && <p className="text-red-600 text-sm mb-3">{errorModal}</p>}

            {productoEncontrado && (
              <div className="border border-gray-200 rounded p-3 mb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {productoEncontrado.imagenes?.[0] ? (
                      <img
                        src={productoEncontrado.imagenes[0]}
                        alt={productoEncontrado.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        Sin foto
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{productoEncontrado.nombre}</p>
                    <p className="text-xs text-gray-500">{productoEncontrado.marca} - S/ {productoEncontrado.precio}</p>
                  </div>
                </div>

                <p className="text-xs font-semibold mb-1">Talla</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {productoEncontrado.tallas
                    .filter((t) => t.stock > 0)
                    .map((t) => (
                      <button
                        key={t.talla}
                        onClick={() => setTallaElegida(t.talla)}
                        className={`text-xs border rounded px-2 py-1 ${
                          tallaElegida === t.talla ? "bg-black text-white border-black" : "border-gray-300"
                        }`}
                      >
                        {t.talla} (stock {t.stock})
                      </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-semibold">Cantidad</p>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-20 text-sm"
                  />
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1">Descuento (opcional)</p>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 1, 2, 5..."
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                  />
                </div>

                <p className="text-sm font-bold mb-3">
                  Total a cobrar: S/ {totalConDescuento >= 0 ? totalConDescuento : 0}
                </p>

                <button
                  onClick={confirmarVenta}
                  disabled={registrando}
                  className="w-full bg-green-600 text-white rounded py-2 text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {registrando ? "Registrando..." : "Confirmar venta"}
                </button>
              </div>
            )}

            <button onClick={cerrarModal} className="text-sm text-gray-500 hover:underline w-full text-center mt-2">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </ProtegerAdmin>
  );
}