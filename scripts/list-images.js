// scripts/list-images.js
// Lista todas las imágenes de una carpeta en Supabase y genera el array de URLs

const { createClient } = require('@supabase/supabase-js')

// Cargar variables de entorno manualmente (porque es un script independiente)
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: No encuentro las variables de entorno')
  console.error('Asegúrate de tener .env.local en la raíz del proyecto')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listImages(folderName) {
  console.log(`\n🔍 Buscando imágenes en: properties/${folderName}\n`)
  
  const { data, error } = await supabase
    .storage
    .from('properties')
    .list(folderName)

  if (error) {
    console.error('❌ Error al listar:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No se encontraron archivos en esa carpeta')
    return
  }

  // Filtrar solo imágenes (no carpetas, no archivos raros)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const images = data
    .filter(file => {
      const ext = file.name.toLowerCase().slice(-4)
      const ext5 = file.name.toLowerCase().slice(-5) // para .jpeg
      return imageExtensions.includes(ext) || imageExtensions.includes(ext5)
    })
    .map(file => {
      const path = folderName ? `${folderName}/${file.name}` : file.name
      return `${supabaseUrl}/storage/v1/object/public/properties/${path}`
    })

  if (images.length === 0) {
    console.log('⚠️  No se encontraron imágenes (.jpg, .png, etc.)')
    console.log('Archivos encontrados:', data.map(f => f.name).join(', '))
    return
  }

  console.log(`✅ Encontradas ${images.length} imágenes:\n`)
  console.log(JSON.stringify(images, null, 2))
  
  console.log('\n📋 Copiá este array y pegalo en tu JSON de propiedades')
}

// Obtener nombre de carpeta de los argumentos
const folder = process.argv[2]

if (!folder) {
  console.log('Uso: node scripts/list-images.js [nombre-de-la-carpeta]')
  console.log('Ejemplo: node scripts/list-images.js casa-nunoa-001')
  process.exit(0)
}

listImages(folder)