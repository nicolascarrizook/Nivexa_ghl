# Sistema de Caja Maestra - Documentación Completa

**Versión:** 2.0
**Fecha:** 30 de Enero de 2025
**Estado:** Diseño Completo - Listo para Implementación

---

## Introducción

El **Sistema de Caja Maestra** es una solución completa para la gestión centralizada de liquidez en estudios de arquitectura, con funcionalidad de **financiera interna** que permite préstamos inter-proyectos, gestión multi-moneda (ARS/USD), y trazabilidad total de todas las transacciones.

### Problema que Resuelve

Los estudios de arquitectura manejan múltiples proyectos simultáneos con diferentes estados de liquidez:

- **Proyectos con superávit**: Tienen dinero ocioso sin rentabilizar
- **Proyectos con déficit**: Necesitan financiamiento urgente para pagos
- **Gestión fragmentada**: Cada proyecto maneja su caja por separado
- **Falta de visibilidad**: No hay visión consolidada de la liquidez total
- **Préstamos informales**: Sin registro ni trazabilidad entre proyectos

### Solución Propuesta

Una **Caja Maestra Centralizada** que funciona como financiera interna:

1. **Pool de Liquidez**: Centraliza fondos disponibles en ARS y USD
2. **Préstamos Inter-Proyectos**: Sistema formal con cuotas, intereses y trazabilidad
3. **Gestión de Deudas**: Balance automático de lo que cada proyecto debe/le deben
4. **Cuentas Bancarias**: Gestión de transferencias entre cuentas del estudio
5. **Pagos Centralizados**: Honorarios y gastos desde la caja maestra
6. **Alertas Automáticas**: Notificaciones de vencimientos y deudas

---

## Documentos de Arquitectura

Esta documentación está organizada en 4 documentos principales:

### 1. [Arquitectura General](./MASTER_CASH_ARCHITECTURE.md)

**Contenido:**
- Visión general del sistema
- Modelo de datos completo (tablas, constraints, índices)
- Flujos de usuario (UX) detallados paso a paso
- Arquitectura de componentes React/TypeScript
- Servicios y lógica de negocio
- Sistema de trazabilidad y auditoría
- Casos de uso con ejemplos

**Cuándo leer:** Para entender el diseño completo del sistema y los flujos de usuario.

### 2. [Esquema de Base de Datos](./MASTER_CASH_DATABASE_SCHEMA.md)

**Contenido:**
- Diagrama entidad-relación completo
- Definición de tablas con todos los campos
- Índices para performance
- Constraints y validaciones
- Triggers automáticos
- Políticas RLS (Row Level Security)
- Funciones PostgreSQL

**Cuándo leer:** Para implementar la base de datos o entender las relaciones entre tablas.

### 3. [Colección de Queries SQL](./MASTER_CASH_SQL_QUERIES.md)

**Contenido:**
- 29+ queries SQL listos para usar
- Consultas de balance y liquidez
- Gestión de préstamos
- Análisis de deudas
- Reportes financieros
- Alertas y notificaciones
- Auditoría y trazabilidad
- Queries de mantenimiento

**Cuándo leer:** Para implementar reportes, dashboards o análisis de datos.

### 4. [Plan de Implementación](./MASTER_CASH_IMPLEMENTATION_PLAN.md)

**Contenido:**
- Plan detallado de 8-10 semanas
- 5 fases de desarrollo
- Tareas específicas con estimaciones
- Criterios de aceptación
- Checklist de lanzamiento
- Riesgos y mitigaciones
- Métricas de éxito

**Cuándo leer:** Para planificar el desarrollo y coordinar el equipo.

---

## Características Principales

### 1. Préstamos Inter-Proyectos

**Funcionalidad:**
- Proyecto A (con superávit) presta a Proyecto B (necesitado)
- Caja Maestra actúa como intermediaria
- Registro formal con contrato y cuotas
- Tasa de interés opcional (0% para préstamos solidarios)
- Plan de pago: mensual, trimestral, pago único

**Flujo:**
```
Proyecto A → Caja Maestra (registro préstamo)
Caja Maestra → Proyecto B (desembolso)

Al pagar:
Proyecto B → Caja Maestra (cuota)
Caja Maestra → Proyecto A (devolución)
```

**Beneficios:**
- Rentabiliza dinero ocioso de proyectos exitosos
- Financia proyectos sin necesidad de crédito bancario
- Trazabilidad total: quién debe qué a quién
- Automatización de cuotas y vencimientos

### 2. Gestión Multi-Moneda

**Monedas Soportadas:**
- ARS (Pesos Argentinos)
- USD (Dólares Estadounidenses)

