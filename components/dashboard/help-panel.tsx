"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  HelpCircle,
  Book,
  Search,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Copy,
  Check,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import "github-markdown-css/github-markdown-light.css";

// Initial Mermaid Config
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
});

// Safe Mermaid block renderer
const MermaidChart = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) setSvg(svg);
      } catch (error) {
        console.error("Error renderizando mermaid", error);
        if (isMounted)
          setSvg(
            `<div class="text-red-500 p-4 border border-red-200 bg-red-50 text-sm rounded-md font-mono">Invalid or failed Mermaid diagram syntax.</div>`,
          );
      }
    };
    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="my-8 relative group border border-[#d0d7de] rounded-md overflow-hidden bg-white shadow-sm">
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={5}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <React.Fragment>
            <div className="absolute top-3 right-3 z-10 flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-[#d0d7de] opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => zoomIn()}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => resetTransform()}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm"
                title="Reset Zoom"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2 text-xs text-[#57606a] font-semibold flex cursor-grab active:cursor-grabbing">
              Diagrama Interactivo (Usa Scroll para Zoom y Arrastra para Mover)
            </div>
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "auto",
                minHeight: "400px",
                cursor: "grab",
              }}
              contentStyle={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: svg }}
                className="w-full flex justify-center [&>svg]:max-w-none [&>svg]:h-auto"
              />
            </TransformComponent>
          </React.Fragment>
        )}
      </TransformWrapper>
    </div>
  );
};

// Tipo extendido para soporte de categorías/separadores
type DocItem =
  | {
      id: string;
      title: string;
      path: string;
      category?: string;
      isHeader?: false;
    }
  | {
      id: string;
      isHeader: true;
      title: string;
      path?: never;
      category?: never;
    };

