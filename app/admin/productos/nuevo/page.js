"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtegerAdmin from "../../../../components/ProtegerAdmin";
import { crearProducto, subirImagenesProducto } from "../../../../lib/api";
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

const MARCA_CON_REPLICA = "Nacionales (Marcelo)";

const claseInput = "border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400";

export default function NuevoProductoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigo: "",
    sucursal: "sucursal1",
    nombre: "",
    modeloBase: "",
    marca: "Nike",
    calidad: "Original",
    descripcion: "",
    precio: "",
    categoria: "hombre",
    tipo: "casual",
    colores: "",
  });
  const [tallas, setTallas] = useState([{ talla: "", stock: "" }]);
  const [imagenes, setImagenes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const duplicado = sessionStorage.getItem("productoDuplicar");
    if (duplicado) {
      const data = JSON.parse(duplicado);
      setForm({
        codigo: data.codigo || "",
        sucursal: data.sucursal || "sucursal1",
        nombre: data.nombre || "",
        modeloBase: data.modeloBase || "",
        marca: data.marca || "Nike",
        calidad: data.marca === MARCA_CON_REPLICA ? (data.calidad || "Original") : "Original",
        descripcion: data.descripcion || "",
        precio: data.precio || "",
        categoria: data.categoria || "hombre",
        tipo: data.tipo || "casual",
        colores: data.colores || "",
      });
      if (data.tallas && data.tallas.length > 0) {
        setTallas(data.tallas.map((t) => ({ talla: t.talla, stock: String(t.stock) })));
      }
      setMensaje("Datos copiados de otro producto. Revisa el codigo, imagenes y tallas antes de guardar.");
      sessionStorage.removeItem("productoDuplicar");
    }
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === "marca") {
      setForm({
        ...form,
        marca: value,
        calidad: value === MARCA_CON_REPLICA ? form.calidad : "Original",
      });
      return;
    }
    setForm({ ...form, [name]: value });
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

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setCargando(true);

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
        calidad: form.marca === MARCA_CON_REPLICA ? form.calidad : "Original",
        descripcion: form.descripcion,
        precio: Number(form.precio),
        categoria: form.categoria,
        tipo: form.tipo,
        colores: form.colores
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        tallas: tallasValidas,
      };

      const productoCreado = await crearProducto(token, payload);

      if (imagenes.length > 0) {
        await subirImagenesProducto(token, productoCreado._id, imagenes);
      }

      setMensaje("Producto creado correctamente");
      setForm({
        codigo: "",
        sucursal: "sucursal1",
        nombre: "",
        modeloBase: "",
        marca: "Nike",
        calidad: "Original",
        descripcion: "",
        precio: "",
        categoria: "hombre",
        tipo: "casual",
        colores: "",
      });
      setTallas([{ talla: "", stock: "" }]);
      setImagenes([]);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Crear producto</h1>
            <button
              onClick={() => router.push("/admin/productos")}
              className="text-sm text-gray-600 hover:underline"
            >
              Volver a la lista
            </button>
          </div>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  name="codigo"
                  placeholder="Codigo / numero del par (ej: 1, 2, 3...)"
                  value={form.codigo}
                  onChange={manejarCambio}
                  className={`${claseInput} w-full`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  El mismo numero que pegaste en la nota fisica del par.
                </p>
              </div>
              <select
                name="sucursal"
                value={form.sucursal}
                onChange={manejarCambio}
                className={claseInput}
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
              className={claseInput}
              required
            />

            <div>
              <input
                name="modeloBase"
                placeholder="Modelo base (ej: Air Max 90) - opcional, para agrupar variantes"
                value={form.modeloBase}
                onChange={manejarCambio}
                className={`${claseInput} w-full`}
              />
              <p className="text-xs text-gray-400 mt-1">
                Si varios productos comparten el mismo texto aqui, apareceran como variantes entre si.
              </p>
            </div>

            <div className="flex gap-3">
              <select
                name="marca"
                value={form.marca}
                onChange={manejarCambio}
                className={`${claseInput} flex-1`}
                required
              >
                {marcas.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                name="calidad"
                value={form.calidad}
                onChange={manejarCambio}
                disabled={form.marca !== MARCA_CON_REPLICA}
                className={`${claseInput} flex-1 ${form.marca !== MARCA_CON_REPLICA ? "opacity-50 cursor-not-allowed" : ""}`}
                required
              >
                <option value="Original">Original</option>
                <option value="Replica">Replica</option>
              </select>
            </div>
            {form.marca !== MARCA_CON_REPLICA && (
              <p className="text-xs text-gray-400 -mt-2">
                Solo los productos de "Nacionales (Marcelo)" pueden marcarse como Replica.
              </p>
            )}

            <textarea
              name="descripcion"
              placeholder="Descripcion"
              value={form.descripcion}
              onChange={manejarCambio}
              className={claseInput}
              rows={3}
            />
            <input
              name="precio"
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={manejarCambio}
              className={claseInput}
              required
            />

            <div className="flex gap-4">
              <select
                name="categoria"
                value={form.categoria}
                onChange={manejarCambio}
                className={`${claseInput} flex-1`}
              >
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
                <option value="ninios">{"Ni\u00f1os"}</option>
              </select>

              <select
                name="tipo"
                value={form.tipo}
                onChange={manejarCambio}
                className={`${claseInput} flex-1`}
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
              className={claseInput}
            />

            <div>
              <p className="font-semibold mb-2 text-gray-900">Tallas y stock</p>
              {tallas.map((t, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    placeholder="Talla (ej: 40)"
                    value={t.talla}
                    onChange={(e) => manejarCambioTalla(index, "talla", e.target.value)}
                    className={`${claseInput} flex-1`}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={t.stock}
                    onChange={(e) => manejarCambioTalla(index, "stock", e.target.value)}
                    className={`${claseInput} w-24`}
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

            <div>
              <p className="font-semibold mb-2 text-gray-900">Imagenes</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImagenes(Array.from(e.target.files))}
                className={`${claseInput} w-full`}
              />
              {imagenes.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {imagenes.length} imagen(es) seleccionada(s)
                </p>
              )}
            </div>

            {mensaje && <p className="text-green-600 text-sm">{mensaje}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {cargando ? "Creando..." : "Crear producto"}
            </button>
          </form>
        </div>
      </div>
    </ProtegerAdmin>
  );
}