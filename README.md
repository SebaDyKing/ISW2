# Sistema de Gestión Integrado
Sistema web integral para la gestión de empleados, clientes, contratos, instalaciones, licencias médicas y hojas de vida. Permite la administración centralizada y el control de asistencia.

## Tecnologías

**Frontend**
- React
- Vite
- Tailwind CSS
- Axios

**Backend**
- Node.js
- Express
- Base de datos relacional
- JSON Web Tokens (JWT)

## Requisitos previos
- Node.js (v18 o superior recomendado)
- npm (v9 o superior)
- Base de datos relacional compatible instalada y ejecutándose

## Instalación

1. Clonar el repositorio
2. Instalar dependencias del backend:
   ```bash
   cd backend
   npm install
   ```
3. Instalar dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```

## Configuración

Crea un archivo `.env` en el directorio `backend` basándote en el archivo `backend/.env.example`.

| Variable | Descripción |
|---|---|
| PORT | Puerto donde correrá el servidor del backend (ej: 3001) |
| HOST | Host del servidor (ej: localhost) |
| DB_USER | Usuario de la base de datos |
| DB_PASSWORD | Contraseña del usuario de la base de datos |
| DB_HOST | Dirección del servidor de la base de datos (ej: localhost) |
| DB_PORT | Puerto de la base de datos (ej: 5432) |
| DB_NAME | Nombre de la base de datos |
| JWT_SECRET | Clave secreta para firmar los tokens JWT |
| CORS_ORIGIN | Origen permitido para CORS (ej: http://localhost:5173) |
| EMAIL_USER | Usuario/Correo para el servicio de envío de emails |
| EMAIL_PASS | Contraseña o App Password para el servicio de emails |

En el `frontend`, si es necesario, crea un archivo `.env` con las variables correspondientes (ej: `VITE_API_URL=http://localhost:3001/api`).

## Ejecución

**Desarrollo (Backend)**
```bash
cd backend
npm run dev
```

**Desarrollo (Frontend)**
```bash
cd frontend
npm run dev
```

**Producción**
1. Construir el frontend: `cd frontend && npm run build`
2. Iniciar el backend: `cd backend && npm start`

## Estructura del proyecto

- `backend/`
  - `src/`: Contiene todo el código fuente del backend (controladores, modelos, servicios, middlewares, utilidades y scripts).
  - `uploads/`: Carpeta para almacenamiento de archivos generados en tiempo de ejecución.
- `frontend/`
  - `src/`: Código fuente de la interfaz de usuario.
    - `components/`: Componentes globales y compartidos.
    - `config/`: Archivos de configuración central (como la instancia de Axios).
    - `features/`: Módulos de la aplicación organizados por dominio (`admin`, `empleado`, `cliente`, `auth`).
    - `routes/`: Configuración del enrutador principal de la aplicación.
    - `utils/`: Utilidades compartidas globales.

## Rutas de la API

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicia sesión de usuario |
| POST | `/api/auth/registro` | Registra un nuevo usuario |
| GET | `/api/usuarios` | Obtiene lista de usuarios |
| GET | `/api/dashboard` | Obtiene métricas generales |
| GET | `/api/contratos` | Obtiene todos los contratos |
| GET | `/api/licencias-medicas` | Lista licencias médicas |
| GET | `/api/hojas-vida` | Lista registros de hojas de vida |
| POST | `/api/asistencias/entrada` | Marca asistencia de entrada |
| POST | `/api/asistencias/salida` | Marca asistencia de salida |

## Autenticación y roles

El sistema utiliza **JSON Web Tokens (JWT)** para la autenticación y autorización de solicitudes. El token debe enviarse en la cabecera `Authorization` con el prefijo `Bearer`. Los roles principales identificados (`admin`, `empleado`, `cliente`) determinan el nivel de acceso en la plataforma, limitando de forma segura las operaciones específicas en el backend.
