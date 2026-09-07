# Librería Ideas - Frontend SPA (React 18 + Vite)

Aplicación web Single Page Application (SPA) para el sistema de inventario, catálogo de productos, registro de ventas y tablero de control para **Librería Ideas**, desarrollada como parte de la **Evaluación Práctica Semana 2 (MIS-701 - Desarrollo de Software)**.

---

## Tecnologías y Librerías Utilizadas

- **Framework / Tooling**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Enrutamiento**: [React Router DOM v6](https://reactrouter.com/) (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `Link`, `NavLink`, `useNavigate`)
- **Estilos & UI**: [Bootstrap 5.3](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/) + Estilos personalizados de Librería Ideas (`src/styles/ideas.css`)
- **Cliente HTTP**: API Nativa `fetch` (encapsulada en `src/services/api.js`)
- **Gestión de Sesión**: React Context API (`AuthContext`) y Rutas Protegidas (`ProtectedRoute`)

---

## Prerrequisitos e Instalación

### Prerrequisitos
- **Node.js**: Versión 18.x o superior
- **npm**: Versión 9.x o superior

### Instalación de Dependencias

Desde el directorio `frontend/`:

```bash
npm install
```

---

## Comandos Disponibles

### Modo Desarrollo
Inicia el servidor de desarrollo local con recarga rápida (HMR):

```bash
npm run dev
```

Por defecto, la aplicación estará accesible en: **`http://localhost:5173`**.

> **Nota**: Asegúrate de tener la REST API Backend en ejecución en `http://localhost:5233` antes de utilizar la aplicación.

### Compilación para Producción
Genera la versión optimizada para producción en el directorio `dist/`:

```bash
npm run build
```

### Vista Previa de Producción
Sirve localmente el bundle generado en `dist/`:

```bash
npm run preview
```

---

## Pantallas de la Aplicación SPA

La interfaz de usuario implementa 6 pantallas principales:

| # | Pantalla | Ruta URL | Descripción |
|---|---|---|---|
| 1 | **Iniciar Sesión** | `/login` | Formulario de login. Envía credenciales a `POST /api/auth/login` y almacena el token JWT retornado en `localStorage`. |
| 2 | **Dashboard Principal** | `/` | Muestra 4 tarjetas de métricas en tiempo real (Total Productos, Ventas Mensuales, Ventas Diarias, Alertas de Stock Bajo) y la tabla con las últimas ventas registradas. |
| 3 | **Lista de Productos** | `/productos` | Tabla responsiva del catálogo de productos con insignias de stock (`Disponible`, `Stock Bajo`, `Agotado`), barra de búsqueda por término, selector de categoría y botones para editar y eliminar. |
| 4 | **Formulario de Producto** | `/productos/nuevo`<br>`/productos/editar/:id` | Creación y actualización de productos. Incluye validaciones de campos requeridos, selección de categorías y números positivos. |
| 5 | **Lista de Ventas** | `/ventas` | Historial de ventas con detalle de cliente, fecha, método de pago, total cobrado y estado de la transacción (`Pagado`, `Pendiente`, `Cancelado`). |
| 6 | **Formulario de Venta** | `/ventas/nueva`<br>`/ventas/editar/:id` | Registro de ventas con selector de producto (muestra stock actual), cálculo dinámico en tiempo real del importe total al cambiar la cantidad, y actualización automática del stock en el backend. |

---

## Guía de Buenas Prácticas SPA Aplicadas

1. **Navegación sin Recargas**:
   - Toda la navegación se realiza exclusivamente mediante `<Link>` y `<NavLink>` de `react-router-dom` para no perder el estado ni destruir la experiencia SPA con recargas completas de navegador (`<a>`).
2. **Uso Exclusivo de Fetch API Nativo**:
   - No se utilizan librerías de terceros como Axios. Todas las peticiones HTTP se gestionan en `src/services/api.js` inyectando automáticamente el encabezado `Authorization: Bearer <token>`.
3. **Manejo Seguro de `useEffect`**:
   - Todas las llamadas asíncronas para consumo de datos se encuentran encapsuladas en `useEffect(() => { ... }, [])` con dependencias explícitas para evitar bucles infinitos de renderizado.
4. **Diseño Adaptativo e Identidad Visual**:
   - Uso de un sistema de diseño con la paleta de colores de Librería Ideas (Azul Oxford `#1b2a4a`, Terracota `#d96b43`, Mostaza `#e0a93b`, etc.), responsive layout en dispositivos móviles y de escritorio.
