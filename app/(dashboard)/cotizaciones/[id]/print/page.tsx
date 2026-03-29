import dynamic from 'next/dynamic';

const PrintClient = dynamic(() => import("./client"), {
  ssr: false, // Since it uses window.print() and heavy client logics
  loading: () => <div className="flex items-center justify-center p-12">Cargando módulo de impresión...</div>
});

export async function generateStaticParams() {
  return [{ id: "placeholder" }];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <PrintClient cotizacionId={id} />;
}
