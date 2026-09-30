"use client";
import { useEffect, useState } from "react";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerToken } from "../../../lib/auth";
import {
  obtenerConfigFacturacion,
  guardarDatosEmpresaFacturacion,
  guardarCredencialesSolApi,
  subirCertificadoFacturacion,
  buscarDocumentoFacturacion,
  guardarClienteApi,
  emitirComprobanteApi,
  obtenerComprobantes,
  emitirNotaCreditoApi,
  obtenerFactilizaTokensApi,
  agregarFactilizaTokenApi,
  actualizarFactilizaTokenApi,
  eliminarFactilizaTokenApi,
  reenviarComprobanteApi,
  descargarReporteCsv,
  descargarReporteZip,
  enviarReporteGoogleSheetsApi,
  desbloquearFacturacionApi,
  bloquearFacturacion,
  tieneDesbloqueoFacturacion,
} from "../../../lib/api";

const MOTIVOS_NOTA_CREDITO = [
  ["01", "Anulacion de la operacion"],
  ["02", "Anulacion por error en el RUC"],
  ["03", "Correccion por error en la descripcion"],
  ["04", "Descuento global"],
  ["05", "Descuento por item"],
  ["06", "Devolucion total"],
  ["07", "Devolucion por item"],
  ["10", "Otros conceptos"],
];

const CLIENTE_VACIO = {
  tipoDocumento: "DNI",
  documento: "",
  nombre: "",
  direccion: "",
  telefono: "",
  correo: "",
  contacto: "",
  referencia: "",
};
const UNIDADES_MEDIDA = ["UNIDAD", "PAR", "DOCENA", "CAJA"];
const CUENTAS_PAGO = ["EFECTIVO", "YAPE", "PLIN", "TRANSFERENCIA", "TARJETA"];
const DOCUMENTO_CLIENTE_VARIOS = "00000000";
const LIMITE_BOLETA_SIN_IDENTIFICAR = 700;
const CLIENTE_VARIOS = {
  tipoDocumento: "DNI",
  documento: DOCUMENTO_CLIENTE_VARIOS,
  nombre: "CLIENTE VARIOS",
  direccion: "",
  telefono: "",
  correo: "",
  contacto: "",
  referencia: "",
};
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const descargarBlob = (blob, nombre) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function FacturacionPage() {
  return (
    <ProtegerAdmin>
      <AccesoFacturacion />
    </ProtegerAdmin>
  );
}

function AccesoFacturacion() {
  const [desbloqueado, setDesbloqueado] = useState(() => tieneDesbloqueoFacturacion());

  useEffect(() => {
    const alBloquear = () => setDesbloqueado(false);
    window.addEventListener("facturacion-bloqueada", alBloquear);
    return () => window.removeEventListener("facturacion-bloqueada", alBloquear);
  }, []);

  if (!desbloqueado) {
    return <PantallaBloqueo onDesbloqueado={() => setDesbloqueado(true)} />;
  }
  return <PanelFacturacion />;
}

