"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerCarrito,
  quitarDelCarrito,
  vaciarCarrito,
} from "../../lib/carrito";
import { crearReserva } from "../../lib/api";

export default function CarritoPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    celular: "",
    ciudad: "andahuaylas",
    entregaDomicilio: false,
    direccion: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [reservaCreada, setReservaCreada] = useState(null);

  useEffect(() => {
    setItems(obtenerCarrito());
  }, []);

  const quitar = (productoId, talla) => {
    setItems(quitarDelCarrito(productoId, talla));
  };

  const total = items.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0);
  const algunaOferta = items.some((item) => item.tieneOferta);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const manejarReserva = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const payload = {
        items: items.map((i) => ({
          producto: i.productoId,
          talla: i.talla,
          cantidad: i.cantidad,
        })),
        cliente: {
          nombre: form.nombre,
          celular: form.celular,
          ciudad: form.ciudad,
          entregaDomicilio: form.entregaDomicilio,
          direccion: form.entregaDomicilio ? form.direccion : "",
        },
      };

      const reserva = await crearReserva(payload);
      setReservaCreada(reserva);
      vaciarCarrito();
      setItems([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (reservaCreada) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-3">Reserva realizada!</h1>
        <p className="text-gray-600 mb-6">
          Nos pondremos en contacto contigo al numero {reservaCreada.cliente.celular} para coordinar
          {reservaCreada.requierePagoCompleto
            ? " el pago completo (uno o mas productos tienen oferta)."
            : " el adelanto."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-black text-white rounded px-6 py-2 font-semibold hover:bg-gray-800 transition"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Tu carrito esta vacio.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Mi carrito</h1>

      <div className="flex flex-col gap-3 mb-6">
        {items.map((item) => (
          <div
            key={`${item.productoId}-${item.talla}`}
            className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
          >
            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {item.imagen ? (
                <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase">{item.marca}</p>
              <p className="font-semibold">{item.nombre}</p>
              <p className="text-sm text-gray-500">
                Talla {item.talla} - Cantidad {item.cantidad}
              </p>
              {item.tieneOferta && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                  En oferta
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold">S/ {item.precioUnitario * item.cantidad}</p>
              <button
                onClick={() => quitar(item.productoId, item.talla)}
                className="text-xs text-red-600 hover:underline"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 flex items-center justify-between mb-6">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold">S/ {total}</span>
      </div>

      {algunaOferta && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded p-3 mb-6">
          Uno o mas productos de tu seleccion estan en oferta. Para reservarlos se requiere el pago
          completo por Yape personal (no solo un adelanto).
        </div>
      )}

      {!mostrarForm ? (
        <button
          onClick={() => setMostrarForm(true)}
          className="w-full bg-black text-white rounded py-3 font-semibold hover:bg-gray-800 transition"
        >
          Reservar
        </button>
      ) : (
        <form onSubmit={manejarReserva} className="flex flex-col gap-4 border-t border-gray-200 pt-6">
          <h2 className="font-semibold">Completa tus datos</h2>

          <input
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={manejarCambio}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            name="celular"
            placeholder="Numero de celular"
            value={form.celular}
            onChange={manejarCambio}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />

          <select
            name="ciudad"
            value={form.ciudad}
            onChange={manejarCambio}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="andahuaylas">Andahuaylas</option>
            <option value="fuera">Fuera de Andahuaylas</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="entregaDomicilio"
              checked={form.entregaDomicilio}
              onChange={manejarCambio}
            />
            Quiero que me lo entreguen/lleven a mi casa
          </label>

          {form.entregaDomicilio && (
            <input
              name="direccion"
              placeholder="Direccion completa"
              value={form.direccion}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="bg-black text-white rounded py-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Hacer reserva"}
          </button>
        </form>
      )}
    </div>
  );
}