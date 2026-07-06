# Enhorabuena - Sistema de Inventario y Tienda 🚀

Enhorabuena es una plataforma integral diseñada para la gestión de inventario, ventas y catálogo en línea. Permite administrar productos oficiales (mediante sincronización automática) y productos personalizados (Tienda Personal), todo desde un panel de control seguro y optimizado para dispositivos móviles.

## 🌟 Características Principales

- **Sincronización Automática:** Conexión directa con el catálogo oficial para mantener precios, imágenes y existencias siempre actualizados.
- **Tienda Personal:** Creación y gestión de productos propios con control de stock, apartados y categorización dinámica.
- **Punto de Venta Móvil:** Escáner de código de barras integrado, compatible con cámaras de celular para un registro de ventas ultra rápido con retroalimentación háptica y sonora.
- **Control de Inventario:** Gestión de ubicaciones físicas (estantes, cajas), auditoría de movimientos y sobreescritura de precios manuales.
- **Historial Financiero:** Registro detallado de ventas, ingresos mensuales e historial de movimientos reversibles.
- **Catálogo Público Web:** Interfaz moderna, rápida y atractiva para que los clientes exploren los productos disponibles y contacten directamente por WhatsApp.
- **PWA Ready:** Instalable como aplicación nativa (Progresive Web App) en iOS y Android.

## 🛠️ Tecnologías

- **Framework:** Next.js 14 (App Router)
- **Base de Datos:** PostgreSQL (Neon Serverless) con Prisma ORM
- **Estilos:** Tailwind CSS y variables dinámicas
- **Autenticación:** NextAuth.js (v5)
- **Validación de Datos:** Zod
- **Almacenamiento en la Nube:** Cloudinary (imágenes personalizadas)

## 🚀 Cómo correr el proyecto localmente

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/NotJcao17/enhorabuena.git
   cd enhorabuena
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   Crea un archivo `.env` en la raíz del proyecto. Necesitarás las siguientes claves:
   - `DATABASE_URL` (URL de conexión a PostgreSQL)
   - `NEXTAUTH_SECRET` (Llave secreta criptográfica para las sesiones)
   - `NEXTAUTH_URL=http://localhost:3000`
   - Credenciales de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
   - `CRON_SECRET` (Para proteger el endpoint de sincronización automatizada)

4. **Preparar la Base de Datos:**
   ```bash
   # Sincronizar el esquema con tu base de datos
   npx prisma db push
   
   # Generar el cliente de Prisma
   npx prisma generate
   
   # Sembrar la base de datos (Crea el usuario Admin por defecto)
   npm run postinstall
   ```

5. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   El proyecto estará disponible en `http://localhost:3000`.

## 🔒 Seguridad
La plataforma cuenta con validación de datos estricta en el backend mediante Zod y protección de rutas en el servidor, garantizando la integridad de los datos financieros y el control exclusivo del inventario.
