# 📦 CatalogKit - Template de Catálogo Next.js + Supabase

> Template profesional para catálogos online con gestión de inventario. Desde tiendas de ropa hasta ferreterías, restaurantes o servicios.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

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
- **Control de inventario** con alertas de stock bajo
- **Registro de ventas** (opcional)
- **Registro de gastos** (opcional)

### 🎨 Personalizable
- Temas de colores via variables CSS
- Logo y branding configurables
- Campos de producto adaptables al tipo de negocio

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
git clone https://github.com/tu-usuario/catalogkit.git
cd catalogkit

# Instalar dependencias
npm install
```

### 2. Configurar Supabase

1. Crear nuevo proyecto en Supabase
2. Ejecutar las migraciones SQL: `supabase/migrations/001_initial_schema.sql`
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
```

### 4. Desarrollo local

```bash
npm run dev
```

Visitar `http://localhost:3000`

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

En `types/business.ts`, ajustar la interfaz Product según necesites:

```typescript
// Para retail (tiendas)
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string;
  images: string[];
}

// Para servicios (sin stock)
interface Service {
  id: string;
  name: string;
  price: number;
  duration?: number;
  category_id: string;
}
```

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
│   ├── inventario/          # Control de stock
│   ├── ventas/              # Registro de ventas
│   ├── gastos/              # Registro de gastos
│   └── components/          # Componentes admin
├── auth/
│   ├── login/
│   └── register/
└── api/                     # API routes

components/
├── ui/                      # shadcn/ui components
└── *                        # Componentes custom

lib/
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
- ✅ Variantes (talla, color, etc.)
- ✅ Control de stock

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

## 📝 Roadmap

- [ ] Carrito de compras básico
- [ ] Integración pasarelas de pago (MercadoPago, Stripe)
- [ ] Sistema de cupones de descuento
- [ ] Agenda/reservas para servicios
- [ ] PWA (instalable en móviles)
- [ ] Multi-idioma

---

## 🐛 Issues Conocidos

Ver `AUDITORIA_COMPLETA.md` para lista detallada de mejoras pendientes.

Principales:
- Auth redirects: usar `NEXT_PUBLIC_SITE_URL`, no `window.location`
- SelectItems: usar `value="all"`, no `value=""`
- Memory leaks: agregar `URL.revokeObjectURL` en previews de imágenes

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
- Documentación de Next.js: https://nextjs.org/docs
- Documentación de Supabase: https://supabase.com/docs
- Issues de este repositorio

---

**Hecho con ❤️ para pymes que necesitan presencia online sin complejidad.**
