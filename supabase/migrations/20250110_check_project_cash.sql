-- Verificar estado de las cajas de proyecto

-- Ver si existe project_cash_box para este proyecto
SELECT
    'project_cash_box' as tabla,
    p.name as proyecto,
    p.currency as moneda_proyecto,
    pcb.current_balance_ars,
    pcb.current_balance_usd,
    pcb.total_income_ars,
    pcb.total_income_usd
FROM projects p
LEFT JOIN project_cash_box pcb ON p.id = pcb.project_id
WHERE p.code = 'PRY-2025-001';

-- Ver pagos registrados
SELECT
    'payments' as tabla,
    i.installment_number as cuota,
    i.amount as monto,
    i.status,
    i.paid_date,
    p.payment_method
FROM projects pr
JOIN installments i ON pr.id = i.project_id
LEFT JOIN payments p ON i.id = p.installment_id
WHERE pr.code = 'PRY-2025-001'
ORDER BY i.installment_number;

-- Ver movimientos de caja relacionados
SELECT
    'cash_movements' as tabla,
    cm.description,
    cm.amount,
    cm.currency,
    cm.movement_type,
    cm.created_at
FROM cash_movements cm
WHERE cm.project_id IN (SELECT id FROM projects WHERE code = 'PRY-2025-001')
ORDER BY cm.created_at DESC;
