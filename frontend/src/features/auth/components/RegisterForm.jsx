import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registroService } from "../services/auth.service";
import { normalizarRut, validarRut } from "../../../utils/rut";

function RegisterForm() {
  const [form, setForm] = useState({
    nombre_empresa: "",
    telefono: "",
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    password: "",
    confirmarPassword: "",
  });
  const [verPassword, setVerPassword]   = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [cargando, setCargando]         = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "telefono") {
      setForm({ ...form, telefono: e.target.value.replace(/\D/g, "") });
    } else if (e.target.name === "nombre" || e.target.name === "apellido") {
      setForm({ ...form, [e.target.name]: e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, "") });
    } else if (e.target.name === "rut") {
      setForm({ ...form, rut: normalizarRut(e.target.value) });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmarPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (!validarRut(form.rut)) {
      toast.error("RUT inválido. Verifica que esté correctamente escrito.");
      return;
    }
    setCargando(true);
    try {
      const { confirmarPassword, ...datosParaEnviar } = form;
      datosParaEnviar.telefono = `+569${form.telefono}`;
      await registroService(datosParaEnviar);
      toast.success("¡Cuenta creada correctamente!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al registrarse");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row relative overflow-hidden font-sans bg-slate-900">
      {/* Fondo */}
      <div className="absolute inset-0 bg-[url('/Fondo_LandingPage.png')] bg-cover bg-[center_20%] blur-[2px] brightness-[0.55] scale-105 z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1228cc] from-40% to-[#0a122880] z-10" />

      {/* Panel izquierdo — branding */}
      <div className="relative z-20 flex-1 flex flex-col justify-center px-8 py-10 lg:p-16 lg:pr-12 lg:max-w-lg hidden lg:flex">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-8 lg:mb-12">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-base text-white border border-white/25">✦</div>
            <span className="text-base font-semibold text-white tracking-tight">CleanPro</span>
          </div>
          <p className="text-[11px] font-medium text-white/60 tracking-widest uppercase mb-4">Plataforma empresarial</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-4">Empieza hoy<br className="hidden lg:block" /> con CleanPro</h1>
          <p className="text-sm text-white/65 leading-relaxed max-w-sm">
            Crea tu cuenta y accede a cotizaciones personalizadas,
            seguimiento de servicios y atención dedicada para tu empresa.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="relative z-20 flex-1 flex items-start justify-center p-4 lg:p-8 h-full overflow-y-auto w-full">
        <div className="bg-[#f4f5f8] rounded-2xl p-6 lg:p-8 w-full max-w-[440px] border border-[#dde1e9] shadow-2xl my-4 lg:my-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 mb-6 transition-colors"
          >
            ← Volver al inicio
          </button>

          <p className="text-xl font-semibold text-slate-900 mb-1">Crear cuenta</p>
          <p className="text-[13px] text-slate-500 mb-7">Completa los datos para registrar tu empresa.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Datos empresa */}
            <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase pb-1.5 border-b border-[#dde1e9] block mt-1">
              Datos de la empresa
            </span>

            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Nombre de empresa</label>
              <input
                type="text" name="nombre_empresa"
                value={form.nombre_empresa} onChange={handleChange}
                placeholder="Mi Empresa SpA" required
                className="w-full px-3 py-2 bg-white border border-[#dde1e9] rounded-lg text-[13px] text-slate-900 outline-none focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Teléfono de contacto</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-[#dde1e9] border-r-0 rounded-l-lg bg-slate-100 text-slate-500 text-[13px] whitespace-nowrap">
                  +569
                </span>
                <input
                  type="text" name="telefono"
                  value={form.telefono} onChange={handleChange}
                  placeholder="12345678" maxLength={8} required
                  className="flex-1 px-3 py-2 bg-white border border-[#dde1e9] rounded-r-lg text-[13px] text-slate-900 outline-none focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] transition-all"
                />
              </div>
            </div>

            {/* Datos representante */}
            <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase pb-1.5 border-b border-[#dde1e9] block mt-3">
              Datos del representante
            </span>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <div className="flex-1">
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Nombre</label>
                <input
                  type="text" name="nombre" maxLength={50}
                  value={form.nombre} onChange={handleChange}
                  placeholder="Juan" required
                  className="w-full px-3 py-2 bg-white border border-[#dde1e9] rounded-lg text-[13px] text-slate-900 outline-none focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Apellido</label>
                <input
                  type="text" name="apellido" maxLength={50}
                  value={form.apellido} onChange={handleChange}
                  placeholder="Pérez" required
                  className="w-full px-3 py-2 bg-white border border-[#dde1e9] rounded-lg text-[13px] text-slate-900 outline-none focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">RUT</label>
              <input
                type="text" name="rut" maxLength={10}
                value={form.rut} onChange={handleChange}
                placeholder="12345678-9" required
                className="w-full px-3 py-2 bg-white border border-[#dde1e9] rounded-lg text-[13px] text-slate-900 outline-none focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Correo electrónico</label>
              <input
                type="email" name="correo"
                value={form.correo} onChange={handleChange}
                placeholder="tucorreo@ejemplo.cl" required
                className="w-full px-3 py-2 bg-white border border-[#dde1e9] rounded-lg text-[13px] text-slate-900 outline-none focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] transition-all"
              />
            </div>

            {/* Credenciales */}
            <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase pb-1.5 border-b border-[#dde1e9] block mt-3">
              Credenciales de acceso
            </span>

            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Contraseña</label>
              <input
                type={verPassword ? "text" : "password"}
                name="password" maxLength={64}
                value={form.password} onChange={handleChange}
                placeholder="••••••••" required
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

            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Confirmar contraseña</label>
              <input
                type={verConfirmar ? "text" : "password"}
                name="confirmarPassword" maxLength={64}
                value={form.confirmarPassword} onChange={handleChange}
                placeholder="••••••••" required
                className="w-full px-3 py-2 bg-white border border-[#dde1e9] rounded-lg text-[13px] text-slate-900 outline-none focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] transition-all"
              />
              <label className="flex items-center gap-2 mt-2 text-[13px] text-slate-500 cursor-pointer w-fit hover:text-slate-700">
                <input
                  type="checkbox"
                  checked={verConfirmar}
                  onChange={() => setVerConfirmar(!verConfirmar)}
                  className="cursor-pointer rounded border-slate-300 text-[#534AB7] focus:ring-[#534AB7]"
                />
                Mostrar contraseña
              </label>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-2.5 mt-4 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                cargando ? "bg-slate-400 cursor-not-allowed" : "bg-[#534AB7] hover:bg-[#4238a3] cursor-pointer"
              }`}
            >
              {cargando ? "Registrando..." : "Crear cuenta →"}
            </button>
          </form>

          <p className="text-center text-[13px] text-slate-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-[#534AB7] font-medium hover:underline">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;