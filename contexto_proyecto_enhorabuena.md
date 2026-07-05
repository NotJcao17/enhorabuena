# Proyecto Enhorabuena — Documento de Contexto Completo

> **Propósito**: Este documento contiene TODA la especificación del proyecto. Un agente de IA debe poder leer este archivo y tener el contexto completo para implementar cualquier fase del proyecto.

---

## 1. Visión General

### 1.1 Qué es
**Enhorabuena** es una web app de inventario y catálogo para una persona que vende productos por catálogo de Betterware. La persona acumula productos excedentes (devoluciones, compras extra, productos a precio de regalo) y quiere venderlos por su cuenta.

La app tiene **dos secciones**:
1. **Enhorabuena – Betterware**: Catálogo de productos excedentes de Betterware con información sincronizada automáticamente desde la API pública de Betterware (Shopify)
2. **Enhorabuena – Tienda Personal**: Productos propios del vendedor que no son de Betterware, con gestión manual completa

### 1.2 Qué NO es
- NO es una tienda Betterware oficial
- NO procesa pagos (las ventas se concretan por WhatsApp)
- NO modifica datos de Betterware (solo lee)
- NO permite crear productos Betterware manualmente (deben existir en el catálogo de BW)

### 1.3 Funcionamiento actual (lo que reemplaza)
El vendedor guarda todo en un Excel (SKU, nombre, precio), manda la info sin imagen por WhatsApp, y al vender elimina la fila. El registro es manual. Hay 2 vendedores: **Maru** y **Mosco**.

### 1.4 Usuarios
- **Admin**: Un solo usuario que gestiona todo el inventario. Hay 2 vendedores pero comparten la misma cuenta de admin
- **Clientes**: Cualquier persona que visite la página para ver el catálogo. No requieren cuenta

### 1.5 Volumen estimado
- 100-200 artículos en inventario físico Betterware (puede crecer moderadamente)
- ~3,500 productos en el catálogo total de Betterware (solo para referencia/lookup)
- Cantidad de productos personales: variable, inicialmente pocos
- 6 ubicaciones físicas configuradas actualmente (puede cambiar)
- Ventas de bajo volumen

---

## 2. Stack Tecnológico

| Componente | Tecnología | Versión/Notas |
|---|---|---|
| Framework | Next.js (App Router) | v14+ |
| Estilos | Tailwind CSS | v3 |
| ORM | Prisma | Última estable |
| Base de datos | PostgreSQL | Neon (serverless, free tier, no se duerme) |
| Deploy | Vercel | Free tier |
| Auth | NextAuth.js (Auth.js v5) | Credentials Provider, un solo usuario |
| Escáner códigos | `html5-qrcode` | Librería web para leer barcodes vía cámara |
| PWA | `next-pwa` | Para instalación en móvil |
| Sync programada | Vercel Cron Jobs | 1 ejecución/día |
| Almacenamiento imágenes propias | Cloudinary | Free tier (25GB almacenamiento, 25GB bandwidth/mes) |
| Validación | Zod | Schemas en API routes |
| Sanitización HTML | DOMPurify | Para body_html de Betterware |

### 2.1 Repositorio
- **URL**: https://github.com/NotJcao17/enhorabuena.git
- **Commits**: Sin co-authored-by de IA
- **`.env`**: NUNCA se commitea. Crear `.env.example` con las variables necesarias sin valores reales
- **`.gitignore`**: Incluir `.env`, `.env.local`, `node_modules`, `.next`, etc.

