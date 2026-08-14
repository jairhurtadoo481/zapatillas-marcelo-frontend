import "./globals.css";
import { Anton, Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Zapatillas Marcelo",
  description: "Tienda de zapatillas Zapatillas Marcelo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${anton.variable} ${inter.variable} bg-white text-black`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}