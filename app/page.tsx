import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-mono-tech { font-family: 'JetBrains Mono', monospace; }
      `}} />

      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060b13] relative overflow-hidden text-slate-100 font-outfit">
        
        {/* Futuristic glowing backdrop */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] opacity-30 transform -translate-y-20"></div>
          <div className="w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] opacity-20 transform translate-y-40 absolute"></div>
        </div>

        {/* Technical grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30 pointer-events-none"></div>

        <main className="flex flex-col items-center justify-center w-full max-w-5xl px-6 text-center z-10 space-y-8">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-[#060b13]/80 backdrop-blur-sm text-amber-500 text-xs font-mono-tech uppercase tracking-[0.2em] mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            SISTEMA OPERATIVO
          </div>

          {/* Main Titles */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-extrabold font-outfit tracking-tighter leading-none text-white drop-shadow-2xl">
              ERP/WMS <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                YAHIRO SRL
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-medium text-slate-300 tracking-wider uppercase font-outfit">
              Corporación de Vidrio y Aluminio
            </p>
          </div>

          <div className="w-16 h-1 bg-amber-500/50 rounded-full mx-auto my-4 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>

          {/* Description */}
          <p className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed mx-auto font-outfit font-light">
            La solución ERP definitiva para precisión industrial. 
            Gestión optimizada de inventario, ingeniería de detalle y control total de procesos metalmecánicos.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center pt-8">
            <Link href="/dashboard">
              <Button className="group relative w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-7 px-12 rounded-lg transition-all duration-300 transform hover:-translate-y-1 font-mono-tech uppercase tracking-widest overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Ir al Dashboard
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </span>
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out skew-x-12"></div>
              </Button>
            </Link>
          </div>
        </main>

        {/* Decorator Lines */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"></div>
      </div>
    </>
  );
}