### 2.2 Lo que el desarrollador (usuario) debe configurar manualmente
1. Crear proyecto en **Neon** y obtener la connection string de PostgreSQL
2. Colocar la connection string en `.env` local como `DATABASE_URL`
3. El repo en GitHub ya está creado
4. Crear proyecto en **Vercel** y conectar el repo
5. Configurar variables de entorno en Vercel (DATABASE_URL, NEXTAUTH_SECRET, etc.)
6. Crear cuenta en **Cloudinary** (free tier), obtener `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, y `CLOUDINARY_API_SECRET`

### 2.3 Lo que el agente hace
- Todo el código: frontend, backend, API routes
- Configuración de Prisma, migraciones (ejecutar `npx prisma db push` o `npx prisma migrate dev`)
- Configuración de NextAuth, PWA, Tailwind
- Documentar cada paso que requiera acción manual del usuario

---

## 3. API de Betterware (Shopify Público)

### 3.1 Endpoints disponibles

| Endpoint | Método | Descripción |
|---|---|---|
| `/products.json?limit=250&page=N` | GET | Catálogo paginado. Máximo 250 por página |
| `/products/{handle}.json` | GET | Detalle de un producto individual |
| `/products/{handle}.js` | GET | Detalle en formato JS (precios en centavos, NO usar) |
| `/collections.json` | GET | Lista de colecciones |
| `/collections/{handle}/products.json` | GET | Productos de una colección específica |

### 3.2 Paginación
- Parámetro `page` (legacy), incrementar hasta obtener `{"products": []}`
- NO soporta `page_info` ni `since_id` (esos son Admin API)
- Límite teórico: `page × limit ≤ 25,000` (no es problema, hay ~3,500 productos)
- **Siempre usar el endpoint `.json`**, nunca `.js` (formatos de precio diferentes)

### 3.3 Estructura del producto (desde `/products.json`)

```json
{
  "id": 10385634722092,
  "title": "Mochila Dúo Camuflaje",
  "handle": "mochila-duo-camuflaje-25335",
  "body_html": "<p>Descripción en HTML</p>",
  "published_at": "2026-06-26T06:04:52-06:00",
  "created_at": "2026-06-26T06:04:51-06:00",
  "updated_at": "2026-07-02T16:35:38-06:00",
  "vendor": "Betterware",
  "product_type": "contigo",
  "tags": ["2_o_mas", "Badge:Lleva 2 o mas a precio rojo", "disponible"],
  "variants": [{
    "id": 53382462767404,
    "sku": "25335",
    "available": true,
    "price": "499.00",
    "compare_at_price": null
  }],
  "images": [{
    "src": "https://cdn.shopify.com/s/files/1/.../25335-set-camuflaje.jpg?v=1782502807",
    "width": 1250, "height": 1250, "position": 1
  }]
}
```

### 3.4 Datos importantes sobre los datos
- **SKU**: 5 dígitos, en `variants[0].sku`. Cada producto tiene exactamente 1 variante
- **Precio**: String en pesos MXN (ej: `"499.00"`)
- **Categorías**: Campo `product_type` (`"cocina"`, `"contigo"`, `"bienestar"`, `"Baño"`, `"limpieza"`, `"recamara"`, `"hogar"`, etc.). Notar capitalización inconsistente
- **Imágenes**: URLs absolutas del CDN de Shopify. Son permanentes. NO descargarlas, usar directamente
- **Tags**: Array de strings. Contienen info de promociones
- **Productos no disponibles en BW**: Tienen tag `"no_disponible"` y/o `available: false`, pero SÍ aparecen en la API
- **Productos eliminados de BW**: Desaparecen de `/products.json`

### 3.5 Precios — Comportamiento detallado

Betterware tiene **dos tipos de oferta** que se reflejan diferente en la API:

#### Tipo 1: Descuento Directo (capturable)
- `price` = precio con descuento (el que paga el cliente)
- `compare_at_price` = precio original (tachado)
- Tags: `ahorro_25`, `Badge:25`, `disponible-oferta`
- Ejemplo: Luz Estrella → `price: 99.90, compare_at_price: 139.00`

#### Tipo 2: Precio Rojo / Condicional (NO siempre capturable)
- `price` = precio normal
- `compare_at_price` = a veces el precio rojo (invertido), a veces `null`
- Tags: `2_o_mas`, `Badge:Lleva 2 o mas a precio rojo`
- Ejemplo: Mochila → `price: 499.00, compare_at_price: null` (el $399 NO aparece)
- **Limitación aceptada**: No siempre podemos obtener este precio desde la API

#### Lógica de precio a implementar:
```
function calcularPrecio(unit, catalogProduct):
  // 1. Precio personalizado del admin tiene prioridad
  if unit.customPrice != null:
    return { display: unit.customPrice, original: null, isCustom: true }
  
  // 2. Si hay compare_at_price, usar el menor
  if catalogProduct.compareAtPrice != null:
    menor = min(catalogProduct.price, catalogProduct.compareAtPrice)
    mayor = max(catalogProduct.price, catalogProduct.compareAtPrice)
    return { display: menor, original: mayor, isCustom: false }
  
  // 3. Solo price
  return { display: catalogProduct.price, original: null, isCustom: false }
