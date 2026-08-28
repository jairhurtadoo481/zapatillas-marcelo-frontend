"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtegerAdmin from "../../../../components/ProtegerAdmin";
import {
  obtenerProductoPorId,
  actualizarProducto,
  subirImagenesProducto,
  eliminarImagenProducto,
  venderTalla,
} from "../../../../lib/api";
import { obtenerToken } from "../../../../lib/auth";

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

const aInputDatetime = (fecha) => {
  if (!fecha) return "";
  const d = new Date(fecha);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EditarProductoPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState({
    codigo: "",
    sucursal: "sucursal1",
    nombre: "",
    modeloBase: "",
    marca: "Nike",
    descripcion: "",
    precio: "",
    categoria: "hombre",
    tipo: "casual",
    colores: "",
    destacado: false,
    activo: true,
    precioOferta: "",
    ofertaInicio: "",
    ofertaFin: "",
  });
  const [tallas, setTallas] = useState([{ talla: "", stock: "" }]);
  const [cantidadesVenta, setCantidadesVenta] = useState({});
  const [imagenesActuales, setImagenesActuales] = useState([]);
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [eliminandoImagen, setEliminandoImagen] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      const producto = await obtenerProductoPorId(id);
      setForm({
        codigo: producto.codigo || "",
        sucursal: producto.sucursal || "sucursal1",
        nombre: producto.nombre,
        modeloBase: producto.modeloBase || "",
        marca: producto.marca && marcas.includes(producto.marca) ? producto.marca : "Nike",
        descripcion: producto.descripcion || "",
        precio: producto.precio,
        categoria: producto.categoria,
        tipo: producto.tipo,
        colores: (producto.colores || []).join(", "),
        destacado: producto.destacado,
        activo: producto.activo,
        precioOferta: producto.precioOferta ?? "",
        ofertaInicio: aInputDatetime(producto.ofertaInicio),
        ofertaFin: aInputDatetime(producto.ofertaFin),
      });
      setTallas(
        producto.tallas && producto.tallas.length > 0
          ? producto.tallas.map((t) => ({ talla: t.talla, stock: String(t.stock) }))
          : [{ talla: "", stock: "" }]
      );
      setImagenesActuales(producto.imagenes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [id]);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const manejarCambioTalla = (index, campo, valor) => {
    const nuevasTallas = [...tallas];
    nuevasTallas[index][campo] = valor;
    setTallas(nuevasTallas);
  };

  const agregarTalla = () => {
    setTallas([...tallas, { talla: "", stock: "" }]);
  };

  const quitarTalla = (index) => {
    setTallas(tallas.filter((_, i) => i !== index));
  };

  const manejarEliminarImagen = async (url) => {
    const confirmar = window.confirm("Eliminar esta imagen?");
    if (!confirmar) return;

    setEliminandoImagen(url);
    try {
      const token = obtenerToken();
      await eliminarImagenProducto(token, id, url);
      setImagenesActuales(imagenesActuales.filter((img) => img !== url));
    } catch (err) {
      alert(err.message);
    } finally {
      setEliminandoImagen(null);
    }
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setGuardando(true);

    try {
      const token = obtenerToken();

      const tallasValidas = tallas
        .filter((t) => t.talla.trim() !== "" && t.stock !== "")
        .map((t) => ({ talla: t.talla.trim(), stock: Number(t.stock) }));

      const payload = {
        codigo: form.codigo.trim(),
        sucursal: form.sucursal,
        nombre: form.nombre,
        modeloBase: form.modeloBase.trim(),
        marca: form.marca,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        categoria: form.categoria,
        tipo: form.tipo,
        colores: form.colores
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        tallas: tallasValidas,
        destacado: form.destacado,
        activo: form.activo,
        precioOferta: form.precioOferta === "" ? null : Number(form.precioOferta),
        ofertaInicio: form.ofertaInicio ? new Date(form.ofertaInicio).toISOString() : null,
        ofertaFin: form.ofertaFin ? new Date(form.ofertaFin).toISOString() : null,
      };

      await actualizarProducto(token, id, payload);

      if (nuevasImagenes.length > 0) {
        const resultado = await subirImagenesProducto(token, id, nuevasImagenes);
        setImagenesActuales(resultado.imagenes || imagenesActuales);
      }

      setMensaje("Producto actualizado correctamente");
      setNuevasImagenes([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const manejarVenta = async (talla) => {
    const cantidad = Number(cantidadesVenta[talla] || 0);
    if (!cantidad || cantidad <= 0) {
      alert("Ingresa una cantidad valida");
      return;
    }

    try {
      const token = obtenerToken();
      await venderTalla(token, id, talla, cantidad);
      setCantidadesVenta({ ...cantidadesVenta, [talla]: "" });
      await cargar();
      setMensaje(`Venta registrada: ${cantidad} unidad(es) de talla ${talla}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (cargandoDatos) {
    return <p className="text-center py-16 text-gray-500">Cargando producto...</p>;
  }

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
            <button
              onClick={() => router.push("/admin/productos")}
              className="text-sm text-gray-600 hover:underline"
            >
              Volver a la lista
            </button>
          </div>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <input
                name="codigo"
                placeholder="Codigo / numero del par"
                value={form.codigo}
                onChange={manejarCambio}
                className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
              />
              <select
                name="sucursal"
                value={form.sucursal}
                onChange={manejarCambio}
                className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
              >
                <option value="sucursal1">Sucursal 1</option>
                <option value="sucursal2">Sucursal 2</option>
              </select>
            </div>

            <input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
              required
            />
            <input
              name="modeloBase"
              placeholder="Modelo base (para agrupar variantes)"
              value={form.modeloBase}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            />

            <select
              name="marca"
              value={form.marca}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
              required
            >
              {marcas.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <textarea
              name="descripcion"
              placeholder="Descripcion"
              value={form.descripcion}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
              rows={3}
            />
            <input
              name="precio"
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
              required
            />

            <div className="flex gap-4">
              <select
                name="categoria"
                value={form.categoria}
                onChange={manejarCambio}
                className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
              >
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
                <option value="ninios">{"Ni\u00f1os"}</option>
              </select>

              <select
                name="tipo"
                value={form.tipo}
                onChange={manejarCambio}
                className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
              >
                <option value="running">Running</option>
                <option value="urbano">Urbano</option>
                <option value="casual">Casual</option>
                <option value="deportivo">Deportivo</option>
                <option value="botines">Botines</option>
              </select>
            </div>

            <input
              name="colores"
              placeholder="Colores (separados por coma)"
              value={form.colores}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            />

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-900">
                <input
                  type="checkbox"
                  name="destacado"
                  checked={form.destacado}
                  onChange={manejarCambio}
                />
                Destacado
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-900">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={manejarCambio}
                />
                Activo (visible en la tienda)
              </label>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <p className="font-semibold mb-3 text-gray-900">Promocion / oferta por tiempo</p>
              <input
                name="precioOferta"
                type="number"
                placeholder="Precio con descuento (dejar vacio para quitar oferta)"
                value={form.precioOferta}
                onChange={manejarCambio}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-3 bg-white text-gray-900"
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Inicio de oferta</label>
                  <input
                    name="ofertaInicio"
                    type="datetime-local"
                    value={form.ofertaInicio}
                    onChange={manejarCambio}
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Fin de oferta</label>
                  <input
                    name="ofertaFin"
                    type="datetime-local"
                    value={form.ofertaFin}
                    onChange={manejarCambio}
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2 text-gray-900">Tallas y stock</p>
              {tallas.map((t, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    placeholder="Talla (ej: 40)"
                    value={t.talla}
                    onChange={(e) => manejarCambioTalla(index, "talla", e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={t.stock}
                    onChange={(e) => manejarCambioTalla(index, "stock", e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-24 bg-white text-gray-900"
                  />
                  {tallas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => quitarTalla(index)}
                      className="text-red-600 px-2"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={agregarTalla}
                className="text-sm text-blue-600 hover:underline"
              >
                + Agregar talla
              </button>
            </div>

            {imagenesActuales.length > 0 && (
              <div>
                <p className="font-semibold mb-2 text-gray-900">Imagenes actuales</p>
                <div className="flex gap-2 flex-wrap">
                  {imagenesActuales.map((img) => (
                    <div key={img} className="relative">
                      <img
                        src={img}
                        alt="imagen producto"
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => manejarEliminarImagen(img)}
                        disabled={eliminandoImagen === img}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-700 transition disabled:opacity-50"
                        title="Eliminar imagen"
                      >
                        {eliminandoImagen === img ? "..." : "x"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="font-semibold mb-2 text-gray-900">Agregar mas imagenes</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNuevasImagenes(Array.from(e.target.files))}
                className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900"
              />
            </div>

            {mensaje && <p className="text-green-600 text-sm">{mensaje}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={guardando}
              className="bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>

          <div className="mt-10 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Registrar venta rapida</h2>
            {tallas
              .filter((t) => t.talla.trim() !== "")
              .map((t) => (
                <div key={t.talla} className="flex items-center gap-3 mb-2">
                  <span className="w-16 text-sm font-medium text-gray-900">Talla {t.talla}</span>
                  <span className="text-sm text-gray-500 w-24">Stock: {t.stock}</span>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={cantidadesVenta[t.talla] || ""}
                    onChange={(e) =>
                      setCantidadesVenta({ ...cantidadesVenta, [t.talla]: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-1 w-24 text-sm bg-white text-gray-900"
                  />
                  <button
                    onClick={() => manejarVenta(t.talla)}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    Vender
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}
