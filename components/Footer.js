import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-2 border-black mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-black mb-4">Zapatillas Marcelo</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              La mejor tienda de zapatillas originales en Andahuaylas, Apurímac. Marcas reales, precios justos.
            </p>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="font-bold text-black mb-4 uppercase tracking-wide text-sm">Categorías</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/hombre" className="text-gray-600 hover:text-black text-sm transition">
                  Hombre
                </Link>
              </li>
              <li>
                <Link href="/mujer" className="text-gray-600 hover:text-black text-sm transition">
                  Mujer
                </Link>
              </li>
              <li>
                <Link href="/ninios" className="text-gray-600 hover:text-black text-sm transition">
                  Niños
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="text-red-600 hover:text-red-800 font-semibold text-sm transition">
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h4 className="font-bold text-black mb-4 uppercase tracking-wide text-sm">Información</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/seguimiento" className="text-gray-600 hover:text-black text-sm transition">
                  Seguimiento de Pedidos
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-black text-sm transition">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-black text-sm transition">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-black text-sm transition">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-bold text-black mb-4 uppercase tracking-wide text-sm">Contacto</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <p className="font-semibold text-black">Ubícanos</p>
                <p>Andahuaylas, Apurímac</p>
              </li>
              <li>
                <p className="font-semibold text-black">Horario</p>
                <p>Lunes a Sábado: 9am - 6pm</p>
                <p>Domingo: 9am - 2pm</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-black pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 md:mb-0">
              © {currentYear} Zapatillas Marcelo. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-500 hover:text-black transition">
                <span className="text-sm font-semibold">Facebook</span>
              </Link>
              <Link href="/" className="text-gray-500 hover:text-black transition">
                <span className="text-sm font-semibold">Instagram</span>
              </Link>
              <Link href="/" className="text-gray-500 hover:text-black transition">
                <span className="text-sm font-semibold">WhatsApp</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
