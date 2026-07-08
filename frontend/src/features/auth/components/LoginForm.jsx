import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginService } from "../services/auth.service";

function LoginForm() {
  const [correo, setCorreo]         = useState("");
  const [password, setPassword]     = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando]     = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const data = await loginService(correo, password);

      const nombreReal      = data.usuario.nombre   || "Usuario";
      const apellidoReal    = data.usuario.apellido || "";
      const nombreCompleto  = `${nombreReal} ${apellidoReal}`.trim();
      const inicialApellido = apellidoReal ? `${apellidoReal.charAt(0).toUpperCase()}.` : "";
      const nombreMostrar   = `${nombreReal} ${inicialApellido}`.trim();

      localStorage.setItem("usuario", JSON.stringify({
        idUsuario: data.usuario.id,
        nombreCompleto,
        nombreMostrar,
        rol: data.usuario.rol,
      }));

      toast.success("¡Bienvenido!");

      const rol = data.usuario.rol;
      if (rol === "administrador") navigate("/admin");
      else if (rol === "supervisor") navigate("/supervisor");
      else if (rol === "empleado") navigate("/empleado");
      else {
        const planGuardado = sessionStorage.getItem("planPreseleccionado");
        if (planGuardado) {
          sessionStorage.removeItem("planPreseleccionado");
          navigate("/cliente/mis-cotizaciones", { state: { abrirModal: true, idPlan: planGuardado } });
        } else {
          navigate("/cliente/mis-cotizaciones");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden font-sans bg-slate-900">
      {/* Fondo */}
      <div className="absolute inset-0 bg-[url('/Fondo_LandingPage.png')] bg-cover bg-[center_20%] blur-[2px] brightness-[0.55] scale-105 z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1228cc] from-40% to-[#0a122880] z-10" />

      {/* Panel izquierdo — branding */}
      <div className="relative z-20 flex-1 flex flex-col justify-center px-8 py-10 lg:p-16 lg:pr-12 lg:max-w-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-8 lg:mb-12">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-base text-white border border-white/25">✦</div>
            <span className="text-base font-semibold text-white tracking-tight">CleanPro</span>
          </div>
          <p className="text-[11px] font-medium text-white/60 tracking-widest uppercase mb-4">Plataforma empresarial</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-4">Bienvenido<br className="hidden lg:block" /> de vuelta</h1>
          <p className="text-sm text-white/65 leading-relaxed max-w-sm">
            Accede a tu cuenta para gestionar tus instalaciones,
            revisar cotizaciones y coordinar con nuestro equipo.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="bg-[#f4f5f8] rounded-2xl p-6 lg:p-8 w-full max-w-[400px] border border-[#dde1e9] shadow-2xl">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 mb-6 transition-colors"
          >
            ← Volver al inicio
          </button>

          <p className="text-xl font-semibold text-slate-900 mb-1">Iniciar sesión</p>
          <p className="text-[13px] text-slate-500 mb-7">Ingresa tus credenciales para continuar.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tucorreo@ejemplo.cl"
                required
                className="w-full px-3 py-2 bg-white border border-[#dde1e9] rounded-lg text-[13px] text-slate-900 outline-none focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Contraseña</label>
              <input
                type={verPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 bg-white border border-[#dde1e9] rounded-lg text-[13px] text-slate-900 outline-none focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] transition-all"
              />
              <label className="flex items-center gap-2 mt-2 text-[13px] text-slate-500 cursor-pointer w-fit hover:text-slate-700">
                <input
                  type="checkbox"
                  checked={verPassword}
                  onChange={() => setVerPassword(!verPassword)}
                  className="cursor-pointer rounded border-slate-300 text-[#534AB7] focus:ring-[#534AB7]"
                />
                Mostrar contraseña
              </label>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-2.5 mt-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                cargando ? "bg-slate-400 cursor-not-allowed" : "bg-[#534AB7] hover:bg-[#4238a3] cursor-pointer"
              }`}
            >
              {cargando ? "Iniciando sesión..." : "Iniciar sesión →"}
            </button>
          </form>

          <p className="text-center text-[13px] text-slate-500 mt-6">
            ¿No tienes cuenta?{" "}
            <a href="/registro" className="text-[#534AB7] font-medium hover:underline">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;