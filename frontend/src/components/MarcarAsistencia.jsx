import React, { useState, useEffect } from "react";
import api from "../config/axios";

// Helper para convertir formato HH:mm:ss o HH:mm a minutos
function horaAMinutos(horaStr) {
  if (!horaStr) return 0;
  const [hh, mm, ss = 0] = horaStr.split(":").map(Number);
  return hh * 60 + mm + ss / 60;
}

// Helper para calcular horas trabajadas restando colación
function calcularHorasTrabajadas(asistencia) {
  if (!asistencia.entrada || !asistencia.salida) return "--";
  const entradaMin = horaAMinutos(asistencia.entrada);
  const salidaMin = horaAMinutos(asistencia.salida);
  let totalMin = salidaMin - entradaMin;

  // Si tiene colación registrada, descontamos la pausa real realizada
  if (asistencia.inicioColacion && asistencia.finColacion) {
    const colacionMin = horaAMinutos(asistencia.finColacion) - horaAMinutos(asistencia.inicioColacion);
    totalMin -= colacionMin;
  }

  const horas = totalMin / 60;
  return `${horas.toFixed(1)}h`;
}

// Helper para formatear fecha en español (ej: "Viernes, 3 de Julio")
function formatFechaEspanol(date) {
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const mesCapitalizado = meses[date.getMonth()].charAt(0).toUpperCase() + meses[date.getMonth()].slice(1);
  return `${dias[date.getDay()]}, ${date.getDate()} de ${mesCapitalizado}`;
}

