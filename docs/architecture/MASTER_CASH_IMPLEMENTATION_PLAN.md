# Plan de Implementación - Caja Maestra v2.0

**Versión:** 2.0
**Fecha:** 30 de Enero de 2025
**Estimación Total:** 8-10 semanas

---

## Resumen Ejecutivo

Este plan detalla la implementación completa del sistema de Caja Maestra con funcionalidad de préstamos inter-proyectos, trazabilidad total y gestión multi-moneda.

### Objetivos Clave

1. Centralizar la gestión de liquidez del estudio
2. Implementar sistema de préstamos entre proyectos con trazabilidad completa
3. Gestionar cuentas bancarias y transferencias
4. Proveer visibilidad total de deudas y balances
5. Automatizar notificaciones de vencimientos

### Alcance

**Incluye:**
- Base de datos completa con nuevas tablas y vistas
- Backend services y API endpoints
- Componentes UI React/TypeScript
- Sistema de notificaciones
- Reportes y exportaciones
- Documentación técnica

**No Incluye:**
- Integración con sistemas bancarios externos (API de bancos)
- Sistema de workflow de aprobaciones multi-nivel
- Módulo de previsión financiera con ML
- App móvil nativa

---

## Fase 1: Base de Datos y Backend (Semanas 1-3)

### Semana 1: Migraciones SQL

**Objetivo:** Crear toda la infraestructura de base de datos

#### Tareas

1. **Migración 001: Tablas Principales** (2 días)
   ```
   - inter_project_loans
   - loan_installments
   - bank_accounts
   - bank_account_transfers
   ```
   - Archivo: `/database/migrations/010_create_master_cash_system.sql`
   - Incluir constraints, indexes y comentarios
   - Probar con datos de ejemplo

2. **Migración 002: Funciones y Triggers** (2 días)
   ```
   - create_inter_project_loan()
   - process_loan_payment()
   - update_loan_outstanding_balance()
   - update_master_cash_balance()
   - validate_inter_project_loan()
   ```
   - Archivo: `/database/migrations/011_create_master_cash_functions.sql`
   - Testing exhaustivo de lógica transaccional
   - Verificar rollback en caso de error

3. **Migración 003: Vista Materializada** (1 día)
   ```
   - loan_balance_ledger
   - refresh_loan_balance_ledger()
   ```
   - Archivo: `/database/migrations/012_create_loan_balance_ledger.sql`
   - Configurar refresh automático (cada hora)
   - Verificar performance con 10,000+ préstamos

**Entregables:**
- ✅ 3 archivos de migración SQL
- ✅ Script de testing con datos sintéticos
- ✅ Documentación de rollback

**Criterios de Aceptación:**
- Todas las migraciones ejecutan sin errores
- Constraints validan datos correctamente
- Triggers actualizan balances automáticamente
- Performance: queries principales <100ms

---

### Semana 2: Servicios Backend (Parte 1)

**Objetivo:** Implementar servicios core de préstamos

#### Tareas

1. **InterProjectLoanService.ts** (3 días)
   ```typescript
   - createLoan(data: CreateLoanFormData): Promise<InterProjectLoan>
   - getLoans(filters?: LoanFilters): Promise<InterProjectLoan[]>
   - getLoanDetail(loanId: string): Promise<LoanDetail>
   - processLoanPayment(data: LoanPaymentData): Promise<void>
   - getLoanBalanceLedger(): Promise<LoanBalance[]>
   - getUpcomingInstallments(days: number): Promise<Installment[]>
   ```
   - Archivo: `/src/services/finance/InterProjectLoanService.ts`
   - Manejo completo de errores
   - Validaciones antes de llamar a stored procedures
   - Tests unitarios (Jest)

2. **Tipos TypeScript** (1 día)
   ```typescript
   - InterProjectLoan
   - LoanInstallment
   - CreateLoanFormData
   - LoanPaymentData
   - LoanBalance
   - LoanFilters
   ```
   - Archivo: `/src/types/loans.types.ts`
   - Sincronizar con tipos de database.types.ts
   - Documentar con JSDoc

