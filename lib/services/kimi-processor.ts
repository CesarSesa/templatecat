/**
 * Servicio de procesamiento de propiedades con Kimi API (K2.5 Multimodal)
 * Visión nativa: analiza fotos + texto simultáneamente
 * Modelo: kimi-k2.5 (thinking disabled para respuestas directas)
 */

export type Currency = 'CLP' | 'UF' | 'USD';

export interface PropertyAnalysis {
  detected: {
    operation: 'sale' | 'rent' | null;
    type: 'house' | 'apartment' | 'office' | 'land' | null;
    commune: string | null;
    region: string;
    price_original: number | null;
    price_currency: Currency | null;
    price_clp: number | null; // Convertido a CLP para comparación
    bedrooms: number | null;
    bathrooms: number | null;
    total_area: number | null;
    built_area: number | null;
    year_built: number | null;
    common_expenses: number | null;
    has_suite: boolean;
    in_condo: boolean;
    has_terrace: boolean;
    parking_count: number | null;
    parking_types: string[];
    storage_count: number | null;
    orientation: string[];
    security_features: string[];
    amenities: string[];
  };
  missing_critical: string[];
  // Legacy: mantener por compatibilidad, pero ya no se usan directamente
  description_tecnica?: string;
  description_puntos_fuertes?: string;
  description_plusvalia?: string;
  // Principal: descripción única compacta
  description_full: string;
  suggested_title: string;
  suggested_slug: string;
  confidence_score: number;
  fotos_analysis: string;
}

interface ImageData {
  base64: string;
  mimeType: string;
}

/**
 * Analiza propiedad usando Kimi K2.5 con visión nativa
 * Envía imágenes en base64 directamente al modelo
 * 
 * FALLBACK: Si falla con imágenes, intenta sin imágenes (solo texto)
 */
export async function analyzePropertyWithKimi(
  text: string,
  images: ImageData[],
  apiKey: string
): Promise<PropertyAnalysis> {
  try {
    return await analyzeWithVision(text, images, apiKey);
  } catch (error) {
    console.log('Vision analysis failed, trying text-only fallback...');
    return await analyzeTextOnly(text, apiKey);
  }
}