```

#### Marcas visuales para el admin:
- Productos con tag `2_o_mas` o `Badge:*precio rojo*`: Mostrar badge/ícono en el panel admin indicando que es un producto de "precio rojo" para que el admin verifique y ponga precio personalizado si el precio de la API no es el correcto
- Productos con precio personalizado: Badge diferente que indique "precio manual"

---

## 4. Modelo de Datos

### 4.1 Tabla: CatalogProduct
Reflejo del catálogo de Betterware. Se actualiza solo vía sincronización automática.

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK, auto) | |
| sku | String (unique) | 5 dígitos, identificador principal |
| shopifyId | String | ID de Shopify del producto |
| title | String | Nombre del producto |
| handle | String | Handle URL (ej: "mochila-duo-camuflaje-25335") |
| bodyHtml | Text | Descripción HTML |
| productType | String | Categoría de Betterware (cocina, baño, etc.) |
| priceBetterware | Decimal | Precio actual en Betterware (campo `price`) |
| compareAtPrice | Decimal? | Precio de comparación (nullable) |
| activeBetterware | Boolean | true si apareció en la última sync |
| availableBetterware | Boolean | Campo `available` de Shopify |
| tags | Json | Array de tags |
| images | Json | Array de {src, width, height, position} |
| publishedAt | DateTime? | Fecha de publicación en BW |
| betterwareUpdatedAt | DateTime? | Campo `updated_at` de Shopify |
| lastSyncAt | DateTime | Fecha de última sincronización |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 4.2 Tabla: Location

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK, auto) | |
| name | String | Ej: "Caja 1", "Estante 3" |
| sortOrder | Int | Para ordenar en dropdowns |
| createdAt | DateTime | |

**Regla de eliminación**: Si se elimina una ubicación que tiene items asignados, mostrar confirmación fuerte preguntando si se quiere mover los items a otra ubicación o dejarlos sin ubicación.

### 4.3 Tabla: InventoryUnit
Cada registro es una **unidad física** de un producto Betterware.

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK, auto) | |
| catalogProductId | Int (FK → CatalogProduct) | |
| locationId | Int? (FK → Location) | Nullable |
| status | Enum: available, reserved, sold, withdrawn | Estado actual |
| customPrice | Decimal? | Precio personalizado del admin (nullable) |
| notes | String? | Notas opcionales |
| registeredAt | DateTime | Fecha de registro |
| statusChangedAt | DateTime | Última vez que cambió el status |
| soldAt | DateTime? | Fecha de venta (si aplica) |
| salePrice | Decimal? | Precio al que se vendió. Si no se ingresa, se usa el precio que se mostraría en la página (customPrice o precio calculado de BW) |
| saleReversed | Boolean | Default false. Si la venta fue revertida |
| saleReversedAt | DateTime? | Fecha en que se revirtió la venta |

### 4.4 Tabla: CustomProduct
Productos personales (no Betterware), gestionados manualmente.

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK, auto) | |
| name | String | Nombre del producto |
| description | Text? | Descripción (texto libre, no HTML de BW) |
| price | Decimal | Precio de venta |
| stock | Int | Stock disponible (default 0) |
| reservedCount | Int | Cantidad apartada (default 0) |
| soldCount | Int | Cantidad vendida total (default 0) |
| images | Json | Array de URLs de imágenes subidas |
| category | String? | Categoría libre (el admin escribe lo que quiera) |
| isActive | Boolean | Activo o archivado (default true) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 4.5 Tabla: CustomSaleRecord

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK, auto) | |
| customProductId | Int (FK → CustomProduct) | |
| quantity | Int | Cantidad vendida en esta venta |
| salePrice | Decimal | Precio unitario al que se vendió. Si no se ingresa, se usa el precio del producto |
| soldAt | DateTime | |
| notes | String? | |
| reversed | Boolean | Default false. Si la venta fue revertida |
| reversedAt | DateTime? | Fecha en que se revirtió la venta |

### 4.6 Tabla: AdminUser

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK, auto) | |
| username | String (unique) | Nombre de usuario (no email) |
| passwordHash | String | Hash bcrypt del password |
| name | String | Nombre para mostrar |

### 4.7 Tabla: SyncLog

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK, auto) | |
| startedAt | DateTime | |
| finishedAt | DateTime? | |
| productsCreated | Int | |
| productsUpdated | Int | |
| productsDeactivated | Int | |
| newProducts | Json? | SKUs de productos nuevos detectados (para aviso al admin) |
| status | String | "success" o "error" |
| errorMessage | String? | |

### 4.8 Tabla: AppConfig

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK, auto) | |
| key | String (unique) | Clave (ej: "whatsapp_maru", "whatsapp_mosco", "store_name") |
| value | String | Valor |

**Valores iniciales (seed)**:
```
whatsapp_maru = "524774499628"
whatsapp_mosco = "524777240506"
store_name = "Enhorabuena"
```

---

## 5. Arquitectura

### 5.1 CatalogProvider (patrón de abstracción)

```
lib/
  catalog-provider/
    types.ts          # Interfaces y tipos
    interface.ts      # ICatalogProvider interface
    betterware.ts     # BetterwareCatalogProvider (implementación)
