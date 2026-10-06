"use client";

import { useEffect, useRef, useState } from "react";
import { URL_BASE_PDF, describirNombre } from "../lib/comprobantes";

const PDFJS = "3.11.174";

const cargarPdfJs = () =>
  new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement("script");
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS}/pdf.min.js`;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS}/pdf.worker.min.js`;
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("No se pudo cargar el visor"));
    document.head.appendChild(script);
  });

export default function VisorComprobante({ nombre }) {
  const contenedor = useRef(null);
  const [estado, setEstado] = useState("cargando");
  const [archivo, setArchivo] = useState(null);

  const urlPdf = `${URL_BASE_PDF}${nombre}`;
  const { titulo, numero } = describirNombre(nombre);

  useEffect(() => {
    let cancelado = false;

    const mostrar = async () => {
      try {
        const [pdfjs, respuesta] = await Promise.all([cargarPdfJs(), fetch(urlPdf)]);
        if (!respuesta.ok) throw new Error("No se encontró el comprobante");
        const datos = await respuesta.arrayBuffer();
        if (cancelado) return;

        setArchivo(URL.createObjectURL(new Blob([datos], { type: "application/pdf" })));

        const pdf = await pdfjs.getDocument({ data: datos.slice(0) }).promise;
        const ancho = contenedor.current.clientWidth;
        const densidad = Math.min(window.devicePixelRatio || 1, 3);

        for (let n = 1; n <= pdf.numPages; n++) {
          const pagina = await pdf.getPage(n);
          const base = pagina.getViewport({ scale: 1 });
          const escala = (ancho / base.width) * densidad;
          const vista = pagina.getViewport({ scale: escala });

          const canvas = document.createElement("canvas");
          canvas.width = vista.width;
          canvas.height = vista.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.className = "block bg-white";
          await pagina.render({ canvasContext: canvas.getContext("2d"), viewport: vista }).promise;
          if (cancelado) return;
          contenedor.current.appendChild(canvas);
        }
        setEstado("listo");
      } catch (error) {
        if (!cancelado) setEstado("error");
      }
    };

    mostrar();
    return () => {
      cancelado = true;
    };
  }, [urlPdf]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-xl mx-auto px-3 py-6">
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">La Casa de Marcelo</p>
          <h1 className="text-lg font-bold text-gray-900">{titulo}</h1>
          <p className="text-sm text-gray-600">{numero}</p>
        </div>

        {estado === "cargando" && <p className="text-center text-sm text-gray-500 py-10">Cargando comprobante...</p>}

        {estado === "error" && (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-gray-700">No pudimos mostrar el comprobante en esta página.</p>
            <a
              href={urlPdf}
              className="inline-block bg-black text-white text-sm font-semibold rounded px-5 py-2"
            >
              Abrir el PDF
            </a>
          </div>
        )}

        <div ref={contenedor} className="shadow rounded overflow-hidden" />

        {archivo && (
          <div className="mt-4 text-center">
            <a
              href={archivo}
              download={`${titulo.split(" ")[0]}-${numero}.pdf`}
              className="inline-block bg-black text-white text-sm font-semibold rounded px-5 py-2 hover:bg-gray-800"
            >
              Descargar PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
