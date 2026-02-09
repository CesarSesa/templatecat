import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SidebarNav } from './components/sidebar-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <div className="flex">
        <SidebarNav />

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-100/50 min-h-[calc(100vh-4rem)]">
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
