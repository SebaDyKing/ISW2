import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginService } from "../services/auth.service";

function LoginForm() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const data = await loginService(correo, password);
      
      localStorage.setItem("token", data.token);

      const nombreReal = data.usuario.nombre || "Usuario";
      const apellidoReal = data.usuario.apellido || "";
      
      const nombreCompleto = `${nombreReal} ${apellidoReal}`.trim();
      
      const inicialApellido = apellidoReal ? `${apellidoReal.charAt(0).toUpperCase()}.` : "";
      const nombreMostrar = `${nombreReal} ${inicialApellido}`.trim();

      const datosUsuario = {
        nombreCompleto: nombreCompleto,
        nombreMostrar: nombreMostrar,
        rol: data.usuario.rol
      };
      
      localStorage.setItem("usuario", JSON.stringify(datosUsuario));

      toast.success("¡Bienvenido!");

      const payload = JSON.parse(atob(data.token.split(".")[1]));
      if (payload.rol === "administrador")   navigate("/admin");
      else if (payload.rol === "empleado")   navigate("/empleado");
      else if (payload.rol === "supervisor") navigate("/supervisor");
      else {
        const planGuardado = sessionStorage.getItem("planPreseleccionado");
        if (planGuardado) {
          navigate("/cliente/cotizar");
        } else {
          navigate("/cliente");
        }
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
        >
          ← Volver
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Iniciar sesión
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@ejemplo.cl"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type={verPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={verPassword}
                onChange={() => setVerPassword(!verPassword)}
                className="cursor-pointer"
              />
              Mostrar contraseña
            </label>
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          ¿No tienes cuenta?{" "}
          <a href="/registro" className="text-blue-600 hover:underline">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;