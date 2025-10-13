-- =====================================================
-- AGREGAR MULTI-MONEDA A MASTER_CASH Y ADMIN_CASH
-- =====================================================
-- Este script agrega campos multi-moneda a las tablas
-- master_cash y admin_cash para soportar ARS y USD
-- =====================================================

BEGIN;

-- ============================================
-- PASO 1: Agregar campos multi-moneda a master_cash
-- ============================================

DO $$
BEGIN
    -- Agregar balance_ars si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'master_cash' AND column_name = 'balance_ars'
    ) THEN
        ALTER TABLE master_cash ADD COLUMN balance_ars DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE '✅ Agregado campo balance_ars a master_cash';
    END IF;

    -- Agregar balance_usd si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'master_cash' AND column_name = 'balance_usd'
    ) THEN
        ALTER TABLE master_cash ADD COLUMN balance_usd DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE '✅ Agregado campo balance_usd a master_cash';
    END IF;

    -- Inicializar valores en 0 para registros existentes
    UPDATE master_cash
    SET balance_ars = COALESCE(balance_ars, 0),
        balance_usd = COALESCE(balance_usd, 0)
    WHERE balance_ars IS NULL OR balance_usd IS NULL;

    RAISE NOTICE '✅ Campos multi-moneda inicializados en master_cash';
END $$;

-- ============================================
-- PASO 2: Agregar campos multi-moneda a admin_cash
-- ============================================

DO $$
BEGIN
    -- Agregar balance_ars si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'admin_cash' AND column_name = 'balance_ars'
    ) THEN
        ALTER TABLE admin_cash ADD COLUMN balance_ars DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE '✅ Agregado campo balance_ars a admin_cash';
    END IF;

    -- Agregar balance_usd si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'admin_cash' AND column_name = 'balance_usd'
    ) THEN
        ALTER TABLE admin_cash ADD COLUMN balance_usd DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE '✅ Agregado campo balance_usd a admin_cash';
    END IF;

    -- Inicializar valores en 0 para registros existentes
    UPDATE admin_cash
    SET balance_ars = COALESCE(balance_ars, 0),
        balance_usd = COALESCE(balance_usd, 0)
    WHERE balance_ars IS NULL OR balance_usd IS NULL;

    RAISE NOTICE '✅ Campos multi-moneda inicializados en admin_cash';
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Mostrar estructura de master_cash
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'master_cash'
ORDER BY ordinal_position;

-- Mostrar estructura de admin_cash
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'admin_cash'
ORDER BY ordinal_position;

-- Mostrar balances actuales
SELECT
    'master_cash' as caja,
    balance as balance_legacy,
    balance_ars,
    balance_usd
FROM master_cash;

SELECT
    'admin_cash' as caja,
    balance as balance_legacy,
    balance_ars,
    balance_usd
FROM admin_cash;
