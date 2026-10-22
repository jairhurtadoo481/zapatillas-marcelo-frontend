import "./globals.css";
import { Anton, Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RegistrarSW from "../components/RegistrarSW";
import AvisoInstalar from "../components/AvisoInstalar";
import OcultarEnComprobante from "../components/OcultarEnComprobante";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Zapatillas Marcelo",
  description: "Tienda de zapatillas Zapatillas Marcelo",
  verification: {
    google: "5QJLTvzwUwKr-oZ9vk5653HDgSRTukKxxvpsI2W-x_o",
  },
  applicationName: "La Casa de Marcelo",
  appleWebApp: { capable: true, title: "Casa de Marcelo", statusBarStyle: "black" },
  // Declarar "icons" aqui reemplaza al app/icon.png automatico, por eso el ícono de la
  // pestaña se declara tambien (con un archivo liviano de 24 KB, no el de 915 KB).
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${anton.variable} ${inter.variable} bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white`}>
        <OcultarEnComprobante>
          <Navbar />
        </OcultarEnComprobante>
        <main>{children}</main>
        <OcultarEnComprobante>
          <Footer />
        </OcultarEnComprobante>
        <RegistrarSW />
        <OcultarEnComprobante>
          <AvisoInstalar />
        </OcultarEnComprobante>
      </body>
    </html>
  );
}
