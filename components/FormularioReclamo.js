"use client";

import { useState } from "react";
import Link from "next/link";
import { crearReclamoApi } from "../lib/api";
import { NEGOCIO } from "../lib/negocio";

const claseInput = "border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400 w-full text-sm";
const claseEtiqueta = "text-xs font-semibold text-gray-600 mb-1 block";

const FORMULARIO_INICIAL = {
  tipo: "reclamo",
  nombre: "",
  tipoDocumento: "DNI",
  documento: "",
  domicilio: "",
  telefono: "",
  correo: "",
  esMenor: false,
  apoderadoNombre: "",
  apoderadoDocumento: "",
  bienTipo: "producto",
  bienDescripcion: "",
  monto: "",
  numeroPedido: "",
  detalle: "",
  pedidoConsumidor: "",
  aceptaPrivacidad: false,
};

function Campo({ etiqueta, children }) {
  return (
    <div>
      <label className={claseEtiqueta}>{etiqueta}</label>
      {children}
    </div>
  );
}

function Bloque({ titulo, children }) {
  return (
    <section className="border border-gray-200 rounded-lg p-4 space-y-3">
      <h2 className="font-semibold text-gray-900">{titulo}</h2>
      {children}
    </section>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <p className="text-sm text-gray-800">
      <span className="font-semibold">{etiqueta}:</span> {valor || "-"}
    </p>
  );
}

