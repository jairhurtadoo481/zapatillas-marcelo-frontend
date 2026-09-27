"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerToken } from "../../../lib/auth";
import { obtenerReclamosApi, responderReclamoApi } from "../../../lib/api";

const DIAS_PLAZO = 30;

const diasTranscurridos = (fecha) => Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);

const colorPlazo = (dias) => {
  if (dias >= 25) return "text-red-600 font-semibold";
  if (dias >= 15) return "text-yellow-700 font-semibold";
  return "text-gray-500";
};

const formatoFecha = (fecha) =>
  new Date(fecha).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Fila({ etiqueta, children }) {
  return (
    <p className="text-sm text-gray-800">
      <span className="text-gray-500">{etiqueta}: </span>
      {children}
    </p>
  );
}

function TarjetaReclamo({ reclamo, onRespondido }) {
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const c = reclamo.consumidor;
  const dias = diasTranscurridos(reclamo.createdAt);
  const celular = c.telefono.replace(/\D/g, "").slice(-9);

  const guardar = async () => {
    setGuardando(true);
    setError("");
    try {
      await responderReclamoApi(obtenerToken(), reclamo._id, texto);
      onRespondido();
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">
            N° {reclamo.codigo}{" "}
            <span className={`text-xs px-2 py-0.5 rounded ml-1 ${reclamo.tipo === "reclamo" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
              {reclamo.tipo === "reclamo" ? "Reclamo" : "Queja"}
            </span>
          </p>
          <p className="text-xs text-gray-500">{formatoFecha(reclamo.createdAt)}</p>
        </div>
        {reclamo.estado === "pendiente" ? (
          <p className={`text-xs ${colorPlazo(dias)}`}>
            Día {dias} de {DIAS_PLAZO}
          </p>
        ) : (
          <p className="text-xs text-green-700 font-semibold">RESPONDIDO</p>
        )}
      </div>

      <Fila etiqueta="Cliente">
        {c.nombre} ({c.tipoDocumento} {c.documento})
      </Fila>
      <Fila etiqueta="Contacto">
        {celular.length === 9 ? (
          <a href={`https://wa.me/51${celular}`} target="_blank" rel="noopener noreferrer" className="underline text-green-700">
            {c.telefono}
          </a>
        ) : (
          c.telefono
        )}{" "}
        ·{" "}
        <a href={`mailto:${c.correo}`} className="underline">
          {c.correo}
        </a>
      </Fila>
      <Fila etiqueta="Domicilio">{c.domicilio}</Fila>
      {reclamo.esMenor && (
        <Fila etiqueta="Menor de edad, apoderado">
          {reclamo.apoderado.nombre} ({reclamo.apoderado.documento})
        </Fila>
      )}
      <Fila etiqueta={reclamo.bien.tipo === "producto" ? "Producto" : "Servicio"}>
        {reclamo.bien.descripcion}
        {reclamo.bien.monto ? ` · S/ ${reclamo.bien.monto}` : ""}
        {reclamo.bien.numeroPedido ? ` · Pedido #${reclamo.bien.numeroPedido}` : ""}
      </Fila>

      <div className="bg-gray-50 rounded p-3 space-y-2">
        <p className="text-sm text-gray-800 whitespace-pre-line">
          <span className="font-semibold">Detalle:</span> {reclamo.detalle}
        </p>
        <p className="text-sm text-gray-800 whitespace-pre-line">
          <span className="font-semibold">Solicita:</span> {reclamo.pedidoConsumidor}
        </p>
      </div>

      {reclamo.estado === "respondido" ? (
        <div className="border-l-4 border-green-500 pl-3">
          <p className="text-xs text-gray-500">Respuesta del {formatoFecha(reclamo.respuesta.fecha)}</p>
          <p className="text-sm text-gray-800 whitespace-pre-line">{reclamo.respuesta.texto}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            maxLength={3000}
            placeholder="Escribe la respuesta o solución que le diste al cliente"
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900 bg-white"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            onClick={guardar}
            disabled={guardando || !texto.trim()}
            className="bg-black text-white text-sm px-4 py-2 rounded disabled:opacity-40"
          >
            {guardando ? "Guardando..." : "Guardar respuesta"}
          </button>
          <p className="text-xs text-gray-500">
            Esto solo registra la respuesta aquí. Recuerda comunicársela al cliente por teléfono, WhatsApp o correo.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminReclamosPage() {
  const [estado, setEstado] = useState("pendiente");
  const [recarga, setRecarga] = useState(0);
  const [resultado, setResultado] = useState({ clave: null, lista: [], error: "" });

  const clave = `${estado}:${recarga}`;
  const cargando = resultado.clave !== clave;

  useEffect(() => {
    let activo = true;
    obtenerReclamosApi(obtenerToken(), estado)
      .then((lista) => activo && setResultado({ clave: `${estado}:${recarga}`, lista, error: "" }))
      .catch((err) => activo && setResultado({ clave: `${estado}:${recarga}`, lista: [], error: err.message }));
    return () => {
      activo = false;
    };
  }, [estado, recarga]);

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/admin" className="text-sm text-gray-500 hover:underline">
            ← Panel admin
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-1">Libro de Reclamaciones</h1>
          <p className="text-sm text-gray-500 mb-6">
            Debes responder cada reclamo en un máximo de {DIAS_PLAZO} días calendario.
          </p>

          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              ["pendiente", "Pendientes"],
              ["respondido", "Respondidos"],
            ].map(([valor, etiqueta]) => (
              <button
                key={valor}
                onClick={() => setEstado(valor)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  estado === valor ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          {cargando && <p className="text-gray-500 text-sm">Cargando...</p>}
          {!cargando && resultado.error && <p className="text-red-600 text-sm">{resultado.error}</p>}
          {!cargando && !resultado.error && resultado.lista.length === 0 && (
            <p className="text-gray-500 text-sm">
              {estado === "pendiente" ? "No hay reclamos pendientes." : "Aún no hay reclamos respondidos."}
            </p>
          )}
          {!cargando && (
            <div className="space-y-3">
              {resultado.lista.map((reclamo) => (
                <TarjetaReclamo key={reclamo._id} reclamo={reclamo} onRespondido={() => setRecarga((n) => n + 1)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtegerAdmin>
  );
}
