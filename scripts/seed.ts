import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Configuración de Supabase (lee de .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
// Soporta ambas nomenclaturas: ANON_KEY (estándar) o PUBLISHABLE_KEY (usado en tu proyecto)
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('Asegúrate de tener el archivo .env.local configurado')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Constantes de validación según el schema
const VALID_OPERATIONS = ['sale', 'rent']
const VALID_PROPERTY_TYPES = ['house', 'apartment', 'office', 'land']
const VALID_STATUSES = ['draft', 'published']
const VALID_ORIENTATIONS = ['norte', 'sur', 'oriente', 'poniente', 'nororiente', 'noroeste', 'suroeste', 'suroriente']

// Interfaz para tipado
interface PropertyInput {
    slug: string
    title: string
    operation: 'sale' | 'rent'
    property_type: 'house' | 'apartment' | 'office' | 'land'
    commune: string
    region?: string | null
    bedrooms: number
    bathrooms: number
    price_clp: number
    description: string
    status?: 'draft' | 'published'
    has_suite?: boolean
    in_condo?: boolean
    has_terrace?: boolean
    common_expenses?: number | null
    parking_count?: number | null
    parking_types?: string[]
    storage_count?: number | null
    total_area?: number | null
    built_area?: number | null
    orientation?: string[]
    year_built?: number | null
    security_features?: string[]
    amenities?: string[]
    images?: string[]
}

function validateProperty(prop: any, index: number): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validar campos obligatorios
    const requiredFields = ['slug', 'title', 'operation', 'property_type', 'commune', 'bedrooms', 'bathrooms', 'price_clp', 'description']
    for (const field of requiredFields) {
        if (!prop[field] && prop[field] !== 0) {
            errors.push(`Falta campo obligatorio: ${field}`)
        }
    }

    // Validar operation
    if (prop.operation && !VALID_OPERATIONS.includes(prop.operation)) {
        errors.push(`operation debe ser uno de: ${VALID_OPERATIONS.join(', ')}`)
    }

    // Validar property_type
    if (prop.property_type && !VALID_PROPERTY_TYPES.includes(prop.property_type)) {
        errors.push(`property_type debe ser uno de: ${VALID_PROPERTY_TYPES.join(', ')}`)
    }

    // Validar status
    if (prop.status && !VALID_STATUSES.includes(prop.status)) {
        errors.push(`status debe ser uno de: ${VALID_STATUSES.join(', ')}`)
    }

    // Validar price_clp > 0
    if (typeof prop.price_clp === 'number' && prop.price_clp <= 0) {
        errors.push(`price_clp debe ser mayor a 0`)
    }

    // Validar common_expenses >= 0
    if (prop.common_expenses !== null && prop.common_expenses !== undefined) {
        if (typeof prop.common_expenses === 'number' && prop.common_expenses < 0) {
            errors.push(`common_expenses debe ser >= 0`)
        }
    }

    // Validar parking_count >= 0
    if (prop.parking_count !== null && prop.parking_count !== undefined) {
        if (typeof prop.parking_count === 'number' && prop.parking_count < 0) {
            errors.push(`parking_count debe ser >= 0`)
        }
    }

    // Validar storage_count >= 0
    if (prop.storage_count !== null && prop.storage_count !== undefined) {
        if (typeof prop.storage_count === 'number' && prop.storage_count < 0) {
            errors.push(`storage_count debe ser >= 0`)
        }
    }

    // Validar total_area > 0
    if (prop.total_area !== null && prop.total_area !== undefined) {
        if (typeof prop.total_area === 'number' && prop.total_area <= 0) {
            errors.push(`total_area debe ser > 0`)
        }
    }

    // Validar built_area > 0
    if (prop.built_area !== null && prop.built_area !== undefined) {
        if (typeof prop.built_area === 'number' && prop.built_area <= 0) {
            errors.push(`built_area debe ser > 0`)
        }
    }

    // Validar year_built entre 1900 y 2100
    if (prop.year_built !== null && prop.year_built !== undefined) {
        if (typeof prop.year_built === 'number' && (prop.year_built < 1900 || prop.year_built > 2100)) {
            errors.push(`year_built debe estar entre 1900 y 2100`)
        }
    }

    // Validar orientation (debe ser subconjunto de VALID_ORIENTATIONS)
    if (prop.orientation && Array.isArray(prop.orientation)) {
        const invalidOrientations = prop.orientation.filter((o: string) => !VALID_ORIENTATIONS.includes(o))
        if (invalidOrientations.length > 0) {
            errors.push(`orientaciones inválidas: ${invalidOrientations.join(', ')}. Válidas: ${VALID_ORIENTATIONS.join(', ')}`)
        }
    }

    // Validar bedrooms >= 0
    if (typeof prop.bedrooms === 'number' && prop.bedrooms < 0) {
        errors.push(`bedrooms debe ser >= 0`)
    }

    // Validar bathrooms >= 0
    if (typeof prop.bathrooms === 'number' && prop.bathrooms < 0) {
        errors.push(`bathrooms debe ser >= 0`)
    }

    return { valid: errors.length === 0, errors }
}

