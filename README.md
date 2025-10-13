# Nivexa - Sistema Financiero para Arquitectos

Sistema de gestión financiera especializado para estudios de arquitectura con sistema de triple caja y financiamiento de proyectos.

## 🚀 Instalación Rápida

### 1. Configuración de Base de Datos

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del archivo `supabase/migrations/001_initial_schema.sql`
5. Ejecuta la query

### 2. Configuración Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Credenciales de Prueba

Para desarrollo local, puedes:
- Registrarte con cualquier email/contraseña
- O usar: demo@nivexa.com / demo123

## 🌐 Deploy a Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Deployment Rápido

1. **Click en el botón "Deploy with Vercel"** arriba
2. **Conecta tu repositorio Git** (GitHub, GitLab, o Bitbucket)
3. **Configura las variables de entorno**:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```
4. **Deploy** - Vercel construirá y desplegará automáticamente

### Configuración Manual

Si prefieres configurar manualmente:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login y deploy
vercel login
vercel

# Añadir variables de entorno
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy a producción
vercel --prod
```

### Obtener Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

Para más detalles sobre deployment, configuración de dominio personalizado, troubleshooting y mejores prácticas, consulta la **[Guía Completa de Deployment](./DEPLOYMENT.md)**.

## 📊 Características Principales

### Sistema de Triple Caja
- **Caja Maestra**: Caja principal del estudio (recibe duplicados automáticos)
- **Caja Admin**: Caja personal del arquitecto para honorarios
- **Caja Proyecto**: Una caja por cada proyecto de construcción

### Flujo Financiero
1. **Ingreso a Proyecto** → Se registra en caja del proyecto + duplica automáticamente en caja maestra
2. **Cobro de Honorarios** → El arquitecto decide manualmente cuánto cobrar de la caja maestra a su caja admin
3. **Trazabilidad Completa** → Todos los movimientos quedan registrados con detalle

### Gestión de Proyectos
- Códigos únicos automáticos (PRY-2024-001)
- Financiamiento hasta 120 cuotas
- Cálculo automático de cuotas
- Seguimiento de pagos y mora
- Contratos digitales

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS v4 (dark theme minimalista)
- **Base de Datos**: Supabase (PostgreSQL)
- **Estado**: React Query + Context API
- **Arquitectura**: Progressive Architecture con Service Layer
- **Deployment**: Vercel (optimizado para Vite + React)

## 📁 Estructura del Proyecto

```
src/
├── core/                 # Núcleo del sistema
│   ├── services/        # Servicios base
│   ├── contexts/        # Contextos React
│   └── providers/       # Providers
├── modules/             # Módulos de dominio
│   ├── projects/        # Gestión de proyectos
│   │   ├── services/
│   │   └── hooks/
│   └── finance/         # Sistema financiero
│       ├── services/    # CashBoxService
│       └── hooks/
├── components/          # Componentes UI
├── pages/              # Páginas
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
└── types/              # TypeScript types
```

## 🔑 Servicios Principales

### ProjectService
- Creación de proyectos con código único
- Generación automática de cuotas
- Cálculo de progreso de pago
- Gestión de estados del proyecto

### CashBoxService
- Gestión de las tres cajas
- Registro de ingresos con duplicación automática
- Cobro flexible de honorarios
- Registro de gastos
- Historial completo de movimientos

## 🚦 Próximos Pasos

### Funcionalidades Pendientes
- [ ] UI para crear proyectos
- [ ] Modal de registro de ingresos
- [ ] Interface de cobro de honorarios
- [ ] Vista de historial de movimientos
- [ ] Generación de reportes
- [ ] Gestión de cuotas e installments
- [ ] Sistema de contratos digitales

### Mejoras Futuras
- [ ] Sistema de roles y permisos
- [ ] Multi-tenancy para múltiples estudios
- [ ] Integración con facturación electrónica
- [ ] Dashboard de analytics avanzado
- [ ] Notificaciones de vencimientos
- [ ] Exportación a Excel/PDF

## 🔧 Herramientas de Diagnóstico

### Scripts de Diagnóstico del Sistema de Cajas

Si el dashboard muestra balances en $0 o tienes problemas con el flujo de cajas:

```bash
# Diagnóstico rápido
npm run diagnose:cash

# Diagnóstico detallado (recomendado)
npm run diagnose:detailed

# Reparación automática (si hay registros duplicados)
npm run fix:cash

# Tests de integración
npm run test:integration
```

**¿Cuándo usar cada uno?**:
- `diagnose:cash` - Chequeo rápido de estado general
- `diagnose:detailed` - Análisis completo con soluciones SQL
- `fix:cash` - Soluciona automáticamente registros duplicados
- `test:integration` - Verifica el flujo completo de cajas

Para más detalles, consulta **[CASH_SYSTEM_DEBUG.md](./CASH_SYSTEM_DEBUG.md)**.

## 📝 Notas de Desarrollo

### Reglas de Negocio
1. Todo ingreso a proyecto se duplica automáticamente en caja maestra
2. Los honorarios se cobran manualmente desde caja maestra a caja admin
3. Cada proyecto tiene su propia caja independiente
4. El arquitecto decide cuánto y cuándo cobrar sus honorarios
5. Trazabilidad completa de todos los movimientos

### Consideraciones de Seguridad
- RLS (Row Level Security) habilitado en todas las tablas
- Autenticación requerida para todas las operaciones
- Validación de datos con Zod
- Transacciones atómicas para movimientos financieros

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Para contribuir:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

Desarrollado con ❤️ para arquitectos que buscan orden financiero