// Helper para formatear hora actual (ej: "1:02 a. m.")
function formatHoraEspanol(date) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function MarcarAsistencia({ idContratoProp }) {
  const idContrato = idContratoProp || Number(localStorage.getItem("idContrato")) || 1;

  // Estados del reloj
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estados de Asistencia
  const [asistenciaHoy, setAsistenciaHoy] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userIp, setUserIp] = useState("Cargando IP...");

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cargarDatos = async () => {
    setErrorText("");
    setLoadingHistory(true);
    try {
      // Obtener todos los registros de asistencia
      const res = await api.get("/asistencias");
      if (res && res.status === "Success") {
        const registros = res.data;

        // Filtrar por contrato actual
        const registrosEmpleado = registros.filter(
          (reg) => reg.contrato && reg.contrato.idContrato === idContrato
        );

        // Guardar copia local de respaldo
        localStorage.setItem(`historial_${idContrato}`, JSON.stringify(registrosEmpleado));

        // Identificar el registro de hoy
        const hoyStr = new Date().toISOString().slice(0, 10);
        const hoyReg = registrosEmpleado.find((reg) => reg.fecha === hoyStr);
        setAsistenciaHoy(hoyReg || null);

        // Obtener historial de los últimos 3 días ordenados descendente por fecha
        const ordenado = registrosEmpleado.sort((a, b) => b.fecha.localeCompare(a.fecha));
        setHistorial(ordenado.slice(0, 3));
      }
    } catch (err) {
      console.warn("No se pudo obtener el historial desde la API, usando respaldo local:", err);
      // Fallback silencioso a localStorage
      const cache = localStorage.getItem(`historial_${idContrato}`);
      if (cache) {
        const registrosEmpleado = JSON.parse(cache);
        const hoyStr = new Date().toISOString().slice(0, 10);
        const hoyReg = registrosEmpleado.find((reg) => reg.fecha === hoyStr);
        setAsistenciaHoy(hoyReg || null);

        const ordenado = registrosEmpleado.sort((a, b) => b.fecha.localeCompare(a.fecha));
        setHistorial(ordenado.slice(0, 3));
      } else {
        setAsistenciaHoy(null);
        setHistorial([]);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  // Cargar datos al iniciar o cambiar de contrato
  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idContrato]);

  // Obtener IP pública del usuario
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setUserIp(data.ip))
      .catch((err) => {
        console.error("Error al obtener la IP:", err);
        setUserIp("No disponible");
      });
  }, []);

  // Helper para capturar geolocalización y realizar marcaje
  const realizarMarcaje = (endpoint, successCallback) => {
    setLoading(true);
    setErrorText("");

    const ahora = new Date();
    // Formatear fecha local YYYY-MM-DD
    const fechaDispositivo = ahora.toISOString().slice(0, 10);
    const horaDispositivo = ahora.toTimeString().split(" ")[0];

    const enviarPeticion = (lat, lon) => {
      const payload = {
        idContrato,
        latitud: lat,
        longitud: lon,
        fechaDispositivo,
        horaDispositivo,
      };

      api
        .post(endpoint, payload)
        .then((res) => {
          if (res && res.status === "Success") {
            const registroMarcado = res.data;
            if (registroMarcado) {
              const cache = localStorage.getItem(`historial_${idContrato}`);
              let registrosEmpleado = cache ? JSON.parse(cache) : [];

              // Buscar si ya existe el registro de esta fecha para actualizarlo
              const index = registrosEmpleado.findIndex((r) => r.fecha === registroMarcado.fecha);
              if (index !== -1) {
                registrosEmpleado[index] = {
                  ...registrosEmpleado[index],
                  ...registroMarcado,
                };
              } else {
                registrosEmpleado.push(registroMarcado);
              }
              localStorage.setItem(`historial_${idContrato}`, JSON.stringify(registrosEmpleado));
            }

            cargarDatos();
            if (successCallback) successCallback();
          }
        })
        .catch((err) => {
          const mensajeError = err.response?.data?.message || "Ocurrió un error al procesar el marcaje.";
          setErrorText(mensajeError);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    // Solicitar coordenadas
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          enviarPeticion(position.coords.latitude, position.coords.longitude);
        },
        () => {
          console.warn("Geolocalización rechazada, usando coordenadas de respaldo.");
          // Coordenadas fallback (Edificio Central)
          enviarPeticion(-36.827, -73.0498);
        },
        { timeout: 5000 }
      );
    } else {
      console.warn("Geolocalización no soportada, usando coordenadas de respaldo.");
      enviarPeticion(-36.827, -73.0498);
    }
  };

  const handleEntrada = () => realizarMarcaje("/asistencias/entrada");
  const handleSalida = () => realizarMarcaje("/asistencias/salida");
  const handleInicioColacion = () => realizarMarcaje("/asistencias/colacion/inicio");
  const handleFinColacion = () => realizarMarcaje("/asistencias/colacion/fin");

  // Determinar estado actual
  const tieneEntrada = !!asistenciaHoy;
  const tieneSalida = asistenciaHoy && !!asistenciaHoy.salida;
  const tieneInicioColacion = asistenciaHoy && !!asistenciaHoy.inicioColacion;
  const tieneFinColacion = asistenciaHoy && !!asistenciaHoy.finColacion;

  // Formatear hora de marcajes del historial (ej: "1:02 a. m.")
  const formatHoraHistorial = (horaStr) => {
    if (!horaStr) return "";
    try {
      const [hh, mm, ss = 0] = horaStr.split(":").map(Number);
      const ampm = hh >= 12 ? 'p. m.' : 'a. m.';
      let hours = hh % 12;
      if (hours === 0) hours = 12;
      const minutes = String(mm).padStart(2, '0');
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      return horaStr;
    }
  };

  // Convierte "YYYY-MM-DD" a "Lunes 23 de noviembre 2026"
  const obtenerFechaTexto = (fechaStr) => {
    try {
      const regDate = new Date(fechaStr + "T00:00:00");
      const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];

      const diaSemana = diasSemana[regDate.getDay()];
      const diaMes = regDate.getDate();
      const mes = meses[regDate.getMonth()];
      const anio = regDate.getFullYear();

      return `${diaSemana} ${diaMes} de ${mes} ${anio}`;
    } catch {
      return fechaStr;
    }
  };

  return (
    <div className="flex-1 bg-[#f4f6fb] min-h-screen p-12 flex flex-col items-center">
      {/* Header section with clock and date */}
      <div className="text-center mb-1.5">
        <h1 className="text-xl font-bold text-[#1a1f36] m-0 mb-3.5">
          Registro de Asistencia
        </h1>
        <p className="text-[44px] font-extrabold text-[#4f46e5] m-0 tracking-tight leading-none">
          {formatHoraEspanol(currentTime)}
        </p>
        <p className="text-[#8a90a2] text-sm mt-1.5 mb-[34px] font-medium">
          {formatFechaEspanol(currentTime)}
        </p>
      </div>

      {/* Acciones Card */}
      <div className="bg-white border border-[#e6e9f2] rounded-2xl p-6 w-full max-w-[576px] mb-[22px] shadow-[0_1px_2px_rgba(20,20,43,0.03)]">
        {/* Iniciar Turno (MARCAR ENTRADA) */}
        <button
          disabled={loading || tieneEntrada}
          onClick={handleEntrada}
          className="w-full border-none rounded-xl p-5 text-base font-bold text-white transition-all duration-150 active:scale-[0.98] cursor-pointer bg-[#166534] hover:brightness-[1.05] disabled:bg-[#e2e5ee] disabled:text-[#a7acbd] disabled:cursor-not-allowed disabled:transform-none disabled:filter-none mb-3.5 flex items-center justify-center gap-2"
        >
          Iniciar Turno
        </button>

        {/* Acciones de Colación (Iniciar / Terminar) */}
        <div className="grid grid-cols-2 gap-3 mb-3.5">
          <button
            disabled={loading || !tieneEntrada || tieneInicioColacion || tieneSalida}
            onClick={handleInicioColacion}
            className="border-none rounded-lg p-4 px-2 text-[13.5px] font-bold text-white transition-all duration-150 active:scale-[0.97] cursor-pointer bg-[#854d0e] hover:brightness-[1.05] disabled:bg-[#e2e5ee] disabled:text-[#a7acbd] disabled:cursor-not-allowed disabled:transform-none disabled:filter-none flex items-center justify-center gap-2"
          >
            Marcar Colación
          </button>

          <button
            disabled={loading || !tieneEntrada || !tieneInicioColacion || tieneFinColacion || tieneSalida}
            onClick={handleFinColacion}
            className="border-none rounded-lg p-4 px-2 text-[13.5px] font-bold text-white transition-all duration-150 active:scale-[0.97] cursor-pointer bg-[#1d4ed8] hover:brightness-[1.05] disabled:bg-[#e2e5ee] disabled:text-[#a7acbd] disabled:cursor-not-allowed disabled:transform-none disabled:filter-none flex items-center justify-center gap-2"
          >
            Finalizar Colación
          </button>
        </div>

        {/* Finalizar Turno (MARCAR SALIDA) */}
        <button
          disabled={loading || !tieneEntrada || tieneSalida || (tieneInicioColacion && !tieneFinColacion)}
          onClick={handleSalida}
          className="w-full border-none rounded-xl p-5 text-base font-bold text-white transition-all duration-150 active:scale-[0.98] cursor-pointer bg-[#ef4444] hover:brightness-[1.05] disabled:bg-[#e2e5ee] disabled:text-[#a7acbd] disabled:cursor-not-allowed disabled:transform-none disabled:filter-none flex items-center justify-center gap-2"
        >
          Finalizar Turno
        </button>
      </div>

      {/* Historial Card */}
      <div className="bg-white border border-[#e6e9f2] rounded-2xl p-6 w-full max-w-[576px] shadow-[0_1px_2px_rgba(20,20,43,0.03)]">
        <div className="text-[11px] tracking-[0.6px] text-[#9096a8] font-bold mb-4">
          HISTORIAL RECIENTE
        </div>

        {loadingHistory ? (
          <div className="text-center text-[#8a90a2] text-sm py-4">
            Cargando historial...
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center text-[#8a90a2] text-sm py-4">
            No hay marcajes registrados.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            {/* Tabla sin líneas */}
            <div className="min-w-[650px]">
              {/* Encabezado */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] text-[10px] font-extrabold text-[#9096a8] uppercase pb-2 mb-2 text-center select-none border-b border-[#e6e9f2]/30">
                <div className="text-left">Fecha</div>
                <div>Inicio de Turno</div>
                <div>Inicio de Colación</div>
                <div>Término de Colación</div>
                <div>Fin de Turno</div>
              </div>

              {/* Datos */}
              <div className="space-y-3.5">
                {historial.map((reg) => (
                  <div
                    key={reg.idAsistencia}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] text-[12.5px] text-[#4f566b] py-1 text-center font-medium items-center"
                  >
                    <div className="font-bold text-slate-800 text-left">
                      {obtenerFechaTexto(reg.fecha)}
                    </div>
                    <div className="text-[#1e293b]">{formatHoraHistorial(reg.entrada) || "--"}</div>
                    <div className="text-[#1e293b]">{formatHoraHistorial(reg.inicioColacion) || "--"}</div>
                    <div className="text-[#1e293b]">{formatHoraHistorial(reg.finColacion) || "--"}</div>
                    <div className="text-[#1e293b]">{formatHoraHistorial(reg.salida) || "--"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
