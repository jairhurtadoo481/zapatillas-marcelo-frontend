"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import {
  obtenerTrabajadores,
  crearTrabajador,
  actualizarTrabajador,
  eliminarTrabajador,
  obtenerVentas,
  obtenerTurnos,
} from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const esHoy = (fecha) => new Date(fecha).toDateString() === new Date().toDateString();

const claseInput = "border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400";

export default function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmar: "" });
  const [creando, setCreando] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ nombre: "", email: "", password: "" });
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const token = obtenerToken();
      const [trabajadoresData, ventas, turnos] = await Promise.all([
        obtenerTrabajadores(token),
        obtenerVentas(token),
        obtenerTurnos(token),
      ]);

      const stats = {};
      trabajadoresData.forEach((t) => {
        const turnoAbierto = turnos.find((tu) => tu.trabajador === t._id && tu.abierto);
        const ventasHoy = ventas
          .filter((v) => v.vendedorId === t._id && esHoy(v.createdAt))
          .reduce((acc, v) => acc + (v.precioUnitario * v.cantidad - (v.descuento || 0)), 0);
        const cantidadHoy = ventas.filter((v) => v.vendedorId === t._id && esHoy(v.createdAt)).length;

        stats[t._id] = {
          turnoAbierto: !!turnoAbierto,
          ventasHoy,
          cantidadHoy,
        };
      });

      setTrabajadores(trabajadoresData);
      setEstadisticas(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const manejarCrear = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmar) {
      setError("Las contrasenias no coinciden");
      return;
    }

    setCreando(true);
    try {
      const token = obtenerToken();
      await crearTrabajador(token, { nombre: form.nombre, email: form.email, password: form.password });
      setForm({ nombre: "", email: "", password: "", confirmar: "" });
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  };

  const iniciarEdicion = (trabajador) => {
    setEditandoId(trabajador._id);
    setFormEdicion({ nombre: trabajador.nombre, email: trabajador.email, password: "" });
  };

  const guardarEdicion = async (id) => {
    try {
      const token = obtenerToken();
      const datos = { nombre: formEdicion.nombre, email: formEdicion.email };
      if (formEdicion.password) datos.password = formEdicion.password;
      await actualizarTrabajador(token, id, datos);
      setEditandoId(null);
      cargar();
    } catch (err) {
      alert(err.message);
    }
  };

  const manejarCambiarActivo = async (trabajador) => {
    setCambiandoEstado(trabajador._id);
    try {
      const token = obtenerToken();
      await actualizarTrabajador(token, trabajador._id, { activo: !trabajador.activo });
      cargar();
    } catch (err) {
      alert(err.message);
    } finally {
      setCambiandoEstado(null);
    }
  };

  const manejarEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`Eliminar la cuenta de "${nombre}"?`);
    if (!confirmar) return;

    try {
      const token = obtenerToken();
      await eliminarTrabajador(token, id);
      setTrabajadores(trabajadores.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const totalVendidoHoy = Object.values(estadisticas).reduce((acc, e) => acc + e.ventasHoy, 0);
  const trabajandoAhora = Object.values(estadisticas).filter((e) => e.turnoAbierto).length;

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Trabajadores</h1>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="border border-gray-200 rounded-lg p-4 text-center bg-white">
              <p className="text-xs text-gray-500">Cuentas</p>
              <p className="text-xl font-bold text-gray-900">{trabajadores.length}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center bg-white">
              <p className="text-xs text-gray-500">Trabajando ahora</p>
              <p className="text-xl font-bold text-green-600">{trabajandoAhora}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center bg-white">
              <p className="text-xs text-gray-500">Vendido hoy (todos)</p>
              <p className="text-xl font-bold text-gray-900">S/ {totalVendidoHoy}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white">
            <h2 className="font-semibold mb-3 text-gray-900">Agregar trabajador</h2>
            <form onSubmit={manejarCrear} className="flex flex-col gap-3">
              <input
                placeholder="Nombre completo"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className={claseInput}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={claseInput}
                required
              />
              <input
                type="password"
                placeholder="Contrasenia"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={claseInput}
                required
              />
              <input
                type="password"
                placeholder="Confirmar contrasenia"
                value={form.confirmar}
                onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                className={claseInput}
                required
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={creando}
                className="bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {creando ? "Creando..." : "Crear cuenta"}
              </button>
            </form>
          </div>

          <h2 className="font-semibold mb-3 text-gray-900">Cuentas existentes</h2>

          {cargando && <p className="text-gray-500">Cargando...</p>}

          {!cargando && trabajadores.length === 0 && (
            <p className="text-gray-500">No hay trabajadores registrados todavia.</p>
          )}

          <div className="flex flex-col gap-3">
            {trabajadores.map((t) => {
              const stats = estadisticas[t._id] || { turnoAbierto: false, ventasHoy: 0, cantidadHoy: 0 };
              const suspendido = t.activo === false;
              return (
                <div
                  key={t._id}
                  className={`border rounded-lg p-4 ${suspendido ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}
                >
                  {editandoId === t._id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={formEdicion.nombre}
                        onChange={(e) => setFormEdicion({ ...formEdicion, nombre: e.target.value })}
                        className={`${claseInput} text-sm`}
                      />
                      <input
                        value={formEdicion.email}
                        onChange={(e) => setFormEdicion({ ...formEdicion, email: e.target.value })}
                        className={`${claseInput} text-sm`}
                      />
                      <input
                        type="password"
                        placeholder="Nueva contrasenia (opcional)"
                        value={formEdicion.password}
                        onChange={(e) => setFormEdicion({ ...formEdicion, password: e.target.value })}
                        className={`${claseInput} text-sm`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => guardarEdicion(t._id)}
                          className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="text-sm text-gray-500 hover:underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{t.nombre}</p>
                          {suspendido ? (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              Acceso suspendido
                            </span>
                          ) : stats.turnoAbierto ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                              Trabajando ahora
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                              Sin turno activo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{t.email}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          Hoy: <span className="font-semibold text-gray-900">S/ {stats.ventasHoy}</span> ({stats.cantidadHoy} ventas)
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => manejarCambiarActivo(t)}
                          disabled={cambiandoEstado === t._id}
                          className={`text-xs px-3 py-1 rounded font-semibold transition disabled:opacity-50 ${
                            suspendido
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                        >
                          {cambiandoEstado === t._id ? "..." : suspendido ? "Activar acceso" : "Desactivar acceso"}
                        </button>
                        <div className="flex gap-3 text-sm">
                          <Link href={`/admin/trabajadores/${t._id}`} className="text-purple-600 hover:underline">
                            Historial
                          </Link>
                          <button onClick={() => iniciarEdicion(t)} className="text-blue-600 hover:underline">
                            Editar
                          </button>
                          <button
                            onClick={() => manejarEliminar(t._id, t.nombre)}
                            className="text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}