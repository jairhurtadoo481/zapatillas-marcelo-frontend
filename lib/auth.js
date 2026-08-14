export const guardarSesion = (token, usuario) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  }
};

export const guardarToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const obtenerToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const obtenerUsuario = () => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("usuario");
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const eliminarToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }
};