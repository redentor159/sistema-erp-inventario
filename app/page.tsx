import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
        
        .font-sans { font-family: 'Fira Sans', sans-serif; }
        .font-mono { font-family: 'Fira Code', monospace; }
      `}} />

      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden text-slate-900 font-sans">

        {/* Technical grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60 pointer-events-none"></div>

        <main className="flex flex-col items-center justify-center w-full max-w-5xl px-6 text-center z-10 space-y-8">

          {/* Status Badge (Cristal Tintado) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 text-xs font-mono font-medium uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
            SISTEMA OPERATIVO ACTIVO
          </div>

          {/* Main Titles */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold font-sans tracking-tight leading-none text-slate-900">
              ERP <br className="md:hidden" />
              <span className="text-blue-700">
                YAHIRO SRL
              </span>
            </h1>

            <p className="text-xl md:text-2xl font-medium text-slate-600 tracking-wide font-sans">
              Corporación de Vidrio y Aluminio
            </p>
          </div>

          <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto my-4 transition-all duration-200"></div>

          {/* Description */}
          <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto font-sans">
            La solución ERP para precisión industrial.
            Gestión optimizada de inventario, ingeniería de detalle y control de procesos metalmecánicos.
          </p>

          {/* CTA Corporativo */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center pt-8">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6 px-10 rounded-md shadow-sm transition-all duration-200 font-mono uppercase tracking-wide flex items-center gap-2">
                Ir al Dashboard
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
