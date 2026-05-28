import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registroService } from "../services/auth.service";

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
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "telefono") {
      const soloNumeros = e.target.value.replace(/\D/g, "");
      setForm({ ...form, telefono: soloNumeros });
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Crear cuenta
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Datos de la empresa */}
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Datos de la empresa
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de empresa
            </label>
            <input
              type="text"
              name="nombre_empresa"
              value={form.nombre_empresa}
              onChange={handleChange}
              placeholder="Mi Empresa SpA"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono de contacto
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500 text-sm">
                +569
              </span>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="12345678"
                maxLength={8}
                required
                className="w-full border border-gray-300 rounded-r-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Datos del representante */}
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-2">
            Datos del representante
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Juan"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RUT
            </label>
            <input
              type="text"
              name="rut"
              value={form.rut}
              onChange={handleChange}
              placeholder="12345678-9"
              maxLength={10}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
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
              name="password"
              value={form.password}
              onChange={handleChange}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type={verConfirmar ? "text" : "password"}
              name="confirmarPassword"
              value={form.confirmarPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={verConfirmar}
                onChange={() => setVerConfirmar(!verConfirmar)}
                className="cursor-pointer"
              />
              Mostrar contraseña
            </label>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 mt-2"
          >
            {cargando ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;