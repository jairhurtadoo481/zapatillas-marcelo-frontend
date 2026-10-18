export const metadata = {
  manifest: "/api/manifest/admin",
  appleWebApp: { capable: true, title: "Marcelo Admin", statusBarStyle: "black" },
};

export default function AdminLayout({ children }) {
  return children;
}