3. **MasterCashService.ts (Actualizar)** (1 día)
   - Extender con métodos para gestión de préstamos
   - Integrar con InterProjectLoanService
   - Archivo: `/src/services/finance/MasterCashService.ts`

**Entregables:**
- ✅ InterProjectLoanService completo con tests
- ✅ Tipos TypeScript documentados
- ✅ MasterCashService actualizado
- ✅ Cobertura de tests >80%

**Criterios de Aceptación:**
- Todos los tests pasan
- Errores se manejan correctamente
- Validaciones funcionan (ej: saldo insuficiente)
- Response times <200ms para operaciones simples

---

### Semana 3: Servicios Backend (Parte 2)

**Objetivo:** Completar servicios auxiliares

#### Tareas

1. **BankAccountService.ts** (2 días)
   ```typescript
   - getBankAccounts(filters?: BankAccountFilters)
   - createBankAccount(data: CreateBankAccountData)
   - updateBankAccount(id: string, data: UpdateBankAccountData)
   - getBankAccountMovements(accountId: string, filters?)
   ```
   - Archivo: `/src/services/finance/BankAccountService.ts`
   - CRUD completo
   - Tests unitarios

2. **BankTransferService.ts** (2 días)
   ```typescript
   - createBankTransfer(data: CreateBankTransferData)
   - getBankTransfers(filters?: BankTransferFilters)
   - cancelBankTransfer(transferId: string)
   - completeBankTransfer(transferId: string)
   ```
   - Archivo: `/src/services/finance/BankTransferService.ts`
   - Manejo de estados (pending, processing, completed, failed)
   - Tests de flujo completo

3. **NotificationService (Extender)** (1 día)
   ```typescript
   - notifyLoanDueSoon(loanId: string, daysUntilDue: number)
   - notifyLoanOverdue(loanId: string, daysOverdue: number)
   - notifyLowBalance(currency: string, balance: number)
   ```
   - Archivo: `/src/services/NotificationService.ts`
   - Integrar con sistema existente
   - Templates de emails/notificaciones

**Entregables:**
- ✅ BankAccountService completo
- ✅ BankTransferService completo
- ✅ NotificationService extendido
- ✅ Documentación API

**Criterios de Aceptación:**
- CRUD operations funcionan correctamente
- Transferencias crean movimientos en cash_movements
- Notificaciones se envían correctamente

---

## Fase 2: Frontend - Componentes Base (Semanas 4-5)

### Semana 4: Hooks y Estado Global

**Objetivo:** Preparar infraestructura React

#### Tareas

1. **Custom Hooks** (3 días)
   ```typescript
   - useMasterCash()
   - useInterProjectLoans()
   - useLoanPayment()
   - useBankAccounts()
   - useBankTransfer()
   ```
   - Archivo: `/src/modules/finance/hooks/`
   - React Query para caching y sincronización
   - Optimistic updates
   - Error handling

2. **Zustand Store (si aplica)** (1 día)
   ```typescript
   - masterCashStore
   - loansStore
   ```
   - Archivo: `/src/modules/finance/store/`
   - Estado compartido entre componentes
   - Persistencia en localStorage si necesario

3. **Utilidades y Helpers** (1 día)
   ```typescript
   - formatCurrency()
   - calculateInstallmentAmount()
   - getLoanStatusLabel()
   - getLoanStatusVariant()
   ```
   - Archivo: `/src/modules/finance/utils/`
   - Tests unitarios

**Entregables:**
- ✅ Hooks personalizados con React Query
- ✅ Store Zustand (si aplica)
- ✅ Utilidades testeadas
- ✅ Documentación de hooks

**Criterios de Aceptación:**
- Hooks gestionan loading/error states
- Caching funciona correctamente
- Refetch automático tras mutaciones

