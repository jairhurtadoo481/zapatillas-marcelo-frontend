import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/60 backdrop-blur-md border-t border-white/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">La Casa de Marcelo</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              La mejor tienda de zapatillas originales en Andahuaylas, Apurímac. Marcas reales, precios justos.
            </p>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wide text-sm">Categorias</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/hombre" className="text-gray-400 hover:text-white text-sm transition">
                  Hombre
                </Link>
              </li>
              <li>
                <Link href="/mujer" className="text-gray-400 hover:text-white text-sm transition">
                  Mujer
                </Link>
              </li>
              <li>
                <Link href="/ninios" className="text-gray-400 hover:text-white text-sm transition">
                  {"Ni\u00f1os"}
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="text-red-400 hover:text-red-300 font-semibold text-sm transition">
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Informacion */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wide text-sm">Informacion</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/seguimiento" className="text-gray-400 hover:text-white text-sm transition">
                  Seguimiento de Pedidos
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-gray-400 hover:text-white text-sm transition">
                  Politica de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-gray-400 hover:text-white text-sm transition">
                  Terminos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-400 hover:text-white text-sm transition">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wide text-sm">Contacto</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <p className="font-semibold text-white">Ubicanos</p>
                <p>Andahuaylas, Apurimac</p>
              </li>
              <li>
                <p className="font-semibold text-white">Telefonos</p>
                <p>917 654 316</p>
                <p>944 347 979 (Soporte)</p>
              </li>
              <li>
                <p className="font-semibold text-white">Horario</p>
                <p>Lunes a Viernes: 8am - 10pm</p>
                <p>Sabados a Domingos: 9am - 10pm</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              © {currentYear} La Casa de Marcelo. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-400 hover:text-white transition">
                <span className="text-sm font-semibold">Facebook</span>
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white transition">
                <span className="text-sm font-semibold">Instagram</span>
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white transition">
                <span className="text-sm font-semibold">WhatsApp</span>
              </Link>
            </div>
          </div>

          {/* Libro de Reclamaciones */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/libro-de-reclamaciones"
              className="inline-flex items-center gap-2 border border-white/30 rounded px-4 py-2 text-xs font-semibold text-gray-200 hover:text-white hover:border-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Libro de Reclamaciones
            </Link>
          </div>

          {/* Links discretos para admin y trabajador */}
          <div className="mt-6 pt-6 border-t border-gray-700 flex justify-center gap-4">
            <Link href="/admin/login" className="text-xs text-gray-500 hover:text-gray-300 transition underline">
              Admin
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/mayorista/login" className="text-xs text-gray-500 hover:text-gray-300 transition underline">
              Mayorista
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/trabajador/login" className="text-xs text-gray-500 hover:text-gray-300 transition underline">
              Trabajador
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
