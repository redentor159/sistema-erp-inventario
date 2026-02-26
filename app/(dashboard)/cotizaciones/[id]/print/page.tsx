import PrintClient from "./client";

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