---

### Semana 5: Componentes Compartidos

**Objetivo:** Crear componentes reutilizables

#### Tareas

1. **Componentes Base** (3 días)
   ```typescript
   - CurrencySelector
   - ProjectSelector
   - PaymentMethodSelector
   - LoanStatusBadge
   - InstallmentStatusBadge
   - FinancialSummaryCard
   ```
   - Archivo: `/src/modules/finance/components/Shared/`
   - Props tipados con TypeScript
   - Storybook stories
   - Accessible (ARIA labels)

2. **Componentes de Balance** (2 días)
   ```typescript
   - MasterCashBalanceCards
   - LoanBalanceLedger
   - ProjectDebtSummary
   ```
   - Archivo: `/src/modules/finance/components/MasterCash/`
   - Usar MetricGrid del design system
   - Animaciones con Framer Motion
   - Loading skeletons

**Entregables:**
- ✅ 9 componentes compartidos
- ✅ Stories en Storybook
- ✅ Tests con React Testing Library
- ✅ Documentación con ejemplos

**Criterios de Aceptación:**
- Componentes son reutilizables
- Accesibilidad WCAG AA
- Performance: render <16ms
- Visual regression tests pasan

---

## Fase 3: Frontend - Módulos Principales (Semanas 6-7)

### Semana 6: Dashboard y Listados

**Objetivo:** Implementar vistas principales

#### Tareas

1. **MasterCashDashboard.tsx** (2 días)
   ```
   - Layout con PageContainer
   - QuickActions (Nuevo Préstamo, Honorarios, Transferencia)
   - MasterCashBalanceCards
   - MasterCashFilters
   - MasterCashTransactionList
   ```
   - Archivo: `/src/modules/finance/components/MasterCash/MasterCashDashboard.tsx`
   - Integrar hooks
   - Responsive design

2. **LoansDashboard.tsx** (2 días)
   ```
   - LoanBalanceLedger (vista de deudas por proyecto)
   - LoansList (tabla con DataTable)
   - Filters (estado, moneda, proyecto)
   - Quick stats (total prestado, pendiente, vencido)
   ```
   - Archivo: `/src/modules/finance/components/InterProjectLoans/LoansDashboard.tsx`
   - Sortable columns
   - Exportar a CSV

3. **LoansList.tsx + LoanDetail.tsx** (1 día)
   ```
   - DataTable con rowActions
   - Badge para estados
   - Modal con detalle completo
   - Tabla de cuotas (LoanInstallmentsTable)
   ```
   - Archivo: `/src/modules/finance/components/InterProjectLoans/`

**Entregables:**
- ✅ 2 dashboards completos
- ✅ Componentes de listado y detalle
- ✅ Integración con design system
- ✅ Tests E2E (Playwright)

**Criterios de Aceptación:**
- Navegación fluida
- Filtros funcionan correctamente
- Datos se actualizan en tiempo real
- Performance: TTI <2s

---

### Semana 7: Modales y Formularios

**Objetivo:** Completar flujos de creación/edición

#### Tareas

1. **CreateLoanModal.tsx** (3 días)
   ```
   - Stepper de 4 pasos
   - Validaciones en cada paso
   - Cálculo automático de cuotas
   - Preview antes de confirmar
   - ConfirmDialog final
   ```
   - Archivo: `/src/modules/finance/components/InterProjectLoans/CreateLoanModal.tsx`
   - React Hook Form para validación
   - Zod schema

2. **LoanPaymentModal.tsx** (1 día)
   ```
   - Selección de cuota o monto personalizado
   - Validación de saldo disponible
   - Confirmación con resumen
   ```
   - Archivo: `/src/modules/finance/components/InterProjectLoans/LoanPaymentModal.tsx`

3. **BankTransferModal.tsx** (1 día)
   ```
   - Selección de cuentas origen/destino
   - Cálculo de comisiones
   - Warning de tiempos de acreditación
   ```
   - Archivo: `/src/modules/finance/components/BankAccounts/BankTransferModal.tsx`

