# Queries SQL - Caja Maestra

**Versión:** 2.0
**Fecha:** 30 de Enero de 2025

Colección de queries SQL para casos de uso comunes del sistema de Caja Maestra.

---

## Índice

1. [Consultas de Balance](#consultas-de-balance)
2. [Gestión de Préstamos](#gestión-de-préstamos)
3. [Análisis de Deudas](#análisis-de-deudas)
4. [Reportes Financieros](#reportes-financieros)
5. [Alertas y Notificaciones](#alertas-y-notificaciones)
6. [Auditoría y Trazabilidad](#auditoría-y-trazabilidad)

---

## Consultas de Balance

### 1. Balance General de Caja Maestra

```sql
SELECT
  balance_ars,
  balance_usd,
  total_income_ars,
  total_income_usd,
  total_expenses_ars,
  total_expenses_usd,
  total_loans_given_ars,
  total_loans_given_usd,
  outstanding_receivables_ars,
  outstanding_receivables_usd,
  outstanding_payables_ars,
  outstanding_payables_usd,
  last_movement_at
FROM master_cash_box
LIMIT 1;
```

### 2. Balance por Proyecto con Deudas

```sql
SELECT
  p.id,
  p.name,
  p.code,
  pc.balance AS project_cash_balance,
  lbl.receivables_ars,
  lbl.receivables_usd,
  lbl.payables_ars,
  lbl.payables_usd,
  lbl.net_balance_ars,
  lbl.net_balance_usd,
  lbl.loans_given_count,
  lbl.loans_received_count
FROM projects p
LEFT JOIN project_cash pc ON pc.project_id = p.id
LEFT JOIN loan_balance_ledger lbl ON lbl.project_id = p.id
WHERE p.status IN ('active', 'on_hold')
ORDER BY lbl.net_balance_ars DESC NULLS LAST;
```

### 3. Resumen de Liquidez Global

```sql
SELECT
  'ARS' AS currency,
  mcb.balance_ars AS master_cash_balance,
  COALESCE(SUM(pc.balance), 0) AS total_project_cash,
  mcb.balance_ars + COALESCE(SUM(pc.balance), 0) AS total_liquidity,
  mcb.outstanding_receivables_ars AS pending_collections,
  mcb.outstanding_payables_ars AS pending_payments
FROM master_cash_box mcb
CROSS JOIN project_cash pc
GROUP BY mcb.balance_ars, mcb.outstanding_receivables_ars, mcb.outstanding_payables_ars

UNION ALL

SELECT
  'USD' AS currency,
  mcb.balance_usd AS master_cash_balance,
  0 AS total_project_cash, -- Los proyectos generalmente están en ARS
  mcb.balance_usd AS total_liquidity,
  mcb.outstanding_receivables_usd AS pending_collections,
  mcb.outstanding_payables_usd AS pending_payments
FROM master_cash_box mcb;
```

---

## Gestión de Préstamos

### 4. Préstamos Activos con Detalle

```sql
SELECT
  l.id,
  l.loan_number,
  l.lender_project_name,
  l.borrower_project_name,
  l.loan_amount,
  l.currency,
  l.interest_rate,
  l.installments_count,
  l.payment_frequency,
  l.loan_date,
  l.first_payment_date,
  l.expected_completion_date,
  l.status,
  l.total_paid,
  l.outstanding_balance,
  ROUND((l.total_paid / NULLIF(l.loan_amount, 0)) * 100, 2) AS payment_progress_percentage,
  -- Próxima cuota pendiente
  (
    SELECT MIN(due_date)
    FROM loan_installments li
    WHERE li.loan_id = l.id
    AND li.status IN ('pending', 'partial')
  ) AS next_payment_date,
  (
    SELECT total_amount - paid_amount
    FROM loan_installments li
    WHERE li.loan_id = l.id
    AND li.status IN ('pending', 'partial')
    ORDER BY due_date
    LIMIT 1
  ) AS next_payment_amount
FROM inter_project_loans l
WHERE l.status IN ('active', 'partially_paid')
ORDER BY l.loan_date DESC;
```

### 5. Detalle Completo de un Préstamo

```sql
SELECT
  l.*,
  lender.name AS lender_project_full_name,
  lender.code AS lender_project_code,
  borrower.name AS borrower_project_full_name,
  borrower.code AS borrower_project_code,
  -- Cuotas
  json_agg(
    json_build_object(
      'installment_number', li.installment_number,
      'principal_amount', li.principal_amount,
      'interest_amount', li.interest_amount,
      'total_amount', li.total_amount,
      'paid_amount', li.paid_amount,
      'due_date', li.due_date,
      'paid_date', li.paid_date,
      'status', li.status,
      'days_overdue', li.days_overdue
    ) ORDER BY li.installment_number
  ) AS installments
FROM inter_project_loans l
JOIN projects lender ON l.lender_project_id = lender.id
JOIN projects borrower ON l.borrower_project_id = borrower.id
LEFT JOIN loan_installments li ON li.loan_id = l.id
WHERE l.id = :loan_id
GROUP BY l.id, lender.name, lender.code, borrower.name, borrower.code;
```

### 6. Historial de Pagos de un Préstamo

```sql
SELECT
  li.installment_number,
  li.due_date,
  li.paid_date,
  li.total_amount,
  li.paid_amount,
  li.status,
  li.days_overdue,
  li.late_fee_amount,
  cm.created_at AS payment_recorded_at,
  cm.description AS payment_description,
  u.email AS recorded_by
FROM loan_installments li
LEFT JOIN cash_movements cm ON cm.id = li.payment_movement_id
LEFT JOIN auth.users u ON u.id = cm.created_by
WHERE li.loan_id = :loan_id
ORDER BY li.installment_number;
```

### 7. Préstamos por Vencer (Próximos 7 días)

```sql
SELECT
  l.loan_number,
  l.borrower_project_name,
  li.installment_number,
  li.due_date,
  li.total_amount - li.paid_amount AS amount_due,
  l.currency,
  EXTRACT(DAY FROM (li.due_date - CURRENT_DATE)) AS days_until_due
FROM loan_installments li
JOIN inter_project_loans l ON l.id = li.loan_id
WHERE li.status IN ('pending', 'partial')
AND li.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY li.due_date;
```

### 8. Préstamos Vencidos

```sql
SELECT
  l.loan_number,
  l.borrower_project_name,
  l.lender_project_name,
  li.installment_number,
  li.due_date,
  li.total_amount - li.paid_amount AS amount_overdue,
  l.currency,
  li.days_overdue,
  li.late_fee_amount,
  CASE
    WHEN li.days_overdue > 90 THEN 'CRÍTICO'
    WHEN li.days_overdue > 30 THEN 'SEVERO'
    WHEN li.days_overdue > 7 THEN 'MODERADO'
    ELSE 'LEVE'
  END AS severity_level
FROM loan_installments li
JOIN inter_project_loans l ON l.id = li.loan_id
WHERE li.status IN ('pending', 'partial', 'overdue')
AND li.due_date < CURRENT_DATE
ORDER BY li.days_overdue DESC, li.due_date;
```

---

## Análisis de Deudas

### 9. Top 5 Proyectos Prestamistas

```sql
SELECT
  lbl.project_id,
  lbl.project_name,
  lbl.receivables_ars,
  lbl.receivables_usd,
  lbl.loans_given_count,
  ROUND((lbl.receivables_ars / NULLIF(
    (SELECT SUM(receivables_ars) FROM loan_balance_ledger WHERE receivables_ars > 0),
  0)) * 100, 2) AS percentage_of_total_receivables
FROM loan_balance_ledger lbl
WHERE lbl.receivables_ars > 0 OR lbl.receivables_usd > 0
ORDER BY lbl.receivables_ars DESC
LIMIT 5;
```

### 10. Top 5 Proyectos Deudores

```sql
SELECT
  lbl.project_id,
  lbl.project_name,
  lbl.payables_ars,
  lbl.payables_usd,
  lbl.loans_received_count,
  ROUND((lbl.payables_ars / NULLIF(
    (SELECT SUM(payables_ars) FROM loan_balance_ledger WHERE payables_ars > 0),
  0)) * 100, 2) AS percentage_of_total_payables
FROM loan_balance_ledger lbl
WHERE lbl.payables_ars > 0 OR lbl.payables_usd > 0
ORDER BY lbl.payables_ars DESC
LIMIT 5;
```

### 11. Matriz de Préstamos Entre Proyectos

```sql
SELECT
  l.lender_project_name AS prestamista,
  l.borrower_project_name AS prestatario,
  COUNT(*) AS cantidad_prestamos,
  SUM(l.loan_amount) AS total_prestado,
  l.currency,
  SUM(l.outstanding_balance) AS saldo_pendiente,
  AVG(l.interest_rate) AS tasa_interes_promedio
FROM inter_project_loans l
WHERE l.status IN ('active', 'partially_paid', 'paid')
GROUP BY l.lender_project_name, l.borrower_project_name, l.currency
ORDER BY SUM(l.loan_amount) DESC;
```

### 12. Balance Neto por Proyecto (Acreedores vs Deudores)

```sql
SELECT
  project_name,
  receivables_ars - payables_ars AS net_position_ars,
  receivables_usd - payables_usd AS net_position_usd,
  CASE
    WHEN (receivables_ars - payables_ars) > 0 THEN 'ACREEDOR'
    WHEN (receivables_ars - payables_ars) < 0 THEN 'DEUDOR'
    ELSE 'NEUTRAL'
  END AS position_type_ars,
  loans_given_count,
  loans_received_count
FROM loan_balance_ledger
WHERE (receivables_ars - payables_ars) != 0 OR (receivables_usd - payables_usd) != 0
ORDER BY (receivables_ars - payables_ars) DESC;
```

---

## Reportes Financieros

### 13. Movimientos de Caja Maestra por Período

```sql
SELECT
  DATE_TRUNC('month', cm.created_at) AS month,
  cm.movement_type,
  cm.currency,
  COUNT(*) AS transaction_count,
  SUM(CASE WHEN cm.destination_type = 'master' THEN cm.amount ELSE 0 END) AS inflows,
  SUM(CASE WHEN cm.source_type = 'master' THEN cm.amount ELSE 0 END) AS outflows,
  SUM(
    CASE
      WHEN cm.destination_type = 'master' THEN cm.amount
      WHEN cm.source_type = 'master' THEN -cm.amount
      ELSE 0
    END
  ) AS net_movement
FROM cash_movements cm
WHERE cm.created_at >= DATE_TRUNC('year', CURRENT_DATE)
AND (cm.source_type = 'master' OR cm.destination_type = 'master')
GROUP BY DATE_TRUNC('month', cm.created_at), cm.movement_type, cm.currency
ORDER BY month DESC, cm.movement_type;
```

### 14. Reporte de Actividad de Préstamos por Mes

```sql
SELECT
  DATE_TRUNC('month', l.loan_date) AS month,
  l.currency,
  COUNT(*) AS loans_created,
  SUM(l.loan_amount) AS total_loaned,
  AVG(l.interest_rate) AS avg_interest_rate,
  -- Préstamos pagados en el mes
  (
    SELECT COUNT(*)
    FROM inter_project_loans pl
    WHERE pl.actual_completion_date IS NOT NULL
    AND DATE_TRUNC('month', pl.actual_completion_date) = DATE_TRUNC('month', l.loan_date)
    AND pl.currency = l.currency
  ) AS loans_completed
FROM inter_project_loans l
WHERE l.loan_date >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', l.loan_date), l.currency
ORDER BY month DESC;
```

### 15. Estado Consolidado de Préstamos

```sql
SELECT
  l.status,
  l.currency,
  COUNT(*) AS loan_count,
  SUM(l.loan_amount) AS total_amount,
  SUM(l.total_paid) AS total_paid,
  SUM(l.outstanding_balance) AS total_outstanding,
  ROUND(AVG(
    (l.total_paid / NULLIF(l.loan_amount, 0)) * 100
  ), 2) AS avg_payment_progress_percentage
FROM inter_project_loans l
GROUP BY l.status, l.currency
ORDER BY l.status, l.currency;
```

### 16. Flujo de Caja Proyectado (Próximos 3 meses)

```sql
SELECT
  DATE_TRUNC('month', li.due_date) AS month,
  l.currency,
  COUNT(*) AS installments_due,
  SUM(li.total_amount - li.paid_amount) AS expected_inflow
FROM loan_installments li
JOIN inter_project_loans l ON l.id = li.loan_id
WHERE li.status IN ('pending', 'partial')
AND li.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 months'
GROUP BY DATE_TRUNC('month', li.due_date), l.currency
ORDER BY month;
```

---

## Alertas y Notificaciones

### 17. Cuotas que Vencen Hoy

```sql
SELECT
  l.loan_number,
  l.borrower_project_name,
  li.installment_number,
  li.total_amount - li.paid_amount AS amount_due,
  l.currency,
  -- Información de contacto del proyecto (si existe)
  p.client_email,
  p.client_phone
FROM loan_installments li
JOIN inter_project_loans l ON l.id = li.loan_id
JOIN projects p ON p.id = l.borrower_project_id
WHERE li.status IN ('pending', 'partial')
AND li.due_date = CURRENT_DATE;
```

### 18. Proyectos con Deudas Críticas

```sql
SELECT
  lbl.project_name,
  lbl.payables_ars,
  lbl.payables_usd,
  -- Cuotas vencidas
  (
    SELECT COUNT(*)
    FROM loan_installments li
    JOIN inter_project_loans l ON l.id = li.loan_id
    WHERE l.borrower_project_id = lbl.project_id
    AND li.status IN ('overdue', 'partial')
    AND li.days_overdue > 30
  ) AS overdue_installments_count,
  -- Días promedio de atraso
  (
    SELECT ROUND(AVG(li.days_overdue))
    FROM loan_installments li
    JOIN inter_project_loans l ON l.id = li.loan_id
    WHERE l.borrower_project_id = lbl.project_id
    AND li.status IN ('overdue', 'partial')
  ) AS avg_days_overdue
FROM loan_balance_ledger lbl
WHERE lbl.payables_ars > 0
AND EXISTS (
  SELECT 1
  FROM loan_installments li
  JOIN inter_project_loans l ON l.id = li.loan_id
  WHERE l.borrower_project_id = lbl.project_id
  AND li.status IN ('overdue', 'partial')
  AND li.days_overdue > 30
)
ORDER BY lbl.payables_ars DESC;
```

### 19. Resumen de Alertas del Día

```sql
SELECT
  'Cuotas Vencen Hoy' AS alert_type,
  COUNT(*) AS count,
  'warning' AS severity
FROM loan_installments li
WHERE li.status IN ('pending', 'partial')
AND li.due_date = CURRENT_DATE

UNION ALL

SELECT
  'Cuotas Vencidas' AS alert_type,
  COUNT(*) AS count,
  CASE
    WHEN MAX(li.days_overdue) > 90 THEN 'critical'
    WHEN MAX(li.days_overdue) > 30 THEN 'high'
    ELSE 'medium'
  END AS severity
FROM loan_installments li
WHERE li.status IN ('overdue', 'partial')
AND li.due_date < CURRENT_DATE

UNION ALL

SELECT
  'Saldo Bajo en Caja Maestra ARS' AS alert_type,
  1 AS count,
  CASE
    WHEN mcb.balance_ars < 100000 THEN 'critical'
    WHEN mcb.balance_ars < 500000 THEN 'warning'
    ELSE 'info'
  END AS severity
FROM master_cash_box mcb
WHERE mcb.balance_ars < 1000000;
```

---

## Auditoría y Trazabilidad

### 20. Trazabilidad Completa de un Préstamo

```sql
SELECT
  cm.created_at,
  cm.movement_type,
  CONCAT(cm.source_type, '/', COALESCE(ps.name, 'N/A')) AS origen,
  CONCAT(cm.destination_type, '/', COALESCE(pd.name, 'N/A')) AS destino,
  cm.amount,
  cm.currency,
  cm.installment_number,
  cm.description,
  u.email AS usuario_registro
FROM cash_movements cm
LEFT JOIN projects ps ON cm.source_id = ps.id AND cm.source_type = 'project'
LEFT JOIN projects pd ON cm.destination_id = pd.id AND cm.destination_type = 'project'
LEFT JOIN auth.users u ON u.id = cm.created_by
WHERE cm.loan_id = :loan_id
ORDER BY cm.created_at;
```

### 21. Historial de Cambios en Préstamo

```sql
-- Asumiendo que existe una tabla de auditoría (audit_log)
SELECT
  al.changed_at,
  al.changed_by,
  u.email AS user_email,
  al.table_name,
  al.operation,
  al.old_values,
  al.new_values
FROM audit_log al
JOIN auth.users u ON u.id = al.changed_by
WHERE al.record_id = :loan_id
AND al.table_name = 'inter_project_loans'
ORDER BY al.changed_at DESC;
```

### 22. Reconciliación de Balance de Caja Maestra

```sql
WITH balance_calculation AS (
  SELECT
    COALESCE(SUM(
      CASE
        WHEN cm.destination_type = 'master' AND cm.currency = 'ARS' THEN cm.amount
        WHEN cm.source_type = 'master' AND cm.currency = 'ARS' THEN -cm.amount
        ELSE 0
      END
    ), 0) AS calculated_balance_ars,
    COALESCE(SUM(
      CASE
        WHEN cm.destination_type = 'master' AND cm.currency = 'USD' THEN cm.amount
        WHEN cm.source_type = 'master' AND cm.currency = 'USD' THEN -cm.amount
        ELSE 0
      END
    ), 0) AS calculated_balance_usd
  FROM cash_movements cm
)
SELECT
  mcb.balance_ars AS recorded_balance_ars,
  bc.calculated_balance_ars,
  (mcb.balance_ars - bc.calculated_balance_ars) AS difference_ars,
  CASE
    WHEN ABS(mcb.balance_ars - bc.calculated_balance_ars) < 0.01 THEN 'OK'
    ELSE 'DISCREPANCIA'
  END AS reconciliation_status_ars,
  mcb.balance_usd AS recorded_balance_usd,
  bc.calculated_balance_usd,
  (mcb.balance_usd - bc.calculated_balance_usd) AS difference_usd,
  CASE
    WHEN ABS(mcb.balance_usd - bc.calculated_balance_usd) < 0.01 THEN 'OK'
    ELSE 'DISCREPANCIA'
  END AS reconciliation_status_usd
FROM master_cash_box mcb
CROSS JOIN balance_calculation bc;
```

### 23. Movimientos Sin Origen/Destino (Posibles Errores)

```sql
SELECT
  cm.id,
  cm.movement_type,
  cm.source_type,
  cm.source_id,
  cm.destination_type,
  cm.destination_id,
  cm.amount,
  cm.currency,
  cm.description,
  cm.created_at
FROM cash_movements cm
WHERE (cm.source_type IS NULL OR cm.source_id IS NULL)
OR (cm.destination_type IS NULL OR cm.destination_id IS NULL)
ORDER BY cm.created_at DESC;
```

### 24. Préstamos con Pagos Inconsistentes

```sql
SELECT
  l.loan_number,
  l.loan_amount,
  l.total_paid,
  l.outstanding_balance,
  -- Sumar cuotas pagadas
  (
    SELECT COALESCE(SUM(li.paid_amount), 0)
    FROM loan_installments li
    WHERE li.loan_id = l.id
  ) AS installments_paid_sum,
  -- Verificar inconsistencias
  CASE
    WHEN ABS(l.total_paid - (
      SELECT COALESCE(SUM(li.paid_amount), 0)
      FROM loan_installments li
      WHERE li.loan_id = l.id
    )) > 0.01 THEN 'INCONSISTENTE'
    ELSE 'OK'
  END AS consistency_check
FROM inter_project_loans l
WHERE l.status IN ('active', 'partially_paid', 'paid')
HAVING CASE
  WHEN ABS(l.total_paid - (
    SELECT COALESCE(SUM(li.paid_amount), 0)
    FROM loan_installments li
    WHERE li.loan_id = l.id
  )) > 0.01 THEN 'INCONSISTENTE'
  ELSE 'OK'
END = 'INCONSISTENTE';
```

---

## Queries de Mantenimiento

### 25. Actualizar Días de Mora

```sql
UPDATE loan_installments
SET
  days_overdue = EXTRACT(DAY FROM (CURRENT_DATE - due_date)),
  status = CASE
    WHEN status = 'pending' AND due_date < CURRENT_DATE THEN 'overdue'
    ELSE status
  END
WHERE status IN ('pending', 'partial', 'overdue')
AND due_date < CURRENT_DATE;
```

### 26. Refrescar Vista Materializada

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY loan_balance_ledger;
```

### 27. Limpiar Préstamos Cancelados Antiguos

```sql
-- CUIDADO: Solo ejecutar con respaldo
DELETE FROM inter_project_loans
WHERE status = 'cancelled'
AND created_at < CURRENT_DATE - INTERVAL '2 years'
AND id NOT IN (
  SELECT DISTINCT loan_id
  FROM cash_movements
  WHERE loan_id IS NOT NULL
);
```

---

## Funciones de Utilidad

### 28. Calcular Próxima Fecha de Pago

```sql
CREATE OR REPLACE FUNCTION calculate_next_payment_date(
  p_current_date DATE,
  p_frequency VARCHAR
)
RETURNS DATE AS $$
BEGIN
  RETURN CASE
    WHEN p_frequency = 'monthly' THEN p_current_date + INTERVAL '1 month'
    WHEN p_frequency = 'quarterly' THEN p_current_date + INTERVAL '3 months'
    WHEN p_frequency = 'biweekly' THEN p_current_date + INTERVAL '2 weeks'
    WHEN p_frequency = 'weekly' THEN p_current_date + INTERVAL '1 week'
    ELSE p_current_date
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 29. Obtener Estado de Préstamo

```sql
CREATE OR REPLACE FUNCTION get_loan_status_label(p_status VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN CASE p_status
    WHEN 'pending' THEN 'Pendiente de Desembolso'
    WHEN 'active' THEN 'Activo'
    WHEN 'partially_paid' THEN 'Pago Parcial'
    WHEN 'paid' THEN 'Pagado Completamente'
    WHEN 'defaulted' THEN 'En Mora Severa'
    WHEN 'cancelled' THEN 'Cancelado'
    ELSE p_status
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

**Documento generado por:** Sistema Arquitecto - Nivexa CRM
**Fecha:** 30 de Enero de 2025
**Versión:** 2.0 - Colección de Queries SQL