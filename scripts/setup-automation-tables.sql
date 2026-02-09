-- =====================================================
-- TABLAS PARA SISTEMA DE AUTOMATIZACIÓN WHATSAPP
-- Workflow: WhatsApp → Draft → Techie → Boss → Publicado
-- =====================================================

-- 1. TABLA DE BORRADORES (property_drafts)
CREATE TABLE IF NOT EXISTS property_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos crudos del WhatsApp
  raw_input_text TEXT,
  raw_image_urls TEXT[],
  whatsapp_sender TEXT, -- Número de quien envió
  whatsapp_message_id TEXT, -- ID único del mensaje de WhatsApp
  
  -- Datos detectados por IA (Inspector-style)
  detected_operation TEXT,
  detected_type TEXT,
  detected_commune TEXT,
  detected_region TEXT DEFAULT 'Metropolitana',
  detected_price INTEGER,
  detected_bedrooms INTEGER,
  detected_bathrooms INTEGER,
  detected_total_area NUMERIC,
  detected_built_area NUMERIC,
  detected_year_built INTEGER,
  detected_common_expenses INTEGER,
  detected_has_suite BOOLEAN DEFAULT FALSE,
  detected_in_condo BOOLEAN DEFAULT FALSE,
  detected_has_terrace BOOLEAN DEFAULT FALSE,
  detected_parking_count INTEGER,
  detected_parking_types TEXT[],
  detected_storage_count INTEGER,
  detected_orientation TEXT[],
  detected_security_features TEXT[],
  detected_amenities TEXT[],
  
  -- Descripción estructurada en 3 partes
  description_tecnica TEXT, -- Materialidad y acabados
  description_puntos_fuertes TEXT, -- Lo mejor de la propiedad
  description_plusvalia TEXT, -- Análisis de ubicación (generado por Kimi)
  description_full TEXT, -- Concatenación final de las 3 partes
  
  -- Sugerencias de Kimi
  suggested_title TEXT,
  suggested_slug TEXT,
  confidence_score NUMERIC, -- 0.0 a 1.0, qué tan seguro está Kimi
  missing_data TEXT[], -- Array de campos faltantes
  
  -- Estado del workflow
  status TEXT DEFAULT 'auto_detected' 
    CHECK (status IN ('auto_detected', 'in_review', 'ready_for_approval', 'approved', 'rejected', 'archived')),
  
  -- Datos editados por el techie (JSON completo)
  edited_data JSONB,
  
  -- Quién hace qué
  created_by TEXT, -- WhatsApp number del sender
  reviewed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  
  -- Notificaciones email
  notification_email TEXT DEFAULT 'redpropertychile@gmail.com',
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  ready_for_approval_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  
  -- Si se aprueba, link a la propiedad publicada
  published_property_id UUID REFERENCES properties(id),
  
  -- Para recordatorios (24h)
  reminder_sent BOOLEAN DEFAULT FALSE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_drafts_status ON property_drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_created_at ON property_drafts(created_at);
CREATE INDEX IF NOT EXISTS idx_drafts_ready_for_approval ON property_drafts(ready_for_approval_at) WHERE status = 'ready_for_approval';

-- 2. TABLA DE PROPIEDADES ARCHIVADAS (Histórico + Reactivable)
CREATE TABLE IF NOT EXISTS archived_properties (
  -- Copia exacta de properties
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('sale', 'rent')),
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'office', 'land')),
  status TEXT DEFAULT 'archived',
  commune TEXT NOT NULL,
  region TEXT,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  price_clp INTEGER NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  has_suite BOOLEAN DEFAULT FALSE,
  in_condo BOOLEAN DEFAULT FALSE,
  has_terrace BOOLEAN DEFAULT FALSE,
  common_expenses INTEGER,
  parking_count INTEGER,
  parking_types TEXT[],
  storage_count INTEGER,
  total_area NUMERIC,
  built_area NUMERIC,
  orientation TEXT[],
  year_built INTEGER,
  security_features TEXT[],
  amenities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  original_property_id UUID REFERENCES properties(id),
  
  -- Campos nuevos de archivado
  archive_reason TEXT CHECK (archive_reason IN ('sold', 'rented', 'withdrawn', 'expired', 'duplicated', 'other')),
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_by UUID REFERENCES auth.users(id),
  
  -- Datos del cliente final (para CRM futuro)
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  final_price INTEGER, -- Si se vendió/arrendó por otro precio
  
  -- Notas internas
  internal_notes TEXT,
  
  -- Reactivación
  reactivated_at TIMESTAMP WITH TIME ZONE,
  reactivated_by UUID REFERENCES auth.users(id),
  reactivated_to_property_id UUID REFERENCES properties(id)
);

-- 3. TABLA DE AUDITORÍA (Log completo de cambios)
CREATE TABLE IF NOT EXISTS property_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Qué se afectó
  property_id UUID REFERENCES properties(id),
  draft_id UUID REFERENCES property_drafts(id),
  archived_property_id UUID REFERENCES archived_properties(id),
  
  -- Qué pasó
  action TEXT NOT NULL CHECK (action IN (
    'draft_created', 
    'draft_updated', 
    'draft_ready_for_approval',
    'draft_approved', 
    'draft_rejected', 
    'property_published',
    'property_updated',
    'property_archived',
    'property_reactivated',
    'reminder_sent'
  )),
  
  -- Quién lo hizo
  performed_by UUID REFERENCES auth.users(id),
  performed_by_whatsapp TEXT, -- Si fue vía WhatsApp webhook
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Datos para trazabilidad
  old_data JSONB,
  new_data JSONB,
  changes_summary TEXT, -- Descripción legible del cambio
  
  -- Metadata
  ip_address INET,
  user_agent TEXT
);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_audit_property ON property_audit_log(property_id);
CREATE INDEX IF NOT EXISTS idx_audit_draft ON property_audit_log(draft_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON property_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON property_audit_log(performed_at);

-- 4. TABLA DE CONFIGURACIÓN DE NOTIFICACIONES (Opcional, para settings)
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  
  -- Qué notificaciones recibe
  notify_new_draft BOOLEAN DEFAULT TRUE,
  notify_draft_approved BOOLEAN DEFAULT TRUE,
  notify_reminders BOOLEAN DEFAULT TRUE,
  
  -- Dónde
  email_notifications BOOLEAN DEFAULT TRUE,
  whatsapp_notifications BOOLEAN DEFAULT FALSE, -- Futuro
  
  -- Email preferido
  preferred_email TEXT DEFAULT 'redpropertychile@gmail.com',
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS para seguridad
ALTER TABLE property_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo usuarios autenticados pueden ver/editar
CREATE POLICY "Users can view drafts" ON property_drafts 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update drafts" ON property_drafts 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view archived" ON archived_properties 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can archive/reactivate" ON archived_properties 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view audit" ON property_audit_log 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE property_drafts IS 'Borradores automáticos desde WhatsApp, workflow de aprobación';
COMMENT ON TABLE archived_properties IS 'Propiedades retiradas del mercado, mantenidas para histórico y reactivación';
COMMENT ON TABLE property_audit_log IS 'Registro completo de todas las acciones para trazabilidad';
