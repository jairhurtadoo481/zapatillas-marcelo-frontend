import VisorComprobante from "../../../components/VisorComprobante";
import { FORMATO_NOMBRE } from "../../../lib/comprobantes";

export const metadata = {
  title: "Comprobante electrónico | La Casa de Marcelo",
  robots: { index: false, follow: false },
};

export default async function ComprobantePage({ params }) {
  const { nombre } = await params;

  if (!FORMATO_NOMBRE.test(nombre)) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Enlace no válido</h1>
          <p className="text-sm text-gray-600">Revisa que el enlace del comprobante esté completo.</p>
        </div>
      </div>
    );
  }

  return <VisorComprobante nombre={nombre} />;
}
