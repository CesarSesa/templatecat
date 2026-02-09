'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  Layout
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'done';
  created_at: string;
  user_id: string;
}

// Colores pasteles suaves y opacos con nombres secuenciales
const columns = [
  { 
    id: 'backlog' as const, 
    title: '📋 Por Comenzar', 
    subtitle: 'Próximas tareas',
    color: 'bg-[#f5f1e8]', // Crema cálido suave
    borderColor: 'border-[#e8e0d0]',
    headerColor: 'bg-[#ebe4d6]',
    icon: '⏳'
  },
  { 
    id: 'in-progress' as const, 
    title: '🔄 En Proceso', 
    subtitle: 'Trabajando ahora',
    color: 'bg-[#e8f0f5]', // Azul cielo muy suave
    borderColor: 'border-[#d0e0e8]',
    headerColor: 'bg-[#d6e5ed]',
    icon: '🔨'
  },
  { 
    id: 'done' as const, 
    title: '✅ Completadas', 
    subtitle: 'Tareas finalizadas',
    color: 'bg-[#e8f5e9]', // Verde menta muy suave
    borderColor: 'border-[#d0e8d2]',
    headerColor: 'bg-[#d6edd8]',
    icon: '🎉'
  },
];

export function KanbanBoard() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserAndTasks();
  }, []);

  const fetchUserAndTasks = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No hay usuario autenticado');
        setLoading(false);
        return;
      }
      
      setUserId(user.id);
      await fetchTasks(user.id);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar datos');
      setLoading(false);
    }
  };

  const fetchTasks = async (uid: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }
      
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !userId) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error: insertError } = await supabase.from('tasks').insert({
        user_id: userId,
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        status: 'backlog',
      });

      if (insertError) {
        throw insertError;
      }

      // Clear form and refresh
      setNewTaskTitle('');
      setNewTaskDesc('');
      setShowAddForm(false);
      await fetchTasks(userId);
    } catch (err: any) {
      console.error('Error adding task:', err);
      setError('Error al crear tarea: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveTask = async (task: Task, direction: 'forward' | 'backward') => {
    const statuses: Task['status'][] = ['backlog', 'in-progress', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex < 0 || newIndex >= statuses.length) return;
    
    const newStatus = statuses[newIndex];
    
    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: newStatus } : t
    ));
    
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', task.id)
        .eq('user_id', userId || '');

      if (updateError) {
        throw updateError;
        // Revert on error would happen in catch
      }
    } catch (err: any) {
      console.error('Error moving task:', err);
      setError('Error al mover tarea');
      // Revert optimistic update
      await fetchTasks(userId || '');
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('¿Eliminar esta tarea permanentemente?')) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId || '');

      if (deleteError) {
        throw deleteError;
      }

      // Remove from local state
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError('Error al eliminar tarea');
    }
  };

  const getColumnTaskCount = (status: Task['status']) => {
    return tasks.filter(t => t.status === status).length;
  };

  if (loading) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardContent className="pt-6">
          <div className="h-[400px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardContent className="pt-6 text-center py-12">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUserAndTasks} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Layout className="w-5 h-5 text-indigo-500" />
          Tablero de Progreso
        </CardTitle>
        <Button 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nueva tarea
        </Button>
      </CardHeader>
      
      <CardContent className="pt-6">
        {showAddForm && (
          <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <Input
              placeholder="¿Qué necesitas hacer?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="border-slate-300"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addTask();
                }
              }}
            />
            <Textarea
              placeholder="Descripción opcional..."
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              rows={2}
              className="border-slate-300 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button 
                size="sm" 
                onClick={addTask} 
                disabled={!newTaskTitle.trim() || isSubmitting}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                {isSubmitting ? 'Creando...' : 'Agregar tarea'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setShowAddForm(false);
                  setNewTaskTitle('');
                  setNewTaskDesc('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column) => (
            <div 
              key={column.id} 
              className={`${column.color} rounded-xl border ${column.borderColor} min-h-[380px] flex flex-col`}
            >
              {/* Column Header */}
              <div className={`${column.headerColor} px-4 py-3 rounded-t-xl border-b ${column.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{column.icon}</span>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700">{column.title}</h3>
                      <p className="text-[10px] text-gray-500">{column.subtitle}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/70 text-gray-600">
                    {getColumnTaskCount(column.id)}
                  </Badge>
                </div>
              </div>
              
              {/* Tasks */}
              <div className="p-3 space-y-2 flex-1">
                {tasks
                  .filter((task) => task.status === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white/80 p-3 rounded-lg shadow-sm border border-gray-200/60 hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-medium text-sm text-gray-800 flex-1">{task.title}</p>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => moveTask(task, 'backward')}
                          disabled={column.id === 'backlog'}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-0 disabled:cursor-default transition-colors p-1 rounded hover:bg-gray-100"
                          title="Mover atrás"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <span className="text-[10px] text-gray-400">
                          {new Date(task.created_at).toLocaleDateString('es-CL', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                        
                        <button
                          onClick={() => moveTask(task, 'forward')}
                          disabled={column.id === 'done'}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-0 disabled:cursor-default transition-colors p-1 rounded hover:bg-gray-100"
                          title="Mover adelante"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                
                {getColumnTaskCount(column.id) === 0 && (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    <p>No hay tareas</p>
                    {column.id === 'backlog' && (
                      <p className="mt-1">Crea una nueva tarea ↑</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
