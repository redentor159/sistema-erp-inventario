"use client";

import dynamic from 'next/dynamic';

export const PrintClient = dynamic(() => import("./client"), {
  ssr: false, // Since it uses window.print() and heavy client logics
  loading: () => <div className="flex items-center justify-center p-12">Cargando módulo de impresión...</div>
});
