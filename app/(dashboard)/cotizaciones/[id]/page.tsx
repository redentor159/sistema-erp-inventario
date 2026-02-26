import CotizacionDetailClient from "./client";

export async function generateStaticParams() {
  return [{ id: "placeholder" }];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CotizacionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CotizacionDetailClient cotizacionId={id} />;
}
