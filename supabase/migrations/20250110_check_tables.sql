-- Verificar qué tablas de cash existen
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%cash%'
ORDER BY table_name;

-- Ver estructura de project_cash si existe
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'project_cash'
ORDER BY ordinal_position;
