import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default async function StorePage() {
  const supabase = await createClient();
  
  const { data: featured } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('active', true)
    .eq('featured', true)
    .limit(4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/tienda" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            ✨ Miche
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
              Admin
            </Link>
            <Button variant="outline" size="sm" className="border-pink-300 text-pink-600 hover:bg-pink-50">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Carrito
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Nueva Colección 2026
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-6">
            Moda que te hace brillar
          </h1>
          <p className="text-xl text-purple-700/70 mb-8 max-w-2xl mx-auto">
            Descubre nuestra colección exclusiva de vestidos, tops y accesorios diseñados para realzar tu belleza única.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-8">
              <Heart className="w-4 h-4 mr-2" />
              Ver Colección
            </Button>
            <Button size="lg" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              Nuevos Ingresos
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-purple-800 mb-2">Destacados</h2>
            <p className="text-purple-600/70">Lo más elegido por nuestras clientas</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <Card key={product.id} className="overflow-hidden group bg-white/80 backdrop-blur border-purple-100 hover:shadow-xl hover:shadow-purple-200/50 transition-all">
                <Link href={`/tienda/productos/${product.slug}`}>
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-purple-300">
                        <Sparkles className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-purple-900 truncate">{product.name}</h3>
                    <p className="text-sm text-purple-600/70">
                      {product.categories?.name}
                    </p>
                    <p className="font-bold text-pink-600 mt-2 text-lg">
                      ${product.price.toLocaleString('es-CL')}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-purple-800 mb-2">Categorías</h2>
          <p className="text-purple-600/70 mb-8">Encuentra tu estilo perfecto</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Vestidos', icon: '👗', color: 'from-purple-200 to-pink-200' },
              { name: 'Poleras', icon: '👚', color: 'from-pink-200 to-purple-200' },
              { name: 'Pantalones', icon: '👖', color: 'from-purple-200 to-pink-200' },
              { name: 'Accesorios', icon: '✨', color: 'from-pink-200 to-purple-200' },
            ].map((cat) => (
              <Link key={cat.name} href={`/tienda/productos?categoria=${cat.name.toLowerCase()}`}>
                <div className={`bg-gradient-to-br ${cat.color} p-8 rounded-2xl hover:shadow-lg hover:scale-105 transition-all`}>
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <p className="font-semibold text-purple-800">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-2xl font-bold mb-2">✨ Miche</p>
          <p className="text-purple-200 mb-4">Moda femenina que inspira confianza</p>
          <div className="flex justify-center gap-6 text-sm text-purple-300">
            <Link href="/tienda" className="hover:text-white">Inicio</Link>
            <Link href="/tienda/productos" className="hover:text-white">Productos</Link>
            <Link href="/admin" className="hover:text-white">Admin</Link>
          </div>
          <p className="mt-8 text-purple-400 text-sm">© 2026 Miche - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}