```

```typescript
// types.ts
interface CatalogProductData {
  sku: string;
  shopifyId: string;
  title: string;
  handle: string;
  bodyHtml: string;
  productType: string;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  tags: string[];
  images: { src: string; width: number; height: number; position: number }[];
  publishedAt: Date | null;
  updatedAt: Date;
}

interface SyncResult {
  created: number;
  updated: number;
  deactivated: number;
  newSkus: string[];  // SKUs nuevos detectados
  errors: string[];
  durationMs: number;
}

// interface.ts
interface ICatalogProvider {
  syncCatalog(): Promise<SyncResult>;
  getProductBySku(sku: string): Promise<CatalogProductData | null>;
}

// betterware.ts
class BetterwareCatalogProvider implements ICatalogProvider {
  private baseUrl = 'https://betterware.com.mx';
  private pageSize = 250;
  private delayMs = 1000; // pausa entre peticiones
  
  async syncCatalog(): Promise<SyncResult> {
    // 1. Recorrer /products.json?limit=250&page=N hasta array vacío
    // 2. 1 segundo de pausa entre peticiones
    // 3. Upsert cada producto por SKU
    // 4. Marcar activeBetterware=false los que no vinieron
    // 5. Detectar SKUs nuevos comparando con sync anterior
    // 6. Registrar en SyncLog
  }
}
```

El resto de la aplicación usa `ICatalogProvider`, nunca `BetterwareCatalogProvider` directamente.

### 5.2 Estructura de carpetas sugerida

```
src/
  app/
    (public)/              # Layout para vistas públicas
      page.tsx             # Catálogo principal con tabs BW/Personal
      producto/
        bw/[sku]/page.tsx  # Detalle producto Betterware
        tp/[id]/page.tsx   # Detalle producto personal
      carrito/page.tsx     # Carrito unificado
    admin/
      login/page.tsx
      page.tsx             # Dashboard
      inventario/page.tsx  # Inventario BW
      escanear/page.tsx    # Escáner de códigos
      registrar/page.tsx   # Registro manual por SKU
      importar/page.tsx    # Importación CSV
      tienda/page.tsx      # CRUD productos personales
      historial/page.tsx   # Historial de ventas
      ubicaciones/page.tsx # CRUD ubicaciones
      configuracion/page.tsx
    api/
      auth/[...nextauth]/route.ts
      sync/
        catalog/route.ts   # Endpoint de sincronización
      products/            # API para productos BW
      inventory/           # API para inventario
      custom-products/     # API para productos personales
      locations/           # API para ubicaciones
      config/              # API para configuración
  lib/
    catalog-provider/
    prisma.ts              # Instancia de Prisma
    auth.ts                # Config de NextAuth
    utils.ts
  components/
    ui/                    # Componentes base (Button, Input, Card, etc.)
    layout/                # Header, Footer, Sidebar
    catalog/               # Componentes del catálogo público
    admin/                 # Componentes del panel admin
    scanner/               # Componente de escáner
  prisma/
    schema.prisma
    seed.ts                # Seed de admin user y AppConfig
