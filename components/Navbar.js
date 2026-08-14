"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CarritoIndicador from "./CarritoIndicador";

export default function Navbar() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const manejarBuscar = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(busqueda.trim())}`);
      setMenuAbierto(false);
    }
  };

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
        <Link href="/" className="text-2xl font-bold tracking-wider text-black hover:text-gray-700 transition">
          Zapatillas Marcelo
        </Link>

        <form onSubmit={manejarBuscar} className="hidden md:block flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar zapatillas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg px-4 py-2 text-sm text-black outline-none border-2 border-black focus:shadow-md transition"
          />
        </form>

        <nav className="hidden md:flex gap-6 text-sm font-semibold whitespace-nowrap items-center">
          <Link href="/" className="text-black hover:text-red-600 hover:border-b-2 hover:border-red-600 pb-0.5 transition">
            Inicio
          </Link>
          <Link href="/hombre" className="text-black hover:text-red-600 hover:border-b-2 hover:border-red-600 pb-0.5 transition">
            Hombre
          </Link>
          <Link href="/mujer" className="text-black hover:text-red-600 hover:border-b-2 hover:border-red-600 pb-0.5 transition">
            Mujer
          </Link>
          <Link href="/ninios" className="text-black hover:text-red-600 hover:border-b-2 hover:border-red-600 pb-0.5 transition">
            {"Niños"}
          </Link>
          <Link href="/ofertas" className="text-red-600 font-bold hover:text-red-800 hover:border-b-2 hover:border-red-600 pb-0.5 transition">
            Ofertas
          </Link>
          <Link href="/seguimiento" className="text-black hover:text-red-600 hover:border-b-2 hover:border-red-600 pb-0.5 transition">
            Mi pedido
          </Link>
          <CarritoIndicador />
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <CarritoIndicador />
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex flex-col gap-1.5 p-2"
            aria-label="Abrir menu"
          >
            <span className="w-6 h-0.5 bg-black"></span>
            <span className="w-6 h-0.5 bg-black"></span>
            <span className="w-6 h-0.5 bg-black"></span>
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="md:hidden bg-white border-t-2 border-black px-4 py-4">
          <form onSubmit={manejarBuscar} className="mb-4">
            <input
              type="text"
              placeholder="Buscar zapatillas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg px-4 py-2 text-sm text-black outline-none border-2 border-black focus:shadow-md transition"
            />
          </form>

          <nav className="flex flex-col gap-3 text-sm font-semibold">
            <Link href="/" onClick={cerrarMenu} className="text-black hover:text-red-600 transition">
              Inicio
            </Link>
            <Link href="/hombre" onClick={cerrarMenu} className="text-black hover:text-red-600 transition">
              Hombre
            </Link>
            <Link href="/mujer" onClick={cerrarMenu} className="text-black hover:text-red-600 transition">
              Mujer
            </Link>
            <Link href="/ninios" onClick={cerrarMenu} className="text-black hover:text-red-600 transition">
              {"Niños"}
            </Link>
            <Link
              href="/ofertas"
              onClick={cerrarMenu}
              className="text-red-600 font-bold hover:text-red-800 transition"
            >
              Ofertas
            </Link>
            <Link href="/seguimiento" onClick={cerrarMenu} className="text-black hover:text-red-600 transition">
              Mi pedido
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}