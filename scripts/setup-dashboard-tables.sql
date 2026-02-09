-- =====================================================
-- SCRIPT INTELIGENTE: Configura Kanban + Notas
-- Detecta automáticamente si hay datos existentes
-- =====================================================

-- ============================================
-- 1. TABLA DE TAREAS (Kanban)
-- ============================================

-- Verificar si la tabla existe
DO $$
BEGIN
    -- Si la tabla NO existe, crearla de cero
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
        
        RAISE NOTICE 'Creando tabla tasks por primera vez...';
        
        CREATE TABLE public.tasks (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            title text NOT NULL,
            description text,
            status text NOT NULL CHECK (status IN ('backlog', 'in-progress', 'done')) DEFAULT 'backlog',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        -- Habilitar RLS
        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
        
        -- Crear políticas
        CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
        
        -- Índice
        CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
        
        RAISE NOTICE 'Tabla tasks creada exitosamente!';
        
    ELSE
        -- La tabla existe - verificar si necesita actualización
        RAISE NOTICE 'Tabla tasks existe. Verificando schema...';
        
        -- 1. Eliminar constraint viejo si existe (con nombre antiguo)
        ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
        
        -- 2. Migrar datos de estados antiguos a nuevos (si existen)
        -- 'todo' → 'backlog'
        UPDATE public.tasks 
        SET status = 'backlog' 
        WHERE status = 'todo' OR status = 'pending';
        
        -- 'doing' o 'in_progress' → 'in-progress'
        UPDATE public.tasks 
        SET status = 'in-progress' 
        WHERE status = 'doing' 
           OR status = 'in_progress' 
           OR status = 'inprogress';
        
        -- 'completed' o 'finished' → 'done'
        UPDATE public.tasks 
        SET status = 'done' 
        WHERE status = 'completed' 
           OR status = 'finished';
        
        -- 3. Agregar constraint nuevo con los valores correctos
        ALTER TABLE public.tasks 
        ADD CONSTRAINT tasks_status_check 
        CHECK (status IN ('backlog', 'in-progress', 'done'));
        
        -- 4. Asegurar RLS esté habilitado
        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
        
        -- 5. Eliminar políticas viejas y crear nuevas (para asegurar consistencia)
        DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
        DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
        DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
        DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
        
        CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
        
        -- 6. Asegurar índice exista
        CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
        
        RAISE NOTICE 'Tabla tasks actualizada exitosamente!';
    END IF;
END $$;

-- ============================================
-- 2. TABLA DE NOTAS (Quick Notes)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_notes') THEN
        
        RAISE NOTICE 'Creando tabla user_notes...';
        
        CREATE TABLE public.user_notes (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            content text NOT NULL DEFAULT '',
            updated_at timestamp with time zone DEFAULT now(),
            UNIQUE(user_id)
        );
        
        ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own notes" ON public.user_notes FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own notes" ON public.user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own notes" ON public.user_notes FOR UPDATE USING (auth.uid() = user_id);
        
        RAISE NOTICE 'Tabla user_notes creada exitosamente!';
        
    ELSE
        RAISE NOTICE 'Tabla user_notes ya existe. Verificando políticas...';
        
        ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
        
        -- Recrear políticas para asegurar consistencia
        DROP POLICY IF EXISTS "Users can view own notes" ON public.user_notes;
        DROP POLICY IF EXISTS "Users can insert own notes" ON public.user_notes;
        DROP POLICY IF EXISTS "Users can update own notes" ON public.user_notes;
        
        CREATE POLICY "Users can view own notes" ON public.user_notes FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own notes" ON public.user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own notes" ON public.user_notes FOR UPDATE USING (auth.uid() = user_id);
        
        RAISE NOTICE 'Tabla user_notes verificada!';
    END IF;
END $$;

-- ============================================
-- 3. VERIFICACIÓN FINAL
-- ============================================

SELECT 
    'tasks' as tabla,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE status = 'backlog') as por_comenzar,
    COUNT(*) FILTER (WHERE status = 'in-progress') as en_proceso,
    COUNT(*) FILTER (WHERE status = 'done') as completadas
FROM public.tasks
UNION ALL
SELECT 
    'user_notes' as tabla,
    COUNT(*) as total_registros,
    NULL as por_comenzar,
    NULL as en_proceso,
    NULL as completadas
FROM public.user_notes;
