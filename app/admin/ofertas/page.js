"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerProductos, obtenerOfertasAdmin, crearOfertas, terminarOfertas } from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const MAX_PORCENTAJE = 90;
const POR_PAGINA = 60;

const duraciones = [
  { valor: "24", etiqueta: "24 horas" },
  { valor: "72", etiqueta: "3 dias" },
  { valor: "168", etiqueta: "1 semana" },
  { valor: "336", etiqueta: "2 semanas" },
  { valor: "otra", etiqueta: "Elegir fecha" },
];

const claseInput = "text-sm border border-gray-300 rounded px-3 py-2 bg-white text-gray-900";
const claseBoton = "text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition disabled:opacity-40";

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;

const aInputDatetime = (fecha) => {
  const d = new Date(fecha);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const ahoraMs = () => Date.now();

const tiempoRestante = (fin) => {
  const falta = new Date(fin).getTime() - ahoraMs();
  if (falta <= 0) return "terminando";
  const minutos = Math.floor(falta / 60000);
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  if (dias > 0) return `${dias} d ${horas} h`;
  if (horas > 0) return `${horas} h ${minutos % 60} min`;
  return `${Math.max(minutos, 1)} min`;
};

const stockTotal = (producto) => (producto.tallas || []).reduce((acc, t) => acc + (t.stock || 0), 0);

// Misma cuenta que hace el servidor, para mostrar la vista previa antes de confirmar.
const redondear2 = (n) => Math.round(n * 100) / 100;

const calcularPrecioOferta = (precio, tipo, valor, redondeo) => {
  const bruto = tipo === "porcentaje" ? precio * (1 - valor / 100) : precio - valor;
  if (redondeo === "entero") return Math.floor(bruto);
  if (redondeo === "90") {
    const candidato = Math.floor(bruto) + 0.9;
    return redondear2(candidato > bruto ? candidato - 1 : candidato);
  }
  return redondear2(bruto);
};

const calcularFin = ({ programar, inicio, duracion, finManual }) => {
  if (duracion === "otra") return finManual ? new Date(finManual) : null;
  const base = programar && inicio ? new Date(inicio) : new Date(ahoraMs());
  return new Date(base.getTime() + Number(duracion) * 3600000);
};

export default function AdminOfertasPage() {
  const [pestana, setPestana] = useState("activas");
  const [ofertas, setOfertas] = useState({ activas: [], programadas: [] });
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState(null);
  const [trabajando, setTrabajando] = useState(false);

  const [terminar, setTerminar] = useState(() => new Set());

  const [busqueda, setBusqueda] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("todas");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [soloConStock, setSoloConStock] = useState(true);
  const [limite, setLimite] = useState(POR_PAGINA);
  const [seleccion, setSeleccion] = useState(() => new Set());

  const [tipo, setTipo] = useState("porcentaje");
  const [valor, setValor] = useState("");
  const [redondeo, setRedondeo] = useState("ninguno");
  const [programar, setProgramar] = useState(false);
  const [inicio, setInicio] = useState("");
  const [duracion, setDuracion] = useState("72");
  const [finManual, setFinManual] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const token = obtenerToken();
      // Primero las ofertas: el servidor limpia las vencidas antes de listar.
      const datosOfertas = await obtenerOfertasAdmin(token);
      const datosProductos = await obtenerProductos({ limit: 1000 });
      setOfertas(datosOfertas);
      setProductos(datosProductos.productos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const idsEnOferta = useMemo(
    () => new Set([...ofertas.activas, ...ofertas.programadas].map((o) => o._id)),
    [ofertas]
  );

  const marcas = useMemo(() => [...new Set(productos.map((p) => p.marca))].sort(), [productos]);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (filtroMarca !== "todas" && p.marca !== filtroMarca) return false;
      if (filtroCategoria !== "todas" && p.categoria !== filtroCategoria) return false;
      if (soloConStock && stockTotal(p) <= 0) return false;
      if (termino) {
        const enNombre = p.nombre.toLowerCase().includes(termino);
        const enCodigo = p.codigo && p.codigo.toLowerCase().includes(termino);
        if (!enNombre && !enCodigo) return false;
      }
      return true;
    });
  }, [productos, busqueda, filtroMarca, filtroCategoria, soloConStock]);

  const cambiarFiltro = (setter) => (e) => {
    setter(e.target.value);
    setLimite(POR_PAGINA);
  };

  const alternar = (conjunto, setConjunto, id) => {
    const copia = new Set(conjunto);
    if (copia.has(id)) copia.delete(id);
    else copia.add(id);
    setConjunto(copia);
  };

  const valorNumero = Number(valor);
  const valorValido =
    Number.isFinite(valorNumero) && valorNumero > 0 && (tipo !== "porcentaje" || valorNumero <= MAX_PORCENTAJE);

  const fechaInicio = programar && inicio ? new Date(inicio) : null;
  const fechaFin = calcularFin({ programar, inicio, duracion, finManual });
  const fechasValidas =
    fechaFin !== null &&
    !Number.isNaN(fechaFin.getTime()) &&
    fechaFin.getTime() > ahoraMs() &&
    (!programar || (fechaInicio && !Number.isNaN(fechaInicio.getTime()) && fechaFin > fechaInicio));

  const vistaPrevia = useMemo(() => {
    if (!valorValido) return [];
    return productos
      .filter((p) => seleccion.has(p._id))
      .map((p) => {
        const nuevo = calcularPrecioOferta(p.precio, tipo, valorNumero, redondeo);
        const valido = nuevo > 0 && nuevo < p.precio;
        return {
          producto: p,
          nuevo,
          valido,
          porcentaje: valido ? Math.round((1 - nuevo / p.precio) * 100) : 0,
          reemplaza: idsEnOferta.has(p._id),
        };
      });
  }, [productos, seleccion, tipo, valorNumero, valorValido, redondeo, idsEnOferta]);

  const aplicables = vistaPrevia.filter((v) => v.valido).length;

  const aplicarOferta = async () => {
    const mensaje = `Crear la oferta para ${aplicables} producto(s)?\nTermina el ${formatearFecha(fechaFin)}`;
    if (!window.confirm(mensaje)) return;

    setTrabajando(true);
    setAviso(null);
    try {
      const resultado = await crearOfertas(obtenerToken(), {
        ids: [...seleccion],
        tipo,
        valor: valorNumero,
        redondeo,
        inicio: fechaInicio ? fechaInicio.toISOString() : null,
        fin: fechaFin.toISOString(),
      });
      setAviso({
        tipo: "ok",
        texto: `Oferta creada para ${resultado.aplicados.length} producto(s).`,
        detalle: resultado.omitidos.map((o) => `${o.nombre || o._id}: ${o.motivo}`),
      });
      setSeleccion(new Set());
      setValor("");
      await cargar();
      setPestana(fechaInicio && fechaInicio.getTime() > ahoraMs() ? "programadas" : "activas");
    } catch (err) {
      setAviso({ tipo: "error", texto: err.message, detalle: [] });
    } finally {
      setTrabajando(false);
    }
  };

  const terminarSeleccionadas = async (ids) => {
    if (ids.length === 0) return;
    if (!window.confirm(`Terminar ${ids.length} oferta(s) ahora? Los productos vuelven a su precio normal.`)) return;

    setTrabajando(true);
    setAviso(null);
    try {
      const resultado = await terminarOfertas(obtenerToken(), ids);
      setAviso({ tipo: "ok", texto: `${resultado.terminadas} oferta(s) terminada(s).`, detalle: [] });
      setTerminar(new Set());
      await cargar();
    } catch (err) {
      setAviso({ tipo: "error", texto: err.message, detalle: [] });
    } finally {
      setTrabajando(false);
    }
  };

  const listaPestana = pestana === "activas" ? ofertas.activas : ofertas.programadas;

  const botonPestana = (clave, etiqueta) => (
    <button
      key={clave}
      onClick={() => setPestana(clave)}
      className={`text-sm px-4 py-2 rounded-full border transition ${
        pestana === clave ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
      }`}
    >
      {etiqueta}
    </button>
  );

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Ofertas</h1>
            <Link href="/admin" className="text-sm text-gray-600 hover:underline">
              Volver al panel
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Descuentos por tiempo limitado solo para la tienda web. Al llegar la fecha de fin, el producto vuelve solo a su
            precio normal. En la tienda fisica se cobra siempre el precio normal.
          </p>

          <div className="flex gap-2 mb-6 flex-wrap">
            {botonPestana("activas", `Activas (${ofertas.activas.length})`)}
            {botonPestana("programadas", `Programadas (${ofertas.programadas.length})`)}
            {botonPestana("nueva", "+ Nueva oferta")}
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          {aviso && (
            <div
              className={`rounded-lg border p-3 mb-6 text-sm ${
                aviso.tipo === "ok" ? "border-green-300 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-700"
              }`}
            >
              <p className="font-semibold">{aviso.texto}</p>
              {aviso.detalle.length > 0 && (
                <ul className="mt-1 list-disc pl-5">
                  {aviso.detalle.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {cargando && <p className="text-gray-500">Cargando...</p>}

          {!cargando && pestana !== "nueva" && (
            <div>
              {listaPestana.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  <p className="mb-3">
                    {pestana === "activas" ? "No hay ofertas activas ahora." : "No hay ofertas programadas."}
                  </p>
                  <button onClick={() => setPestana("nueva")} className={claseBoton}>
                    Crear una oferta
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={terminar.size === listaPestana.length}
                        onChange={(e) =>
                          setTerminar(e.target.checked ? new Set(listaPestana.map((o) => o._id)) : new Set())
                        }
                      />
                      Seleccionar todas
                    </label>
                    <button
                      onClick={() => terminarSeleccionadas([...terminar])}
                      disabled={terminar.size === 0 || trabajando}
                      className="text-sm border border-red-300 text-red-700 px-4 py-2 rounded hover:bg-red-50 transition disabled:opacity-40"
                    >
                      Terminar seleccionadas ({terminar.size})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {listaPestana.map((o) => {
                      const porcentaje = Math.round((1 - o.precioOferta / o.precio) * 100);
                      return (
                        <div
                          key={o._id}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-3 border border-gray-200 rounded-lg p-3"
                        >
                          <input
                            type="checkbox"
                            checked={terminar.has(o._id)}
                            onChange={() => alternar(terminar, setTerminar, o._id)}
                          />
                          {o.imagen ? (
                            <img src={o.imagen} alt="" className="w-12 h-12 object-cover rounded bg-gray-100" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100" />
                          )}
                          <div className="flex-1 min-w-[150px]">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{o.nombre}</p>
                            <p className="text-xs text-gray-500">
                              {o.marca}
                              {o.codigo ? ` · ${o.codigo}` : ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pestana === "activas"
                                ? `Termina ${formatearFecha(o.ofertaFin)} · faltan ${tiempoRestante(o.ofertaFin)}`
                                : `Empieza ${formatearFecha(o.ofertaInicio)} · termina ${formatearFecha(o.ofertaFin)}`}
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            <div className="flex sm:block items-baseline gap-2 sm:text-right">
                              <p className="text-sm font-bold text-red-600">{soles(o.precioOferta)}</p>
                              <p className="text-xs text-gray-400 line-through">{soles(o.precio)}</p>
                              <p className="text-xs font-semibold text-red-600">-{porcentaje}%</p>
                            </div>
                            <button
                              onClick={() => terminarSeleccionadas([o._id])}
                              disabled={trabajando}
                              className="text-xs text-red-600 hover:underline disabled:opacity-40"
                            >
                              Terminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {!cargando && pestana === "nueva" && (
            <div className="grid grid-cols-1 gap-8">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Elige las zapatillas</h2>

                <div className="flex gap-2 flex-wrap mb-3">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={cambiarFiltro(setBusqueda)}
                    placeholder="Buscar por nombre o codigo"
                    className={`${claseInput} flex-1 min-w-[180px]`}
                  />
                  <select value={filtroMarca} onChange={cambiarFiltro(setFiltroMarca)} className={claseInput}>
                    <option value="todas">Todas las marcas</option>
                    {marcas.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select value={filtroCategoria} onChange={cambiarFiltro(setFiltroCategoria)} className={claseInput}>
                    <option value="todas">Todas las categorias</option>
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                    <option value="ninios">Ninios</option>
                  </select>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={soloConStock}
                      onChange={(e) => {
                        setSoloConStock(e.target.checked);
                        setLimite(POR_PAGINA);
                      }}
                    />
                    Solo con stock
                  </label>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">
                      {filtrados.length} producto(s) · <strong className="text-gray-900">{seleccion.size} elegido(s)</strong>
                    </span>
                    <button
                      onClick={() => setSeleccion(new Set([...seleccion, ...filtrados.map((p) => p._id)]))}
                      disabled={filtrados.length === 0}
                      className="text-blue-700 hover:underline disabled:opacity-40"
                    >
                      Elegir los {filtrados.length}
                    </button>
                    <button
                      onClick={() => setSeleccion(new Set())}
                      disabled={seleccion.size === 0}
                      className="text-gray-600 hover:underline disabled:opacity-40"
                    >
                      Quitar todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {filtrados.slice(0, limite).map((p) => (
                    <label
                      key={p._id}
                      className={`flex items-center gap-3 border rounded-lg p-2 cursor-pointer ${
                        seleccion.has(p._id) ? "border-black bg-gray-50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={seleccion.has(p._id)}
                        onChange={() => alternar(seleccion, setSeleccion, p._id)}
                      />
                      {p.imagenes && p.imagenes[0] ? (
                        <img src={p.imagenes[0]} alt="" loading="lazy" className="w-10 h-10 object-cover rounded bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{p.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {p.marca}
                          {p.codigo ? ` · ${p.codigo}` : ""} · stock {stockTotal(p)}
                          {idsEnOferta.has(p._id) && <span className="text-red-600 font-semibold"> · ya en oferta</span>}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{soles(p.precio)}</p>
                    </label>
                  ))}
                </div>

                {filtrados.length > limite && (
                  <button onClick={() => setLimite(limite + POR_PAGINA)} className="mt-3 text-sm text-blue-700 hover:underline">
                    Mostrar mas ({filtrados.length - limite} restantes)
                  </button>
                )}
                {filtrados.length === 0 && <p className="text-sm text-gray-500">No hay productos con esos filtros.</p>}
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Descuento y duracion</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Descuento</p>
                    <div className="flex gap-2">
                      <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={claseInput}>
                        <option value="porcentaje">Porcentaje (%)</option>
                        <option value="monto">Monto fijo (S/)</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        placeholder={tipo === "porcentaje" ? "Ej: 20" : "Ej: 30"}
                        className={`${claseInput} w-28`}
                      />
                    </div>
                    {valor !== "" && !valorValido && (
                      <p className="text-xs text-red-600 mt-1">
                        {tipo === "porcentaje" ? `Debe ser mayor a 0 y hasta ${MAX_PORCENTAJE}%` : "Debe ser mayor a 0"}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Redondeo del precio</p>
                    <select value={redondeo} onChange={(e) => setRedondeo(e.target.value)} className={`${claseInput} w-full`}>
                      <option value="ninguno">Sin redondeo (con centimos)</option>
                      <option value="entero">A soles enteros, hacia abajo</option>
                      <option value="90">Terminar en .90, hacia abajo</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Empieza</p>
                    <div className="flex gap-4 text-sm text-gray-700 mb-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          checked={!programar}
                          onChange={() => setProgramar(false)}
                        />
                        Ahora
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          checked={programar}
                          onChange={() => {
                            setProgramar(true);
                            if (!inicio) setInicio(aInputDatetime(ahoraMs() + 3600000));
                          }}
                        />
                        Programar
                      </label>
                    </div>
                    {programar && (
                      <input
                        type="datetime-local"
                        value={inicio}
                        onChange={(e) => setInicio(e.target.value)}
                        className={claseInput}
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Dura</p>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {duraciones.map((d) => (
                        <button
                          key={d.valor}
                          onClick={() => setDuracion(d.valor)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition ${
                            duracion === d.valor
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                          }`}
                        >
                          {d.etiqueta}
                        </button>
                      ))}
                    </div>
                    {duracion === "otra" && (
                      <input
                        type="datetime-local"
                        value={finManual}
                        onChange={(e) => setFinManual(e.target.value)}
                        className={claseInput}
                      />
                    )}
                  </div>
                </div>

                {fechaFin && !Number.isNaN(fechaFin.getTime()) && (
                  <p className="text-sm text-gray-600 mt-3">
                    {programar && fechaInicio ? `Empieza el ${formatearFecha(fechaInicio)} y termina` : "Empieza ahora y termina"}{" "}
                    el <strong>{formatearFecha(fechaFin)}</strong>
                  </p>
                )}
                {fechaFin && !fechasValidas && (
                  <p className="text-xs text-red-600 mt-1">
                    La fecha de fin debe estar en el futuro y despues del inicio.
                  </p>
                )}
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Vista previa</h2>

                {seleccion.size === 0 && <p className="text-sm text-gray-500">Elige al menos una zapatilla.</p>}
                {seleccion.size > 0 && !valorValido && (
                  <p className="text-sm text-gray-500">Pon el descuento para ver los precios nuevos.</p>
                )}

                {vistaPrevia.length > 0 && (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    {vistaPrevia.map((v) => (
                      <div key={v.producto._id} className="flex items-center gap-3 p-2 text-sm">
                        <p className="flex-1 min-w-0 truncate text-gray-900">{v.producto.nombre}</p>
                        {v.valido ? (
                          <>
                            <span className="text-gray-400 line-through">{soles(v.producto.precio)}</span>
                            <span className="font-bold text-red-600">{soles(v.nuevo)}</span>
                            <span className="text-xs font-semibold text-red-600 w-10 text-right">-{v.porcentaje}%</span>
                          </>
                        ) : (
                          <span className="text-xs text-red-600">Se omite: precio no valido</span>
                        )}
                        {v.reemplaza && v.valido && <span className="text-xs text-amber-600">reemplaza oferta</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={aplicarOferta}
                    disabled={trabajando || aplicables === 0 || !fechasValidas}
                    className={claseBoton}
                  >
                    {trabajando ? "Creando..." : `Crear oferta (${aplicables})`}
                  </button>
                  {vistaPrevia.length > aplicables && (
                    <span className="text-xs text-red-600">{vistaPrevia.length - aplicables} se omitiran</span>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </ProtegerAdmin>
  );
}