function cleanProperty(prop: any): PropertyInput {
    // Limpiar y normalizar los datos
    return {
        slug: prop.slug,
        title: prop.title,
        operation: prop.operation,
        property_type: prop.property_type,
        commune: prop.commune,
        region: prop.region ?? null,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        price_clp: prop.price_clp,
        description: prop.description,
        status: prop.status || 'published',
        has_suite: prop.has_suite ?? false,
        in_condo: prop.in_condo ?? false,
        has_terrace: prop.has_terrace ?? false,
        common_expenses: prop.common_expenses ?? null,
        parking_count: prop.parking_count ?? null,
        parking_types: prop.parking_types || [],
        storage_count: prop.storage_count ?? null,
        total_area: prop.total_area ?? null,
        built_area: prop.built_area ?? null,
        orientation: prop.orientation || [],
        year_built: prop.year_built ?? null,
        security_features: prop.security_features || [],
        amenities: prop.amenities || [],
        images: prop.images || []
    }
}

async function seedProperties() {
    try {
        // Leer el archivo JSON
        const filePath = path.join(__dirname, '..', 'data', 'propiedades.json')

        if (!fs.existsSync(filePath)) {
            console.error(`❌ No existe el archivo ${filePath}`)
            console.error('Crea la carpeta data/ y el archivo propiedades.json')
            process.exit(1)
        }

        const rawData = fs.readFileSync(filePath, 'utf-8')
        let parsedData = JSON.parse(rawData)
        
        // Soporta tanto un array de propiedades como un objeto único
        let properties: any[]
        if (Array.isArray(parsedData)) {
            properties = parsedData
        } else if (typeof parsedData === 'object' && parsedData !== null) {
            // Si es un solo objeto, lo convertimos a array
            console.log('📦 Detectado objeto único, convirtiendo a array...')
            properties = [parsedData]
        } else {
            console.error('❌ El archivo JSON debe contener un objeto {...} o un array [...]')
            process.exit(1)
        }

        console.log(`📦 Procesando ${properties.length} propiedad(es)...\n`)

        let exitosas = 0
        let fallidas = 0
        let omitidas = 0

        for (let i = 0; i < properties.length; i++) {
            let prop = properties[i]

            // 🔄 DETECTAR Y EXTRAER DE catalog_data si existe
            if (prop.catalog_data && typeof prop.catalog_data === 'object') {
                console.log(`  🔧 Propiedad ${i + 1}: Detectada estructura anidada (catalog_data), extrayendo datos...`)
                prop = prop.catalog_data
            }

            // 🔄 DETECTAR si viene de un formato Gem completo
            if (prop.easyprop_description && !prop.catalog_data) {
                delete prop.easyprop_description
            }

            console.log(`  📋 Propiedad ${i + 1}: ${prop.slug || 'sin-slug'}`)

            // ✅ VALIDACIONES
            const validation = validateProperty(prop, i)
            if (!validation.valid) {
                console.error(`   ❌ Errores de validación:`)
                validation.errors.forEach(err => console.error(`      • ${err}`))
                console.error('   Saltando esta propiedad...\n')
                fallidas++
                continue
            }

            // 🧹 LIMPIAR DATOS
            const cleanProp = cleanProperty(prop)

            console.log(`   ⬆️  Subiendo: ${cleanProp.title}`)

            // 🚀 INSERTAR EN SUPABASE
            const { data, error } = await supabase
                .from('properties')
                .insert([cleanProp])
                .select()

            if (error) {
                if (error.message.includes('duplicate key') || error.message.includes('properties_slug_key')) {
                    console.error(`   ⚠️  Ya existe una propiedad con slug "${cleanProp.slug}" (duplicado)\n`)
                    omitidas++
                } else {
                    console.error(`   ❌ Error de Supabase: ${error.message}\n`)
                    fallidas++
                }
                continue
            }

            console.log(`   ✅ Subida correctamente (ID: ${data?.[0]?.id})\n`)
            exitosas++
        }

        // 📊 RESUMEN
        console.log('='.repeat(50))
        console.log('📊 RESUMEN DEL PROCESO')
        console.log('='.repeat(50))
        console.log(`   ✅ Exitosas:  ${exitosas}`)
        console.log(`   ⚠️  Omitidas:  ${omitidas} (duplicadas)`)
        console.log(`   ❌ Fallidas:  ${fallidas}`)
        console.log('='.repeat(50))

        if (fallidas > 0) {
            process.exit(1)
        }

    } catch (error) {
        console.error('❌ Error fatal:', error)
        process.exit(1)
    }
}

// Ejecutar
seedProperties()
