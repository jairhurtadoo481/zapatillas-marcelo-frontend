"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerProductos, eliminarProducto } from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const nombreSucursal = {
  sucursal1: "Sucursal 1",
  sucursal2: "Sucursal 2",
};

const categorias = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "hombre", etiqueta: "Hombre" },
  { valor: "mujer", etiqueta: "Mujer" },
  { valor: "ninios", etiqueta: "Ninios" },
];

const tipos = ["todos", "running", "urbano", "casual", "deportivo", "botines"];

const marcas = [
  "todas",
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
];

const claseSelect = "text-sm border border-gray-300 rounded px-3 py-2 bg-white text-gray-900";

export default function AdminProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroSucursal, setFiltroSucursal] = useState("todas");
  const [filtroMarca, setFiltroMarca] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const data = await obtenerProductos({ limit: 1000 });
      setProductos(data.productos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const manejarEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`Eliminar "${nombre}"? Esta accion no se puede deshacer.`);
    if (!confirmar) return;

    try {
      const token = obtenerToken();
      await eliminarProducto(token, id);
      setProductos(productos.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const manejarDuplicar = (producto) => {
    const copia = {
      codigo: "",
      sucursal: producto.sucursal,
      nombre: producto.nombre,
      modeloBase: producto.modeloBase || "",
      marca: producto.marca,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      categoria: producto.categoria,
      tipo: producto.tipo,
      colores: (producto.colores || []).join(", "),
      tallas: producto.tallas || [],
    };
    sessionStorage.setItem("productoDuplicar", JSON.stringify(copia));
    router.push("/admin/productos/nuevo");
  };

  const productosFiltrados = productos.filter((p) => {
    if (filtroCategoria !== "todos" && p.categoria !== filtroCategoria) return false;
    if (filtroTipo !== "todos" && p.tipo !== filtroTipo) return false;
    if (filtroSucursal !== "todas" && p.sucursal !== filtroSucursal) return false;
    if (filtroMarca !== "todas" && p.marca !== filtroMarca) return false;
    if (busqueda.trim()) {
      const termino = busqueda.trim().toLowerCase();
      const coincideCodigo = p.codigo && p.codigo.toLowerCase().includes(termino);
      const coincideNombre = p.nombre.toLowerCase().includes(termino);
      if (!coincideCodigo && !coincideNombre) return false;
    }
    return true;
  });

  const contarPorCategoria = (categoria) => {
    if (categoria === "todos") return productos.length;
    return productos.filter((p) => p.categoria === categoria).length;
  };

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestion de productos</h1>
            <Link
              href="/admin/productos/nuevo"
              className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              + Nuevo producto
            </Link>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            {categorias.map((c) => (
              <button
                key={c.valor}
                onClick={() => setFiltroCategoria(c.valor)}
                className={`text-sm px-4 py-2 rounded-full border transition ${
                  filtroCategoria === c.valor
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-600 hover:border-black bg-white"
                }`}
              >
                {c.etiqueta} ({contarPorCategoria(c.valor)})
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <select
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
              className={claseSelect}
            >
              {marcas.map((m) => (
                <option key={m} value={m}>
                  {m === "todas" ? "Todas las marcas" : m}
                </option>
              ))}
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className={claseSelect}
            >
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t === "todos" ? "Todos los tipos" : t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filtroSucursal}
              onChange={(e) => setFiltroSucursal(e.target.value)}
              className={claseSelect}
            >
              <option value="todas">Todas las sucursales</option>
              <option value="sucursal1">Sucursal 1</option>
              <option value="sucursal2">Sucursal 2</option>
            </select>

            <input
              type="text"
              placeholder="Buscar por codigo o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-2 flex-1 min-w-[200px] bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          {cargando && <p className="text-gray-500">Cargando...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!cargando && productosFiltrados.length === 0 && (
            <p className="text-gray-500">No hay productos con estos filtros.</p>
          )}

          <div className="flex flex-col gap-3">
            {productosFiltrados.map((producto) => (
              <div
                key={producto._id}
                className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 bg-white"
              >
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {producto.imagenes && producto.imagenes.length > 0 ? (
                    <img
                      src={producto.imagenes[0]}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {producto.codigo && (
                      <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-bold">
                        #{producto.codigo}
                      </span>
                    )}
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      {nombreSucursal[producto.sucursal] || "Sucursal 1"}
                    </span>
                    <p className="text-xs text-gray-500 uppercase">{producto.marca}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{producto.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {producto.categoria} / {producto.tipo} - S/ {producto.precio}
                  </p>
                </div>

                <div className="flex gap-3 text-sm">
                  <Link
                    href={`/admin/productos/${producto._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => manejarDuplicar(producto)}
                    className="text-purple-600 hover:underline"
                  >
                    Duplicar
                  </button>
                  <button
                    onClick={() => manejarEliminar(producto._id, producto.nombre)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}