```

### 5.3 Sincronización

1. **Vercel Cron Job**: Se configura en `vercel.json`
   ```json
   { "crons": [{ "path": "/api/sync/catalog", "schedule": "0 9 * * *" }] }
   ```
   (9:00 UTC = 3:00 AM CST)
2. La API route verifica un token secreto (`CRON_SECRET`) para que no se pueda ejecutar públicamente
3. El admin también puede disparar la sync manualmente desde `/admin/configuracion`
4. Tiempo estimado: ~20 segundos (14 requests × 1s delay + procesamiento)

---

## 6. Pantallas y Flujos

### 6.1 Vista del Cliente (Mobile-First)

#### Catálogo Principal (`/`)
- **Header**: "Enhorabuena" (texto, sin logo por ahora) + ícono de carrito con contador
- **Toggle/Tabs**: "Betterware" | "Tienda" — al cambiar, la paleta de colores cambia
- **Buscador**: Solo busca en productos del inventario disponible (no todo el catálogo BW)
- **Filtros**: Por categoría (`productType` para BW, categoría libre para personal) + ordenar por precio
- **Grid**: 2 columnas en móvil, 3-4 en desktop
- **Tarjeta de producto**:
  - Imagen principal
  - Nombre
  - SKU (solo Betterware)
  - Precio final (según lógica de precios)
  - Precio tachado si aplica (compare_at_price > price)
  - Cantidad disponible si > 1
- **Solo productos disponibles** (ni apartados, ni vendidos, ni retirados)

#### Detalle del Producto (`/producto/bw/[sku]` o `/producto/tp/[id]`)
- Carrusel de imágenes
- Nombre, descripción, categoría
- SKU (solo BW)
- Precio (con tachado si aplica)
- Disponibilidad (X unidades disponibles)
- Botón "Agregar al carrito"
- **Sección Betterware**: 2 botones de WhatsApp ("Preguntar a Maru", "Preguntar a Mosco")
- **Sección Personal**: 1 botón de WhatsApp ("Preguntar a Maru" solamente)
- Mensaje pre-llenado: `Hola, me interesa el producto [nombre] - [SKU si BW] ($[precio])`

#### Carrito (`/carrito`)
- **Unificado**: Puede tener productos BW y personales mezclados
- Lista: imagen, nombre, tipo (BW/Personal), precio, cantidad, subtotal
- Total general
- **Lógica de botones de WhatsApp**:
  - Si el carrito tiene **solo productos BW**: 2 botones → "Enviar pedido a Maru" / "Enviar pedido a Mosco"
  - Si el carrito tiene **cualquier producto de Tienda Personal** (solo personales o mezclado con BW): 1 botón → "Enviar pedido a Maru" (Mosco no maneja productos personales)
- Mensaje pre-llenado:
  ```
  ¡Hola! Me interesan estos productos de Enhorabuena:
  
  • [Nombre] ([SKU]) - $[precio]
  • [Nombre] - $[precio]
  
  Total: $[total]
  ```
- Carrito almacenado en `localStorage` (sin backend)
- Botón "Vaciar carrito"

### 6.2 Vista del Admin (Desktop-First, responsiva)

#### Login (`/admin/login`)
- **Usuario + Contraseña** (no email)
- Simple, limpio

#### Dashboard (`/admin`)
- **Resumen general**: Total productos (ambos), ingresos del mes
- **Sección Betterware** (lado izquierdo o arriba):
  - Disponibles / Apartados / Vendidos este mes
  - Valor del inventario BW (suma de precios de unidades disponibles)
- **Sección Tienda Personal** (lado derecho o abajo):
  - Disponibles / Apartados / Vendidos este mes
  - Valor del inventario personal
- **Última sincronización con Betterware**: fecha/hora + status
- Accesos rápidos: Escanear, Inventario, Registrar producto

#### Inventario BW (`/admin/inventario`)
- **Visualización muy clara** (tabla limpia, espaciada, legible)
- Buscador por nombre o SKU
- Filtros: categoría, ubicación, estado, **"con precio personalizado"**, **"precio rojo (verificar)"**
- Cada fila: thumbnail, nombre, SKU, ubicación, estado (badge de color), precio
- **Badge "Precio manual"**: Para items con customPrice
- **Badge "Precio rojo ⚠️"**: Para items cuyo producto en catálogo tiene tag `2_o_mas` o similar, indicando que el admin debe verificar el precio
- Acciones por unidad:
  - Apartar (available → reserved)
  - Vender (available/reserved → sold, pide precio de venta. Si no se ingresa, se usa el precio que se muestra en la página)
  - Retirar (available → withdrawn, sin marcar como venta)
  - Devolver (reserved → available)
  - Cambiar ubicación
  - Editar precio personalizado (o quitar para usar el de BW)
- **Feedback explícito**: Toast/notificación de éxito o error en cada acción
- Botón flotante: "+ Registrar producto"

#### Escáner (`/admin/escanear`)
- **Cámara en pantalla completa** (optimizado para móvil)
- Al detectar código de barras (barcode = SKU de 5 dígitos):
  - **Sonido de beep** (tipo supermercado) + **vibración**
  - Modal de confirmación: imagen del producto, nombre, SKU
  - Dropdown de ubicación — **persiste la última selección** entre escaneos (para no re-seleccionar al escanear muchos productos de la misma ubicación)
  - Botones: ✅ Confirmar / ❌ Cancelar
  - **Mensaje explícito**: "✅ Producto registrado correctamente" o "❌ Error: SKU no encontrado en el catálogo"
- Al confirmar → vuelve automáticamente al modo escaneo
- Contador de productos escaneados en la sesión actual
- Volumen habitual: 10-20 productos por sesión

#### Registro Manual por SKU (`/admin/registrar`)
- Input de 5 dígitos
- Al ingresar: preview del producto (imagen + nombre)
- Dropdown de ubicación
- Input de cantidad (default 1)
- Botón confirmar con feedback explícito

#### Importación CSV (`/admin/importar`)
- Dropdown de ubicación (aplica a todos los productos de esta importación)
- Textarea para pegar datos, formato por línea: `SKU,cantidad`
  ```
  26754,3
  25335,1
  26989,2
  ```
- Preview: tabla con imagen, nombre, SKU, cantidad, estado (✅ encontrado / ❌ no encontrado)
- Botón "Importar X productos"
- Resultado: resumen de éxitos y errores

#### Productos Personales (`/admin/tienda`)
- Lista de productos personales con buscador
- **Crear/Editar producto**: nombre, descripción, precio, stock, categoría (texto libre), subir imágenes
- Gestión de stock:
  - Apartar (disminuye stock, aumenta reservedCount)
  - Vender (disminuye stock o reservedCount, registra venta)
  - Devolver apartado (reservedCount → stock)
- Eliminar producto (con confirmación)

#### Historial de Ventas (`/admin/historial`)
- Tabla: fecha, producto, tipo (BW/Personal), SKU (si BW), precio de venta, ubicación (si BW), estado (activa/revertida)
- Filtros: rango de fechas, tipo (BW/Personal), categoría, **estado de venta** ("Activas" / "Revertidas" / "Todas")
- **Acciones por venta**:
  - **"Editar venta"**: Permite cambiar el precio de venta y las notas (por si el admin se equivocó)
  - **"Revertir venta"**: El producto BW pasa de `sold` → `available` (se restaura). Para productos personales, el stock se incrementa. El registro de venta se marca como `reversed: true` — no se borra, queda en historial para auditoría pero no suma en ingresos
- Estadísticas: total vendido, ingresos totales (excluyendo revertidas), producto más vendido

#### Ubicaciones (`/admin/ubicaciones`)
- CRUD: crear, editar nombre, eliminar
- Cada ubicación muestra cantidad de productos asignados
- **Al eliminar una ubicación con items**: Confirmación fuerte con opciones:
  - "Mover items a [dropdown de otra ubicación]"
  - "Dejar items sin ubicación"
- Reordenar (flechas arriba/abajo o drag & drop)

#### Configuración (`/admin/configuracion`)
- WhatsApp de Maru (número)
- WhatsApp de Mosco (número)
- Nombre de la tienda
- Botón "Sincronizar con Betterware ahora" (manual)
- **"Reiniciar inventario"**: Al fondo de la página, texto rojo, requiere escribir la palabra "REINICIAR" para confirmar. Todas las unidades con status `available` pasan a `withdrawn`. Las `reserved` no se tocan (requieren atención manual).

---

## 7. Diseño Visual

### 7.1 Principios
- **Mobile-first** para catálogo público y escáner
- **Desktop-first** para panel de administración (pero responsivo)
- Tema **claro**
- Tipografía: **Lato** (Google Fonts) como fuente principal. Sans-serif como fallback
- Inventario del admin debe ser **muy claro y legible**

### 7.2 Paleta de colores

#### Colores base (compartidos)
| Rol | Color | Hex |
|---|---|---|
| Fondo | Gris muy claro | `#f8f9fa` |
| Superficie | Blanco | `#ffffff` |
| Texto principal | Negro azulado | `#1a1a2e` |
| Texto secundario | Gris medio | `#6c757d` |
| Éxito | Verde | `#28a745` |
| Error/Peligro | Rojo | `#dc3545` |
| Alerta | Ámbar | `#f59e0b` |
| Oferta (precio) | Rojo | `#e63946` |
| Borde | Gris claro | `#e2e8f0` |

