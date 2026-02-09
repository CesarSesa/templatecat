-- Actualizar el schema de tareas para usar los nuevos nombres de estado
-- Nota: Esto solo funciona si no hay datos. Si ya tienes datos, necesitaríamos migrarlos.

-- Opción 1: Si la tabla está vacía, eliminar y recrear:
DROP TABLE IF EXISTS public.tasks;

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
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para performance
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
