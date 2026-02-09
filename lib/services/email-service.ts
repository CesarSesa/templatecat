/**
 * Servicio de notificaciones por email usando Resend
 * Documentación: https://resend.com/docs
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'onboarding@resend.dev'; // Email por defecto de Resend en free tier
// Cuando verifiques tu dominio, cambia a: 'notificaciones@tudominio.com'

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text || '',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { success: false, error };
    }

    const result = await response.json();
    console.log('Email sent:', result);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Email: Nuevo borrador creado (para revisión técnica)
export async function notifyNewDraft(draftId: string, draftData: {
  suggestedTitle: string;
  commune: string;
  price: number | null;
  confidence: number;
  missingData: string[];
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🏠 Nuevo Borrador de Propiedad</h2>
      <p>Se ha creado automáticamente un nuevo borrador que requiere tu revisión técnica.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${draftData.suggestedTitle || 'Propiedad sin título'}</h3>
        <p><strong>📍 Ubicación:</strong> ${draftData.commune || 'No detectada'}</p>
        <p><strong>💰 Precio:</strong> ${draftData.price ? `$${draftData.price.toLocaleString('es-CL')}` : 'No detectado'}</p>
        <p><strong>🤖 Confianza IA:</strong> ${Math.round((draftData.confidence || 0) * 100)}%</p>
        
        ${draftData.missingData?.length > 0 ? `
          <div style="margin-top: 15px; padding: 10px; background: #fef3c7; border-radius: 4px;">
            <strong>⚠️ Datos faltantes:</strong> ${draftData.missingData.join(', ')}
          </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/borradores/${draftId}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Revisar Borrador
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        Este es un mensaje automático del sistema de Catálogo Inmobiliario.
      </p>
    </div>
  `;

  return sendEmail({
    to: 'sesaworkshop1@gmail.com',
    subject: `🏠 Nuevo borrador: ${draftData.suggestedTitle || 'Propiedad'}`,
    html,
  });
}

// Email: Borrador listo para aprobación (para la jefa)
export async function notifyReadyForApproval(draftId: string, draftData: {
  suggestedTitle: string;
  commune: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">✅ Propiedad Lista para Aprobar</h2>
      <p>El equipo técnico ha revisado y preparado una propiedad. Solo necesita tu aprobación final.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
        <h3 style="margin-top: 0; color: #166534;">${draftData.suggestedTitle}</h3>
        <p><strong>📍 Ubicación:</strong> ${draftData.commune}</p>
        <p><strong>💰 Precio:</strong> ${draftData.price ? `$${draftData.price.toLocaleString('es-CL')}` : 'Consultar'}</p>
        <p><strong>🛏️ Dormitorios:</strong> ${draftData.bedrooms || 'N/A'}</p>
        <p><strong>🚿 Baños:</strong> ${draftData.bathrooms || 'N/A'}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/aprobaciones" 
           style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Aprobar Publicación
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        Al aprobar, la propiedad se publicará inmediatamente en el catálogo.
      </p>
    </div>
  `;

  return sendEmail({
    to: 'sesaworkshop1@gmail.com',
    subject: `✅ Listo para aprobar: ${draftData.suggestedTitle}`,
    html,
  });
}

// Email: Recordatorio (24h sin aprobar)
export async function notifyPendingReminder(draftId: string, draftData: {
  suggestedTitle: string;
  hoursWaiting: number;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">⏰ Recordatorio: Propiedad Pendiente</h2>
      <p>Hay una propiedad esperando aprobación desde hace ${draftData.hoursWaiting} horas.</p>
      
      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fcd34d;">
        <h3 style="margin-top: 0;">${draftData.suggestedTitle}</h3>
        <p>Esta propiedad está lista para publicar pero aún no ha sido aprobada.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/aprobaciones" 
           style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Ver Pendientes
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: 'sesaworkshop1@gmail.com',
    subject: `⏰ Recordatorio: ${draftData.suggestedTitle} pendiente`,
    html,
  });
}

// Email: Propiedad publicada exitosamente
export async function notifyPublished(propertyId: string, propertyData: {
  title: string;
  slug: string;
  url: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">🎉 Propiedad Publicada</h2>
      <p>La propiedad ha sido publicada exitosamente en el catálogo.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${propertyData.title}</h3>
        <p><strong>🔗 URL pública:</strong></p>
        <a href="${propertyData.url}" style="color: #2563eb; word-break: break-all;">
          ${propertyData.url}
        </a>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${propertyData.url}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Ver Propiedad Publicada
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: 'sesaworkshop1@gmail.com',
    subject: `🎉 Publicado: ${propertyData.title}`,
    html,
  });
}
