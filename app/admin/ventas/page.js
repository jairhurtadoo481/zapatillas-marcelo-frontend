"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import {
  obtenerReservas,
  obtenerVentas,
  buscarProductoPorCodigo,
  registrarVentaPorCodigo,
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

export default function VentasPage() {
  const [filas, setFilas] = useState([]);
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

  const cargarTodo = async () => {
    setCargando(true);
    try {
      const token = obtenerToken();
      const [reservas, ventas] = await Promise.all([
        obtenerReservas(token, true),
        obtenerVentas(token),
      ]);

      const filasExpandidas = [];

      reservas.forEach((reserva) => {
        reserva.items.forEach((item) => {
          filasExpandidas.push({
            origen: "Reserva web",
            fecha: reserva.updatedAt,
            codigo: item.codigo,
            nombre: item.nombre,
            talla: item.talla,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            descuento: 0,
            subtotal: item.precioUnitario * item.cantidad,
            cliente: reserva.cliente.nombre,
          });
        });
      });

      ventas.forEach((venta) => {
        filasExpandidas.push({
          origen: "Tienda",
          fecha: venta.createdAt,
          codigo: venta.codigo,
          nombre: venta.nombre,
          talla: venta.talla,
          cantidad: venta.cantidad,
          precioUnitario: venta.precioUnitario,
          descuento: venta.descuento || 0,
          subtotal: venta.precioUnitario * venta.cantidad - (venta.descuento || 0),
          cliente: "-",
        });
      });

      filasExpandidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setFilas(filasExpandidas);
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

  const totalGeneral = filas.reduce((acc, f) => acc + f.subtotal, 0);

  const totalConDescuento = productoEncontrado
    ? productoEncontrado.precio * cantidad - (Number(descuento) || 0)
    : 0;

  return (
    <ProtegerAdmin>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Ventas</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setModalAbierto(true)}
              className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              + Agregar venta
            </button>
            <Link href="/admin/reservas" className="text-sm text-blue-600 hover:underline self-center">
              Volver a reservas
            </Link>
          </div>
        </div>

        {cargando && <p className="text-gray-500">Cargando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!cargando && filas.length === 0 && (
          <p className="text-gray-500">Aun no hay ventas registradas.</p>
        )}

        {filas.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Hora</th>
                    <th className="p-2">Origen</th>
                    <th className="p-2">Codigo</th>
                    <th className="p-2">Producto</th>
                    <th className="p-2">Talla</th>
                    <th className="p-2">Cant.</th>
                    <th className="p-2">Precio</th>
                    <th className="p-2">Descuento</th>
                    <th className="p-2">Subtotal</th>
                    <th className="p-2">Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="p-2">{formatearFecha(f.fecha)}</td>
                      <td className="p-2">{formatearHora(f.fecha)}</td>
                      <td className="p-2">{f.origen}</td>
                      <td className="p-2">{f.codigo ? `#${f.codigo}` : "-"}</td>
                      <td className="p-2">{f.nombre}</td>
                      <td className="p-2">{f.talla}</td>
                      <td className="p-2">{f.cantidad}</td>
                      <td className="p-2">S/ {f.precioUnitario}</td>
                      <td className="p-2">
                        {f.descuento > 0 ? (
                          <span className="text-red-600">- S/ {f.descuento}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2 font-semibold">S/ {f.subtotal}</td>
                      <td className="p-2">{f.cliente}</td>
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