#### Sección Betterware (acento azul)
| Rol | Hex |
|---|---|
| Primario | `#1a4b8c` |
| Primario hover | `#153d73` |
| Acento (links, badges) | `#2d7dd2` |
| Fondo sutil (header tint) | `#eef4fb` |

#### Sección Tienda Personal (acento verde)
| Rol | Hex |
|---|---|
| Primario | `#019d71` |
| Primario hover | `#017d5a` |
| Acento (links, badges) | `#01c38c` |
| Fondo sutil (header tint) | `#edf9f5` |

Al cambiar el toggle entre secciones, se aplica la paleta correspondiente para crear un cambio visual notable.

---

## 8. Seguridad

| Medida | Implementación |
|---|---|
| SQL Injection | Prisma (queries parametrizadas) |
| XSS | DOMPurify para HTML de Betterware al renderizar |
| CSRF | NextAuth.js automático |
| Rate Limiting | Middleware en API routes |
| Input Validation | Zod schemas en todas las API routes |
| Auth | NextAuth.js con sesiones seguras |
| CORS | next.config.js |
| Headers | X-Content-Type-Options, X-Frame-Options, CSP |
| Secrets | .env nunca en repo, .env.example documentado |
| Cron | Token CRON_SECRET para proteger endpoint de sync |

