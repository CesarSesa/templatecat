# 📦 CatalogKit - Template de Catálogo Next.js + Supabase

> Template profesional para catálogos online con gestión de inventario y sistema de planes (Basic/Pro/Premium). Desde tiendas de ropa hasta ferreterías, restaurantes o servicios.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Build](https://img.shields.io/badge/build-passing-success)

---

## ✨ ¿Qué incluye?

### 🛍️ Catálogo Público
- **Homepage** con productos/servicios destacados
- **Página de catálogo** con filtros por categoría
- **Diseño responsive** (mobile-first)
- **Optimización de imágenes** integrada

### 🔐 Panel de Administración
- **Autenticación** segura con Supabase Auth
- **Dashboard** con métricas de negocio
- **Gestión de productos** (CRUD completo)
- **Control de inventario** con alertas de stock bajo (Plan Pro+)
- **Registro de ventas** (Plan Pro+)
- **Registro de gastos** (Plan Premium)
- **Sistema de planes**: Basic ($50) / Pro ($80) / Premium ($120)

### 🎨 Personalizable
- Temas de colores via variables CSS
- Logo y branding configurables
- Sistema de features modular (activar/desactivar por plan)

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 + React + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de Datos | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Deploy | Vercel (recomendado) |

---

## 📋 Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

---

## 🛠️ Instalación

### 1. Clonar y configurar

```bash
# Clonar el template
git clone https://github.com/CesarSesa/templatecat.git
cd templatecat

# Instalar dependencias
npm install
```

### 2. Configurar Supabase

1. Crear nuevo proyecto en Supabase
2. Ejecutar las migraciones SQL en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions.sql`
   - `supabase/migrations/003_feature_system.sql`
3. Configurar Storage bucket para imágenes
4. Copiar credenciales para el siguiente paso

### 3. Variables de Entorno

Crear archivo `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BUSINESS_NAME="Tu Negocio"
NEXT_PUBLIC_BUSINESS_TYPE="retail"  # retail | services | restaurant
```

### 4. Desarrollo local

```bash
npm run dev
```

Visitar `http://localhost:3000`

**Windows:** Usar el ejecutable `INICIAR-TEMPLATECAT.bat` en el escritorio

---

## 🎯 Sistema de Features (Planes)

### Estructura de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA              │  IMPLEMENTACIÓN                        │
├─────────────────────────────────────────────────────────────┤
│  Cache SSR         │  React.cache() + Map keyed by userId   │
│  Server Actions    │  Decorador @withFeature('key')         │
│  API Routes        │  guardApiFeature() con validación      │
│  UI (Sidebar)      │  FeatureGate component                 │
│  Datos (RLS)       │  Supabase policies                     │
└─────────────────────────────────────────────────────────────┘
```

### Planes Disponibles

| Plan | Precio | Features |
|------|--------|----------|
| **Basic** | $50/mes | Catálogo, productos, categorías, imágenes |
| **Pro** | $80/mes | + Inventario, ventas, reportes, clientes |
| **Premium** | $120/mes | + Gastos, P&L, multi-usuario, API access |

### Configurar Plan de Cliente

```sql
-- En Supabase SQL Editor
UPDATE tenant_config SET plan = 'pro' WHERE id = '...';
```

---

## 🎨 Personalización

### Cambiar colores

Editar `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: '#8B5CF6',    // Cambiar a tu color
    foreground: '#ffffff',
  },
  // ...
}
```

### Configurar tipo de negocio

En `.env.local`:
```bash
NEXT_PUBLIC_BUSINESS_TYPE="retail"  # retail | services | restaurant
```

O modificar `types/product.ts` para ajustar campos.

---

## 📁 Estructura del Proyecto

```
app/
├── page.tsx                 # Homepage pública
├── tienda/
│   └── productos/
│       └── page.tsx         # Catálogo público
├── admin/
│   ├── dashboard/           # Métricas y resumen
│   ├── productos/           # CRUD productos
│   ├── inventario/          # Control de stock (Pro+)
│   ├── ventas/              # Registro de ventas (Pro+)
│   ├── gastos/              # Registro de gastos (Premium)
│   ├── upgrade/             # Página de planes
│   └── components/          # Componentes admin
├── auth/
│   ├── login/
│   └── register/
└── api/                     # API routes

