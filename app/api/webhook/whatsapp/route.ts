import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzePropertyWithKimi } from '@/lib/services/kimi-processor';

/**
 * Webhook para recibir mensajes de WhatsApp
 * Procesa solo mensajes que contengan la palabra mágica "SUBIR"
 * y tengan fotos adjuntas
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar que sea un mensaje válido
    if (!body.message || !body.sender) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    const { message, sender, message_id, timestamp } = body;
    
    // Verificar palabra mágica "SUBIR"
    const messageText = message.text?.toUpperCase() || '';
    if (!messageText.includes('SUBIR')) {
      // Ignorar mensajes sin palabra mágica
      return NextResponse.json(
        { status: 'ignored', reason: 'Magic word not found' },
        { status: 200 }
      );
    }

    // Verificar que tenga fotos
    const imageUrls = message.images || [];
    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'No images attached. Please include property photos.' },
        { status: 400 }
      );
    }

    // Limpiar el texto (quitar "SUBIR" para el análisis)
    const cleanText = message.text.replace(/SUBIR/gi, '').trim();

    // Obtener API key de Kimi
    const kimiApiKey = process.env.KIMI_API_KEY;
    if (!kimiApiKey) {
      console.error('KIMI_API_KEY not configured');
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 500 }
      );
    }

    // Procesar con Kimi
    console.log('Processing property with Kimi...', { sender, images: imageUrls.length });
    
    let analysis;
    try {
      analysis = await analyzePropertyWithKimi(cleanText, imageUrls, kimiApiKey);
    } catch (error) {
      console.error('Kimi analysis failed:', error);
      return NextResponse.json(
        { error: 'Failed to analyze property', details: (error as Error).message },
        { status: 500 }
      );
    }

    // Guardar en Supabase
    const supabase = await createClient();
    
    const { data: draft, error: insertError } = await supabase
      .from('property_drafts')
      .insert({
        raw_input_text: message.text,
        raw_image_urls: imageUrls,
        whatsapp_sender: sender,
        whatsapp_message_id: message_id,
        
        // Datos detectados
        detected_operation: analysis.detected.operation,
        detected_type: analysis.detected.type,
        detected_commune: analysis.detected.commune,
        detected_region: analysis.detected.region,
        detected_price: analysis.detected.price_clp,
        detected_bedrooms: analysis.detected.bedrooms,
        detected_bathrooms: analysis.detected.bathrooms,
        detected_total_area: analysis.detected.total_area,
        detected_built_area: analysis.detected.built_area,
        detected_year_built: analysis.detected.year_built,
        detected_common_expenses: analysis.detected.common_expenses,
        detected_has_suite: analysis.detected.has_suite,
        detected_in_condo: analysis.detected.in_condo,
        detected_has_terrace: analysis.detected.has_terrace,
        detected_parking_count: analysis.detected.parking_count,
        detected_parking_types: analysis.detected.parking_types,
        detected_storage_count: analysis.detected.storage_count,
        detected_orientation: analysis.detected.orientation,
        detected_security_features: analysis.detected.security_features,
        detected_amenities: analysis.detected.amenities,
        
        // Descripciones
        description_tecnica: analysis.description_tecnica,
        description_puntos_fuertes: analysis.description_puntos_fuertes,
        description_plusvalia: analysis.description_plusvalia,
        description_full: analysis.description_full,
        
        // Sugerencias
        suggested_title: analysis.suggested_title,
        suggested_slug: analysis.suggested_slug,
        confidence_score: analysis.confidence_score,
        missing_data: analysis.missing_critical,
        
        // Estado inicial
        status: 'auto_detected',
        created_by: sender,
        
        // Notificaciones
        notification_email: 'redpropertychile@gmail.com',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save draft:', insertError);
      return NextResponse.json(
        { error: 'Failed to save draft', details: insertError.message },
        { status: 500 }
      );
    }

    // Registrar en audit log
    await supabase.from('property_audit_log').insert({
      draft_id: draft.id,
      action: 'draft_created',
      performed_by_whatsapp: sender,
      new_data: analysis,
      changes_summary: `Draft created automatically from WhatsApp. Confidence: ${analysis.confidence_score}`,
    });

    // Respuesta exitosa
    return NextResponse.json({
      status: 'success',
      draft_id: draft.id,
      message: 'Draft created successfully',
      detected: {
        title: analysis.suggested_title,
        price: analysis.detected.price_clp,
        commune: analysis.detected.commune,
        confidence: analysis.confidence_score,
        missing: analysis.missing_critical,
      },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Endpoint de verificación (para configurar el webhook en algunos servicios)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({
    status: 'Webhook endpoint active',
    required_params: {
      message: 'object with text and images',
      sender: 'WhatsApp number',
      message_id: 'unique message ID',
    },
    magic_word: 'SUBIR',
  });
}
