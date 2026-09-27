export function Seccion({ titulo, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-2">{titulo}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

export default function PaginaLegal({ titulo, actualizado, children }) {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
        <p className="text-xs text-gray-500 mt-1 mb-8">Última actualización: {actualizado}</p>
        {children}
      </div>
    </div>
  );
}
