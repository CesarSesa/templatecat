'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push('/admin');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-purple-200 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
            ✨ Bienvenida a Miche
          </CardTitle>
          <p className="text-purple-600/70 mt-2">Inicia sesión para administrar tu tienda</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-purple-800">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-purple-200 focus:border-purple-400"
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-purple-800">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-purple-200 focus:border-purple-400"
                placeholder="••••••••"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
            >
              {loading ? (
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Heart className="w-4 h-4 mr-2 fill-white" />
              )}
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-purple-600/70">
            <p>¿No tienes cuenta?{' '}</p>
            <Link href="/auth/sign-up" className="text-pink-600 hover:text-pink-700 font-medium">
              Regístrate aquí
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/tienda" className="text-sm text-purple-500 hover:text-purple-700">
              ← Volver a la tienda
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
