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

export const eliminarToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};