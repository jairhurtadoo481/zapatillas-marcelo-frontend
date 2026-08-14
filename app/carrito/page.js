"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  obtenerCarrito,
  quitarDelCarrito,
  vaciarCarrito,
} from "../../lib/carrito";
import { crearReserva, subirComprobante, obtenerConfiguracion } from "../../lib/api";

export default function CarritoPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [paso, setPaso] = useState("carrito");

  const [form, setForm] = useState({
    nombre: "",
    celular: "",
    ciudad: "andahuaylas",
    entregaDomicilio: false,
    direccion: "",
  });

  const [metodoPago, setMetodoPago] = useState("");
  const [config, setConfig] = useState({ qrYape: null, qrPlin: null });
  const [archivoComprobante, setArchivoComprobante] = useState(null);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [numeroFinal, setNumeroFinal] = useState(null);

  useEffect(() => {
    setItems(obtenerCarrito());
    obtenerConfiguracion().then(setConfig).catch(() => {});
  }, []);

  const quitar = (productoId, talla) => {
    setItems(quitarDelCarrito(productoId, talla));
  };

  const total = items.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0);
  const algunaOferta = items.some((item) => item.tieneOferta);

  const manejarCambioForm = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const irAPago = (e) => {
    e.preventDefault();
    setPaso("pago");
  };

  const irAQr = () => {
    if (!metodoPago) {
      setError("Selecciona un metodo de pago");
      return;
    }
    setError("");
    setPaso("qr");
  };

  const irAComprobante = () => {
    setPaso("comprobante");
  };

  const finalizarCompra = async () => {
    if (!archivoComprobante) {
      setError("Sube una foto del comprobante de pago");
      return;
    }

    setEnviando(true);
    setError("");

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
        metodoPago,
      };

      const reserva = await crearReserva(payload);
      await subirComprobante(reserva._id, archivoComprobante);

      setNumeroFinal(reserva.numero);
      vaciarCarrito();
      setItems([]);
      setPaso("exito");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (paso === "exito") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-3">Compra exitosa!</h1>
        <p className="text-gray-600 mb-2">Tu numero de pedido es #{numeroFinal}</p>
        <p className="text-gray-600 mb-6">Nuestro personal se comunicara en breve para confirmar tu compra.</p>
        <div className="flex flex-col gap-3 items-center">
          <Link href="/seguimiento" className="text-sm text-blue-600 hover:underline">
            Ver estado de mi pedido
          </Link>
          <button
            onClick={() => router.push("/")}
            className="bg-black text-white rounded px-6 py-2 font-semibold hover:bg-gray-800 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (paso === "carrito" && items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Tu carrito esta vacio.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {paso === "carrito" && (
        <>
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
              Uno o mas productos de tu seleccion estan en oferta. Se requiere el pago completo.
            </div>
          )}

          <button
            onClick={() => setPaso("datos")}
            className="w-full bg-black text-white rounded py-3 font-semibold hover:bg-gray-800 transition"
          >
            Iniciar compra
          </button>
        </>
      )}

      {paso === "datos" && (
        <form onSubmit={irAPago} className="flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">Completa tus datos</h2>

          <input
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={manejarCambioForm}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            name="celular"
            placeholder="Numero de celular"
            value={form.celular}
            onChange={manejarCambioForm}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />

          <select
            name="ciudad"
            value={form.ciudad}
            onChange={manejarCambioForm}
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
              onChange={manejarCambioForm}
            />
            Quiero que me lo entreguen/lleven a mi casa
          </label>

          {form.entregaDomicilio && (
            <input
              name="direccion"
              placeholder="Direccion completa"
              value={form.direccion}
              onChange={manejarCambioForm}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
          )}

          <button
            type="submit"
            className="bg-black text-white rounded py-3 font-semibold hover:bg-gray-800 transition"
          >
            Siguiente paso
          </button>
        </form>
      )}

      {paso === "pago" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Metodo de pago</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setMetodoPago("yape")}
              className={`border-2 rounded-lg p-6 text-center font-bold ${
                metodoPago === "yape" ? "border-purple-600 bg-purple-50" : "border-gray-200"
              }`}
              style={{ color: "#7B2FF7" }}
            >
              YAPE
            </button>
            <button
              onClick={() => setMetodoPago("plin")}
              className={`border-2 rounded-lg p-6 text-center font-bold ${
                metodoPago === "plin" ? "border-teal-500 bg-teal-50" : "border-gray-200"
              }`}
              style={{ color: "#00C1A2" }}
            >
              PLIN
            </button>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            onClick={irAQr}
            className="w-full bg-black text-white rounded py-3 font-semibold hover:bg-gray-800 transition"
          >
            Siguiente paso
          </button>
        </div>
      )}

      {paso === "qr" && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">
            Escanea el QR de {metodoPago === "yape" ? "Yape" : "Plin"}
          </h2>

          <div className="flex justify-center mb-4">
            {metodoPago === "yape" && config.qrYape && (
              <img src={config.qrYape} alt="QR Yape" className="w-56 h-56 object-contain border border-gray-200 rounded" />
            )}
            {metodoPago === "plin" && config.qrPlin && (
              <img src={config.qrPlin} alt="QR Plin" className="w-56 h-56 object-contain border border-gray-200 rounded" />
            )}
            {((metodoPago === "yape" && !config.qrYape) || (metodoPago === "plin" && !config.qrPlin)) && (
              <p className="text-gray-500 text-sm">QR no disponible por el momento, contactanos por WhatsApp.</p>
            )}
          </div>

          <p className="text-lg font-bold mb-6">Monto a pagar: S/ {total}</p>

          <button
            onClick={irAComprobante}
            className="w-full bg-black text-white rounded py-3 font-semibold hover:bg-gray-800 transition"
          >
            Ya pague, siguiente paso
          </button>
        </div>
      )}

      {paso === "comprobante" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Sube tu comprobante de pago</h2>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setArchivoComprobante(e.target.files[0])}
            className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
          />

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            onClick={finalizarCompra}
            disabled={enviando}
            className="w-full bg-green-600 text-white rounded py-3 font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Finalizar compra"}
          </button>
        </div>
      )}
    </div>
  );
}