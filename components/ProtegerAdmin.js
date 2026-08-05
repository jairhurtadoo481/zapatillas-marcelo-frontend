"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerToken } from "../lib/auth";

export default function ProtegerAdmin({ children }) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      router.push("/admin/login");
    } else {
      setVerificando(false);
    }
  }, [router]);

  if (verificando) {
    return <p className="text-center py-16 text-gray-500">Verificando acceso...</p>;
  }

  return children;
}