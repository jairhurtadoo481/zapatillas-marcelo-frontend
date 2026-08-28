import "./globals.css";
import { Anton, Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Zapatillas Marcelo",
  description: "Tienda de zapatillas Zapatillas Marcelo",
  verification: {
    google: "5QJLTvzwUwKr-oZ9vk5653HDgSRTukKxxvpsI2W-x_o",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${anton.variable} ${inter.variable} bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
