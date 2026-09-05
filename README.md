# Librería Ideas - REST API (Práctica 2 - MIS-701)

Sistema Backend para la gestión de inventario, catálogo de productos, registro de ventas y métricas en tiempo real para **Librería Ideas**, desarrollado como parte de la **Evaluación Práctica Semana 2 (MIS-701 - Desarrollo de Software)**.

---

## Tecnologías y Arquitectura

- **Framework**: ASP.NET Core Web API (.NET 10)
- **Base de Datos**: SQLite (`ideas.db`)
- **ORM**: Entity Framework Core con soporte de Migraciones
- **Seguridad**: Autenticación y Autorización basada en Tokens JWT (HMAC-SHA256) y contraseñas hasheadas con BCrypt
- **Documentación API**: Swagger UI / OpenAPI con soporte para Bearer Token
- **CORS**: Habilitado para comunicación con clientes React (`http://localhost:5173`, `http://localhost:3000`)

---

## Prerequisitos

Para compilar y ejecutar el proyecto se requiere:

1. **.NET SDK** (versión 10.0):
   ```bash
   dotnet --version
   ```
2. **Herramienta de Entity Framework Core CLI**:
   ```bash
   dotnet tool install --global dotnet-ef
   export PATH="$PATH:$HOME/.dotnet/tools"
   ```
3. **Git** (para clonación y versionamiento).

---

## Instalación y Compilación

1. **Navegar a la carpeta del proyecto backend:**
   ```bash
   cd backend/IdeasRestApi
   ```

2. **Restaurar las dependencias NuGet:**
   ```bash
   dotnet restore
   ```

3. **Compilar la solución:**
   ```bash
   dotnet build
   ```

---

## Base de Datos y Migraciones

La API cuenta con **auto-migración e inicialización automática (Seed Data)** en el arranque. Al ejecutar la aplicación, se creará el archivo SQLite `ideas.db` y se aplicarán las migraciones de forma transparente.

Si deseas aplicar las migraciones manualmente:
```bash
dotnet ef database update
```

### Credenciales por Defecto (Usuario Administrador)
- **Correo Electrónico**: `admin@email.com`
- **Contraseña**: `Admin123!`
- **Rol**: `Admin`

---

## Cómo Ejecutar la REST API

Desde la carpeta `backend/IdeasRestApi`, ejecuta:

```bash
dotnet run
```

La consola mostrará la URL en la que la API está escuchando (por defecto en `http://localhost:5233` o `https://localhost:7128`).

---

## Documentación Interactiva: Swagger UI

Con la API en ejecución, abre tu navegador web en:

**`http://localhost:5233/swagger`**

### ¿Cómo autenticarse en Swagger?
1. Ejecuta el endpoint `POST /api/auth/login` con las credenciales de administrador.
2. Copia el valor del campo `token` de la respuesta JSON.
3. Haz clic en el botón verde **Authorize** (arriba a la derecha).
4. Escribe: `Bearer <tu_token>` y haz clic en **Authorize**.
5. Ahora podrás ejecutar todos los endpoints protegidos directamente desde la interfaz.

---

## Ejemplos de Uso de la REST API (cURL)

> **Variable base**: `http://localhost:5233`

### 1. Iniciar Sesión (Login)
Obtiene el token JWT necesario para las rutas protegidas.

```bash
curl -X POST http://localhost:5233/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@email.com",
    "password": "Admin123!"
  }'
```

**Respuesta exitosa (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiration": "2026-09-06T04:30:00Z",
  "user": {
    "id": 1,
    "email": "admin@email.com",
    "fullName": "Administrador Librería Ideas",
    "role": "Admin"
  }
}
```

---

### 2. Listar Productos (List Products)
Obtiene el catálogo de productos registrados. Soporta filtros opcionales por búsqueda (`?search=`) y categoría (`?category=`).

```bash
curl http://localhost:5233/api/products
```

**Respuesta exitosa (`200 OK`):**
```json
[
  {
    "id": 1,
    "name": "Cuaderno espiral 100 hojas Lider",
    "category": "books",
    "categoryLabel": "Cuadernos y Papelería",
    "brand": "Líder",
    "sku": "CUA-101",
    "price": 42.00,
    "stock": 25,
    "minStock": 5,
    "description": "Cuaderno tamaño carta cuadriculado",
    "stockStatus": "Disponible",
    "stockStatusClass": "ok",
    "createdAt": "2026-09-05T02:00:00Z"
  }
]
```

---

### 3. Registrar un Nuevo Producto (Add Product)
> *Requiere token de autorización.*

```bash
curl -X POST http://localhost:5233/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT>" \
  -d '{
    "name": "Colores Faber-Castell 24 unidades",
    "category": "pencils",
    "categoryLabel": "Escritura y Colores",
    "brand": "Faber-Castell",
    "sku": "COL-204",
    "price": 58.00,
    "stock": 15,
    "minStock": 5,
    "description": "Caja de lápices de colores largos ecológicos."
  }'