async function analyzeWithVision(
  text: string,
  images: ImageData[],
  apiKey: string
): Promise<PropertyAnalysis> {
  const KIMI_API_URL = 'https://api.moonshot.ai/v1/chat/completions';
  
  // Prompt comercial optimizado para K2.5 multimodal
  const systemPrompt = `Eres un "Redactor Inmobiliario Experto" en Santiago, Chile. Tu trabajo es crear descripciones COMERCIALES que vendan propiedades.

## 🎯 TU OBJETIVO:
Crear descripciones persuasivas, cálidas y profesionales que hagan que un comprador quiera visitar la propiedad.

## 📍 REGLA CRÍTICA - DIRECCIÓN:
- **NUNCA incluyas números de departamento específicos** (ej: "Depto 502", "N° 1234")
- **NUNCA incluyas direcciones exactas con numeración** de calles
- **SÍ incluye**: nombre de la comuna, barrio, sector, referencias cercanas ("cerca del metro", "a pasos de Av. Providencia")
- **EXCEPCIÓN**: Si es CONDOMINIO (in_condo = true), puedes mencionar el nombre del condominio y una referencia de sector

Ejemplos CORRECTOS:
- "Hermoso departamento en sector Ñuñoa, cercano a Metro Chile España"
- "Casa en barrio residencial de Las Condes, cerca de colegios y servicios"
- "Condomio Los Robles, ubicado en sector Macul con acceso directo a Vespucio"

Ejemplos PROHIBIDOS:
- "Departamento en Av. Suecia 1234, departamento 502"
- "Casa en Calle Los Pinos 456"

## 📊 DATOS A EXTRAER:
- **Operación**: VENTA o ARRIENDO
- **Tipo**: casa, departamento, oficina, terreno
- **Precio y Moneda**: Detecta el precio y su moneda (CLP, UF, o USD)
  - UF: "8500 UF", "8.500 UF" → currency: "UF", price_original: 8500
  - CLP: "$85.000.000", "85 millones", "85000 lukas" → currency: "CLP", price_original: 85000000
  - USD: "US$100.000", "100000 dólares" → currency: "USD", price_original: 100000
  - price_clp: Convierte el precio a CLP usando aproximaciones (UF≈38000 CLP, USD≈950 CLP)
- **Comuna**: Nombre exacto
- **Dormitorios/Baños/Metraje**: números exactos
- **Amenities detectadas**: piscina, quincho, gimnasio, terraza común, sala de eventos, juegos infantiles, áreas verdes, estacionamientos de visita
- **Seguridad**: conserjería, cámaras, alarma, portero, vigilancia 24h

## ✍️ DESCRIPCIÓN ÚNICA (900-1500 caracteres, ideal 1200):

Genera UNA SOLA descripción comercial fluida y compacta. 

**REGLAS DE LONGITUD:**
- Mínimo: 900 caracteres
- Máximo: 1500 caracteres (estricto)
- Ideal: ~1200 caracteres
- NO excedas 1500 caracteres bajo ninguna circunstancia

**ESTRUCTURA (integrada naturalmente, sin secciones marcadas):**

1. **Apertura** (150-200 chars): Hook emocional + tipo de propiedad + ubicación sectorial
2. **Espacios** (300-400 chars): Distribución, materialidad, luz natural, estado
3. **Valor diferencial** (250-350 chars): Lo especial de la propiedad, lifestyle
4. **Ubicación** (300-400 chars): Barrio, conectividad, servicios cercanos, plusvalía

**ESTILO:**
- Texto narrativo continuo, fluido
- Sin títulos ni separadores tipo "Descripción Técnica:"
- Transiciones naturales entre ideas
- Lenguaje comercial persuasivo pero conciso
- Segunda persona: "usted", "su familia"

## 🎯 TONO COMERCIAL:
- Usa adjetivos evocadores: "luminoso", "acogedor", "moderno", "cálido", "espacioso"
- Segunda persona: "usted", "su familia"
- Frases de acción: "Disfrute de...", "Aproveche...", "Viva..."
- Evita tecnicismos excesivos - que suene humano, no un informe técnico

## 📋 FORMATO JSON:
{
  "detected": {
    "operation": "sale" | "rent" | null,
    "type": "house" | "apartment" | "office" | "land" | null,
    "commune": "string" | null,
    "region": "Metropolitana",
    "price_original": number | null,
    "price_currency": "CLP" | "UF" | "USD" | null,
    "price_clp": number | null,
    "bedrooms": number | null,
    "bathrooms": number | null,
    "total_area": number | null,
    "built_area": number | null,
    "year_built": number | null,
    "common_expenses": number | null,
    "has_suite": boolean,
    "in_condo": boolean,
    "has_terrace": boolean,
    "parking_count": number | null,
    "parking_types": ["cubierto"|"descubierto"|"techado"],
    "storage_count": number | null,
    "orientation": ["norte"|"sur"|"oriente"|"poniente"],
    "security_features": ["conserjería"|"cámaras"|"alarma"|"portero"|"vigilancia 24h"],
    "amenities": ["piscina"|"quincho"|"gimnasio"|"terraza común"|"sala de eventos"|"juegos infantiles"|"áreas verdes"|"estacionamientos de visita"]
  },
  "missing_critical": ["campo1", "campo2"],
  "description_full": "Descripción comercial única, fluida, 900-1500 caracteres (ideal 1200). Sin secciones marcadas, estilo narrativo profesional.",
  "suggested_slug": "venta-departamento-nunoa-3d2b-ab12",
  "confidence_score": 0.0-1.0,
  "fotos_analysis": "Resumen visual: qué ambientes se ven, estado general, amenities visibles"
}

## ✅ REGLAS FINALES:
1. Slug: [operacion]-[tipo]-[comuna]-[N]d[N]b-[4chars-random]
2. Precio: número entero SIN puntos ni comas
3. Si falta precio/comuna/tipo/operación → incluir en missing_critical
4. Amenities: detecta TODO lo visible en fotos
5. confidence_score: basado en claridad de datos
6. NUNCA incluyas direcciones exactas ni números de departamento
7. TÍTULO: Usa formato "Se vende/arrienda [tipo] [en condominio si aplica] en [comuna] ([X]D-[Y]B) en [precio] [moneda]"
   Ejemplo: "Se vende departamento en condominio en Ñuñoa (3D-2B) en 8500 UF"
   Ejemplo: "Se arrienda casa en Las Condes (4D-3B) en $850.000 CLP"`;

  // Construir mensaje con imágenes en base64 (formato K2.5)
  const content: Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  > = [
    { type: 'text', text: `Analiza esta propiedad:\n\nTEXTO DEL CLIENTE:\n${text}\n\nFOTOS ADJUNTAS: ${images.length} imágenes.\n\nGenera el JSON con análisis completo.` }
  ];

  // Agregar imágenes en base64
  for (const img of images) {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:${img.mimeType};base64,${img.base64}`
      }
    });
  }

  // Debug: verificar key
  console.log('Kimi API Key check:', apiKey ? `Set (${apiKey.length} chars, starts with: ${apiKey.substring(0, 7)})` : 'NOT SET');
  
  // Preparar request body
  const requestBody = {
    model: 'kimi-k2.5',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content }
    ],
    temperature: 0.6, // K2.5 solo acepta 0.6
    response_format: { type: 'json_object' },
    thinking: { type: 'disabled' } // Respuestas directas, más rápidas
  };
  
  console.log('Request body:', JSON.stringify({
    ...requestBody,
    messages: [
      { role: 'system', content: '[system prompt hidden]' },
      { role: 'user', content: `[${content.length} items: ${content.map(c => c.type).join(', ')}]` }
    ]
  }, null, 2));
  
  try {
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kimi API error response:', errorText);
      throw new Error(`Kimi API error: ${errorText}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    // Asegurar que description_full existe y está dentro de límites
    if (!analysis.description_full) {
      analysis.description_full = `${analysis.description_tecnica || ''}\n\n${analysis.description_puntos_fuertes || ''}\n\n${analysis.description_plusvalia || ''}`.trim();
    }
    
    // Validar y ajustar longitud
    const desc = analysis.description_full;
    if (desc.length < 900) {
      // Si es muy corta, agregar contexto
      analysis.description_full += `\n\nUbicada en ${analysis.detected?.commune || 'zona estratégica'}, esta propiedad representa una excelente oportunidad de ${analysis.detected?.operation === 'sale' ? 'inversión' : 'arriendo'} en uno de los sectores más dinámicos de Santiago.`;
    } else if (desc.length > 1500) {
      // Si excede 1500, truncar inteligentemente al último punto
      const truncated = desc.substring(0, 1500);
      const lastPeriod = truncated.lastIndexOf('.');
      analysis.description_full = lastPeriod > 900 ? truncated.substring(0, lastPeriod + 1) : truncated + '...';
    }
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing with Kimi K2.5:', error);
    throw error;
  }
}

