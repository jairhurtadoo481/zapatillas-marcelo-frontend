"use client";

import { useState } from "react";

const TABLA_HOMBRE = [
  { usa: "3.5", eur: "35.5", cm: "21.5" },
  { usa: "4", eur: "36", cm: "22" },
  { usa: "4.5", eur: "36.5", cm: "22.5" },
  { usa: "5", eur: "37.5", cm: "23" },
  { usa: "5.5", eur: "38", cm: "23.5" },
  { usa: "6", eur: "38.5", cm: "24" },
  { usa: "6.5", eur: "39", cm: "24.5" },
  { usa: "7", eur: "40", cm: "25" },
  { usa: "7.5", eur: "40.5", cm: "25.5" },
  { usa: "8", eur: "41", cm: "26" },
  { usa: "8.5", eur: "42", cm: "26.5" },
  { usa: "9", eur: "42.5", cm: "27" },
  { usa: "9.5", eur: "43", cm: "27.5" },
  { usa: "10", eur: "44", cm: "28" },
  { usa: "10.5", eur: "44.5", cm: "28.5" },
  { usa: "11", eur: "45", cm: "29" },
  { usa: "11.5", eur: "45.5", cm: "29.5" },
  { usa: "12", eur: "46", cm: "30" },
  { usa: "12.5", eur: "47", cm: "30.5" },
  { usa: "13", eur: "47.5", cm: "31" },
];

export default function GuiaTallas() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-sm text-blue-600 hover:underline"
      >
        Guia de tallas
      </button>

      {abierto && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setAbierto(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Tallas Hombre</h2>
              <button
                onClick={() => setAbierto(false)}
                className="text-gray-400 hover:text-black text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-2">USA</th>
                  <th className="py-2">EUR</th>
                  <th className="py-2">CM</th>
                </tr>
              </thead>
              <tbody>
                {TABLA_HOMBRE.map((fila) => (
                  <tr key={fila.usa} className="border-b border-gray-100">
                    <td className="py-2">{fila.usa}</td>
                    <td className="py-2">{fila.eur}</td>
                    <td className="py-2">{fila.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}