import Link from "next/link";
import PaginaLegal, { Seccion } from "../../components/PaginaLegal";
import { NEGOCIO } from "../../lib/negocio";

export const metadata = {
  title: "Política de Privacidad | La Casa de Marcelo",
  description: "Cómo tratamos tus datos personales cuando compras en La Casa de Marcelo.",
};

export default function PrivacidadPage() {
  return (
    <PaginaLegal titulo="Política de Privacidad" actualizado={NEGOCIO.versionLegal}>
      <p className="text-sm leading-relaxed text-gray-700 mb-8">
        En {NEGOCIO.nombreComercial} respetamos tu privacidad. Esta política explica qué datos personales
        recopilamos cuando haces un pedido en este sitio, para qué los usamos y cuáles son tus derechos, conforme
        a la Ley N.° 29733, Ley de Protección de Datos Personales.
      </p>

      <Seccion titulo="1. Quién es el responsable">
        <p>
          El responsable del tratamiento de tus datos es {NEGOCIO.titular}, titular de {NEGOCIO.nombreComercial}{" "}
          (Zapatillas Marcelo), con RUC {NEGOCIO.ruc} y domicilio en {NEGOCIO.direccion}.
        </p>
      </Seccion>

      <Seccion titulo="2. Qué datos recopilamos">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-semibold">Al hacer un pedido:</span> tu nombre completo, número de celular,
            ciudad, y tu dirección solo si eliges entrega a domicilio.
          </li>
          <li>
            <span className="font-semibold">Sobre tu pago:</span> el método que elegiste (Yape, Plin o BCP) y la
            imagen del comprobante de pago que subes.
          </li>
          <li>
            <span className="font-semibold">Para boleta o factura electrónica:</span> tu DNI o RUC, tu nombre o
            razón social y tu dirección, cuando el comprobante lo requiere.
          </li>
          <li>
            <span className="font-semibold">Al consultar tu pedido:</span> el número de pedido y tu celular.
          </li>
        </ul>
        <p>
          Además, el contenido de tu carrito se guarda en tu propio navegador para que no lo pierdas si cierras
          la página.
        </p>
      </Seccion>

      <Seccion titulo="3. Para qué usamos tus datos">
        <ul className="list-disc pl-5 space-y-1">
          <li>Procesar y confirmar tu pedido, y verificar tu pago.</li>
          <li>Coordinar la entrega o el recojo, y comunicarnos contigo por llamada o WhatsApp sobre tu pedido.</li>
          <li>Emitir comprobantes electrónicos y cumplir nuestras obligaciones tributarias ante la SUNAT.</li>
          <li>Atender tus consultas, cambios y reclamos.</li>
        </ul>
        <p>Usamos tus datos únicamente para estas finalidades.</p>
      </Seccion>

      <Seccion titulo="4. Con quién los compartimos">
        <p>No vendemos ni alquilamos tus datos personales. Solo los compartimos en estos casos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Con la <span className="font-semibold">SUNAT</span>, cuando emitimos un comprobante electrónico, tal
            como lo exige la ley.
          </li>
          <li>
            Con proveedores de servicios técnicos que nos permiten operar el sitio, como el alojamiento, la base
            de datos y el almacenamiento de imágenes en la nube. Sus servidores pueden estar ubicados fuera del
            Perú.
          </li>
          <li>Con autoridades competentes, cuando la ley lo exija.</li>
        </ul>
      </Seccion>

      <Seccion titulo="5. Cuánto tiempo los conservamos">
        <p>
          Conservamos tus datos durante el tiempo necesario para atender tu pedido, tus cambios o reclamos, y el
          que exija la normativa tributaria y contable para los comprobantes emitidos.
        </p>
      </Seccion>

      <Seccion titulo="6. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: conexión segura (HTTPS),
          acceso restringido al personal autorizado y protección con contraseña de las áreas de administración.
          Ningún sistema es infalible, pero trabajamos para reducir los riesgos.
        </p>
      </Seccion>

      <Seccion titulo="7. Tus derechos">
        <p>
          Puedes solicitar el acceso, la rectificación, la cancelación de tus datos o la oposición a su
          tratamiento. Para hacerlo, comunícate con nosotros por los medios de la página de{" "}
          <Link href="/contacto" className="underline text-blue-700">
            Contacto
          </Link>
          , indicando tu nombre y tu número de pedido. Si consideras que no atendimos tu solicitud, puedes acudir a
          la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.
        </p>
      </Seccion>

      <Seccion titulo="8. Menores de edad">
        <p>
          Los pedidos deben ser realizados por personas mayores de edad. No recopilamos intencionalmente datos de
          menores. Si compras calzado para un menor, los datos que nos entregas son los tuyos como comprador.
        </p>
      </Seccion>

      <Seccion titulo="9. Cambios en esta política">
        <p>
          Podemos actualizar esta política. La fecha de la última actualización aparece al inicio de la página.
          También puedes revisar nuestros{" "}
          <Link href="/terminos" className="underline text-blue-700">
            Términos y Condiciones
          </Link>
          .
        </p>
      </Seccion>
    </PaginaLegal>
  );
}
