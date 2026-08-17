"use client";
import { useEffect, useState } from "react";
import ProtegerAdmin from "../../../components/ProtegerAdmin";
import { obtenerConfiguracion, subirQr } from "../../../lib/api";
import { obtenerToken } from "../../../lib/auth";
export default function ConfiguracionPage() {
  const [config, setConfig] = useState({ qrYape: null, qrPlin: null });
  const [cargando, setCargando] = useState(true);
  const [subiendoYape, setSubiendoYape] = useState(false);
  const [subiendoPlin, setSubiendoPlin] = useState(false);
  const [error, setError] = useState("");
  const cargar = async () => {
    try {
      const data = await obtenerConfiguracion();
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    cargar();
  }, []);
  const manejarSubidaYape = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendoYape(true);
    setError("");
    try {
      const token = obtenerToken();
      const data = await subirQr(token, "yape", archivo);
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendoYape(false);
    }
  };
  const manejarSubidaPlin = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendoPlin(true);
    setError("");
    try {
      const token = obtenerToken();
      const data = await subirQr(token, "plin", archivo);
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendoPlin(false);
    }
  };
  if (cargando) {
    return (
      <div className="bg-white min-h-screen">
        <p className="text-center py-16 text-gray-500">Cargando...</p>
      </div>
    );
  }
  return (
    <ProtegerAdmin>
      <div className="bg-white min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Configuracion de pagos</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <p className="font-semibold mb-3 text-gray-900">QR de Yape</p>
            {config.qrYape && (
              <img src={config.qrYape} alt="QR Yape" className="w-40 h-40 object-contain mb-3 border border-gray-100 rounded" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={manejarSubidaYape}
              disabled={subiendoYape}
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm bg-white text-gray-900"
            />
            {subiendoYape && <p className="text-xs text-gray-500 mt-1">Subiendo...</p>}
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-semibold mb-3 text-gray-900">QR de Plin</p>
            {config.qrPlin && (
              <img src={config.qrPlin} alt="QR Plin" className="w-40 h-40 object-contain mb-3 border border-gray-100 rounded" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={manejarSubidaPlin}
              disabled={subiendoPlin}
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm bg-white text-gray-900"
            />
            {subiendoPlin && <p className="text-xs text-gray-500 mt-1">Subiendo...</p>}
          </div>
        </div>
      </div>
    </ProtegerAdmin>
  );
}