function PantallaBloqueo({ onDesbloqueado }) {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const desbloquear = async (e) => {
    e.preventDefault();
    if (!codigo) return;
    setEnviando(true);
    setError("");
    try {
      await desbloquearFacturacionApi(obtenerToken(), codigo);
      onDesbloqueado();
    } catch (err) {
      setError(err.message);
      setCodigo("");
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-sm mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Facturacion Electronica</h1>
        <p className="text-sm text-gray-500 mb-6">Ingresa el codigo de acceso para continuar.</p>
        <form onSubmit={desbloquear} className="space-y-3">
          <input
            type="password"
            autoFocus
            placeholder="Codigo de acceso"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={enviando} className="bg-gray-900 text-white text-sm px-4 py-2 rounded w-full">
            {enviando ? "Verificando..." : "Desbloquear"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PanelFacturacion() {
  const [tab, setTab] = useState("emitir");
  const [config, setConfig] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarConfig = async () => {
    try {
      const token = obtenerToken();
      const data = await obtenerConfigFacturacion(token);
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarConfig();
  }, []);

  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Facturacion Electronica</h1>
            <button
              onClick={bloquearFacturacion}
              className="border border-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded"
            >
              Bloquear
            </button>
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              ["emitir", "Emitir"],
              ["historial", "Historial"],
              ["configuracion", "Configuracion"],
            ].map(([valor, etiqueta]) => (
              <button
                key={valor}
                onClick={() => setTab(valor)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  tab === valor ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {cargando ? (
            <p className="text-gray-500">Cargando...</p>
          ) : (
            <>
              {tab === "configuracion" && (
                <TabConfiguracion config={config} recargar={cargarConfig} />
              )}
              {tab === "emitir" && <TabEmitir config={config} recargar={cargarConfig} />}
              {tab === "historial" && <TabHistorial />}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function TabConfiguracion({ config, recargar }) {
  const [empresa, setEmpresa] = useState({
    ruc: config.ruc || "",
    razonSocial: config.razonSocial || "",
    nombreComercial: config.nombreComercial || "",
    direccion: config.direccion || "",
    ambiente: config.ambiente || "beta",
    serieBoleta: config.series?.boleta || "BA01",
    serieFactura: config.series?.factura || "FA01",
    serieNotaCreditoBoleta: config.series?.notaCreditoBoleta || "BN01",
    serieNotaCreditoFactura: config.series?.notaCreditoFactura || "FN01",
  });
  const [sol, setSol] = useState({ usuarioSol: "", claveSol: "" });
  const [certificado, setCertificado] = useState(null);
  const [claveCertificado, setClaveCertificado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const guardarEmpresa = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const token = obtenerToken();
      await guardarDatosEmpresaFacturacion(token, empresa);
      setMensaje("Datos de la empresa guardados");
      await recargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const guardarSol = async (e) => {
    e.preventDefault();
    if (!sol.usuarioSol || !sol.claveSol) return;
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const token = obtenerToken();
      await guardarCredencialesSolApi(token, sol.usuarioSol, sol.claveSol);
      setMensaje("Credenciales SOL guardadas");
      setSol({ usuarioSol: "", claveSol: "" });
      await recargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const guardarCert = async (e) => {
    e.preventDefault();
    if (!certificado || !claveCertificado) return;
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const token = obtenerToken();
      await subirCertificadoFacturacion(token, certificado, claveCertificado);
      setMensaje("Certificado guardado");
      setCertificado(null);
      setClaveCertificado("");
      await recargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {mensaje && <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">{mensaje}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <form onSubmit={guardarEmpresa} className="border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="font-semibold text-gray-900">Datos de la empresa</p>
        <input
          placeholder="RUC"
          value={empresa.ruc}
          onChange={(e) => setEmpresa({ ...empresa, ruc: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        />
        <input
          placeholder="Razon social"
          value={empresa.razonSocial}
          onChange={(e) => setEmpresa({ ...empresa, razonSocial: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        />
        <input
          placeholder="Nombre comercial"
          value={empresa.nombreComercial}
          onChange={(e) => setEmpresa({ ...empresa, nombreComercial: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        />
        <input
          placeholder="Direccion"
          value={empresa.direccion}
          onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        />
        <select
          value={empresa.ambiente}
          onChange={(e) => setEmpresa({ ...empresa, ambiente: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        >
          <option value="beta">Beta (pruebas)</option>
          <option value="produccion">Produccion</option>
        </select>
        <div className="flex gap-2">
          <input
            placeholder="Serie boleta (ej. B002)"
            value={empresa.serieBoleta}
            onChange={(e) => setEmpresa({ ...empresa, serieBoleta: e.target.value.toUpperCase() })}
            className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm text-gray-900"
          />
          <input
            placeholder="Serie factura (ej. FA01)"
            value={empresa.serieFactura}
            onChange={(e) => setEmpresa({ ...empresa, serieFactura: e.target.value.toUpperCase() })}
            className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm text-gray-900"
          />
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Serie nota de credito de boleta (ej. BN01)"
            value={empresa.serieNotaCreditoBoleta}
            onChange={(e) => setEmpresa({ ...empresa, serieNotaCreditoBoleta: e.target.value.toUpperCase() })}
            className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm text-gray-900"
          />
          <input
            placeholder="Serie nota de credito de factura (ej. FN01)"
            value={empresa.serieNotaCreditoFactura}
            onChange={(e) => setEmpresa({ ...empresa, serieNotaCreditoFactura: e.target.value.toUpperCase() })}
            className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm text-gray-900"
          />
        </div>
        <p className="text-xs text-gray-500">
          Si usas otro proveedor de facturacion en paralelo (como Rapifac), usa series distintas a las de ellos para
          evitar choques. Cambiar una serie reinicia su numeracion desde 1.
        </p>
        <button disabled={guardando} className="bg-gray-900 text-white text-sm px-4 py-2 rounded">
          Guardar datos
        </button>
      </form>

      <form onSubmit={guardarSol} className="border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="font-semibold text-gray-900">Credenciales SOL</p>
        <p className="text-xs text-gray-500">
          {config.tieneCredencialesSol ? "Ya hay credenciales guardadas. Completa para reemplazarlas." : "Aun no se han guardado credenciales."}
        </p>
        <input
          placeholder="Usuario SOL"
          value={sol.usuarioSol}
          onChange={(e) => setSol({ ...sol, usuarioSol: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        />
        <input
          type="password"
          placeholder="Clave SOL"
          value={sol.claveSol}
          onChange={(e) => setSol({ ...sol, claveSol: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        />
        <button disabled={guardando} className="bg-gray-900 text-white text-sm px-4 py-2 rounded">
          Guardar credenciales
        </button>
      </form>

      <form onSubmit={guardarCert} className="border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="font-semibold text-gray-900">Certificado digital</p>
        <p className="text-xs text-gray-500">
          {config.tieneCertificado ? "Ya hay un certificado guardado. Sube uno nuevo para reemplazarlo." : "Aun no se ha subido un certificado."}
        </p>
        {config.certificado && !config.certificado.error && (
          <p
            className={`text-xs font-medium rounded px-3 py-2 ${
              config.certificado.diasRestantes < 0
                ? "bg-red-50 text-red-700 border border-red-200"
                : config.certificado.diasRestantes <= 7
                ? "bg-red-50 text-red-700 border border-red-200"
                : config.certificado.diasRestantes <= 30
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "text-gray-500"
            }`}
          >
            {config.certificado.diasRestantes < 0
              ? `El certificado vencio el ${new Date(config.certificado.vigenteHasta).toLocaleDateString("es-PE")}. Sube uno nuevo antes de seguir emitiendo.`
              : `Vence el ${new Date(config.certificado.vigenteHasta).toLocaleDateString("es-PE")} (en ${config.certificado.diasRestantes} dias).`}
          </p>
        )}
        {config.certificado?.error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{config.certificado.error}</p>
        )}
        <input
          type="file"
          accept=".p12,.pfx"
          onChange={(e) => setCertificado(e.target.files[0])}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm bg-white text-gray-900"
        />
        <input
          type="password"
          placeholder="Clave del certificado"
          value={claveCertificado}
          onChange={(e) => setClaveCertificado(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        />
        <button disabled={guardando} className="bg-gray-900 text-white text-sm px-4 py-2 rounded">
          Guardar certificado
        </button>
      </form>

      <FactilizaTokens />
    </div>
  );
}

function FactilizaTokens() {
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({ token: "", etiqueta: "", usadosIniciales: "" });
  const [guardando, setGuardando] = useState(false);
  const [ocupado, setOcupado] = useState("");

  const cargar = async () => {
    try {
      const data = await obtenerFactilizaTokensApi(obtenerToken());
      setTokens(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const agregar = async (e) => {
    e.preventDefault();
    if (!nuevo.token.trim()) return;
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      await agregarFactilizaTokenApi(obtenerToken(), nuevo);
      setNuevo({ token: "", etiqueta: "", usadosIniciales: "" });
      setMostrarForm(false);
      setMensaje("Cuenta agregada");
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiar = async (id, cambios) => {
    setOcupado(id);
    setError("");
    setMensaje("");
    try {
      await actualizarFactilizaTokenApi(obtenerToken(), id, cambios);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado("");
    }
  };

  const eliminar = async (id) => {
    setOcupado(id);
    setError("");
    setMensaje("");
    try {
      await eliminarFactilizaTokenApi(obtenerToken(), id);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado("");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">Cuentas de Factiliza (consulta DNI/RUC)</p>
          <p className="text-xs text-gray-500">
            Cada cuenta gratuita permite 100 consultas al mes. Cuando una llega a 98, el sistema pasa solo a la
            siguiente cuenta activa.
          </p>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded whitespace-nowrap">
          {mostrarForm ? "Cancelar" : "+ Agregar cuenta"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={agregar} className="border border-gray-200 rounded p-3 space-y-2 bg-gray-50">
          <input
            placeholder="Token de la cuenta"
            value={nuevo.token}
            onChange={(e) => setNuevo({ ...nuevo, token: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
          />
          <div className="flex gap-2">
            <input
              placeholder="Etiqueta (ej. correo de la cuenta)"
              value={nuevo.etiqueta}
              onChange={(e) => setNuevo({ ...nuevo, etiqueta: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm text-gray-900"
            />
            <input
              type="number"
              min="0"
              placeholder="Ya usadas (si no es nueva)"
              value={nuevo.usadosIniciales}
              onChange={(e) => setNuevo({ ...nuevo, usadosIniciales: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 w-44 text-sm text-gray-900"
            />
          </div>
          <button disabled={guardando} className="bg-green-700 text-white text-sm px-4 py-2 rounded">
            {guardando ? "Guardando..." : "Guardar cuenta"}
          </button>
        </form>
      )}

      {mensaje && <p className="text-green-700 text-sm">{mensaje}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {tokens === null ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : tokens.length === 0 ? (
        <p className="text-sm text-gray-500">Aun no hay ninguna cuenta guardada.</p>
      ) : (
        <div className="space-y-2">
          {tokens.map((t) => {
            const agotada = t.usados >= t.limite;
            const porcentaje = Math.min(100, Math.round((t.usados / t.limite) * 100));
            return (
              <div key={t._id} className="border border-gray-200 rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {t.etiqueta || "(sin etiqueta)"}
                    {!t.activo && <span className="ml-2 text-xs text-gray-500">(desactivada)</span>}
                  </p>
                  <p className={`text-xs font-semibold ${agotada ? "text-red-600" : "text-gray-600"}`}>
                    {t.usados} / {t.limite}
                  </p>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden mb-2">
                  <div
                    className={`h-full ${agotada ? "bg-red-500" : "bg-green-600"}`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Se reinicia el {new Date(t.proximoReinicio).toLocaleDateString("es-PE")}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => cambiar(t._id, { reiniciarContador: true })}
                      disabled={ocupado === t._id}
                      className="text-xs text-blue-600 underline"
                    >
                      Reiniciar contador
                    </button>
                    <button
                      onClick={() => cambiar(t._id, { activo: !t.activo })}
                      disabled={ocupado === t._id}
                      className="text-xs text-gray-600 underline"
                    >
                      {t.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminar(t._id)}
                      disabled={ocupado === t._id}
                      className="text-xs text-red-600 underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Modal({ titulo, onCerrar, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <p className="font-semibold text-gray-900">{titulo}</p>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="p-5 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function ClienteModal({ tipo, onCerrar, onGuardado }) {
  const tipoDoc = tipo === "factura" ? "ruc" : "dni";
  const [cliente, setCliente] = useState(CLIENTE_VACIO);
  const [buscandoDoc, setBuscandoDoc] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [clienteConocido, setClienteConocido] = useState(false);
  const [error, setError] = useState("");

  const buscarDocumento = async () => {
    const numero = cliente.documento.trim();
    const longitudEsperada = tipoDoc === "ruc" ? 11 : 8;
    if (numero.length !== longitudEsperada) {
      setError(`El ${tipoDoc.toUpperCase()} debe tener ${longitudEsperada} digitos`);
      return;
    }
    setBuscandoDoc(true);
    setError("");
    try {
      const token = obtenerToken();
      const data = await buscarDocumentoFacturacion(token, tipoDoc, numero);
      setCliente({
        ...cliente,
        tipoDocumento: tipoDoc === "ruc" ? "RUC" : "DNI",
        documento: data.documento,
        nombre: data.nombre,
        direccion: data.direccion || "",
        telefono: data.telefono || "",
        correo: data.correo || "",
        contacto: data.contacto || "",
        referencia: data.referencia || "",
      });
      setClienteConocido(Boolean(data.esClienteConocido));
    } catch (err) {
      setError(err.message);
    } finally {
      setBuscandoDoc(false);
    }
  };

  const guardarYUsar = async () => {
    if (!cliente.documento || !cliente.nombre) {
      setError("Falta buscar o completar el documento y nombre del cliente");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const token = obtenerToken();
      const guardado = await guardarClienteApi(token, cliente.documento, {
        tipoDocumento: cliente.tipoDocumento,
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        correo: cliente.correo,
        contacto: cliente.contacto,
        referencia: cliente.referencia,
      });
      onGuardado({ ...cliente, ...guardado });
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo="Cliente Nuevo" onCerrar={onCerrar}>
      <div className="flex gap-2">
        <select
          value={cliente.tipoDocumento}
          onChange={(e) => setCliente({ ...cliente, tipoDocumento: e.target.value })}
          className="border border-gray-300 rounded px-2 py-2 text-sm text-gray-900"
        >
          <option value={tipoDoc === "ruc" ? "RUC" : "DNI"}>{tipoDoc.toUpperCase()}</option>
        </select>
        <input
          placeholder={tipoDoc === "ruc" ? "RUC (11 digitos)" : "DNI (8 digitos)"}
          value={cliente.documento}
          onChange={(e) => setCliente({ ...cliente, documento: e.target.value.replace(/\D/g, "") })}
          className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm text-gray-900"
        />
        <button
          onClick={buscarDocumento}
          disabled={buscandoDoc}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded whitespace-nowrap"
        >
          {buscandoDoc ? "..." : "Buscar"}
        </button>
      </div>

      {clienteConocido && <p className="text-xs text-green-700 font-medium">Ya es cliente</p>}

      <input
        placeholder="Nombre / Razon social"
        value={cliente.nombre}
        onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
        className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
      />
      <input
        placeholder="Correo"
        value={cliente.correo}
        onChange={(e) => setCliente({ ...cliente, correo: e.target.value })}
        className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
      />
      <input
        placeholder="Direccion"
        value={cliente.direccion}
        onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
        className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
      />
      <input
        placeholder="Referencia"
        value={cliente.referencia}
        onChange={(e) => setCliente({ ...cliente, referencia: e.target.value })}
        className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
      />
      <div className="flex gap-2">
        <input
          placeholder="Contacto"
          value={cliente.contacto}
          onChange={(e) => setCliente({ ...cliente, contacto: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm text-gray-900"
        />
        <input
          placeholder="Celular"
          value={cliente.telefono}
          onChange={(e) => setCliente({ ...cliente, telefono: e.target.value.replace(/\D/g, "") })}
          className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm text-gray-900"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          onClick={guardarYUsar}
          disabled={guardando}
          className="bg-green-700 text-white text-sm font-medium px-4 py-2 rounded flex-1"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        <button onClick={onCerrar} className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded">
          Cancelar
        </button>
      </div>
    </Modal>
  );
}

function ItemModal({ onCerrar, onAgregar }) {
  const [descripcion, setDescripcion] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("UNIDAD");
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [error, setError] = useState("");

  const total = (Number(cantidad) || 0) * (Number(precioUnitario) || 0);

  const guardar = () => {
    if (!descripcion.trim() || !cantidad || !precioUnitario) {
      setError("Completa descripcion, cantidad y precio unitario");
      return;
    }
    onAgregar({
      descripcion: descripcion.trim(),
      unidadMedida,
      cantidad: Number(cantidad),
      precioUnitario: Number(precioUnitario),
    });
  };

  return (
    <Modal titulo="Item Detallado" onCerrar={onCerrar}>
      <div>
        <label className="text-xs text-gray-500">Unidad de Medida</label>
        <select
          value={unidadMedida}
          onChange={(e) => setUnidadMedida(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        >
          {UNIDADES_MEDIDA.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500">IGV</label>
        <input
          disabled
          value="Gravado - Operacion Onerosa"
          className="border border-gray-200 bg-gray-100 rounded px-3 py-2 w-full text-sm text-gray-500"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500">Descripcion</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500">Cantidad</label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500">Precio Unitario (con IGV)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500">Total</label>
        <input
          disabled
          value={total.toFixed(2)}
          className="border border-gray-200 bg-gray-100 rounded px-3 py-2 w-full text-sm text-gray-700"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button onClick={guardar} className="bg-green-700 text-white text-sm font-medium px-4 py-2 rounded flex-1">
          Guardar
        </button>
        <button onClick={onCerrar} className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded">
          Cerrar
        </button>
      </div>
    </Modal>
  );
}

function TabEmitir({ config, recargar }) {
  const [tipo, setTipo] = useState("boleta");
  const [cliente, setCliente] = useState(null);
  const [items, setItems] = useState([]);
  const [clienteModalAbierto, setClienteModalAbierto] = useState(false);
  const [itemModalAbierto, setItemModalAbierto] = useState(false);
  const [cuenta, setCuenta] = useState("EFECTIVO");
  const [pago, setPago] = useState("");
  const [emitiendo, setEmitiendo] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [whatsappTelefono, setWhatsappTelefono] = useState("");

  const configLista = config?.tieneCertificado && config?.tieneCredencialesSol && config?.ruc;

  const quitarItem = (indice) => setItems(items.filter((_, i) => i !== indice));

  const total = items.reduce((acc, it) => acc + it.cantidad * it.precioUnitario, 0);
  const vuelto = pago ? Math.max(0, Number(pago) - total) : 0;

  const serieActual = config?.series?.[tipo] || (tipo === "factura" ? "F001" : "B001");
  const correlativoSiguiente = (config?.correlativos?.[tipo] || 0) + 1;

  const limpiarFormulario = () => {
    setCliente(null);
    setItems([]);
    setPago("");
  };

  const cancelar = () => {
    limpiarFormulario();
    setResultado(null);
    setError("");
  };

  const clienteVariosSuperaElLimite =
    cliente?.documento === DOCUMENTO_CLIENTE_VARIOS && total >= LIMITE_BOLETA_SIN_IDENTIFICAR;

  const emitir = async () => {
    setError("");
    if (!cliente) {
      setError("Falta registrar el cliente");
      return;
    }
    if (items.length === 0) {
      setError("Agrega al menos un item");
      return;
    }
    if (clienteVariosSuperaElLimite) {
      setError(`Para S/ ${total.toFixed(2)} debes identificar al cliente (obligatorio desde S/ ${LIMITE_BOLETA_SIN_IDENTIFICAR})`);
      return;
    }
    setEmitiendo(true);
    setResultado(null);
    try {
      const token = obtenerToken();
      const data = await emitirComprobanteApi(token, {
        tipo,
        cliente: {
          tipoDocumento: cliente.tipoDocumento,
          documento: cliente.documento,
          nombre: cliente.nombre,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
        },
        items: items.map((it) => ({
          descripcion: it.descripcion,
          cantidad: it.cantidad,
          precioUnitario: it.precioUnitario,
        })),
      });
      setResultado(data);
      setWhatsappTelefono(cliente.telefono || "");
      await recargar();
      if (data.estado === "aceptado") {
        limpiarFormulario();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEmitiendo(false);
    }
  };

  if (!configLista) {
    return (
      <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
        Falta completar la configuracion (RUC, credenciales SOL y certificado) antes de poder emitir comprobantes.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {clienteModalAbierto && (
        <ClienteModal
          tipo={tipo}
          onCerrar={() => setClienteModalAbierto(false)}
          onGuardado={(c) => {
            setCliente(c);
            setClienteModalAbierto(false);
          }}
        />
      )}
      {itemModalAbierto && (
        <ItemModal
          onCerrar={() => setItemModalAbierto(false)}
          onAgregar={(item) => {
            setItems([...items, item]);
            setItemModalAbierto(false);
          }}
        />
      )}

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500">Tipo Comprobante</label>
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setCliente(null);
              }}
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
            >
              <option value="boleta">Boleta</option>
              <option value="factura">Factura</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Documento</label>
            <input
              disabled
              value={`${serieActual} - ${correlativoSiguiente}`}
              className="border border-gray-200 bg-gray-100 rounded px-3 py-2 w-full text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Moneda</label>
            <input disabled value="SOLES" className="border border-gray-200 bg-gray-100 rounded px-3 py-2 w-full text-sm text-gray-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Fecha</label>
            <input
              disabled
              value={new Date().toLocaleDateString("es-PE")}
              className="border border-gray-200 bg-gray-100 rounded px-3 py-2 w-full text-sm text-gray-500"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-500">Tipo de Operacion</label>
          <input
            disabled
            value="Venta interna"
            className="border border-gray-200 bg-gray-100 rounded px-3 py-2 w-full md:w-1/4 text-sm text-gray-500"
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        {cliente ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{cliente.nombre}</p>
              <p className="text-xs text-gray-500">
                {cliente.tipoDocumento}: {cliente.documento}
                {cliente.telefono ? ` · Cel. ${cliente.telefono}` : ""}
              </p>
              {cliente.documento === DOCUMENTO_CLIENTE_VARIOS && (
                <p className="text-xs text-yellow-700">
                  Cliente sin identificar. Solo valido para boletas menores a S/ {LIMITE_BOLETA_SIN_IDENTIFICAR}.
                </p>
              )}
            </div>
            <button
              onClick={() => setClienteModalAbierto(true)}
              className="text-sm text-gray-700 underline whitespace-nowrap"
            >
              Cambiar cliente
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setClienteModalAbierto(true)}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded"
            >
              + Cliente Nuevo
            </button>
            {tipo === "boleta" && (
              <button
                onClick={() => setCliente(CLIENTE_VARIOS)}
                className="border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded"
              >
                Cliente Varios (menos de S/ {LIMITE_BOLETA_SIN_IDENTIFICAR})
              </button>
            )}
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-900">Items</p>
          <button
            onClick={() => setItemModalAbierto(true)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded"
          >
            + Item Detallado
          </button>
        </div>

        {items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                <th className="py-2">Descripcion</th>
                <th className="py-2 text-center">Cant.</th>
                <th className="py-2 text-center">U.M.</th>
                <th className="py-2 text-right">P.U.</th>
                <th className="py-2 text-right">Importe</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, indice) => (
                <tr key={indice} className="border-b border-gray-100 text-gray-800">
                  <td className="py-2">{item.descripcion}</td>
                  <td className="py-2 text-center">{item.cantidad}</td>
                  <td className="py-2 text-center">{item.unidadMedida}</td>
                  <td className="py-2 text-right">{item.precioUnitario.toFixed(2)}</td>
                  <td className="py-2 text-right">{(item.cantidad * item.precioUnitario).toFixed(2)}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => quitarItem(indice)} className="text-red-600 text-xs">
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400">Aun no hay items agregados</p>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-gray-500">Cuenta</label>
          <select
            value={cuenta}
            onChange={(e) => setCuenta(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
          >
            {CUENTAS_PAGO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="text-xs text-gray-500">Pago</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={pago}
            onChange={(e) => setPago(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
          />
          <label className="text-xs text-gray-500">Vuelto</label>
          <input
            disabled
            value={vuelto.toFixed(2)}
            className="border border-gray-200 bg-gray-100 rounded px-3 py-2 w-full text-sm text-gray-500"
          />
        </div>

        <div className="md:col-span-2 flex flex-col justify-between">
          <div className="text-right">
            <p className="text-xs text-gray-500">Importe Total</p>
            <p className="text-3xl font-bold text-gray-900">S/ {total.toFixed(2)}</p>
            {clienteVariosSuperaElLimite && (
              <p className="text-xs text-red-600 mt-1">
                Debes identificar al cliente para emitir S/ {LIMITE_BOLETA_SIN_IDENTIFICAR} o mas.
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={cancelar} className="bg-red-100 text-red-700 text-sm font-medium px-5 py-3 rounded">
              Cancelar
            </button>
            <button
              onClick={emitir}
              disabled={emitiendo || clienteVariosSuperaElLimite}
              className="bg-green-700 text-white text-sm font-medium px-6 py-3 rounded disabled:opacity-40"
            >
              {emitiendo ? "Emitiendo..." : "Emitir"}
            </button>
          </div>
        </div>
      </div>

      {resultado && (
        <div
          className={`border rounded-lg p-4 text-sm ${
            resultado.estado === "aceptado"
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          <p className="font-semibold">
            {resultado.serie}-{resultado.correlativo} — {resultado.estado.toUpperCase()}
          </p>
          <p>{resultado.observaciones}</p>
          <div className="flex gap-4 mt-2">
            {resultado.pdfUrl && (
              <a href={resultado.pdfUrl} target="_blank" rel="noopener noreferrer" className="underline">
                Descargar PDF
              </a>
            )}
            {resultado.estado === "aceptado" && resultado.pdfUrl && whatsappTelefono.length === 9 && (
              <a
                href={`https://wa.me/51${whatsappTelefono}?text=${encodeURIComponent(
                  `Hola! Aqui tienes tu ${resultado.tipo} ${resultado.serie}-${resultado.correlativo} por S/ ${resultado.total.toFixed(2)}:\n${resultado.pdfUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-green-700 font-medium"
              >
                Enviar por WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotaCreditoModal({ comprobante, onCerrar, onEmitida }) {
  const [motivoCodigo, setMotivoCodigo] = useState("01");
  const [emitiendo, setEmitiendo] = useState(false);
  const [error, setError] = useState("");

  const confirmar = async () => {
    setEmitiendo(true);
    setError("");
    try {
      const token = obtenerToken();
      const nota = await emitirNotaCreditoApi(token, comprobante._id, motivoCodigo);
      onEmitida(nota);
    } catch (err) {
      setError(err.message);
    } finally {
      setEmitiendo(false);
    }
  };

  return (
    <Modal titulo="Anular con Nota de Credito" onCerrar={onCerrar}>
      <p className="text-sm text-gray-700">
        Vas a anular <span className="font-semibold">{comprobante.serie}-{comprobante.correlativo}</span> ({comprobante.cliente.nombre}, S/{" "}
        {comprobante.total.toFixed(2)}). Esto genera una Nota de Credito real ante SUNAT y no se puede deshacer.
      </p>
      <div>
        <label className="text-xs text-gray-500">Motivo</label>
        <select
          value={motivoCodigo}
          onChange={(e) => setMotivoCodigo(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        >
          {MOTIVOS_NOTA_CREDITO.map(([codigo, texto]) => (
            <option key={codigo} value={codigo}>
              {texto}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          onClick={confirmar}
          disabled={emitiendo}
          className="bg-red-700 text-white text-sm font-medium px-4 py-2 rounded flex-1"
        >
          {emitiendo ? "Emitiendo..." : "Confirmar anulacion"}
        </button>
        <button onClick={onCerrar} className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded">
          Cancelar
        </button>
      </div>
    </Modal>
  );
}

const TIPO_ETIQUETA = { boleta: "Boleta", factura: "Factura", nota_credito: "Nota de Credito" };

const abrirWhatsApp = (telefono, comprobante) => {
  const tipo = (TIPO_ETIQUETA[comprobante.tipo] || comprobante.tipo).toLowerCase();
  const mensaje = `Hola! Aqui tienes tu ${tipo} ${comprobante.serie}-${comprobante.correlativo} por S/ ${comprobante.total.toFixed(2)}:\n${comprobante.pdfUrl}`;
  window.open(`https://wa.me/51${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener,noreferrer");
};

function WhatsAppModal({ comprobante, onCerrar }) {
  const [telefono, setTelefono] = useState("");
  const valido = telefono.length === 9;

  const enviar = () => {
    abrirWhatsApp(telefono, comprobante);
    onCerrar();
  };

  return (
    <Modal titulo="Enviar por WhatsApp" onCerrar={onCerrar}>
      <p className="text-sm text-gray-700">
        Este cliente no tiene celular guardado. Escribe el numero para enviar{" "}
        <span className="font-semibold">{comprobante.serie}-{comprobante.correlativo}</span> a {comprobante.cliente.nombre}.
      </p>
      <div>
        <label className="text-xs text-gray-500">Celular (9 digitos)</label>
        <input
          autoFocus
          inputMode="numeric"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 9))}
          onKeyDown={(e) => e.key === "Enter" && valido && enviar()}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-900"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={enviar}
          disabled={!valido}
          className="bg-green-700 text-white text-sm font-medium px-4 py-2 rounded flex-1 disabled:opacity-40"
        >
          Abrir WhatsApp
        </button>
        <button onClick={onCerrar} className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded">
          Cancelar
        </button>
      </div>
    </Modal>
  );
}

function ReportesMensuales() {
  const ahora = new Date();
  const [anio, setAnio] = useState(ahora.getFullYear());
  const [mes, setMes] = useState(ahora.getMonth() + 1);
  const [descargando, setDescargando] = useState("");
  const [error, setError] = useState("");
  const [mensajeSheets, setMensajeSheets] = useState("");

  const descargar = async (tipo) => {
    setDescargando(tipo);
    setError("");
    setMensajeSheets("");
    try {
      const token = obtenerToken();
      const blob = tipo === "csv" ? await descargarReporteCsv(token, anio, mes) : await descargarReporteZip(token, anio, mes);
      const extension = tipo === "csv" ? "csv" : "zip";
      const prefijo = tipo === "csv" ? "reporte" : "comprobantes";
      descargarBlob(blob, `${prefijo}-${anio}-${String(mes).padStart(2, "0")}.${extension}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDescargando("");
    }
  };

  const enviarASheets = async () => {
    setDescargando("sheets");
    setError("");
    setMensajeSheets("");
    try {
      const data = await enviarReporteGoogleSheetsApi(obtenerToken(), anio, mes);
      setMensajeSheets(data.mensaje);
    } catch (err) {
      setError(err.message);
    } finally {
      setDescargando("");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="font-semibold text-gray-900 mb-3">Reporte para el contador</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Mes</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
          >
            {MESES.map((nombre, i) => (
              <option key={nombre} value={i + 1}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Año</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1.5 w-24 text-sm text-gray-900"
          />
        </div>
        <button
          onClick={() => descargar("csv")}
          disabled={Boolean(descargando)}
          className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded"
        >
          {descargando === "csv" ? "Generando..." : "Descargar Excel (CSV)"}
        </button>
        <button
          onClick={() => descargar("zip")}
          disabled={Boolean(descargando)}
          className="border border-gray-300 text-gray-800 text-sm px-3 py-1.5 rounded"
        >
          {descargando === "zip" ? "Generando..." : "Descargar XML y CDR (ZIP)"}
        </button>
        <button
          onClick={enviarASheets}
          disabled={Boolean(descargando)}
          className="border border-gray-300 text-gray-800 text-sm px-3 py-1.5 rounded"
        >
          {descargando === "sheets" ? "Enviando..." : "Enviar a Google Sheets"}
        </button>
      </div>
      {mensajeSheets && <p className="text-green-700 text-sm mt-2">{mensajeSheets}</p>}
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}

function TabHistorial() {
  const [comprobantes, setComprobantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [comprobanteParaAnular, setComprobanteParaAnular] = useState(null);
  const [comprobanteParaWhatsApp, setComprobanteParaWhatsApp] = useState(null);
  const [reenviandoId, setReenviandoId] = useState(null);
  const [errorReenvio, setErrorReenvio] = useState("");

  const enviarPorWhatsApp = (comprobante) => {
    if (/^\d{9}$/.test(comprobante.clienteTelefono || "")) {
      abrirWhatsApp(comprobante.clienteTelefono, comprobante);
    } else {
      setComprobanteParaWhatsApp(comprobante);
    }
  };

  const reenviar = async (id) => {
    setReenviandoId(id);
    setErrorReenvio("");
    try {
      await reenviarComprobanteApi(obtenerToken(), id);
      await cargar();
    } catch (err) {
      setErrorReenvio(err.message);
    } finally {
      setReenviandoId(null);
    }
  };

  const cargar = async () => {
    try {
      const token = obtenerToken();
      const data = await obtenerComprobantes(token);
      setComprobantes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  if (cargando) return <p className="text-gray-500">Cargando...</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;

  const colorEstado = {
    aceptado: "text-green-700",
    rechazado: "text-red-700",
    error: "text-red-700",
    pendiente: "text-yellow-700",
  };

  return (
    <div className="space-y-2">
      <ReportesMensuales />

      {comprobanteParaAnular && (
        <NotaCreditoModal
          comprobante={comprobanteParaAnular}
          onCerrar={() => setComprobanteParaAnular(null)}
          onEmitida={() => {
            setComprobanteParaAnular(null);
            cargar();
          }}
        />
      )}

      {comprobanteParaWhatsApp && (
        <WhatsAppModal comprobante={comprobanteParaWhatsApp} onCerrar={() => setComprobanteParaWhatsApp(null)} />
      )}

      {errorReenvio && <p className="text-red-600 text-sm">{errorReenvio}</p>}

      {comprobantes.length === 0 && <p className="text-gray-500 text-sm">Aun no hay comprobantes emitidos.</p>}

      {comprobantes.map((c) => (
        <div key={c._id} className="border border-gray-200 rounded-lg p-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {TIPO_ETIQUETA[c.tipo] || c.tipo} {c.serie}-{c.correlativo} · {c.cliente.nombre}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(c.createdAt).toLocaleString("es-PE")} · S/ {c.total.toFixed(2)}
              </p>
              {c.tipo === "nota_credito" && c.comprobanteAfectado && (
                <p className="text-xs text-gray-500">
                  Anula a {c.comprobanteAfectado.serie}-{c.comprobanteAfectado.correlativo} · {c.motivoDescripcion}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className={`font-semibold ${colorEstado[c.estado] || "text-gray-700"}`}>
                {c.anulado ? "ANULADO" : c.estado.toUpperCase()}
              </p>
              {c.pdfUrl && (
                <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline text-gray-600">
                  PDF
                </a>
              )}
              {c.estado === "aceptado" && c.pdfUrl && !c.anulado && (
                <button
                  onClick={() => enviarPorWhatsApp(c)}
                  className="block ml-auto text-xs underline text-green-700"
                >
                  WhatsApp
                </button>
              )}
            </div>
          </div>
          {c.estado === "aceptado" && c.tipo !== "nota_credito" && !c.anulado && (
            <button
              onClick={() => setComprobanteParaAnular(c)}
              className="text-xs text-red-600 underline mt-2"
            >
              Anular con Nota de Credito
            </button>
          )}
          {c.estado === "error" && (
            <button
              onClick={() => reenviar(c._id)}
              disabled={reenviandoId === c._id}
              className="text-xs text-blue-600 underline mt-2"
            >
              {reenviandoId === c._id ? "Reenviando..." : "Reenviar a SUNAT"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
