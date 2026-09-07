# Librería Ideas - Guía de Configuración y Ejecución del Backend y Frontend

Este documento detalla paso a paso las instrucciones necesarias para **configurar, compilar y ejecutar** la REST API Backend y la aplicación SPA Frontend del sistema **Librería Ideas**, desarrollado para la **Evaluación Práctica Semana 2 (MIS-701 - Desarrollo de Software)**.

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas en tu sistema:

1. **.NET SDK** (Versión 10.0):
   ```bash
   dotnet --version
   ```
2. **Node.js** (Versión 22.x) y **npm**:
   ```bash
   node --version
   npm --version
   ```
---

## Paso 1: Configurar y Ejecutar el Backend (ASP.NET Core Web API)

El backend expone una API RESTful construida con ASP.NET Core (.NET 10), utilizando Entity Framework Core con base de datos SQLite (`ideas.db`), seguridad JWT Bearer y Swagger UI.

### 1. Navegar al directorio del Backend
Abre una terminal y navega a la carpeta del proyecto backend:

```bash
cd backend/IdeasRestApi
```

### 2. Restaurar dependencias NuGet
Ejecuta el siguiente comando para descargar e instalar los paquetes requeridos (Entity Framework Core, BCrypt, JWT Bearer, Swagger):

```bash
dotnet restore
```

### 3. Compilar la aplicación Backend
Compila la solución para verificar que no existan errores de sintaxis o referencias:

```bash
dotnet build
```

### 4. Iniciar el servidor Backend
Ejecuta la API REST:

```bash
dotnet run
```

Al iniciar por primera vez:
- La aplicación creará automáticamente la base de datos SQLite en `backend/IdeasRestApi/ideas.db`.
- Se aplicarán las migraciones de EF Core y se insertará el usuario **Administrador** por defecto.
- El servidor comenzará a escuchar peticiones en: **`http://localhost:5233`** (o `https://localhost:7128`).

### 5. Verificar con Swagger UI
Con la API en ejecución, abre tu navegador e ingresa a:

**`http://localhost:5233/swagger`**

#### Credenciales Administrador por Defecto:
- **Correo Electrónico**: `admin@email.com`
- **Contraseña**: `Admin123!`

---

## Paso 2: Configurar y Ejecutar el Frontend (React + Vite)

El frontend es una Single Page Application (SPA) responsiva y moderna construida con React 18, Vite, React Router DOM v6 y Bootstrap 5.

### 1. Navegar al directorio del Frontend
Abre una nueva ventana de terminal y dirígete a la carpeta `frontend/`:

```bash
cd frontend
```

### 2. Instalar dependencias npm
Instala todos los módulos y librerías necesarias (`react`, `react-dom`, `react-router-dom`, `bootstrap`, `bootstrap-icons`, `vite`):

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
Ejecuta la aplicación en modo desarrollo con soporte de reemplazo de módulos en caliente (HMR):

```bash
npm run dev
```

El servidor web de desarrollo Vite estará disponible en:

**`http://localhost:5173`**

### 4. Probar la aplicación web SPA
Abre el navegador en `http://localhost:5173`:
1. Inicia sesión con el correo `admin@email.com` y la contraseña `Admin123!`.
2. Navega entre las distintas pantallas del menú principal (Dashboard, Productos, Ventas).