---

## 9. WhatsApp — Integración

### Números
- **Maru**: +52 4774499628 → wa.me link: `https://wa.me/524774499628`
- **Mosco**: +52 4777240506 → wa.me link: `https://wa.me/524777240506`

### Dónde aparecen
- **Catálogo Betterware**: 2 botones (Maru y Mosco) en detalle de producto
- **Catálogo Personal**: 1 botón (solo Maru) en detalle de producto
- **Carrito unificado**: Si solo hay productos BW → 2 botones (Maru y Mosco). Si hay cualquier producto personal (solo o mezclado) → 1 botón (solo Maru)

### Mensaje pre-llenado (ejemplo producto individual)
```
Hola, me interesa el producto Extendi Paraguas - 26754 ($500) de Enhorabuena
```

### Mensaje pre-llenado (ejemplo carrito)
```
¡Hola! Me interesan estos productos de Enhorabuena:

• Extendi Paraguas (26754) - $500
• Luz Estrella (26989) - $99.90
• Camiseta personalizada - $150

Total: $749.90
```

---

## 10. Fases de Implementación

### Fase 1: Fundamentos (Backend + Sync + Auth)

**Objetivo**: Tener el backend funcional con datos reales de Betterware

- [ ] Inicializar proyecto Next.js + Tailwind + Prisma
- [ ] Definir schema completo de Prisma (TODAS las tablas, incluyendo CustomProduct)
- [ ] Configurar Prisma con Neon PostgreSQL
- [ ] Ejecutar migración inicial
- [ ] Implementar CatalogProvider (interfaz + BetterwareCatalogProvider)
- [ ] API Route `/api/sync/catalog` (protegida con CRON_SECRET)
- [ ] Configurar NextAuth.js con Credentials Provider (usuario + password)
- [ ] Script de seed: usuario admin + AppConfig (números de WhatsApp, nombre tienda)
- [ ] Documentar variables de .env necesarias en .env.example

**Verificación**:
- Ejecutar sync y verificar que ~3,500 productos se guardan correctamente
- Verificar login de admin
- Verificar que productos con compare_at_price se guardan correctamente

---

### Fase 2: Panel de Administración

**Objetivo**: El admin puede gestionar todo el inventario de ambas tiendas

- [ ] Layout del admin (sidebar, header con última sync)
- [ ] Dashboard con estadísticas separadas BW/Personal
- [ ] CRUD de ubicaciones (con lógica de eliminación segura)
- [ ] Inventario BW: tabla con filtros, buscador, acciones por unidad
  - [ ] Filtro por precio personalizado
  - [ ] Badge "precio rojo ⚠️" para productos con tag `2_o_mas`
  - [ ] Acciones: apartar, vender, retirar, devolver, cambiar ubicación, editar precio
- [ ] Registro manual por SKU
- [ ] Escáner de código de barras (html5-qrcode + sonido + vibración + feedback)
- [ ] Importación CSV (textarea con formato SKU,cantidad)
- [ ] CRUD de productos personales (nombre, descripción, precio, stock, categoría, imágenes)
- [ ] Gestión de stock de productos personales (apartar, vender, devolver)
- [ ] Historial de ventas (ambos tipos, con filtros)
- [ ] Configuración (WhatsApp, nombre, sync manual, reinicio de inventario)

**Verificación**:
- Flujo completo: registrar → apartar → vender (ambos tipos)
- Escanear código de barras desde celular
- Importar CSV
- Reiniciar inventario

---

### Fase 3: Catálogo Público

**Objetivo**: Los clientes pueden ver productos y contactar por WhatsApp

- [ ] Layout público (header, footer, carrito)
- [ ] Página principal con tabs Betterware / Tienda
- [ ] Cambio de paleta de colores al cambiar tab (azul ↔ verde)
- [ ] Grid de productos con tarjetas
- [ ] Buscador (solo busca en inventario disponible)
- [ ] Filtros por categoría y precio
- [ ] Página de detalle con carrusel de imágenes
- [ ] Carrito temporal en localStorage (unificado)
- [ ] Botones de WhatsApp con mensaje pre-llenado
- [ ] Diseño mobile-first, tema claro

**Verificación**:
- Navegar catálogo en móvil y desktop
- Agregar productos de ambas secciones al carrito
- Enviar pedido por WhatsApp

---

