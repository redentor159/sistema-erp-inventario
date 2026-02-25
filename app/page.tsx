import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-background text-foreground">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          ERP/WMS <span className="text-blue-600">YAHIRO SRL</span>
        </h1>
        <p className="mt-3 text-2xl font-medium">
          CORPORACIÓN DE VIDRIO Y ALUMINIO YAHIRO SRL
        </p>
        <p className="mt-2 text-xl text-muted-foreground">
          Sistema de Gestión para Carpintería Metálica de Alta Precisión
        </p>
        <div className="flex mt-6">
          <Link href="/dashboard">
            <Button>Ir al Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
