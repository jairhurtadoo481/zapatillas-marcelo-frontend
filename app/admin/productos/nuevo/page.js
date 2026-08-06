"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtegerAdmin from "../../../../components/ProtegerAdmin";
import { crearProducto, subirImagenesProducto } from "../../../../lib/api";
import { obtenerToken } from "../../../../lib/auth";

export default function NuevoProductoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigo: "",
    sucursal: "sucursal1",
    nombre: "",
    modeloBase: "",
    marca: "",
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

  const manejarCambio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        marca: "",
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
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Crear producto</h1>
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
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
              <p className="text-xs text-gray-400 mt-1">
                El mismo numero que pegaste en la nota fisica del par.
              </p>
            </div>
            <select
              name="sucursal"
              value={form.sucursal}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2"
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
            className="border border-gray-300 rounded px-3 py-2"
            required
          />

          <div>
            <input
              name="modeloBase"
              placeholder="Modelo base (ej: Air Max 90) - opcional, para agrupar variantes"
              value={form.modeloBase}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Si varios productos comparten el mismo texto aqui, apareceran como variantes entre si.
            </p>
          </div>

          <input
            name="marca"
            placeholder="Marca"
            value={form.marca}
            onChange={manejarCambio}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <textarea
            name="descripcion"
            placeholder="Descripcion"
            value={form.descripcion}
            onChange={manejarCambio}
            className="border border-gray-300 rounded px-3 py-2"
            rows={3}
          />
          <input
            name="precio"
            type="number"
            placeholder="Precio"
            value={form.precio}
            onChange={manejarCambio}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />

          <div className="flex gap-4">
            <select
              name="categoria"
              value={form.categoria}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            >
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="ninios">{"Ni\u00f1os"}</option>
            </select>

            <select
              name="tipo"
              value={form.tipo}
              onChange={manejarCambio}
              className="border border-gray-300 rounded px-3 py-2 flex-1"
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
            className="border border-gray-300 rounded px-3 py-2"
          />

          <div>
            <p className="font-semibold mb-2">Tallas y stock</p>
            {tallas.map((t, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  placeholder="Talla (ej: 40)"
                  value={t.talla}
                  onChange={(e) => manejarCambioTalla(index, "talla", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 flex-1"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={t.stock}
                  onChange={(e) => manejarCambioTalla(index, "stock", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-24"
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
            <p className="font-semibold mb-2">Imagenes</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImagenes(Array.from(e.target.files))}
              className="border border-gray-300 rounded px-3 py-2 w-full"
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
    </ProtegerAdmin>
  );
}