const DOCS_LIST: DocItem[] = [
  // ── ÍNDICE ──────────────────────────────────────────────
  { id: "h-idx", isHeader: true, title: "📋 Índice y Referencia Rápida" },
  {
    id: "00",
    title: "00 Índice Maestro",
    path: "/docs/00_INDICE_MAESTRO.md",
    category: "indice",
  },

  // ── TUTORIALES DE USUARIO ────────────────────────────────
  { id: "h-tut", isHeader: true, title: "📚 Tutoriales para Usuarios" },
  {
    id: "T01",
    title: "T01 Dashboard KPI",
    path: "/docs/tutoriales/T01_TUTORIAL_DASHBOARD.md",
    category: "tutorial",
  },
  {
    id: "T02",
    title: "T02 Cotizaciones",
    path: "/docs/tutoriales/T02_TUTORIAL_COTIZACIONES.md",
    category: "tutorial",
  },
  {
    id: "T03",
    title: "T03 Catálogo de Productos",
    path: "/docs/tutoriales/T03_TUTORIAL_CATALOGO.md",
    category: "tutorial",
  },
  {
    id: "T04",
    title: "T04 Inventario / Stock",
    path: "/docs/tutoriales/T04_TUTORIAL_INVENTARIO.md",
    category: "tutorial",
  },
  {
    id: "T05",
    title: "T05 Entradas (Compras)",
    path: "/docs/tutoriales/T05_TUTORIAL_ENTRADAS.md",
    category: "tutorial",
  },
  {
    id: "T06",
    title: "T06 Salidas (Despachos)",
    path: "/docs/tutoriales/T06_TUTORIAL_SALIDAS.md",
    category: "tutorial",
  },
  {
    id: "T07",
    title: "T07 Kardex",
    path: "/docs/tutoriales/T07_TUTORIAL_KARDEX.md",
    category: "tutorial",
  },
  {
    id: "T08",
    title: "T08 Recetas de Ingeniería",
    path: "/docs/tutoriales/T08_TUTORIAL_RECETAS.md",
    category: "tutorial",
  },
  {
    id: "T09",
    title: "T09 Producción (Kanban)",
    path: "/docs/tutoriales/T09_TUTORIAL_PRODUCCION.md",
    category: "tutorial",
  },
  {
    id: "T10",
    title: "T10 Exportador Excel",
    path: "/docs/tutoriales/T10_TUTORIAL_EXPORTADOR.md",
    category: "tutorial",
  },
  {
    id: "T11",
    title: "T11 Clientes y Proveedores",
    path: "/docs/tutoriales/T11_TUTORIAL_CLIENTES_PROVEEDORES.md",
    category: "tutorial",
  },
  {
    id: "T12",
    title: "T12 Configuración del Sistema",
    path: "/docs/tutoriales/T12_TUTORIAL_CONFIGURACION.md",
    category: "tutorial",
  },

  // ── DOCUMENTACIÓN TÉCNICA ────────────────────────────────
  { id: "h-tec", isHeader: true, title: "🔧 Documentación Técnica" },
  {
    id: "01",
    title: "01 Arquitectura General",
    path: "/docs/01_ARQUITECTURA_GENERAL.md",
    category: "tecnico",
  },
  {
    id: "02",
    title: "02 Esquema Base de Datos",
    path: "/docs/02_ESQUEMA_BASE_DATOS.md",
    category: "tecnico",
  },
  {
    id: "03",
    title: "03 Módulos y Funcionalidades",
    path: "/docs/03_MODULOS_Y_FUNCIONALIDADES.md",
    category: "tecnico",
  },
  {
    id: "04",
    title: "04 API Referencia",
    path: "/docs/04_API_REFERENCIA.md",
    category: "tecnico",
  },
  {
    id: "05",
    title: "05 Guía Desarrollador",
    path: "/docs/05_GUIA_DESARROLLADOR.md",
    category: "tecnico",
  },
  {
    id: "06",
    title: "06 Blindaje Arquitectónico",
    path: "/docs/06_BLINDAJE_ARQUITECTONICO.md",
    category: "tecnico",
  },
  {
    id: "07",
    title: "07 Guía Despliegue Estático",
    path: "/docs/07_GUIA_DESPLIEGUE_ESTATICO.md",
    category: "tecnico",
  },
  {
    id: "08",
    title: "08 Arquitectura Recetas",
    path: "/docs/08_ARQUITECTURA_RECETAS.md",
    category: "tecnico",
  },
  {
    id: "09",
    title: "09 Diccionario de Datos",
    path: "/docs/09_DICCIONARIO_DATOS.md",
    category: "tecnico",
  },
  {
    id: "10",
    title: "10 Flujos de Negocio",
    path: "/docs/10_FLUJOS_DE_NEGOCIO.md",
    category: "tecnico",
  },
  {
    id: "11",
    title: "11 Autenticación y Roles",
    path: "/docs/11_AUTENTICACION_Y_ROLES.md",
    category: "tecnico",
  },
  {
    id: "12",
    title: "12 Guía Completa Supabase",
    path: "/docs/12_GUIA_SUPABASE.md",
    category: "tecnico",
  },
  {
    id: "13",
    title: "13 Contingencia y Backups",
    path: "/docs/13_CONTINGENCIA_RECUPERACION.md",
    category: "tecnico",
  },

  // ── OPERACIONES ──────────────────────────────────────────
  { id: "h-ops", isHeader: true, title: "⚙️ Operaciones y Soporte" },
  {
    id: "handoff",
    title: "Handoff Maestro",
    path: "/docs/HANDOFF_MAESTRO.md",
    category: "ops",
  },
  {
    id: "cont-legacy",
    title: "Contingencia Supabase (Resumen)",
    path: "/docs/CONTINGENCIA_SUPABASE.md",
    category: "ops",
  },
  {
    id: "csv",
    title: "CSV a SQL Upsert",
    path: "/docs/CSV_A_SQL_UPSERT.md",
    category: "ops",
  },
  {
    id: "mig",
    title: "Plan Migración Masiva",
    path: "/docs/PLAN_MIGRACION_MASIVA.md",
    category: "ops",
  },
];

