# Changelog

## [Refactor] - 2026-06-13

### Configuración de red
- Unificación de tres instancias de Axios (config/api.js, config/axios.js y services/api.js) en una única fuente de verdad: config/axios.js
- Migración de todos los servicios que usaban instancias aisladas de Axios

### Estructura de middlewares
- Fusión de las carpetas middleware/ y middlewares/ en una sola (middleware/)
- Reubicación de upload.middleware.js a la carpeta unificada

### Desacoplamiento de features
- Extracción de componentes compartidos (LicenciasMedicasSummary, PdfPreviewModal, HojaVidaCard, HojaVidaSummary) a components/shared/
- Extracción de utilidades compartidas (fecha.js, estadoLicencia.js) a src/utils/
- Eliminación de importaciones cruzadas entre features admin y empleado

### Estandarización de nomenclatura
- Unificación del naming de servicios al formato [entidad].service.js en frontend y backend
- Fusión de admin.service.js y adminService.js en un único archivo
- Renombrado de contratosService.js a contrato.service.js

### Corrección de errores tipográficos
- Renombrado de carpeta Handlers/ a handlers/ (convención minúsculas)
- Corrección del typo responseHanders.js a responseHandlers.js
- Actualización de los 6 imports afectados

### Limpieza general
- Eliminación de archivos .gitkeep en carpetas con contenido real
- Eliminación de carpetas vacías obsoletas (src/services/, src/hooks/)
- Reubicación de generarTokenEmpleado.js a src/scripts/
- Creación de backend/.env.example documentando todas las variables de entorno requeridas