**Entregables:**
- ✅ 3 modales completos con validaciones
- ✅ Manejo de errores y loading states
- ✅ Tests de integración
- ✅ Documentación de flujos

**Criterios de Aceptación:**
- Validaciones previenen errores
- UX es intuitiva (user testing)
- Errores se muestran claramente
- Confirmaciones exitosas con toast/modal

---

## Fase 4: Integraciones y Automatizaciones (Semana 8)

### Semana 8: Notificaciones y Reportes

**Objetivo:** Automatizar alertas y generar reportes

#### Tareas

1. **Sistema de Notificaciones** (2 días)
   ```typescript
   - Cron job: Verificar cuotas que vencen (diario 8am)
   - Cron job: Verificar cuotas vencidas (diario 9am)
   - Cron job: Verificar saldo bajo (diario 10am)
   - Email templates
   - In-app notifications
   ```
   - Archivo: `/src/services/cron/MasterCashCronJobs.ts`
   - Usar node-cron o similar
   - Logging de ejecuciones

2. **Generación de Reportes** (2 días)
   ```typescript
   - Reporte mensual de actividad
   - Reporte de deudas pendientes
   - Reporte de flujo de caja proyectado
   - Exportar a PDF/Excel
   ```
   - Archivo: `/src/services/reports/MasterCashReports.ts`
   - Usar pdfmake o jsPDF
   - Templates con estilos

3. **Dashboard de Alertas** (1 día)
   ```
   - Widget con resumen de alertas
   - Notificaciones en NavigationBar
   - Badge count en menú
   ```
   - Archivo: `/src/modules/finance/components/Alerts/`

**Entregables:**
- ✅ Sistema de notificaciones automáticas
- ✅ 4 tipos de reportes descargables
- ✅ Dashboard de alertas
- ✅ Documentación de cron jobs

**Criterios de Aceptación:**
- Notificaciones se envían a tiempo
- Reportes generan correctamente
- Performance: generación PDF <5s
- Emails tienen formato correcto

---

## Fase 5: Testing y Documentación (Semanas 9-10)

### Semana 9: Testing Completo

**Objetivo:** Asegurar calidad con tests exhaustivos

#### Tareas

1. **Tests Unitarios** (2 días)
   ```
   - Services: >80% coverage
   - Hooks: >80% coverage
   - Utilidades: 100% coverage
   - Funciones SQL: 100% coverage
   ```
   - Usar Jest + React Testing Library
   - Mocks de Supabase

2. **Tests de Integración** (2 días)
   ```
   - Flujo completo: crear préstamo → pagar cuota
   - Flujo: transferencia entre cuentas
   - Flujo: verificar balance después de movimientos
   ```
   - Testing con base de datos de prueba

3. **Tests E2E** (1 día)
   ```
   - Playwright scenarios:
     - Usuario crea préstamo exitosamente
     - Usuario registra pago
     - Usuario recibe notificación de vencimiento
   ```

**Entregables:**
- ✅ Cobertura de tests >80%
- ✅ Tests E2E críticos
- ✅ Reporte de cobertura
- ✅ CI/CD pipeline configurado

**Criterios de Aceptación:**
- Todos los tests pasan
- No hay console errors
- Performance tests pasan (Lighthouse >90)
- Accessibility tests pasan (axe-core)

---

### Semana 10: Documentación y Preparación para Producción

**Objetivo:** Documentar todo y preparar despliegue

#### Tareas

1. **Documentación Técnica** (2 días)
   ```markdown
   - README.md del módulo
   - API documentation (Swagger/OpenAPI)
   - Database schema documentation
   - Architecture diagrams actualizados
   ```

2. **Documentación de Usuario** (2 días)
   ```markdown
   - Manual de usuario: Cómo crear préstamos
   - Manual de usuario: Cómo registrar pagos
   - Manual de usuario: Cómo leer reportes
   - Video tutorials (opcional)
   ```

