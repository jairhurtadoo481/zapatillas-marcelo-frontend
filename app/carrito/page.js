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

const claseInput = "border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400";

const METODOS_PAGO = [
  { id: "yape", nombre: "Yape", logo: "/yape.png", colorBorde: "border-purple-600", colorFondo: "bg-purple-50" },
  { id: "plin", nombre: "Plin", logo: "/plin.png", colorBorde: "border-teal-500", colorFondo: "bg-teal-50" },
  { id: "bcp", nombre: "BCP", logo: "/bcp.jpg", colorBorde: "border-blue-600", colorFondo: "bg-blue-50" },
];

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
  const [config, setConfig] = useState({ qrYape: null, qrPlin: null, qrBcp: null });
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

  const fondoOscuro = "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black";

  if (paso === "exito") {
    return (
      <div className={fondoOscuro}>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-green-600 mb-3">Compra exitosa!</h1>
            <p className="text-gray-700 mb-2">Tu numero de pedido es #{numeroFinal}</p>
            <p className="text-gray-700 mb-6">Nuestro personal se comunicara en breve para confirmar tu compra.</p>
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
        </div>
      </div>
    );
  }

  if (paso === "carrito" && items.length === 0) {
    return (
      <div className={fondoOscuro}>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-gray-500">Tu carrito esta vacio.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={fondoOscuro}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {paso === "carrito" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Mi carrito</h1>
            <p className="text-sm text-gray-500 mb-6">
              Revisa los productos que agregaste. Cuando estes listo, presiona "Iniciar compra" para continuar con tus datos y el pago.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {items.map((item) => (
                <div
                  key={`${item.productoId}-${item.talla}`}
                  className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 bg-white"
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
                    <p className="font-semibold text-gray-900">{item.nombre}</p>
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
                    <p className="font-semibold text-gray-900">S/ {item.precioUnitario * item.cantidad}</p>
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
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">S/ {total}</span>
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
          </div>
        )}

        {paso === "datos" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <form onSubmit={irAPago} className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paso 1 de 4</p>
              <h2 className="text-xl font-bold text-gray-900">Completa tus datos</h2>
              <p className="text-sm text-gray-500 -mt-2">
                Ingresa tu nombre, celular y ciudad para que podamos coordinar la entrega o recojo de tu pedido. Si quieres que te lo llevemos a domicilio, marca la casilla y agrega tu direccion.
              </p>

              <input
                name="nombre"
                placeholder="Nombre completo"
                value={form.nombre}
                onChange={manejarCambioForm}
                className={claseInput}
                required
              />
              <input
                name="celular"
                placeholder="Numero de celular"
                value={form.celular}
                onChange={manejarCambioForm}
                className={claseInput}
                required
              />

              <select
                name="ciudad"
                value={form.ciudad}
                onChange={manejarCambioForm}
                className={claseInput}
              >
                <option value="andahuaylas">Andahuaylas</option>
                <option value="fuera">Fuera de Andahuaylas</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-gray-900">
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
                  className={claseInput}
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
          </div>
        )}

        {paso === "pago" && (
          <div className="rounded-2xl p-6 md:p-10 shadow-xl">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paso 2 de 4</p>
            <h2 className="text-2xl font-bold mb-2 text-white">Metodo de pago</h2>
            <p className="text-sm text-gray-300 mb-6">
              Elige con que app vas a pagar. En el siguiente paso te mostraremos el codigo QR correspondiente para que hagas el pago.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {METODOS_PAGO.map((metodo) => {
                const seleccionado = metodoPago === metodo.id;
                return (
                  <button
                    key={metodo.id}
                    onClick={() => setMetodoPago(metodo.id)}
                    className={`relative rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 border-2 bg-white ${
                      seleccionado
                        ? `${metodo.colorBorde} ${metodo.colorFondo} scale-105 shadow-lg`
                        : "border-transparent hover:border-gray-300 hover:scale-102"
                    }`}
                  >
                    {seleccionado && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
                        {"\u2713"}
                      </span>
                    )}
                    <img
                      src={metodo.logo}
                      alt={metodo.nombre}
                      className="w-16 h-16 object-contain"
                    />
                    <span className="text-sm font-bold text-gray-800">{metodo.nombre}</span>
                  </button>
                );
              })}
            </div>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <button
              onClick={irAQr}
              disabled={!metodoPago}
              className="w-full bg-white text-gray-900 rounded-lg py-3 font-bold hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente paso
            </button>
          </div>
        )}

        {paso === "qr" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paso 3 de 4</p>
            <h2 className="text-xl font-bold mb-2 text-gray-900">
              Escanea el QR de {metodoPago === "yape" ? "Yape" : metodoPago === "plin" ? "Plin" : "BCP"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Abre tu app de {metodoPago === "yape" ? "Yape" : metodoPago === "plin" ? "Plin" : "BCP"}, escanea este codigo y paga exactamente el monto indicado abajo. Cuando termines, toma una captura de pantalla del comprobante y presiona el boton.
            </p>

            <div className="flex justify-center mb-4">
              {metodoPago === "yape" && config.qrYape && (
                <img src={config.qrYape} alt="QR Yape" className="w-56 h-56 object-contain border border-gray-200 rounded" />
              )}
              {metodoPago === "plin" && config.qrPlin && (
                <img src={config.qrPlin} alt="QR Plin" className="w-56 h-56 object-contain border border-gray-200 rounded" />
              )}
              {metodoPago === "bcp" && config.qrBcp && (
                <img src={config.qrBcp} alt="QR BCP" className="w-56 h-56 object-contain border border-gray-200 rounded" />
              )}
              {((metodoPago === "yape" && !config.qrYape) ||
                (metodoPago === "plin" && !config.qrPlin) ||
                (metodoPago === "bcp" && !config.qrBcp)) && (
                <p className="text-gray-500 text-sm">QR no disponible por el momento, contactanos por WhatsApp.</p>
              )}
            </div>

            <p className="text-lg font-bold mb-6 text-gray-900">Monto a pagar: S/ {total}</p>

            <button
              onClick={irAComprobante}
              className="w-full bg-black text-white rounded py-3 font-semibold hover:bg-gray-800 transition"
            >
              Ya pague, siguiente paso
            </button>
          </div>
        )}

        {paso === "comprobante" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paso 4 de 4</p>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Sube tu comprobante de pago</h2>
            <p className="text-sm text-gray-500 mb-4">
              Selecciona la captura de pantalla o foto del comprobante de tu pago y presiona "Finalizar compra". Nuestro personal verificara el pago y se comunicara contigo en breve.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArchivoComprobante(e.target.files[0])}
              className={`${claseInput} w-full mb-4`}
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
    </div>
  );
}