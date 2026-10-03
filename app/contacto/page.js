import Link from "next/link";
import { NEGOCIO } from "../../lib/negocio";

export const metadata = {
  title: "Contacto | La Casa de Marcelo",
  description: "Teléfonos, WhatsApp, ubicación y horario de atención de La Casa de Marcelo en Andahuaylas.",
};

const claseTarjeta = "border border-gray-200 rounded-lg p-4 bg-white";

export default function ContactoPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const enlaceWhatsapp = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola! Quisiera hacer una consulta.")}`
    : null;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contacto</h1>
        <p className="text-sm text-gray-600 mb-6">
          Escríbenos o llámanos para consultas sobre productos, tallas, tu pedido o cambios.
        </p>

        {enlaceWhatsapp && (
          <a
            href={enlaceWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-green-600 text-white rounded py-3 font-semibold hover:bg-green-700 transition mb-6"
          >
            Escribir por WhatsApp
          </a>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={claseTarjeta}>
            <h2 className="font-semibold text-gray-900 mb-2">Teléfonos</h2>
            <p className="text-sm text-gray-700">
              <a href={`tel:${NEGOCIO.telefonoPrincipal.tel}`} className="underline">
                {NEGOCIO.telefonoPrincipal.texto}
              </a>
            </p>
            <p className="text-sm text-gray-700">
              <a href={`tel:${NEGOCIO.telefonoSoporte.tel}`} className="underline">
                {NEGOCIO.telefonoSoporte.texto}
              </a>{" "}
              <span className="text-gray-500">(Soporte)</span>
            </p>
          </div>

          <div className={claseTarjeta}>
            <h2 className="font-semibold text-gray-900 mb-2">Horario</h2>
            {NEGOCIO.horario.map((linea) => (
              <p key={linea} className="text-sm text-gray-700">
                {linea}
              </p>
            ))}
          </div>

          <div className={`${claseTarjeta} sm:col-span-2`}>
            <h2 className="font-semibold text-gray-900 mb-2">Ubicación</h2>
            <div className="space-y-3">
              {NEGOCIO.sucursales.map((s) => (
                <div key={s.id}>
                  <p className="text-sm font-medium text-gray-900">{s.nombre}</p>
                  <p className="text-sm text-gray-700">{s.direccion}</p>
                  {s.referencia && <p className="text-xs text-gray-500">{s.referencia}</p>}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.direccion)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline text-blue-700 inline-block mt-1"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600 space-y-1">
          <p>
            ¿Ya hiciste un pedido?{" "}
            <Link href="/seguimiento" className="underline text-blue-700">
              Consulta su estado
            </Link>
            .
          </p>
          <p>
            ¿Tienes un reclamo o una queja?{" "}
            <Link href="/libro-de-reclamaciones" className="underline text-blue-700">
              Regístralo en nuestro Libro de Reclamaciones
            </Link>
            .
          </p>
          <p>
            Revisa también nuestros{" "}
            <Link href="/terminos" className="underline text-blue-700">
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/privacidad" className="underline text-blue-700">
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