**Funcionalidad:**
- Balances separados por moneda
- Conversión con tipo de cambio rastreado (blue, oficial, MEP)
- Préstamos en cualquier moneda
- Reportes consolidados en ARS

**Uso:**
```
Balance Caja Maestra:
- ARS: $3,200,000
- USD: $25,000 (≈ $39,000,000 ARS al blue $1,560)

Total equivalente: $42,200,000 ARS
```

### 3. Trazabilidad Total

**Cada movimiento registra:**
- Origen: De dónde sale el dinero (proyecto, cuenta, externa)
- Destino: A dónde va el dinero (proyecto, cuenta, externa)
- Préstamo asociado (si aplica)
- Número de cuota (si aplica)
- Usuario que registró
- Timestamp inmutable

**Ejemplo de Trazabilidad:**
```sql
-- Préstamo LOAN-2025-001: $500,000 ARS

Movimiento 1 (Desembolso):
  source: project/torre-central
  destination: master/caja-maestra
  loan_id: loan-001
  amount: -500,000 ARS

Movimiento 2 (Desembolso):
  source: master/caja-maestra
  destination: project/barrio-norte
  loan_id: loan-001
  amount: 500,000 ARS

Movimiento 3 (Pago Cuota 1):
  source: project/barrio-norte
  destination: master/caja-maestra
  loan_id: loan-001
  installment_number: 1
  amount: 125,000 ARS

Movimiento 4 (Devolución):
  source: master/caja-maestra
  destination: project/torre-central
  loan_id: loan-001
  installment_number: 1
  amount: 125,000 ARS
```

### 4. Sistema de Alertas

**Notificaciones Automáticas:**
- Cuotas que vencen hoy
- Cuotas vencidas (mora)
- Saldo bajo en caja maestra
- Préstamos próximos a completarse
- Deudas críticas (>90 días mora)

**Configuración:**
- Cron jobs diarios (8am, 9am, 10am)
- Emails + notificaciones in-app
- Frecuencia configurable
- Opt-out disponible

### 5. Reportes Financieros

**Reportes Disponibles:**
1. **Balance General**: Liquidez total, deudas, gastos
2. **Actividad de Préstamos**: Préstamos creados, pagos, estado
3. **Flujo de Caja Proyectado**: Ingresos esperados próximos 3 meses
4. **Deudas por Proyecto**: Balance de cada proyecto
5. **Matriz de Préstamos**: Quién le prestó a quién

**Formatos:**
- Visualización web (tablas y gráficos)
- Exportación PDF
- Exportación Excel/CSV

---

## Tecnologías Utilizadas

### Backend
- **Supabase (PostgreSQL)**: Base de datos relacional
- **PostgreSQL Functions**: Lógica transaccional compleja
- **Row Level Security**: Seguridad a nivel de fila
- **Materialized Views**: Performance en consultas complejas

### Frontend
- **React 19**: Framework UI
- **TypeScript 5.8**: Type safety
- **React Query**: State management y caching
- **Zustand**: Estado global (opcional)
- **Framer Motion**: Animaciones
- **Tailwind CSS v4**: Estilos

### Design System (Existente)
- `MetricGrid`: Cards de balance
- `DataTable`: Listados de préstamos
- `Modal`: Formularios y confirmaciones
- `MoneyInput`: Inputs de moneda
- `DateRangePicker`: Selección de fechas
- `ConfirmDialog`: Confirmaciones
- `SuccessModal`: Resultado exitoso

### Testing
- **Jest**: Tests unitarios
- **React Testing Library**: Tests de componentes
- **Playwright**: Tests E2E
- **Vitest**: Tests rápidos

### CI/CD
- **GitHub Actions**: Automatización
- **Vercel**: Deployment frontend
- **Supabase**: Hosting backend

---

## Métricas de Impacto

### Técnicas
- **Performance**: Time to Interactive <2s
- **Confiabilidad**: Uptime >99.9%
- **Cobertura de Tests**: >80%
- **Tasa de Errores**: <0.1%

### Negocio
- **Adopción**: >80% proyectos usando préstamos en 3 meses
- **Eficiencia**: Reducción 50% tiempo en gestión
- **Satisfacción**: NPS >50
- **ROI**: Recuperación inversión en 6 meses

---

## Roadmap Futuro

### v2.1 (Q2 2025)
- Integración con APIs bancarias (Modo, Mercado Pago)
- Workflow de aprobaciones multi-nivel
- Reportes avanzados con gráficos interactivos
- App móvil (React Native)

### v2.2 (Q3 2025)
- Previsión de flujo de caja con Machine Learning
- Automatización de inversiones
- Sistema de scoring crediticio inter-proyectos
- Dashboard ejecutivo con Business Intelligence

### v3.0 (Q4 2025)
- Multi-tenant (múltiples estudios)
- Marketplace de servicios financieros
- Integración con contabilidad (facturación)
- API pública para integraciones

