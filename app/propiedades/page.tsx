import { Suspense } from 'react';
import { Metadata } from 'next';
import PropertiesContent from './properties-content';
import Loading from './loading';

export const metadata: Metadata = {
  title: 'Propiedades | Catálogo Inmobiliario',
  description: 'Encuentra casas, departamentos y oficinas en venta y arriendo.',
};

interface Props {
  searchParams: Promise<{
    operation?: string;
    type?: string;
    commune?: string;
  }>;
}

export default function PropertiesPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <PropertiesContent searchParams={searchParams} />
    </Suspense>
  );
}
