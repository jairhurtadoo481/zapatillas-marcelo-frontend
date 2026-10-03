export const NEGOCIO = {
  nombreComercial: "La Casa de Marcelo",
  titular: "Diego Marcelo Chiquillan Leyva",
  ruc: "10750805847",
  versionLegal: "25 de agosto de 2026",
  direccion: "Jr. Ramón Castilla 149, Andahuaylas, Apurímac",
  telefonoPrincipal: { texto: "917 654 316", tel: "+51917654316" },
  telefonoSoporte: { texto: "944 347 979", tel: "+51944347979" },
  horario: ["Lunes a Viernes: 8am - 10pm", "Sábados a Domingos: 9am - 10pm"],
  // Punto aproximado sobre el Jr. Ramón Castilla (las dos tiendas estan a una cuadra),
  // solo se usa para estimar la distancia. Reemplazar por coordenadas exactas si se tienen.
  coordenadasAprox: { lat: -13.65666, lng: -73.388 },
  sucursales: [
    {
      id: "principal",
      nombre: "Tienda principal",
      direccion: "Jr. Ramón Castilla 149, Andahuaylas, Apurímac",
      referencia: "",
    },
    {
      id: "galeria",
      nombre: "Sucursal 2",
      direccion: "Jirón Ramón Castilla 224, Andahuaylas 03701",
      referencia: "Dentro de la galería, a una cuadra de la tienda principal",
    },
  ],
};