3. **Preparación Producción** (1 día)
   ```
   - Variables de entorno
   - Scripts de deployment
   - Rollback plan
   - Monitoring setup (Sentry)
   ```

**Entregables:**
- ✅ Documentación técnica completa
- ✅ Manual de usuario con screenshots
- ✅ Scripts de deployment
- ✅ Plan de rollback

**Criterios de Aceptación:**
- Documentación está actualizada
- Deployment scripts funcionan
- Monitoring está configurado
- Equipo está capacitado

---

## Checklist de Lanzamiento

### Pre-Lanzamiento

- [ ] Todas las migraciones probadas en staging
- [ ] Backup de base de datos de producción
- [ ] Tests E2E pasan en staging
- [ ] Performance testing completado
- [ ] Security audit realizado
- [ ] Documentación completa
- [ ] Equipo capacitado

### Lanzamiento

- [ ] Ejecutar migraciones en producción (ventana de mantenimiento)
- [ ] Deployar backend services
- [ ] Deployar frontend
- [ ] Verificar monitoreo (Sentry, logs)
- [ ] Smoke tests en producción
- [ ] Notificar usuarios del nuevo módulo

### Post-Lanzamiento

- [ ] Monitorear errores primeras 24h
- [ ] Recolectar feedback de usuarios
- [ ] Documentar issues encontrados
- [ ] Plan de mejoras iterativas

---

## Recursos Necesarios

### Equipo

- **Backend Developer** (Full-time, 6 semanas): Migraciones SQL, servicios
- **Frontend Developer** (Full-time, 6 semanas): Componentes, hooks, UI
- **QA Engineer** (Part-time, 4 semanas): Tests, validaciones
- **UX Designer** (Part-time, 2 semanas): Validación de flujos, feedback

### Herramientas

- Supabase (base de datos + auth)
- Vercel (deployment frontend)
- GitHub Actions (CI/CD)
- Playwright (E2E testing)
- Storybook (component documentation)
- Sentry (error tracking)

### Ambiente

- **Development**: Local + Supabase dev project
- **Staging**: Vercel preview + Supabase staging
- **Production**: Vercel production + Supabase production

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Migraciones fallan en producción | Baja | Alto | Testing exhaustivo en staging, rollback automático |
| Performance issues con >10K préstamos | Media | Medio | Índices optimizados, vista materializada, pagination |
| Errores de cálculo en cuotas | Baja | Alto | Tests unitarios de cálculos, validación manual |
| Usuarios no entienden flujos | Media | Medio | Manual de usuario, tooltips, onboarding |
| Notificaciones spam | Media | Bajo | Configuración de frecuencia, opt-out |

---

## Métricas de Éxito

### Técnicas

- **Performance**: TTI <2s, TBT <200ms
- **Reliability**: Uptime >99.9%
- **Test Coverage**: >80%
- **Error Rate**: <0.1%

### Negocio

- **Adopción**: >80% de proyectos usando préstamos en 3 meses
- **Eficiencia**: Reducción 50% tiempo en gestión de préstamos
- **Satisfacción**: NPS >50
- **ROI**: Recuperación de inversión en 6 meses

---

## Siguiente Iteración (Futuro)

**v2.1 (Q2 2025):**
- Integración con APIs bancarias (Modo, Mercado Pago)
- Workflow de aprobaciones multi-nivel
- Reportes avanzados con gráficos
- App móvil (React Native)

**v2.2 (Q3 2025):**
- Previsión de flujo de caja con ML
- Automatización de inversiones
- Sistema de scoring crediticio inter-proyectos
- Dashboard ejecutivo con BI

---

**Documento generado por:** Sistema Arquitecto - Nivexa CRM
**Fecha:** 30 de Enero de 2025
**Versión:** 2.0 - Plan de Implementación Completo