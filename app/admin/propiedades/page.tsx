import { Suspense } from 'react';
import { Metadata } from 'next';
import PropertiesContent from './properties-content';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Propiedades | Admin',
};

interface Props {
  searchParams: Promise<{
    status?: string;
    operation?: string;
    q?: string;
  }>;
}

export default function AdminPropertiesPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<PropertiesSkeleton />}>
      <PropertiesContent searchParams={searchParams} />
    </Suspense>
  );
}

function PropertiesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
