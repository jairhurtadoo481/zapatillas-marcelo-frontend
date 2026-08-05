import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Zapatillas Marcelo",
  description: "Tienda de zapatillas Zapatillas Marcelo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-white text-black">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
