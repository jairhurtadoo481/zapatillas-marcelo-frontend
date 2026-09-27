import Link from "next/link";
import PaginaLegal, { Seccion } from "../../components/PaginaLegal";
import { NEGOCIO } from "../../lib/negocio";

export const metadata = {
  title: "Términos y Condiciones | La Casa de Marcelo",
  description: "Condiciones para comprar en La Casa de Marcelo: pedidos, pagos, entrega, cambios y reclamos.",
};

export default function TerminosPage() {
  return (
    <PaginaLegal titulo="Términos y Condiciones" actualizado={NEGOCIO.versionLegal}>
      <p className="text-sm leading-relaxed text-gray-700 mb-8">
        Al usar este sitio y hacer un pedido aceptas los siguientes términos. Léelos antes de comprar.
      </p>

      <Seccion titulo="1. Quiénes somos">
        <p>
          Este sitio es operado por {NEGOCIO.titular}, titular de {NEGOCIO.nombreComercial} (Zapatillas Marcelo),
          con RUC {NEGOCIO.ruc} y domicilio en {NEGOCIO.direccion}. Vendemos zapatillas de marcas originales.
        </p>
      </Seccion>

      <Seccion titulo="2. Productos y disponibilidad">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Las fotos y descripciones son referenciales. Los colores pueden verse ligeramente distintos según tu
            pantalla.
          </li>
          <li>
            El stock se maneja por talla y está sujeto a disponibilidad. Elige tu talla con la guía de tallas que
            aparece en cada producto.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="3. Precios">
        <ul className="list-disc pl-5 space-y-1">
          <li>Los precios están expresados en soles (S/) e incluyen el IGV.</li>
          <li>
            Los precios de oferta están vigentes mientras se muestren en el sitio y hasta agotar stock. Los
            productos en oferta requieren el pago completo.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="4. Cómo hacer un pedido y pagar">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Agrega tus productos al carrito y presiona Iniciar compra.</li>
          <li>Completa tus datos: nombre, celular, ciudad y, si quieres entrega a domicilio, tu dirección.</li>
          <li>Elige Yape, Plin o BCP, escanea el código QR y paga el monto exacto indicado.</li>
          <li>Sube la captura o foto de tu comprobante de pago y finaliza la compra.</li>
        </ol>
        <p>
          Tu pedido queda pendiente de confirmación hasta que nuestro personal verifique el pago y se comunique
          contigo. Si el pago no coincide con el monto, no se puede verificar o el producto ya no está disponible,
          te avisaremos y coordinaremos contigo la devolución del dinero o una alternativa.
        </p>
      </Seccion>

      <Seccion titulo="5. Entrega y recojo">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-semibold">En Andahuaylas:</span> puedes recoger tu pedido en la sucursal que te
            indiquemos cuando esté listo, o pedir entrega a domicilio.
          </li>
          <li>
            <span className="font-semibold">Fuera de Andahuaylas:</span> coordinamos contigo por teléfono o
            WhatsApp el envío, los plazos y cualquier costo antes de despachar.
          </li>
          <li>
            Puedes revisar el estado de tu pedido en{" "}
            <Link href="/seguimiento" className="underline text-blue-700">
              Seguimiento de Pedidos
            </Link>{" "}
            con tu número de pedido y tu celular.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="6. Comprobantes de pago">
        <p>
          Emitimos boleta o factura electrónica conforme a las normas de la SUNAT. Si necesitas factura, indícanos
          tu RUC y razón social cuando nuestro personal se comunique contigo.
        </p>
      </Seccion>

      <Seccion titulo="7. Cambios, devoluciones y reclamos">
        <p>
          Si tu producto llegó con algún defecto o no corresponde a lo que pediste, comunícate con nosotros lo
          antes posible indicando tu número de pedido, para evaluar el cambio o la devolución conforme al Código
          de Protección y Defensa del Consumidor (Ley N.° 29571). Para cambios de talla o de modelo, escríbenos y
          te indicaremos las condiciones y la disponibilidad.
        </p>
        <p>
          Puedes contactarnos por los medios de la página de{" "}
          <Link href="/contacto" className="underline text-blue-700">
            Contacto
          </Link>
          .
        </p>
      </Seccion>

      <Seccion titulo="8. Uso del sitio y propiedad intelectual">
        <p>
          Las marcas y logos que aparecen en el sitio pertenecen a sus respectivos dueños y los usamos solo para
          identificar los productos que vendemos. El contenido propio del sitio no puede copiarse ni reutilizarse
          sin nuestra autorización.
        </p>
      </Seccion>

      <Seccion titulo="9. Tus datos">
        <p>
          El tratamiento de tus datos personales se explica en nuestra{" "}
          <Link href="/privacidad" className="underline text-blue-700">
            Política de Privacidad
          </Link>
          .
        </p>
      </Seccion>

      <Seccion titulo="10. Ley aplicable y cambios">
        <p>
          Estos términos se rigen por las leyes de la República del Perú. Podemos actualizarlos; la fecha de la
          última actualización aparece al inicio de la página.
        </p>
      </Seccion>
    </PaginaLegal>
  );
}