components/
├── ui/                      # shadcn/ui components
├── feature-provider.tsx     # React Context para features
└── business-name.tsx        # Componentes de branding

lib/
├── features.ts              # Sistema de features (seguro)
├── feature-guard.ts         # Guards y decoradores
├── supabase/                # Clientes Supabase
└── utils.ts                 # Utilidades

supabase/
└── migrations/              # SQL de base de datos

types/
└── *.ts                     # Tipos TypeScript
```

---

## 🔄 Tipos de Negocio Soportados

### Retail (Tiendas de productos)
- ✅ Catálogo con fotos
- ✅ Inventario por producto
- ✅ Variantes (talla, color, etc.) - Plan Pro+
- ✅ Control de stock - Plan Pro+

### Servicios
- ✅ Catálogo de servicios
- ✅ Sin inventario (disponible/no disponible)
- ✅ Duración de servicios
- ✅ Precios variables

### Restaurantes (Menús digitales)
- ✅ Menú organizado por categorías
- ✅ Fotos de platos
- ✅ Marcado de disponibilidad
- ✅ Sin complejidad de inventario

---

## 🔒 Seguridad

### Buenas prácticas implementadas

1. **Cache SSR seguro**: Usa `React.cache()` con `tenantId` para evitar data leak entre usuarios
2. **Server Actions protegidas**: Decorador `withFeature()` verifica permisos antes de ejecutar
3. **RLS en Supabase**: Políticas de fila por tenant
4. **No window.location**: Usar `NEXT_PUBLIC_SITE_URL` para redirects

### Verificar seguridad antes de deploy

```bash
# 1. Build debe pasar sin errores
npm run build

# 2. Verificar no hay variables globales de cache
rg "let.*Cache" lib/ --type ts

# 3. Todas las Server Actions deben usar withFeature
rg "'use server'" app/ --type ts -A 3
```

---

## 📝 Roadmap

### Corto plazo
- [x] Sistema de features modular (Basic/Pro/Premium)
- [x] Cache SSR seguro con React.cache()
- [ ] Integración pasarela de pago (Flow Chile)
- [ ] Webhook para actualización automática de planes
- [ ] Soft Lock (readonly) para downgrades

### Medio plazo
- [ ] Carrito de compras básico
- [ ] Sistema de cupones de descuento
- [ ] Agenda/reservas para servicios
- [ ] PWA (instalable en móviles)

### Largo plazo
- [ ] Multi-idioma
- [ ] Dashboard Imperial (gestión multi-cliente)
- [ ] API pública para integraciones

---

## 🐛 Issues Conocidos

Ver `memoria.local.md` para lista detallada.

**Solucionados (Feb 11, 2026):**
- ✅ Cache SSR inseguro (variable global)
- ✅ Build fallaba por encoding en config/site.ts
- ✅ Imports de BusinessName desde config/site.ts

**Pendientes:**
- Integración con pasarela de pagos
- Tests de concurrencia (User A + User B simultáneos)

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agrega funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

---

## 📄 Licencia

MIT - Libre para uso personal y comercial.

---

## 💬 Soporte

Para dudas o soporte, revisar:
- Documentación local: `memoria.local.md`
- Documentación de Next.js: https://nextjs.org/docs
- Documentación de Supabase: https://supabase.com/docs
- Issues de este repositorio

---

**Hecho con ❤️ para pymes que necesitan presencia online sin complejidad.**  
**Refactor de seguridad: Feb 11, 2026**
