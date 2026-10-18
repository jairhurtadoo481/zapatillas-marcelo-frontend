// Se muestra al instante mientras una pagina espera sus datos (por ejemplo, si el
// servidor estaba dormido). Los estilos estan en globals.css, bajo ".carga".
export default function Loading() {
  return (
    <div className="carga" role="status" aria-live="polite">
      <div className="carga__huella" aria-hidden="true" />
      <div className="carga__centro">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={104} height={104} className="carga__logo" />
        <div className="carga__barra" aria-hidden="true">
          <span />
        </div>
        <p className="carga__texto">
          <span className="carga__texto-corto">Cargando zapatillas…</span>
          <span className="carga__texto-largo">La tienda se está despertando, un momento…</span>
        </p>
      </div>
    </div>
  );
}
