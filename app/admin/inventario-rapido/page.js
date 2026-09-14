"use client";

import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import {
  buscarPorCodigoModelo,
  sumarStockTalla,
  crearProducto,
  subirImagenesProducto,
} from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const marcas = [
  "Joma",
  "Nike",
  "Adidas",
  "Puma",
  "Lacoste",
  "Punto Original",
  "CRforward",
  "VD-Dariems",
  "New Athletic",
  "Michelin",
  "Underarmour",
  "Nacionales (Marcelo)",
  "Ni Air Running",
];

const TALLAS_DEFECTO = [
  "36", "36.5", "37", "37.5", "38", "38.5", "39", "39.5", "40", "40.5",
  "41", "41.5", "42", "42.5", "43", "43.5", "44", "44.5", "45", "46", "47",
];

export default function InventarioRapidoPage() {
  const [marcaActual, setMarcaActual] = useState("Nike");

  const [codigoModelo, setCodigoModelo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [tallaStock, setTallaStock] = useState("");
  const [cantidadStock, setCantidadStock] = useState("");
  const [guardandoStock, setGuardandoStock] = useState(false);

  const [formNuevo, setFormNuevo] = useState({
    nombre: "",
    modelo: "",
    color: "",
    categoria: "hombre",
    tipo: "",
    precio: "",
  });
  const [tallaNueva, setTallaNueva] = useState("");
  const [cantidadNueva, setCantidadNueva] = useState("");
  const [imagenNueva, setImagenNueva] = useState(null);
  const [creando, setCreando] = useState(false);

  const [escaneando, setEscaneando] = useState(false);
  const [progresoOcr, setProgresoOcr] = useState(0);
  const inputCamaraRef = useRef(null);
  const inputFotoProductoRef = useRef(null);

  const actualizarNombreSugerido = (cambios) => {
    const nuevo = { ...formNuevo, ...cambios };
    const partes = [marcaActual, nuevo.tipo, nuevo.modelo, nuevo.color].filter(Boolean);
    return { ...nuevo, nombre: partes.join(" ") };
  };

  const manejarCambioFormNuevo = (campo, valor) => {
    setFormNuevo((prev) => actualizarNombreSugerido({ ...prev, [campo]: valor }));
  };

  const procesarImagenOcr = async (archivo) => {
    setEscaneando(true);
    setProgresoOcr(0);
    setError("");
    try {
      const resultado = await Tesseract.recognize(archivo, "eng", {
        logger: (info) => {
          if (info.status === "recognizing text") {
            setProgresoOcr(Math.round(info.progress * 100));
          }
        },
      });
      const texto = resultado.data.text;

      const lineas = texto
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const posibleCodigo = lineas.find((l) => /^[A-Z0-9\-]{6,}$/i.test(l.replace(/\s/g, "")));
      const posibleTalla = texto.match(/\b(3[6-9]|4[0-7])(\.5)?\b/);

      if (posibleCodigo) {
        setCodigoModelo(posibleCodigo.replace(/\s/g, ""));
      }
      if (posibleTalla) {
        setTallaStock(posibleTalla[0]);
        setTallaNueva(posibleTalla[0]);
      }

      const primeraLinea = lineas[0] || "";
      setFormNuevo((prev) => actualizarNombreSugerido({ ...prev, modelo: primeraLinea }));

      setMensaje("Texto leido. Revisa y corrige los campos si algo salio mal.");
    } catch (err) {
      setError("No se pudo leer la imagen: " + err.message);
    } finally {
      setEscaneando(false);
    }
  };

  const manejarCapturaCamara = (e) => {
    const archivo = e.target.files[0];
    if (archivo) procesarImagenOcr(archivo);
  };

  const buscarCodigo = async () => {
    if (!codigoModelo.trim()) {
      setError("Escribe o escanea un codigo de modelo");
      return;
    }
    setBuscando(true);
    setError("");
    setMensaje("");
    setProductoEncontrado(null);
    setNoEncontrado(false);
    try {
      const token = obtenerToken();
      const producto = await buscarPorCodigoModelo(token, codigoModelo.trim());
      setProductoEncontrado(producto);
    } catch (err) {
      setNoEncontrado(true);
    } finally {
      setBuscando(false);
    }
  };

  const guardarStock = async () => {
    if (!tallaStock || !cantidadStock || Number(cantidadStock) <= 0) {
      setError("Indica talla y cantidad validas");
      return;
    }
    setGuardandoStock(true);
    setError("");
    try {
      const token = obtenerToken();
      const actualizado = await sumarStockTalla(token, productoEncontrado._id, tallaStock, Number(cantidadStock));
      setProductoEncontrado(actualizado);
      setMensaje(`Se sumaron ${cantidadStock} unidades a la talla ${tallaStock}`);
      setTallaStock("");
      setCantidadStock("");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoStock(false);
    }
  };

  const crearProductoNuevo = async () => {
    if (!formNuevo.nombre.trim() || !formNuevo.precio || !formNuevo.categoria) {
      setError("Completa nombre, precio y categoria");
      return;
    }
    if (!tallaNueva || !cantidadNueva || Number(cantidadNueva) <= 0) {
      setError("Indica la talla y cantidad de esta caja");
      return;
    }

    setCreando(true);
    setError("");
    try {
      const token = obtenerToken();
      const tallasIniciales = TALLAS_DEFECTO.map((t) => ({
        talla: t,
        stock: t === tallaNueva ? Number(cantidadNueva) : 0,
      }));

      const payload = {
        codigo: "",
        sucursal: "sucursal1",
        nombre: formNuevo.nombre,
        modeloBase: formNuevo.modelo,
        marca: marcaActual,
        codigoModelo: codigoModelo.trim(),
        calidad: "Original",
        descripcion: formNuevo.color ? `Color: ${formNuevo.color}` : "",
        precio: Number(formNuevo.precio),
        categoria: formNuevo.categoria,
        tipo: formNuevo.tipo || "casual",
        colores: formNuevo.color ? [formNuevo.color] : [],
        tallas: tallasIniciales,
      };

      const productoCreado = await crearProducto(token, payload);

      if (imagenNueva) {
        await subirImagenesProducto(token, productoCreado._id, [imagenNueva]);
      }

      setMensaje("Producto nuevo creado correctamente");
      setCodigoModelo("");
      setNoEncontrado(false);
      setFormNuevo({ nombre: "", modelo: "", color: "", categoria: "hombre", tipo: "", precio: "" });
      setTallaNueva("");
      setCantidadNueva("");
      setImagenNueva(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  };

  const claseInput = "border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400 w-full";

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Inventario rapido</h1>

          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-900 block mb-1">Marca que estas subiendo</label>
            <select
              value={marcaActual}
              onChange={(e) => setMarcaActual(e.target.value)}
              className={claseInput}
            >
              {marcas.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <label className="text-sm font-semibold text-gray-900 block mb-2">
              Escanea la etiqueta de la caja
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={inputCamaraRef}
              onChange={manejarCapturaCamara}
              className="hidden"
            />
            <button
              onClick={() => inputCamaraRef.current?.click()}
              disabled={escaneando}
              className="w-full bg-blue-600 text-white rounded py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50 mb-3"
            >
              {escaneando ? `Leyendo... ${progresoOcr}%` : "Abrir camara y escanear"}
            </button>

            <label className="text-sm font-semibold text-gray-900 block mb-1">
              Codigo de modelo (revisa/corrige lo leido)
            </label>
            <div className="flex gap-2">
              <input
                value={codigoModelo}
                onChange={(e) => setCodigoModelo(e.target.value)}
                placeholder="Ej: AW06-M-01-17"
                className={claseInput}
              />
              <button
                onClick={buscarCodigo}
                disabled={buscando}
                className="bg-black text-white rounded px-4 py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-50 whitespace-nowrap"
              >
                {buscando ? "..." : "Buscar"}
              </button>
            </div>
          </div>

          {mensaje && <p className="text-green-600 text-sm mb-4">{mensaje}</p>}
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {productoEncontrado && (
            <div className="border border-green-300 bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-green-700 mb-2">Ya existe este modelo</p>
              <div className="flex gap-3 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {productoEncontrado.imagenes && productoEncontrado.imagenes.length > 0 && (
                    <img src={productoEncontrado.imagenes[0]} alt={productoEncontrado.nombre} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{productoEncontrado.nombre}</p>
                  <p className="text-xs text-gray-500">{productoEncontrado.marca}</p>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <select
                  value={tallaStock}
                  onChange={(e) => setTallaStock(e.target.value)}
                  className={claseInput}
                >
                  <option value="">Talla de esta caja</option>
                  {TALLAS_DEFECTO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={cantidadStock}
                  onChange={(e) => setCantidadStock(e.target.value)}
                  placeholder="Cantidad"
                  className={`${claseInput} w-28`}
                />
              </div>

              <button
                onClick={guardarStock}
                disabled={guardandoStock}
                className="w-full bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {guardandoStock ? "Guardando..." : "Sumar al stock"}
              </button>
            </div>
          )}

          {noEncontrado && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Modelo nuevo - completa los datos
              </p>

              <div className="flex flex-col gap-3 mb-4">
                <input
                  placeholder="Nombre (sugerido, editable)"
                  value={formNuevo.nombre}
                  onChange={(e) => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
                  className={claseInput}
                />
                <input
                  placeholder="Modelo (ej: Kiama)"
                  value={formNuevo.modelo}
                  onChange={(e) => manejarCambioFormNuevo("modelo", e.target.value)}
                  className={claseInput}
                />
                <input
                  placeholder="Color (ej: Negro-Rojo)"
                  value={formNuevo.color}
                  onChange={(e) => manejarCambioFormNuevo("color", e.target.value)}
                  className={claseInput}
                />
                <div className="flex gap-2">
                  <select
                    value={formNuevo.categoria}
                    onChange={(e) => setFormNuevo({ ...formNuevo, categoria: e.target.value })}
                    className={claseInput}
                  >
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                    <option value="ninios">Ninios</option>
                  </select>
                  <select
                    value={formNuevo.tipo}
                    onChange={(e) => manejarCambioFormNuevo("tipo", e.target.value)}
                    className={claseInput}
                  >
                    <option value="">Tipo (opcional)</option>
                    <option value="running">Running</option>
                    <option value="urbano">Urbano</option>
                    <option value="casual">Casual</option>
                    <option value="deportivo">Deportivo</option>
                    <option value="botines">Botines</option>
                  </select>
                </div>
                <input
                  type="number"
                  placeholder="Precio"
                  value={formNuevo.precio}
                  onChange={(e) => setFormNuevo({ ...formNuevo, precio: e.target.value })}
                  className={claseInput}
                />

                <div className="flex gap-2">
                  <select
                    value={tallaNueva}
                    onChange={(e) => setTallaNueva(e.target.value)}
                    className={claseInput}
                  >
                    <option value="">Talla de esta caja</option>
                    {TALLAS_DEFECTO.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={cantidadNueva}
                    onChange={(e) => setCantidadNueva(e.target.value)}
                    placeholder="Cantidad"
                    className={`${claseInput} w-28`}
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={inputFotoProductoRef}
                  onChange={(e) => setImagenNueva(e.target.files[0])}
                  className={claseInput}
                />
                {imagenNueva && (
                  <p className="text-xs text-gray-500">Foto lista: {imagenNueva.name}</p>
                )}
              </div>

              <button
                onClick={crearProductoNuevo}
                disabled={creando}
                className="w-full bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {creando ? "Creando..." : "Crear producto"}
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtegerAdmin>
  );
}