import React, { useState, useEffect } from "react";
import api from "../services/api";

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

// Helper para formatear fecha en español (ej: "jueves, 26 de marzo")
function formatFechaEspanol(date) {
  const opciones = { weekday: "long", day: "numeric", month: "long" };
  let fecha = date.toLocaleDateString("es-ES", opciones);
  // Asegurar formato en minúsculas como en el screenshot
  return fecha.toLowerCase();
}

// Helper para formatear hora actual (ej: "12:34 p. m.")
function formatHoraEspanol(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "a. m." : "p. m."; // En la app del screenshot usan "a. m. / p. m."
  // Ajuste a formato 12 horas
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function MarcarAsistencia({ idContratoProp, installationNameFallback = "Edificio Central" }) {
  // Obtener idContrato desde prop, localStorage o usar 1 por defecto (Juan Pérez)
  const idContrato = idContratoProp || Number(localStorage.getItem("idContrato")) || 1;

  // Estados del reloj
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estados de Asistencia
  const [tipoJornada, setTipoJornada] = useState("colacion"); // 'colacion' o 'corrida'
  const [asistenciaHoy, setAsistenciaHoy] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Estado del temporizador de colación (segundos restantes para cumplir 30 minutos)
  const [colacionTimeLeft, setColacionTimeLeft] = useState(0);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carga inicial de datos de asistencia e historial
  useEffect(() => {
    cargarDatos();
  }, [idContrato]);

  // Temporizador para el botón "Fin Colación"
  useEffect(() => {
    let timer;
    if (asistenciaHoy && asistenciaHoy.inicioColacion && !asistenciaHoy.finColacion) {
      // Calcular hora esperada de fin (+30 minutos de inicioColacion)
      const [hh, mm, ss = 0] = asistenciaHoy.inicioColacion.split(":").map(Number);
      const inicioDate = new Date();
      inicioDate.setHours(hh, mm, ss, 0);
      const finColacionDate = new Date(inicioDate.getTime() + 30 * 60 * 1000);

      const calcularRestante = () => {
        const diffMs = finColacionDate.getTime() - new Date().getTime();
        const diffSec = Math.max(0, Math.ceil(diffMs / 1000));
        setColacionTimeLeft(diffSec);
      };

      calcularRestante();
      timer = setInterval(calcularRestante, 1000);
    } else {
      setColacionTimeLeft(0);
    }
    return () => clearInterval(timer);
  }, [asistenciaHoy]);

  const cargarDatos = async () => {
    setErrorText("");
    setLoadingHistory(true);
    try {
      // Obtener todos los registros de asistencia
      const res = await api.get("/asistencias");
      if (res.data && res.data.status === "Success") {
        const registros = res.data.data;

        // Filtrar por contrato actual
        const registrosEmpleado = registros.filter(
          (reg) => reg.contrato && reg.contrato.idContrato === idContrato
        );

        // Identificar el registro de hoy
        const hoyStr = new Date().toISOString().slice(0, 10);
        const hoyReg = registrosEmpleado.find((reg) => reg.fecha === hoyStr);
        setAsistenciaHoy(hoyReg || null);

        // Si hoy ya hay registro, bloquear la jornada según lo guardado
        if (hoyReg) {
          if (hoyReg.inicioColacion || hoyReg.finColacion) {
            setTipoJornada("colacion");
          } else {
            const savedType = localStorage.getItem(`tipoJornada_${idContrato}_${hoyStr}`);
            if (savedType) {
              setTipoJornada(savedType);
            }
          }
        }

        // Obtener historial de los últimos 3 días (excluyendo hoy si se desea, o incluyéndolo ordenado)
        // Ordenamos descendente por fecha
        const ordenado = registrosEmpleado.sort((a, b) => b.fecha.localeCompare(a.fecha));
        setHistorial(ordenado.slice(0, 3));
      }
    } catch (err) {
      console.error("Error al cargar asistencias:", err);
      setErrorText("No se pudo cargar el historial de asistencia.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper para capturar geolocalización y realizar marcaje
  const realizarMarcaje = (endpoint, successCallback) => {
    setLoading(true);
    setErrorText("");

    const ahora = new Date();
    // Formatear fecha local YYYY-MM-DD
    const fechaDispositivo = ahora.toISOString().slice(0, 10);
    // Formatear hora local HH:mm:ss
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
          if (res.data && res.data.status === "Success") {
            // Guardar selección de tipo de jornada si es Entrada
            if (endpoint === "/asistencias/entrada") {
              localStorage.setItem(`tipoJornada_${idContrato}_${fechaDispositivo}`, tipoJornada);
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
        (error) => {
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

  // Handlers para cada acción
  const handleEntrada = () => realizarMarcaje("/asistencias/entrada");
  const handleSalida = () => realizarMarcaje("/asistencias/salida");
  const handleInicioColacion = () => realizarMarcaje("/asistencias/colacion/inicio");
  const handleFinColacion = () => realizarMarcaje("/asistencias/colacion/fin");

  // Formatear tiempo restante de colación en MM:SS
  const formatTimeLeft = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Determinar estado actual
  const tieneEntrada = !!asistenciaHoy;
  const tieneSalida = asistenciaHoy && !!asistenciaHoy.salida;
  const tieneInicioColacion = asistenciaHoy && !!asistenciaHoy.inicioColacion;
  const tieneFinColacion = asistenciaHoy && !!asistenciaHoy.finColacion;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-8 flex flex-col items-center">
      {/* Título Principal */}
      <h1 className="text-xl font-bold text-slate-800 tracking-wide mt-2">
        Registro de Asistencia
      </h1>

      {/* Reloj y Fecha en tiempo real */}
      <div className="flex flex-col items-center mt-3 mb-8">
        <span className="text-4xl font-extrabold text-indigo-600 tracking-tight">
          {formatHoraEspanol(currentTime)}
        </span>
        <span className="text-sm font-semibold text-slate-400 mt-1 capitalize">
          {formatFechaEspanol(currentTime)}
        </span>
      </div>

      <div className="w-full max-w-xl space-y-6">
        {/* SECCIÓN 1: TIPO DE JORNADA */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">
            1. TIPO DE JORNADA
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Tarjeta Con Colación */}
            <button
              disabled={tieneEntrada}
              onClick={() => setTipoJornada("colacion")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                tipoJornada === "colacion"
                  ? "border-indigo-600 bg-indigo-50/40 text-indigo-600"
                  : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
              } ${tieneEntrada ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-4-9 4 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path fill="currentColor" d="M18.5 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
              <span className="text-sm font-bold">Con Colación</span>
              <span className="text-[10px] font-bold tracking-wider opacity-60 mt-0.5">30 MIN PAUSA</span>
            </button>

            {/* Tarjeta Corrida */}
            <button
              disabled={tieneEntrada}
              onClick={() => setTipoJornada("corrida")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                tipoJornada === "corrida"
                  ? "border-indigo-600 bg-indigo-50/40 text-indigo-600"
                  : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
              } ${tieneEntrada ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-bold">Corrida</span>
              <span className="text-[10px] font-bold tracking-wider opacity-60 mt-0.5">SIN PAUSA</span>
            </button>
          </div>
        </div>

        {/* SECCIÓN 2: ACCIÓN */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
            2. ACCIÓN
          </h2>

          <div className="flex flex-col items-center w-full space-y-4">
            {/* 2.1 Sin Entrada Marcada */}
            {!tieneEntrada && (
              <button
                disabled={loading}
                onClick={handleEntrada}
                className="w-full flex items-center justify-center py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>MARCAR ENTRADA</span>
                  </>
                )}
              </button>
            )}

            {/* 2.2 Entrada Registrada (y no salida) */}
            {tieneEntrada && !tieneSalida && (
              <div className="w-full space-y-4">
                {/* Banner Verde Éxito */}
                <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col items-center text-center">
                  <svg className="w-8 h-8 text-emerald-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold text-emerald-800">Entrada Registrada</span>
                  <span className="text-xs text-emerald-600 mt-0.5">
                    A las {asistenciaHoy.entrada?.slice(0, 5)} hrs en {installationNameFallback}
                  </span>
                </div>

                {/* Si requiere colación y no ha iniciado colación */}
                {tipoJornada === "colacion" && !tieneInicioColacion && (
                  <button
                    disabled={loading}
                    onClick={handleInicioColacion}
                    className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {loading ? "Registrando..." : "INICIAR COLACIÓN"}
                  </button>
                )}

                {/* Si requiere colación y está en colación activa */}
                {tipoJornada === "colacion" && tieneInicioColacion && !tieneFinColacion && (
                  <div className="w-full space-y-2">
                    {/* Indicador de Colación Iniciada */}
                    <div className="w-full bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center justify-center text-center text-xs font-bold text-amber-700">
                      ☕ Colación iniciada a las {asistenciaHoy.inicioColacion?.slice(0, 5)} hrs
                    </div>

                    {/* Botón de Fin Colación con Timer */}
                    <button
                      disabled={loading || colacionTimeLeft > 0}
                      onClick={handleFinColacion}
                      className={`w-full flex items-center justify-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-sm ${
                        colacionTimeLeft > 0
                          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {loading
                        ? "Registrando..."
                        : colacionTimeLeft > 0
                        ? `Disponible en ${formatTimeLeft(colacionTimeLeft)} min`
                        : "FIN COLACIÓN"}
                    </button>
                  </div>
                )}

                {/* Si es jornada corrida o si la colación ya finalizó */}
                {(tipoJornada === "corrida" || tieneFinColacion) && (
                  <button
                    disabled={loading}
                    onClick={handleSalida}
                    className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {loading ? "Registrando..." : "MARCAR SALIDA"}
                  </button>
                )}
              </div>
            )}

            {/* 2.3 Jornada Completada */}
            {tieneSalida && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                  🎉
                </div>
                <span className="text-sm font-bold text-indigo-950">Jornada Completada</span>
                <span className="text-xs text-slate-500 mt-1">
                  ¡Gracias por tu jornada! Has registrado tu entrada y salida del día de hoy.
                </span>
                <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400">ENTRADA</span>
                    <span className="text-sm text-slate-800 mt-0.5">{asistenciaHoy.entrada?.slice(0, 5)} hrs</span>
                  </div>
                  <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400">SALIDA</span>
                    <span className="text-sm text-slate-800 mt-0.5">{asistenciaHoy.salida?.slice(0, 5)} hrs</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mensajes de Error de la API */}
            {errorText && (
              <span className="text-xs font-semibold text-red-500 text-center w-full mt-2 bg-red-50 border border-red-100 rounded-lg p-2.5">
                ⚠️ {errorText}
              </span>
            )}
          </div>
        </div>

        {/* SECCIÓN: HISTORIAL RECIENTE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">
            HISTORIAL RECIENTE
          </h2>

          {loadingHistory ? (
            <div className="text-center py-6 text-sm text-slate-400 font-semibold">
              Cargando historial...
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-400 font-semibold">
              No hay marcajes registrados.
            </div>
          ) : (
            <div className="space-y-3">
              {historial.map((reg) => {
                const isHoy = reg.fecha === new Date().toISOString().slice(0, 10);
                let fechaTexto = reg.fecha;

                // Formateo visual del historial (Hoy, Ayer, o Lun/Mar/Miér...)
                try {
                  const regDate = new Date(reg.fecha + "T00:00:00");
                  const diffTime = new Date().setHours(0,0,0,0) - regDate.getTime();
                  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays === 0) {
                    fechaTexto = "Hoy, " + regDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
                  } else if (diffDays === 1) {
                    fechaTexto = "Ayer, " + regDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
                  } else {
                    const dia = regDate.toLocaleDateString("es-ES", { weekday: "short" });
                    const formattedDia = dia.charAt(0).toUpperCase() + dia.slice(1);
                    fechaTexto = `${formattedDia}. ${regDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`;
                  }
                } catch (e) {
                  // Fallback
                }

                const esColacion = reg.inicioColacion || reg.finColacion;

                return (
                  <div
                    key={reg.idAsistencia}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/40 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Indicador de estado */}
                      <span className={`w-2 h-2 rounded-full ${reg.salida ? "bg-indigo-600" : "bg-emerald-500"}`} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{fechaTexto}</span>
                        <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">
                          {esColacion ? "CON COLACIÓN" : "CORRIDA"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-600">
                        {reg.entrada?.slice(0, 5) || "--:--"} - {reg.salida?.slice(0, 5) || "--:--"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {calcularHorasTrabajadas(reg)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