/**
 * Fallback: Análisis solo con texto (sin imágenes)
 * Usa moonshot-v1-8k que es más simple y compatible
 */
async function analyzeTextOnly(
  text: string,
  apiKey: string
): Promise<PropertyAnalysis> {
  const KIMI_API_URL = 'https://api.moonshot.ai/v1/chat/completions';
  
  console.log('Using text-only fallback with moonshot-v1-8k...');
  
  const systemPrompt = `Eres "Redactor Inmobiliario", experto en crear descripciones comerciales persuasivas en Santiago, Chile.

Extrae datos y genera UNA descripción única compacta.

FORMATO JSON:
{
  "detected": {
    "operation": "sale" | "rent" | null,
    "type": "house" | "apartment" | "office" | "land" | null,
    "commune": "string" | null,
    "region": "Metropolitana",
    "price_original": number | null,
    "price_currency": "CLP" | "UF" | "USD",
    "price_clp": number | null,
    "bedrooms": number | null,
    "bathrooms": number | null,
    "total_area": number | null,
    "built_area": number | null,
    "year_built": number | null,
    "common_expenses": number | null,
    "has_suite": boolean,
    "in_condo": boolean,
    "has_terrace": boolean,
    "parking_count": number | null,
    "parking_types": [],
    "storage_count": number | null,
    "orientation": [],
    "security_features": [],
    "amenities": []
  },
  "missing_critical": [],
  "description_full": "Descripción comercial única, fluida, 900-1500 caracteres máximo. Sin secciones marcadas. Combina: espacios/materialidad, valor diferencial, ubicación/plusvalía.",
  "suggested_title": "Se vende/arrienda tipo en comuna (XD-YB) en precio moneda",
  "suggested_slug": "venta-departamento-nunoa-3d2b-ab12",
  "confidence_score": 0.5,
  "fotos_analysis": "Análisis basado solo en texto"
}`;

  const userPrompt = `Analiza esta propiedad:\n\n${text}\n\nResponde SOLO con el JSON.`;

  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Kimi fallback API error:', errorText);
    throw new Error(`Kimi API error (fallback): ${errorText}`);
  }

  const data = await response.json();
  let analysis;
  
  try {
    analysis = JSON.parse(data.choices[0].message.content);
  } catch (e) {
    // Si no es JSON válido, extraer de markdown
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } else {
      throw new Error('No se pudo parsear la respuesta');
    }
  }
  
  // Asegurar description_full
  if (!analysis.description_full) {
    analysis.description_full = `${analysis.description_tecnica || ''}\n\n${analysis.description_puntos_fuertes || ''}\n\n${analysis.description_plusvalia || ''}`.trim();
  }
  
  // Ajustar longitud si es necesario
  if (analysis.description_full.length > 1500) {
    const truncated = analysis.description_full.substring(0, 1500);
    const lastPeriod = truncated.lastIndexOf('.');
    analysis.description_full = lastPeriod > 900 ? truncated.substring(0, lastPeriod + 1) : truncated + '...';
  }
  
  // Anotar que es fallback
  analysis.fotos_analysis = `[MODO TEXTO - Sin análisis visual] ${analysis.fotos_analysis || ''}`;
  
  return analysis;
}

// Función para generar el JSON final (estilo Generator)
export function generateFinalJSON(
  analysis: PropertyAnalysis,
  imageUrls: string[]
): object {
  const d = analysis.detected;
  
  return {
    slug: analysis.suggested_slug,
    title: analysis.suggested_title,
    operation: d.operation,
    property_type: d.type,
    commune: d.commune,
    region: d.region || 'Metropolitana',
    bedrooms: d.bedrooms,
    bathrooms: d.bathrooms,
    price_clp: d.price_clp,
    description: analysis.description_full,
    status: 'draft',
    has_suite: d.has_suite,
    in_condo: d.in_condo,
    has_terrace: d.has_terrace,
    common_expenses: d.common_expenses,
    parking_count: d.parking_count,
    parking_types: d.parking_types,
    storage_count: d.storage_count,
    total_area: d.total_area,
    built_area: d.built_area,
    orientation: d.orientation,
    year_built: d.year_built,
    security_features: d.security_features,
    amenities: d.amenities,
    images: imageUrls,
  };
}