```

**Respuesta exitosa (`201 Created`):**
```json
{
  "id": 2,
  "name": "Colores Faber-Castell 24 unidades",
  "category": "pencils",
  "categoryLabel": "Escritura y Colores",
  "brand": "Faber-Castell",
  "sku": "COL-204",
  "price": 58.00,
  "stock": 15,
  "minStock": 5,
  "description": "Caja de lápices de colores largos ecológicos.",
  "stockStatus": "Disponible",
  "stockStatusClass": "ok",
  "createdAt": "2026-09-05T04:35:00Z"
}
```

---

### 4. Listar Ventas (List Sales)
Obtiene el historial de transacciones incluyendo los datos del producto relacionado.

```bash
curl http://localhost:5233/api/sales
```

**Respuesta exitosa (`200 OK`):**
```json
[
  {
    "id": 1,
    "productId": 1,
    "productName": "Cuaderno espiral 100 hojas Lider",
    "productSku": "CUA-101",
    "quantity": 2,
    "unitPrice": 42.00,
    "total": 84.00,
    "date": "2026-09-05T04:00:00Z",
    "formattedDate": "05/09/2026",
    "status": "ok",
    "statusLabel": "Pagado",
    "customer": "Juan Pérez",
    "paymentMethod": "efectivo",
    "notes": "Venta mostrador",
    "createdAt": "2026-09-05T04:00:00Z"
  }
]
```

---

### 5. Registrar una Venta (Add Sale)
> *Requiere token de autorización.*
> **Regla de negocio**: Valida stock suficiente y **descuenta automáticamente** la cantidad del stock del producto.

```bash
curl -X POST http://localhost:5233/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT>" \
  -d '{
    "productId": 1,
    "quantity": 2,
    "unitPrice": 42.00,
    "status": "ok",
    "statusLabel": "Pagado",
    "customer": "María Gomez",
    "paymentMethod": "qr",
    "notes": "Pago mediante transferencia QR"
  }'
```

**Respuesta exitosa (`201 Created`):**
```json
{
  "id": 2,
  "productId": 1,
  "productName": "Cuaderno espiral 100 hojas Lider",
  "productSku": "CUA-101",
  "quantity": 2,
  "unitPrice": 42.00,
  "total": 84.00,
  "date": "2026-09-05T04:36:00Z",
  "formattedDate": "05/09/2026",
  "status": "ok",
  "statusLabel": "Pagado",
  "customer": "María Gomez",
  "paymentMethod": "qr",
  "notes": "Pago mediante transferencia QR",
  "createdAt": "2026-09-05T04:36:00Z"
}
```

---

### 6. Obtener Métricas del Dashboard (Metrics)
> *Requiere token de autorización.*
> Retorna métricas consolidadas en tiempo real para la pantalla del Dashboard.

```bash
curl http://localhost:5233/api/dashboard/metrics \
  -H "Authorization: Bearer <TOKEN_JWT>"
```

**Respuesta exitosa (`200 OK`):**
```json
{
  "totalProducts": 2,
  "monthlySalesTotal": 168.00,
  "dailySalesTotal": 168.00,
  "lowStockProductsCount": 0,
  "recentSales": [
    {
      "id": 2,
      "productId": 1,
      "productName": "Cuaderno espiral 100 hojas Lider",
      "quantity": 2,
      "unitPrice": 42.00,
      "total": 84.00,
      "formattedDate": "05/09/2026",
      "status": "ok",
      "statusLabel": "Pagado",
      "customer": "María Gomez"
    }
  ]
}
```

---