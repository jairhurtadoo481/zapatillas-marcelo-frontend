"use client";

import { useEffect, useState } from "react";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import {
  obtenerMayoristas,
  crearMayorista,
  actualizarMayorista,
  eliminarMayorista,
} from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";

const claseInput = "border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400";

export default function MayoristasPage() {
  const [mayoristas, setMayoristas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ nombre: "", email: "", celular: "", password: "", confirmar: "" });
  const [creando, setCreando] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ nombre: "", email: "", celular: "", password: "" });
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const token = obtenerToken();
      const data = await obtenerMayoristas(token);
      setMayoristas(data);
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
      await crearMayorista(token, {
        nombre: form.nombre,
        email: form.email,
        celular: form.celular,
        password: form.password,
      });
      setForm({ nombre: "", email: "", celular: "", password: "", confirmar: "" });
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  };

  const iniciarEdicion = (mayorista) => {
    setEditandoId(mayorista._id);
    setFormEdicion({
      nombre: mayorista.nombre,
      email: mayorista.email,
      celular: mayorista.celular || "",
      password: "",
    });
  };

  const guardarEdicion = async (id) => {
    try {
      const token = obtenerToken();
      const datos = {
        nombre: formEdicion.nombre,
        email: formEdicion.email,
        celular: formEdicion.celular,
      };
      if (formEdicion.password) datos.password = formEdicion.password;
      await actualizarMayorista(token, id, datos);
      setEditandoId(null);
      cargar();
    } catch (err) {
      alert(err.message);
    }
  };

  const manejarCambiarActivo = async (mayorista) => {
    setCambiandoEstado(mayorista._id);
    try {
      const token = obtenerToken();
      await actualizarMayorista(token, mayorista._id, { activo: !mayorista.activo });
      cargar();
    } catch (err) {
      alert(err.message);
    } finally {
      setCambiandoEstado(null);
    }
  };

  const manejarEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`Eliminar la cuenta mayorista de "${nombre}"?`);
    if (!confirmar) return;

    try {
      const token = obtenerToken();
      await eliminarMayorista(token, id);
      setMayoristas(mayoristas.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Cuentas mayoristas</h1>

          <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white">
            <h2 className="font-semibold mb-3 text-gray-900">Agregar mayorista</h2>
            <form onSubmit={manejarCrear} className="flex flex-col gap-3">
              <input
                placeholder="Nombre completo o negocio"
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
                placeholder="Celular (opcional)"
                value={form.celular}
                onChange={(e) => setForm({ ...form, celular: e.target.value })}
                className={claseInput}
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

          {!cargando && mayoristas.length === 0 && (
            <p className="text-gray-500">No hay mayoristas registrados todavia.</p>
          )}

          <div className="flex flex-col gap-3">
            {mayoristas.map((m) => {
              const suspendido = m.activo === false;
              return (
                <div
                  key={m._id}
                  className={`border rounded-lg p-4 ${suspendido ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}
                >
                  {editandoId === m._id ? (
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
                        value={formEdicion.celular}
                        onChange={(e) => setFormEdicion({ ...formEdicion, celular: e.target.value })}
                        className={`${claseInput} text-sm`}
                        placeholder="Celular"
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
                          onClick={() => guardarEdicion(m._id)}
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
                          <p className="font-semibold text-gray-900">{m.nombre}</p>
                          {suspendido && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              Acceso suspendido
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{m.email}</p>
                        {m.celular && <p className="text-sm text-gray-500">{m.celular}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => manejarCambiarActivo(m)}
                          disabled={cambiandoEstado === m._id}
                          className={`text-xs px-3 py-1 rounded font-semibold transition disabled:opacity-50 ${
                            suspendido
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                        >
                          {cambiandoEstado === m._id ? "..." : suspendido ? "Activar acceso" : "Desactivar acceso"}
                        </button>
                        <div className="flex gap-3 text-sm">
                          <button onClick={() => iniciarEdicion(m)} className="text-blue-600 hover:underline">
                            Editar
                          </button>
                          <button
                            onClick={() => manejarEliminar(m._id, m.nombre)}
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