// Solo los items seleccionables (excluye headers)
const SELECTABLE_DOCS = DOCS_LIST.filter(
  (d): d is Extract<DocItem, { isHeader?: false }> => !d.isHeader,
);

export function HelpPanel({ collapsed }: { collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<
    Extract<DocItem, { isHeader?: false }>
  >(SELECTABLE_DOCS[0]);
  const [docContent, setDocContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const fetchDoc = async () => {
      setLoading(true);
      try {
        const res = await fetch(selectedDoc.path!);
        if (!res.ok)
          throw new Error("Documento no encontrado en /public/docs.");
        const text = await res.text();
        setDocContent(text);
        if (contentRef.current) contentRef.current.scrollTop = 0;
      } catch (err: any) {
        setDocContent(`### Error al cargar documento\n\n${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [open, selectedDoc]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery) return DOCS_LIST;
    const q = searchQuery.toLowerCase();
    // When searching, only show matching selectable docs (no headers)
    return SELECTABLE_DOCS.filter((doc) => doc.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleLinkClick = (href: string | undefined, e: React.MouseEvent) => {
    if (!href) return;

    // Intercept local .md links to navigate nicely
    if (href.endsWith(".md") && !href.startsWith("http")) {
      e.preventDefault();
      const fileName = href.split("/").pop() || "";
      const targetDoc = SELECTABLE_DOCS.find((d) => d.path.endsWith(fileName));
      if (targetDoc) {
        setSelectedDoc(targetDoc);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${collapsed ? "justify-center" : ""}`}
          title="Ayuda y Documentación"
        >
          <HelpCircle className={`h-5 w-5 ${!collapsed && "mr-3"}`} />
          {!collapsed && <span>Ayuda y Manuales</span>}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[95vw] max-w-[95vw] w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden bg-white rounded-md border border-gray-300 shadow-2xl">
        {/* Header Navbar similar a repositorio Github */}
        <DialogHeader className="px-6 py-3 border-b border-gray-200 bg-[#f6f8fa] flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-[#24292f]">
            <Book className="h-4 w-4 text-gray-500" />
            <span className="text-blue-600 hover:underline cursor-pointer">
              redentor159
            </span>
            <span className="text-gray-400 font-normal">/</span>
            <span className="text-blue-600 font-bold">
              sistema-erp-inventario
            </span>
            <span className="ml-2 text-xs font-normal border border-gray-200 rounded-full px-2 py-0.5 text-gray-500 bg-white">
              Public Docs
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar File explorer */}
          <div className="w-[300px] flex-shrink-0 border-r border-[#d0d7de] bg-white overflow-y-auto hidden md:flex flex-col">
            <div className="px-4 py-3 border-b border-[#d0d7de] bg-[#f6f8fa]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar manuales..."
                  className="w-full bg-white border border-[#d0d7de] rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex px-4 py-2 items-center justify-between bg-white text-xs font-semibold text-[#57606a] border-b border-[#d0d7de]">
              <span>Files</span>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
              {filteredDocs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No se encontraron resultados.
                </p>
              ) : (
                filteredDocs.map((doc) => {
                  // Render group header
                  if (doc.isHeader) {
                    return (
                      <div
                        key={doc.id}
                        className="px-3 pt-4 pb-1 text-[11px] font-bold text-[#57606a] uppercase tracking-wider select-none"
                      >
                        {doc.title}
                      </div>
                    );
                  }
                  // Render selectable doc
                  const isSelected = selectedDoc.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
                        isSelected
                          ? "bg-[#0969da] text-white"
                          : "text-[#24292f] hover:bg-[#f3f4f6]"
                      }`}
                    >
                      <FileText
                        className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-blue-200" : "text-[#57606a]"}`}
                      />
                      <span className="truncate">{doc.title}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Contenido Visor */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto bg-white scroll-smooth relative"
          >
            {/* Breadcrumb Header estilo GitHub */}
            <div className="sticky top-0 z-10 bg-[#f6f8fa] border-b border-[#d0d7de] px-6 py-2.5 flex items-center justify-between text-sm text-[#24292f]">
              <div className="flex items-center gap-1 font-semibold">
                <span className="text-blue-600 hover:underline cursor-pointer">
                  docs
                </span>
                <span className="text-[#57606a] mx-1">/</span>
                <span>{selectedDoc.path?.split("/").pop()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#57606a]">
                <Bookmark className="h-4 w-4" /> Markdown Source
              </div>
            </div>

            <div className="p-8 md:p-12">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                  <div className="h-8 w-8 border-4 border-[#0969da] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#57606a] text-sm tracking-wide">
                    Fetching data...
                  </p>
                </div>
              ) : (
                <div className="border border-[#d0d7de] rounded-md overflow-hidden bg-white max-w-5xl mx-auto shadow-sm">
                  <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-3 flex items-center">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    </div>
                    <span className="text-[#24292f] text-sm font-semibold ml-4">
                      {selectedDoc.title}
                    </span>
                  </div>
                  <div
                    className="markdown-body p-8 lg:p-10 font-sans"
                    style={{ backgroundColor: "white" }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre({ node, children, ...props }) {
                          // Buscamos si hay un code adentro para extraer el texto
                          let codeContent = "";
                          if (node && node.children) {
                            const codeNode = node.children.find(
                              (c) =>
                                c.type === "element" && c.tagName === "code",
                            ) as any;
                            if (
                              codeNode &&
                              codeNode.children &&
                              codeNode.children.length > 0
                            ) {
                              codeContent = codeNode.children[0].value;
                            }
                          }

                          // Extraemos el child <code> en react land
                          const child = React.Children.toArray(
                            children,
                          )[0] as React.ReactElement<any>;
                          const childProps = child?.props as any;

                          const match = /language-(\w+)/.exec(
                            childProps?.className || "",
                          );
                          const isMermaid = match && match[1] === "mermaid";

                          if (
                            isMermaid &&
                            typeof childProps?.children === "string"
                          ) {
                            return (
                              <MermaidChart
                                chart={childProps.children.replace(/\n$/, "")}
                              />
                            );
                          }

                          return (
                            <div className="relative group/pre my-4">
                              <div className="absolute right-2 top-2 opacity-0 group-hover/pre:opacity-100 transition-opacity z-10 flex gap-2">
                                {match && (
                                  <span className="text-xs text-gray-500 font-mono self-center px-1">
                                    {match[1]}
                                  </span>
                                )}
                                <CopyButton
                                  text={
                                    codeContent ||
                                    childProps?.children?.toString() ||
                                    ""
                                  }
                                />
                              </div>
                              <pre
                                {...props}
                                className="bg-[#f6f8fa] rounded-md border border-[#d0d7de] !p-4 !overflow-x-auto"
                              >
                                {children}
                              </pre>
                            </div>
                          );
                        },
                        code(props: any) {
                          const { node, inline, className, children, ...rest } =
                            props;
                          if (inline) {
                            return (
                              <code
                                className={`bg-[#f3f4f6] px-1.5 py-0.5 rounded text-[13px] text-[#24292f] font-mono whitespace-nowrap border border-gray-200 ${className || ""}`}
                                {...rest}
                              >
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code className={className} {...rest}>
                              {children}
                            </code>
                          );
                        },
                        a(props: any) {
                          const { href, children, ...rest } = props;
                          const isInternal =
                            href?.endsWith(".md") && !href?.startsWith("http");
                          return (
                            <a
                              href={href}
                              onClick={(e) => handleLinkClick(href, e)}
                              className="text-[#0969da] hover:underline cursor-pointer inline-flex items-center gap-1 font-medium"
                              {...rest}
                            >
                              {children}
                              {!isInternal && (
                                <ExternalLink className="h-3 w-3 opacity-60" />
                              )}
                            </a>
                          );
                        },
                      }}
                    >
                      {docContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="p-1.5 bg-white border border-[#d0d7de] hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-md shadow-sm transition-all focus:outline-none"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