function Constancia({ reclamo }) {
  const fecha = new Date(reclamo.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="bg-white min-h-screen">
      <style>{"@media print { header, footer { display: none !important; } }"}</style>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="border border-green-300 bg-green-50 text-green-800 rounded-lg p-4 mb-6 text-sm print:hidden">
          <p className="font-semibold">{reclamo.tipo === "reclamo" ? "Tu reclamo fue registrado." : "Tu queja fue registrada."}</p>
          <p>
            Guarda o imprime esta constancia con tu número. Te responderemos en un plazo máximo de 30 días calendario,
            por el correo o el teléfono que indicaste.
          </p>
        </div>

        <div className="border border-gray-300 rounded-lg p-5 space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hoja de Reclamación</h1>
              <p className="text-xs text-gray-500">Libro de Reclamaciones virtual</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">N°</p>
              <p className="text-lg font-bold text-gray-900">{reclamo.codigo}</p>
              <p className="text-xs text-gray-500">{fecha}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase">Proveedor</p>
            <Dato etiqueta="Razón social" valor={`${NEGOCIO.nombreComercial} - ${NEGOCIO.titular}`} />
            <Dato etiqueta="RUC" valor={NEGOCIO.ruc} />
            <Dato etiqueta="Domicilio" valor={NEGOCIO.direccion} />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase">Consumidor</p>
            <Dato etiqueta="Nombre" valor={reclamo.consumidor.nombre} />
            <Dato etiqueta={reclamo.consumidor.tipoDocumento} valor={reclamo.consumidor.documento} />
            <Dato etiqueta="Domicilio" valor={reclamo.consumidor.domicilio} />
            <Dato etiqueta="Teléfono" valor={reclamo.consumidor.telefono} />
            <Dato etiqueta="Correo" valor={reclamo.consumidor.correo} />
            {reclamo.esMenor && (
              <Dato etiqueta="Padre, madre o tutor" valor={`${reclamo.apoderado.nombre} (${reclamo.apoderado.documento})`} />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase">Bien contratado</p>
            <Dato etiqueta="Tipo" valor={reclamo.bien.tipo === "producto" ? "Producto" : "Servicio"} />
            <Dato etiqueta="Descripción" valor={reclamo.bien.descripcion} />
            <Dato etiqueta="Monto reclamado" valor={reclamo.bien.monto ? `S/ ${reclamo.bien.monto}` : ""} />
            <Dato etiqueta="N° de pedido" valor={reclamo.bien.numeroPedido} />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Detalle {reclamo.tipo === "reclamo" ? "del reclamo" : "de la queja"}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-line">{reclamo.detalle}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase pt-2">Pedido del consumidor</p>
            <p className="text-sm text-gray-800 whitespace-pre-line">{reclamo.pedidoConsumidor}</p>
          </div>

          <p className="text-xs text-gray-500 border-t border-gray-200 pt-3">
            La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo
            para interponer una denuncia ante el INDECOPI. El proveedor debe dar respuesta al reclamo en un plazo no
            mayor a treinta (30) días calendario, pudiendo ampliar el plazo hasta por treinta (30) días más, previa
            comunicación al consumidor.
          </p>
        </div>

        <div className="flex gap-3 mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-black text-white rounded px-5 py-2 text-sm font-semibold hover:bg-gray-800 transition"
          >
            Imprimir o guardar PDF
          </button>
          <Link href="/" className="border border-gray-300 text-gray-800 rounded px-5 py-2 text-sm font-semibold">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FormularioReclamo() {
  const [form, setForm] = useState(FORMULARIO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [constancia, setConstancia] = useState(null);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const reclamo = await crearReclamoApi({
        tipo: form.tipo,
        aceptaPrivacidad: form.aceptaPrivacidad,
        consumidor: {
          nombre: form.nombre,
          tipoDocumento: form.tipoDocumento,
          documento: form.documento,
          domicilio: form.domicilio,
          telefono: form.telefono,
          correo: form.correo,
        },
        esMenor: form.esMenor,
        apoderado: { nombre: form.apoderadoNombre, documento: form.apoderadoDocumento },
        bien: {
          tipo: form.bienTipo,
          descripcion: form.bienDescripcion,
          monto: form.monto,
          numeroPedido: form.numeroPedido,
        },
        detalle: form.detalle,
        pedidoConsumidor: form.pedidoConsumidor,
      });
      setConstancia(reclamo);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (constancia) return <Constancia reclamo={constancia} />;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Libro de Reclamaciones</h1>
        <p className="text-sm text-gray-600 mb-6">
          Completa esta hoja si tienes un reclamo o una queja. Al enviarla recibirás una constancia con tu número.
        </p>

        <form onSubmit={enviar} className="space-y-5">
          <Bloque titulo="1. Identificación del proveedor">
            <p className="text-sm text-gray-700">
              {NEGOCIO.nombreComercial} - {NEGOCIO.titular}
              <br />
              RUC {NEGOCIO.ruc}
              <br />
              {NEGOCIO.direccion}
            </p>
          </Bloque>

          <Bloque titulo="2. Tus datos">
            <Campo etiqueta="Nombre completo">
              <input name="nombre" value={form.nombre} onChange={cambiar} className={claseInput} maxLength={120} required />
            </Campo>
            <div className="grid grid-cols-3 gap-3">
              <Campo etiqueta="Documento">
                <select name="tipoDocumento" value={form.tipoDocumento} onChange={cambiar} className={claseInput}>
                  <option value="DNI">DNI</option>
                  <option value="CE">Carné de extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="RUC">RUC</option>
                </select>
              </Campo>
              <div className="col-span-2">
                <Campo etiqueta="Número de documento">
                  <input name="documento" value={form.documento} onChange={cambiar} className={claseInput} maxLength={20} required />
                </Campo>
              </div>
            </div>
            <Campo etiqueta="Domicilio">
              <input name="domicilio" value={form.domicilio} onChange={cambiar} className={claseInput} maxLength={200} required />
            </Campo>
            <div className="grid sm:grid-cols-2 gap-3">
              <Campo etiqueta="Teléfono o celular">
                <input name="telefono" inputMode="tel" value={form.telefono} onChange={cambiar} className={claseInput} maxLength={20} required />
              </Campo>
              <Campo etiqueta="Correo electrónico">
                <input name="correo" type="email" value={form.correo} onChange={cambiar} className={claseInput} maxLength={120} required />
              </Campo>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input type="checkbox" name="esMenor" checked={form.esMenor} onChange={cambiar} />
              Soy menor de edad
            </label>
            {form.esMenor && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Campo etiqueta="Nombre del padre, madre o tutor">
                  <input name="apoderadoNombre" value={form.apoderadoNombre} onChange={cambiar} className={claseInput} maxLength={120} required />
                </Campo>
                <Campo etiqueta="Documento del padre, madre o tutor">
                  <input name="apoderadoDocumento" value={form.apoderadoDocumento} onChange={cambiar} className={claseInput} maxLength={20} required />
                </Campo>
              </div>
            )}
          </Bloque>

          <Bloque titulo="3. Bien contratado">
            <div className="flex gap-5 text-sm text-gray-800">
              <label className="flex items-center gap-2">
                <input type="radio" name="bienTipo" value="producto" checked={form.bienTipo === "producto"} onChange={cambiar} />
                Producto
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="bienTipo" value="servicio" checked={form.bienTipo === "servicio"} onChange={cambiar} />
                Servicio
              </label>
            </div>
            <Campo etiqueta="Descripción (ej. Zapatillas Joma talla 40)">
              <input name="bienDescripcion" value={form.bienDescripcion} onChange={cambiar} className={claseInput} maxLength={300} required />
            </Campo>
            <div className="grid sm:grid-cols-2 gap-3">
              <Campo etiqueta="Monto reclamado en S/ (opcional)">
                <input name="monto" type="number" min="0" step="0.01" value={form.monto} onChange={cambiar} className={claseInput} />
              </Campo>
              <Campo etiqueta="N° de pedido (opcional)">
                <input name="numeroPedido" value={form.numeroPedido} onChange={cambiar} className={claseInput} maxLength={30} />
              </Campo>
            </div>
          </Bloque>

          <Bloque titulo="4. Detalle del reclamo o queja">
            <div className="space-y-2 text-sm text-gray-800">
              <label className="flex items-start gap-2">
                <input type="radio" name="tipo" value="reclamo" checked={form.tipo === "reclamo"} onChange={cambiar} className="mt-1" />
                <span>
                  <span className="font-semibold">Reclamo:</span> disconformidad relacionada con los productos o servicios.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input type="radio" name="tipo" value="queja" checked={form.tipo === "queja"} onChange={cambiar} className="mt-1" />
                <span>
                  <span className="font-semibold">Queja:</span> disconformidad no relacionada con los productos o servicios,
                  o malestar por la atención al público.
                </span>
              </label>
            </div>
            <Campo etiqueta="Detalle">
              <textarea name="detalle" value={form.detalle} onChange={cambiar} rows={4} maxLength={3000} className={claseInput} required />
            </Campo>
            <Campo etiqueta="Pedido del consumidor (qué solicitas)">
              <textarea name="pedidoConsumidor" value={form.pedidoConsumidor} onChange={cambiar} rows={3} maxLength={2000} className={claseInput} required />
            </Campo>
          </Bloque>

          <label className="flex items-start gap-2 text-sm text-gray-800">
            <input type="checkbox" name="aceptaPrivacidad" checked={form.aceptaPrivacidad} onChange={cambiar} className="mt-1" required />
            <span>
              Declaro que los datos consignados son ciertos y acepto la{" "}
              <Link href="/privacidad" target="_blank" className="underline text-blue-700">
                Política de Privacidad
              </Link>{" "}
              para el tratamiento de mis datos en la atención de este reclamo.
            </span>
          </label>

          <p className="text-xs text-gray-500">
            La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo
            para interponer una denuncia ante el INDECOPI. El proveedor debe dar respuesta al reclamo en un plazo no
            mayor a treinta (30) días calendario, pudiendo ampliar el plazo hasta por treinta (30) días más, previa
            comunicación al consumidor.
          </p>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-black text-white rounded py-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Enviar hoja de reclamación"}
          </button>
        </form>
      </div>
    </div>
  );
}
