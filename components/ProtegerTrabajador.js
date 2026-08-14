"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerToken, obtenerUsuario } from "../lib/auth";

export default function ProtegerTrabajador({ children }) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const token = obtenerToken();
    const usuario = obtenerUsuario();

    if (!token || !usuario || usuario.rol !== "trabajador") {
      router.push("/trabajador/login");
    } else {
      setVerificando(false);
    }
  }, [router]);

  if (verificando) {
    return <p className="text-center py-16 text-gray-500">Verificando acceso...</p>;
  }

  return children;
}