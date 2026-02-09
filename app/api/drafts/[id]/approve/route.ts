import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/drafts/[id]/approve
 * Convierte un draft en propiedad publicada
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Obtener el draft
    const { data: draft, error: draftError } = await supabase
      .from('property_drafts')
      .select('*')
      .eq('id', id)
      .single();

    if (draftError || !draft) {
      return NextResponse.json(
        { error: 'Borrador no encontrado' },
        { status: 404 }
      );
    }

    // 2. Verificar que tenga slug
    if (!draft.suggested_slug) {
      return NextResponse.json(
        { error: 'El borrador no tiene slug definido' },
        { status: 400 }
      );
    }

    // 3. Verificar que no exista una propiedad con ese slug
    const { data: existing } = await supabase
      .from('properties')
      .select('id')
      .eq('slug', draft.suggested_slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una propiedad con ese slug' },
        { status: 409 }
      );
    }

    // 4. Crear la propiedad publicada
    // Usar price_original si existe, sino price_clp
    const finalPrice = draft.detected_price_original || draft.detected_price;
    const finalCurrency = draft.detected_price_currency || 'CLP';
    
    const { data: property, error: insertError } = await supabase
      .from('properties')
      .insert({
        slug: draft.suggested_slug,
        title: draft.suggested_title,
        description: draft.description_full,
        price: finalPrice,
        price_currency: finalCurrency,
        price_clp: draft.detected_price, // Para comparación/filtros
        operation: draft.detected_operation,
        property_type: draft.detected_type,
        commune: draft.detected_commune,
        region: draft.detected_region || 'Metropolitana',
        bedrooms: draft.detected_bedrooms,
        bathrooms: draft.detected_bathrooms,
        total_area: draft.detected_total_area,
        built_area: draft.detected_built_area,
        parking_count: draft.detected_parking_count,
        parking_types: draft.detected_parking_types,
        storage_count: draft.detected_storage_count,
        year_built: draft.detected_year_built,
        common_expenses: draft.detected_common_expenses,
        has_suite: draft.detected_has_suite,
        in_condo: draft.detected_in_condo,
        has_terrace: draft.detected_has_terrace,
        orientation: draft.detected_orientation,
        security_features: draft.detected_security_features || [],
        amenities: draft.detected_amenities || [],
        images: draft.raw_image_urls,
        status: 'published',
        featured: false,
        views_count: 0,
        contact_clicks: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating property:', insertError);
      return NextResponse.json(
        { error: 'Error al crear la propiedad', details: insertError.message },
        { status: 500 }
      );
    }

    // 5. Actualizar el draft como aprobado
    await supabase
      .from('property_drafts')
      .update({
        status: 'approved',
        published_property_id: property.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // 6. Registrar en audit log
    await supabase.from('property_audit_log').insert({
      draft_id: draft.id,
      property_id: property.id,
      action: 'draft_approved',
      new_data: { property_id: property.id, slug: property.slug },
      changes_summary: `Draft approved and published as property ${property.id}`,
    });

    return NextResponse.json({
      success: true,
      property_id: property.id,
      slug: property.slug,
      url: `/propiedades/${property.slug}`,
    });

  } catch (error) {
    console.error('Approve draft error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