---

## Cómo Empezar

### Para Desarrolladores

1. **Leer documentación de arquitectura:**
   - Empezar por [MASTER_CASH_ARCHITECTURE.md](./MASTER_CASH_ARCHITECTURE.md)
   - Revisar [MASTER_CASH_DATABASE_SCHEMA.md](./MASTER_CASH_DATABASE_SCHEMA.md)

2. **Seguir plan de implementación:**
   - Ver [MASTER_CASH_IMPLEMENTATION_PLAN.md](./MASTER_CASH_IMPLEMENTATION_PLAN.md)
   - Comenzar por Fase 1: Base de Datos

3. **Configurar ambiente de desarrollo:**
   ```bash
   # Clonar repositorio
   git clone https://github.com/nivexa/nivexa-crm
   cd nivexa-crm

   # Instalar dependencias
   npm install

   # Configurar Supabase
   cp .env.example .env.local
   # Editar .env.local con credenciales de Supabase

   # Ejecutar migraciones (cuando estén listas)
   npm run db:migrate

   # Iniciar desarrollo
   npm run dev
   ```

### Para Product Managers

1. **Revisar flujos de usuario:**
   - Ver sección "Flujos de Usuario (UX)" en [MASTER_CASH_ARCHITECTURE.md](./MASTER_CASH_ARCHITECTURE.md)
   - Validar con usuarios reales

2. **Priorizar features:**
   - Ver [MASTER_CASH_IMPLEMENTATION_PLAN.md](./MASTER_CASH_IMPLEMENTATION_PLAN.md)
   - Ajustar según feedback de usuarios

3. **Definir métricas de éxito:**
   - Métricas técnicas vs negocio
   - Objetivos por trimestre

### Para Diseñadores UX

1. **Estudiar flujos propuestos:**
   - 4 flujos principales documentados
   - Wireframes en arquitectura

2. **Validar con usuarios:**
   - Pruebas de usabilidad
   - Ajustar según feedback

3. **Diseñar pantallas finales:**
   - Usar design system existente
   - Mantener consistencia visual

---

## Preguntas Frecuentes

### ¿Por qué préstamos inter-proyectos?

Muchos estudios tienen proyectos con superávit que no generan rendimiento, mientras otros proyectos necesitan financiamiento urgente. En vez de ir a un banco (con intereses altos), se puede usar el dinero interno.

### ¿Cómo se asegura la trazabilidad?

Cada movimiento tiene origen y destino explícitos. Todos los préstamos se registran con número único. Cada cuota crea 2 movimientos (ida y vuelta). La vista materializada `loan_balance_ledger` consolida el estado en tiempo real.

### ¿Qué pasa si un proyecto no paga?

El sistema marca cuotas como "vencidas" automáticamente. Envía notificaciones escaladas:
- 7 días antes: Recordatorio
- Día del vencimiento: Alerta
- Después: Notificación diaria de mora

El administrador puede tomar acciones: condonar deuda, refinanciar, o gestionar fuera del sistema.

### ¿Se pueden hacer préstamos sin interés?

Sí, el campo `interest_rate` puede ser 0. Son préstamos solidarios entre proyectos del mismo estudio.

### ¿Cómo se manejan las conversiones de moneda?

Cada movimiento registra el `exchange_rate` usado. La tabla `currency_conversions` mantiene historial de conversiones con fuente (blue, oficial, MEP). Los reportes pueden mostrar equivalencias en ARS.

### ¿Es seguro para producción?

La arquitectura incluye:
- Transacciones atómicas (todo o nada)
- Constraints para validar datos
- Triggers para actualizar balances automáticamente
- Row Level Security para multi-tenant
- Auditoría completa de cambios
- Tests automatizados (>80% cobertura)

---

## Soporte y Contacto

**Equipo de Desarrollo:**
- Arquitecto: [Sistema Arquitecto - Claude]
- Backend Lead: [Por asignar]
- Frontend Lead: [Por asignar]
- QA Lead: [Por asignar]

**Documentación:**
- GitHub: `/docs/architecture/MASTER_CASH_*.md`
- Storybook: https://nivexa-storybook.vercel.app
- API Docs: https://nivexa-api.vercel.app/docs

**Issues y Feedback:**
- GitHub Issues: https://github.com/nivexa/nivexa-crm/issues
- Email: dev@nivexa.com

---

## Licencia

Este sistema es parte de **Nivexa CRM** - Software propietario.
© 2025 Nivexa. Todos los derechos reservados.

---

**Última actualización:** 30 de Enero de 2025
**Versión de documentación:** 2.0
**Estado:** ✅ Diseño Completo - Listo para Implementación