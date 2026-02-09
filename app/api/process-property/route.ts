import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzePropertyWithKimi } from '@/lib/services/kimi-processor';
import { notifyNewDraft } from '@/lib/services/email-service';
import { generateTitle, convertToCLP, formatPrice } from '@/lib/services/currency-service';
import type { Currency } from '@/lib/services/currency-service';

/**
 * API Route: Procesar nueva propiedad desde formulario
 * 1. Recibe texto + fotos
 * 2. Convierte fotos a base64 para Kimi K2.5
 * 3. Sube fotos a Supabase Storage (backup)
 * 4. Analiza con Kimi K2.5 (visión nativa)
 * 5. Crea borrador
 * 6. Envía email de notificación
 */

// Convertir File a base64
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extraer datos del formulario
    const text = formData.get('text') as string;
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'El texto de descripción es requerido' },
        { status: 400 }
      );
    }

    // Extraer imágenes
    const imageFiles: File[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
      }
    });

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'Al menos una foto es requerida' },
        { status: 400 }
      );
    }

    console.log(`Processing ${imageFiles.length} images for property analysis`);

    // Preparar imágenes para Kimi (base64) Y para Storage
    const imagesForKimi: { base64: string; mimeType: string }[] = [];
    const folderName = `draft-${Date.now()}`;
    
    // Convertir todas las imágenes a base64 primero (para Kimi)
    for (const file of imageFiles) {
      const base64 = await fileToBase64(file);
      imagesForKimi.push({
        base64,
        mimeType: file.type
      });
    }

    // Inicializar Supabase
    const supabase = await createClient();

    // Subir imágenes a Supabase Storage (para persistencia)
    const imageUrls: string[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const image = imageFiles[i];
      const fileExt = image.name.split('.').pop();
      const fileName = `${folderName}/${i + 1}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('properties')
        .upload(fileName, image, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(fileName);
      
      imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron subir las imágenes' },
        { status: 500 }
      );
    }

    console.log(`Uploaded ${imageUrls.length} images successfully`);

    // Analizar con Kimi K2.5 (con imágenes en base64)
    const kimiApiKey = process.env.KIMI_API_KEY?.trim();
    console.log('KIMI_API_KEY loaded:', kimiApiKey ? `${kimiApiKey.substring(0, 10)}...${kimiApiKey.substring(kimiApiKey.length - 5)} (${kimiApiKey.length} chars)` : 'NOT SET');
    
    if (!kimiApiKey) {
      return NextResponse.json(
        { error: 'Kimi API not configured' },
        { status: 500 }
      );
    }

    let analysis;
    try {
      analysis = await analyzePropertyWithKimi(text, imagesForKimi, kimiApiKey);
      console.log('Kimi K2.5 analysis completed successfully');
    } catch (error) {
      console.error('Kimi analysis failed:', error);
      return NextResponse.json(
        { error: 'Error al analizar con IA', details: (error as Error).message },
        { status: 500 }
      );
    }

    // Calcular price_clp si no viene convertido
    let priceCLP = analysis.detected.price_clp;
    const currency: Currency = analysis.detected.price_currency || 'CLP';
    const priceOriginal = analysis.detected.price_original;
    
    if (priceOriginal && !priceCLP && currency !== 'CLP') {
      try {
        priceCLP = await convertToCLP(priceOriginal, currency);
      } catch (e) {
        console.warn('Failed to convert currency:', e);
        // Fallback manual
        if (currency === 'UF') priceCLP = priceOriginal * 38000;
        if (currency === 'USD') priceCLP = priceOriginal * 950;
      }
    }

    // Generar título si no tiene el formato correcto o está vacío
    let title = analysis.suggested_title;
    if (!title || !title.includes('Se ')) {
      title = generateTitle(
        analysis.detected.operation,
        analysis.detected.type,
        analysis.detected.commune,
        analysis.detected.bedrooms,
        analysis.detected.bathrooms,
        priceOriginal || priceCLP || 0,
        currency,
        analysis.detected.in_condo
      );
    }

    // Crear borrador en la base de datos
    const { data: draft, error: insertError } = await supabase
      .from('property_drafts')
      .insert({
        raw_input_text: text,
        raw_image_urls: imageUrls,
        whatsapp_sender: 'manual-upload',
        
        // Datos detectados
        detected_operation: analysis.detected.operation,
        detected_type: analysis.detected.type,
        detected_commune: analysis.detected.commune,
        detected_region: analysis.detected.region,
        detected_price_original: priceOriginal,
        detected_price_currency: currency,
        detected_price: priceCLP,
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
        suggested_title: title,
        suggested_slug: analysis.suggested_slug,
        confidence_score: analysis.confidence_score,
        missing_data: analysis.missing_critical,
        
        // Estado
        status: 'auto_detected',
        created_by: 'manual-form',
        
        // Email
        notification_email: 'sesaworkshop1@gmail.com',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create draft:', insertError);
      return NextResponse.json(
        { error: 'Error al crear borrador', details: insertError.message },
        { status: 500 }
      );
    }

    // Registrar en audit log
    await supabase.from('property_audit_log').insert({
      draft_id: draft.id,
      action: 'draft_created',
      new_data: analysis,
      changes_summary: `Draft created manually via form. Confidence: ${analysis.confidence_score}`,
    });

    // Enviar email de notificación
    try {
      await notifyNewDraft(draft.id, {
        suggestedTitle: analysis.suggested_title,
        commune: analysis.detected.commune || '',
        price: analysis.detected.price_clp,
        confidence: analysis.confidence_score,
        missingData: analysis.missing_critical,
      });
      console.log('Notification email sent');
    } catch (emailError) {
      console.error('Failed to send email (non-critical):', emailError);
      // No fallamos el request si el email falla
    }

    return NextResponse.json({
      success: true,
      draft_id: draft.id,
      message: 'Borrador creado exitosamente',
      detected: {
        title: analysis.suggested_title,
        price: analysis.detected.price_clp,
        commune: analysis.detected.commune,
        confidence: analysis.confidence_score,
        missing: analysis.missing_critical,
      },
    });

  } catch (error) {
    console.error('Process property error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}