### Fase 4: PWA + Polish + Deploy

**Objetivo**: App instalable, sync automática, producción

- [ ] Configurar next-pwa (manifest, service worker, íconos)
- [ ] Configurar Vercel Cron Job para sync diaria
- [ ] Badge en dashboard "BW agregó X productos nuevos" (detección de nuevos SKUs)
- [ ] Logo (cuando el cliente lo tenga, o placeholder)
- [ ] SEO: meta tags, OG tags, structured data
- [ ] Optimización: lazy loading imágenes, ISR/SSG donde aplique
- [ ] Deploy en Vercel
- [ ] Verificar conexión con Neon en producción
- [ ] Documentación final

**Verificación**:
- Instalar PWA en celular
- Escanear productos desde la PWA
- Verificar que el cron ejecuta la sync
- Verificar que la app funciona en producción

---

## 11. Variables de Entorno (.env.example)

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generar-un-secret-aleatorio-seguro"

# Admin inicial (solo para seed)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="cambiar-en-produccion"
ADMIN_NAME="Administrador"

# Sync de Betterware
CRON_SECRET="un-token-secreto-para-proteger-el-cron"

# Cloudinary (para imágenes de productos personales)
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

---

## 12. Mockups de Referencia

En la carpeta `/mockups` del proyecto se encuentran los mockups de diseño generados para las pantallas principales. **El agente debe usar estos mockups como referencia visual** al implementar la UI:
- Respetar la estructura general de layout, proporciones y espaciado de los mockups
- Seguir la paleta de colores definida en la sección 7.2 (puede diferir ligeramente de los mockups)
- Adaptar los mockups al framework (Next.js + Tailwind), no intentar replicarlos pixel-perfect
- Cuando un mockup no exista para una pantalla, seguir el estilo visual establecido por los mockups existentes

---

## 13. Anti-Patrones de Diseño IA — Qué Evitar

El diseño debe verse **humano y con intención**, no generado por IA. Evitar específicamente:

### Señales visuales de diseño IA
- **Layouts genéricos tipo SaaS**: No usar el esqueleto típico de hero centrado + grid de 3 cards + sección de testimonios. Diseñar con propósito para este caso específico
- **Uniformidad excesiva**: No usar el mismo padding, border-radius y altura de card para todo. Crear **jerarquía visual intencional** — algunos elementos deben ser más grandes, más prominentes, con más espacio
- **Paletas "seguras" sin identidad**: Usar la paleta definida en el plan (azul oscuro Betterware, verde tienda personal), no caer en grises genéricos o azules por defecto
- **Tipografía por defecto del navegador**: Usar Lato como se especifica, no Inter ni system fonts genéricas
- **Simetría perfecta artificial**: No todo debe estar perfectamente centrado y equidistante. Permitir asimetría intencional donde tenga sentido
- **Uso de emojis**: Evita el uso de emojis, usa íconos en su lugar

### Señales de UX generada por IA
- **Micro-interacciones "muertas"**: Todo botón y elemento interactivo debe tener hover states, transiciones suaves (150-300ms), y feedback visual. No dejar hovers que no hacen nada
- **Transiciones bruscas**: Usar `transition-all duration-200 ease-in-out` o similar, nunca cambios instantáneos de estado
- **Copy genérico**: No usar frases como "Bienvenido a nuestra plataforma" o "Descubre nuestros productos". Usar lenguaje directo y específico para este negocio: "Tu inventario", "Registrar producto", "Enviar pedido"
- **Espacios vacíos sin propósito**: El whitespace debe ser intencional, no resultado de no saber qué poner

### Buenas prácticas para que se vea profesional
- Variedad en tamaños de cards/elementos cuando tiene sentido funcional
- Bordes y sombras sutiles y consistentes (no sombras excesivas)
- Íconos con propósito, no decorativos sin función
- Estados vacíos bien diseñados ("No hay productos registrados" con ilustración o ícono)
- Mensajes de error/éxito específicos, no genéricos
- Loading states y skeleton loaders donde aplique

---

## 14. Notas Finales

- El agente debe **comentar al usuario todo lo que necesita configurar manualmente** (Neon, Vercel, variables de entorno)
- Al terminar cada fase, generar un documento `.md` resumiendo lo implementado, cambios vs plan, y pasos pendientes
- El inventario del admin debe ser **visualmente muy claro** — tabla limpia, bien espaciada, fácil de leer
- Priorizar la experiencia del admin (es el usuario principal) sin descuidar la experiencia del cliente
- Cualquier decisión de diseño o arquitectura que no esté cubierta aquí, tomar la opción más simple y documentarla
