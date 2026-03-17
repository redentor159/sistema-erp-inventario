"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  recetasApi,
  type RecetaLinea,
  type RecetaModelo,
} from "@/lib/api/recetas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CatalogSkuSelector } from "@/components/mto/catalog-sku-selector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Trash2,
  Plus,
  Calculator,
  Loader2,
  Settings2,
  ChevronsUpDown,
  Check,
  Search,
  Save,
  ChevronDown,
  ChevronRight,
  Layout,
  Copy,
  Nut,
  Settings,
  Maximize,
  Wrench,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useToastHelper } from "@/lib/hooks/useToastHelper";
import { ItemRenderer } from "@/components/trx/ItemRenderer";
import {
  evaluateFormula,
  validateFormula,
  type FormulaVariables,
} from "@/lib/utils/formula-engine";

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════

const SECCIONES = [
  { key: "MARCO", label: "Marco", icon: Layout, mode: "perfil" as const },
  { key: "HOJAS", label: "Hojas", icon: Copy, mode: "perfil" as const },
  {
    key: "ACCESORIOS_MARCO",
    label: "Accesorios en Marco",
    icon: Nut,
    mode: "accesorio" as const,
  },
  {
    key: "ACCESORIOS_HOJAS",
    label: "Accesorios en Hojas",
    icon: Settings,
    mode: "accesorio" as const,
  },
  {
    key: "INTERIOR",
    label: "Interior / Vidrio",
    icon: Maximize,
    mode: "perfil" as const,
  },
  { key: "CRUCES", label: "Cruces", icon: Plus, mode: "perfil" as const },
  {
    key: "ACCESORIOS_CRUCES",
    label: "Accesorios en Cruces",
    icon: Wrench,
    mode: "accesorio" as const,
  },
  {
    key: "GENERAL",
    label: "General / Servicios",
    icon: Package,
    mode: "accesorio" as const,
  },
];

const DEFAULT_PREVIEW: FormulaVariables = {
  ancho: 2000,
  alto: 1500,
  hojas: 2,
  crucesH: 0,
  crucesV: 0,
};

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

interface RecipeEditorProps {
  modelId: string;
}

export function RecipeEditor({ modelId }: RecipeEditorProps) {
  const toast = useToastHelper();
  const { toast: rawToast } = useToast();
  const qc = useQueryClient();
  const [preview, setPreview] = useState<FormulaVariables>(DEFAULT_PREVIEW);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [addDialog, setAddDialog] = useState<{
    open: boolean;
    seccion: string;
    mode: "perfil" | "accesorio";
  }>({ open: false, seccion: "", mode: "perfil" });

  // ── Pending changes (batch save) ──
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Record<string, any>>
  >({});
  const [saving, setSaving] = useState(false);
  const hasPending = Object.keys(pendingChanges).length > 0;

  const { data: modelo } = useQuery({
    queryKey: ["recetaModelo", modelId],
    queryFn: () => recetasApi.getModeloById(modelId),
    enabled: !!modelId,
  });

  const { data: recetas, isLoading } = useQuery({
    queryKey: ["recetasLineas", modelId],
    queryFn: () => recetasApi.getRecetasByModelo(modelId),
    enabled: !!modelId,
  });

  const { data: plantillas } = useQuery({
    queryKey: ["catPlantillasRecetas"],
    queryFn: recetasApi.getPlantillas,
  });

  const { data: variantes } = useQuery({
    queryKey: ["catVariantesAccesorios"],
    queryFn: recetasApi.getVariantesAccesorios,
  });

  // Apply pending changes on top of server data
  const recetasConPending = useMemo(() => {
    if (!recetas) return [];
    return recetas.map((r) => {
      const pending = pendingChanges[r.id_receta];
      if (!pending) return r;
      return { ...r, ...pending };
    });
  }, [recetas, pendingChanges]);

  const pvars = useMemo(
    () => ({
      ...preview,
      hojas: modelo?.num_hojas || preview.hojas,
    }),
    [preview, modelo],
  );

  const grouped = useMemo(() => {
    if (!recetasConPending) return {};
    return recetasConPending.reduce<Record<string, RecetaLinea[]>>((acc, r) => {
      const s = r.seccion || "GENERAL";
      if (!acc[s]) acc[s] = [];
      acc[s].push(r);
      return acc;
    }, {});
  }, [recetasConPending]);

  // Stage changes locally instead of saving immediately
  const saveField = useCallback(
    async (id: string, field: string, value: any) => {
      setPendingChanges((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), [field]: value },
      }));
    },
    [],
  );

  const saveMulti = useCallback(
    async (id: string, fields: Record<string, any>) => {
      setPendingChanges((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), ...fields },
      }));
    },
    [],
  );

  // Flush all pending changes to DB
  const handleSaveAll = useCallback(async () => {
    if (!hasPending) return;
    setSaving(true);
    try {
      const entries = Object.entries(pendingChanges);
      for (const [id, fields] of entries) {
        await recetasApi.updateRecetaLinea(id, fields);
      }
      setPendingChanges({});
      qc.invalidateQueries({ queryKey: ["recetasLineas", modelId] });
      toast.success(
        "Receta guardada",
        `${entries.length} componente(s) actualizado(s)`,
      );
    } catch (e: any) {
      toast.error("Error al guardar receta", e.message);
    } finally {
      setSaving(false);
    }
  }, [pendingChanges, hasPending, modelId, qc, toast]);

  const updateCatalogPrice = useCallback(
    async (id_sku: string, precio: number) => {
      try {
        await recetasApi.updatePrecioAccesorio(id_sku, precio);
        qc.invalidateQueries({ queryKey: ["catVariantesAccesorios"] });
        toast.success(
          "Precio actualizado en catálogo",
          `${id_sku}: S/ ${precio}`,
        );
      } catch (e: any) {
        toast.error("Error al actualizar precio", e.message);
      }
    },
    [qc, toast],
  );

  const deleteLine = useCallback(
    (r: RecetaLinea) => {
      rawToast({
        title: `¿Eliminar "${r.nombre_componente}"?`,
        action: (
          <ToastAction
            altText="Eliminar"
            onClick={async () => {
              try {
                await recetasApi.deleteRecetaLinea(r.id_receta);
                // Also remove any pending changes for this line
                setPendingChanges((prev) => {
                  const next = { ...prev };
                  delete next[r.id_receta];
                  return next;
                });
                qc.invalidateQueries({ queryKey: ["recetasLineas", modelId] });
                toast.success("Eliminado", r.nombre_componente);
              } catch (e: any) {
                toast.error("Error", e.message);
              }
            }}
          >
            Sí, Eliminar
          </ToastAction>
        ),
      });
    },
    [modelId, qc, toast, rawToast],
  );

  // ── Empty state ──
  if (!modelId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <Calculator className="h-12 w-12 mx-auto text-slate-300" />
          <p className="text-lg font-medium">Selecciona un modelo</p>
          <p className="text-sm">Elige un modelo del panel izquierdo</p>
        </div>
      </div>
    );
  }
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-white dark:bg-slate-950 shrink-0">
        <div>
          <h2 className="text-base font-bold">
            {modelo?.nombre_comercial || modelId}
          </h2>
          <p className="text-[11px] text-muted-foreground font-mono">
            {modelId} · {modelo?.num_hojas || "?"} hojas ·{" "}
            {recetasConPending?.length || 0} componentes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={() => setPreviewOpen(!previewOpen)}
          >
            <Settings2 className="h-3 w-3 mr-1" /> Variables
          </Button>
          <Button
            size="sm"
            className={cn(
              "text-xs h-7 gap-1",
              hasPending
                ? "bg-green-600 hover:bg-green-700 text-white animate-pulse"
                : "bg-slate-200 text-slate-400 cursor-not-allowed",
            )}
            disabled={!hasPending || saving}
            onClick={handleSaveAll}
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            {saving
              ? "Guardando..."
              : hasPending
                ? `Guardar Receta (${Object.keys(pendingChanges).length})`
                : "Guardado ✓"}
          </Button>
        </div>
      </div>

      {/* ===== CONFIGURACIÓN VISUAL DEL MODELO ===== */}
      <div className="px-4 py-2 border-b border-slate-200/60 bg-slate-50 dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[10px] text-indigo-600 font-semibold tracking-wide">DIBUJO:</span>

          {/* Selector Tipo Dibujo */}
          <label className="flex items-center gap-1.5 text-[11px]">
            <span className="font-medium text-slate-600">Tipo:</span>
            <Select
              value={modelo?.tipo_dibujo || "Fijo"}
              onValueChange={async (v) => {
                try {
                  await recetasApi.updateModelo(modelId, { tipo_dibujo: v });
                  qc.invalidateQueries({ queryKey: ["recetaModelo", modelId] });
                } catch (e) { console.error(e); }
              }}
            >
              <SelectTrigger className="h-6 w-[120px] text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Corrediza">Corrediza</SelectItem>
                <SelectItem value="Proyectante">Proyectante</SelectItem>
                <SelectItem value="Batiente">Batiente</SelectItem>
                <SelectItem value="Fijo">Fijo</SelectItem>
              </SelectContent>
            </Select>
          </label>

          {/* Selector Config Hojas */}
          <label className="flex items-center gap-1.5 text-[11px]">
            <span className="font-medium text-slate-600">Hojas:</span>
            <Select
              value={modelo?.config_hojas_default || "F"}
              onValueChange={async (v) => {
                try {
                  await recetasApi.updateModelo(modelId, { config_hojas_default: v });
                  qc.invalidateQueries({ queryKey: ["recetaModelo", modelId] });
                } catch (e) { console.error(e); }
              }}
            >
              <SelectTrigger className="h-6 w-[100px] text-[11px] font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* Opciones Generales (Fijos puros) - Aplican a cualquier tipo como baseline o si es tipo Fijo */}
                {(modelo?.tipo_dibujo === "Fijo" || !modelo?.tipo_dibujo) && (
                  <SelectGroup>
                    <SelectLabel>Fijos puros</SelectLabel>
                    <SelectItem value="F">F (1 Fijo)</SelectItem>
                    <SelectItem value="FF">FF (2 Fijos)</SelectItem>
                    <SelectItem value="FFF">FFF (3 Fijos)</SelectItem>
                    <SelectItem value="FFFF">FFFF (4 Fijos)</SelectItem>
                    <SelectItem value="V_FF">V_FF (2 Fijos Vert.)</SelectItem>
                  </SelectGroup>
                )}

                {/* Opciones Corrediza */}
                {modelo?.tipo_dibujo === "Corrediza" && (
                  <SelectGroup>
                    <SelectLabel>Corredizas Base</SelectLabel>
                    <SelectItem value="CC">CC (2 Corr.)</SelectItem>
                    <SelectItem value="FC">FC (Fijo-Corr.)</SelectItem>
                    <SelectItem value="CF">CF (Corr.-Fijo)</SelectItem>
                    <SelectItem value="FCC">FCC (Telescópica Der)</SelectItem>
                    <SelectItem value="CCF">CCF (Telescópica Izq)</SelectItem>
                    <SelectLabel>Corredizas 3+ Hojas</SelectLabel>
                    <SelectItem value="CCC">CCC (3 Corr.)</SelectItem>
                    <SelectItem value="FCF">FCF (Centro Móvil)</SelectItem>
                    <SelectItem value="CFC">CFC (Centro Fijo)</SelectItem>
                    <SelectItem value="FCCF">FCCF (4 hojas OXXO)</SelectItem>
                    <SelectItem value="CCCC">CCCC (4 Corr.)</SelectItem>
                    <SelectItem value="CFFC">CFFC</SelectItem>
                    <SelectItem value="CCCCCC">CCCCCC (6 hojas)</SelectItem>
                    <SelectItem value="FCCCCF">FCCCCF (6 hojas)</SelectItem>
                    <SelectLabel>Verticales (Guillotinas)</SelectLabel>
                    <SelectItem value="V_GDOBLE">G_DOBLE (Guillotina)</SelectItem>
                    <SelectItem value="V_GSIMP">G_SIMP (Guill. Simple)</SelectItem>
                  </SelectGroup>
                )}

                {/* Opciones Proyectante */}
                {modelo?.tipo_dibujo === "Proyectante" && (
                  <SelectGroup>
                    <SelectLabel>Proyectante Base</SelectLabel>
                    <SelectItem value="P">P / P_SUP (Proy. Superior)</SelectItem>
                    <SelectItem value="P_INF">P_INF (Banderola)</SelectItem>
                    <SelectItem value="PP">PP (2 Proyectantes)</SelectItem>
                    <SelectLabel>Mixtas Horizontales</SelectLabel>
                    <SelectItem value="PF">PF (Proy-Fijo)</SelectItem>
                    <SelectItem value="FP">FP (Fijo-Proy)</SelectItem>
                    <SelectItem value="PFP">PFP (Proy-Fijo-Proy)</SelectItem>
                    <SelectItem value="FPF">FPF (Fijo-Proy-Fijo)</SelectItem>
                    <SelectLabel>Mixtas Verticales (Tragaluces)</SelectLabel>
                    <SelectItem value="V_FP">V_FP (Tragaluz Fijo-Proy)</SelectItem>
                    <SelectItem value="V_PF">V_PF (Tragaluz Proy-Fijo)</SelectItem>
                  </SelectGroup>
                )}

                {/* Opciones Batiente */}
                {modelo?.tipo_dibujo === "Batiente" && (
                  <SelectGroup>
                    <SelectLabel>Abatibles Base</SelectLabel>
                    <SelectItem value="A">A / A_DER (Abat. Derecha)</SelectItem>
                    <SelectItem value="A_IZQ">A_IZQ (Abat. Izquierda)</SelectItem>
                    <SelectItem value="AA">AA (Dos Abatibles)</SelectItem>
                    <SelectLabel>Mixtas Abatibles</SelectLabel>
                    <SelectItem value="AF">AF (Abatible-Fijo)</SelectItem>
                    <SelectItem value="FA">FA (Fijo-Abatible)</SelectItem>
                    <SelectItem value="AFA">AFA</SelectItem>
                    <SelectItem value="FAA">FAA</SelectItem>
                    <SelectItem value="FAAF">FAAF</SelectItem>
                    <SelectItem value="AAFAA">AAFAA</SelectItem>
                    <SelectLabel>Especiales</SelectLabel>
                    <SelectItem value="OB">OB (Oscilobatiente)</SelectItem>
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </label>

          {/* Mini Preview SVG */}
          <div className="ml-auto border rounded bg-white p-1 flex items-center justify-center" style={{ width: 80, height: 56 }}>
            <ItemRenderer
              anchoMm={preview.ancho}
              altoMm={preview.alto}
              colorCode="MAT"
              tipoDibujo={modelo?.tipo_dibujo || "Fijo"}
              configHojas={modelo?.config_hojas_default || "F"}
              showCotas={false}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Preview vars */}
      {previewOpen && (
        <div className="px-4 py-1.5 bg-slate-50/80 border-b border-slate-200/60 flex items-center gap-3 shrink-0 flex-wrap">
          <span className="text-[10px] text-blue-600 font-semibold">
            PREVIEW:
          </span>
          {(["ancho", "alto", "hojas", "crucesH", "crucesV"] as const).map(
            (k) => (
              <label key={k} className="flex items-center gap-1 text-[11px]">
                <span className="font-medium text-blue-700">{k}:</span>
                <Input
                  type="number"
                  className="w-16 h-5 text-[11px] font-mono px-1 bg-white border-blue-200"
                  value={preview[k]}
                  onChange={(e) =>
                    setPreview((p) => ({ ...p, [k]: Number(e.target.value) }))
                  }
                />
              </label>
            ),
          )}
        </div>
      )}

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {SECCIONES.map((sec) => (
          <SectionBlock
            key={sec.key}
            sec={sec}
            lines={grouped[sec.key] || []}
            pvars={pvars}
            plantillas={plantillas || []}
            variantes={variantes || []}
            onSave={saveField}
            onSaveMulti={saveMulti}
            onUpdateCatalogPrice={updateCatalogPrice}
            onDelete={deleteLine}
            onAdd={() =>
              setAddDialog({ open: true, seccion: sec.key, mode: sec.mode })
            }
          />
        ))}
      </div>

      {/* Add dialog */}
      <AddDialog
        open={addDialog.open}
        seccion={addDialog.seccion}
        mode={addDialog.mode}
        modelId={modelId}
        modelo={modelo}
        plantillas={plantillas || []}
        variantes={variantes || []}
        pvars={pvars}
        onClose={() =>
          setAddDialog({ open: false, seccion: "", mode: "perfil" })
        }
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ["recetasLineas", modelId] });
          setAddDialog({ open: false, seccion: "", mode: "perfil" });
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SECCIÓN COLAPSABLE
// ═══════════════════════════════════════════════════════════════════

interface SectionBlockProps {
  sec: (typeof SECCIONES)[number];
  lines: RecetaLinea[];
  pvars: FormulaVariables;
  plantillas: any[];
  variantes: any[];
  onSave: (id: string, field: string, value: any) => Promise<void>;
  onSaveMulti: (id: string, fields: Record<string, any>) => Promise<void>;
  onUpdateCatalogPrice: (id_sku: string, precio: number) => Promise<void>;
  onDelete: (r: RecetaLinea) => void;
  onAdd: () => void;
}

function SectionBlock({
  sec,
  lines,
  pvars,
  plantillas,
  variantes,
  onSave,
  onSaveMulti,
  onUpdateCatalogPrice,
  onDelete,
  onAdd,
}: SectionBlockProps) {
  const [open, setOpen] = useState(lines.length > 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border-b">
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-2 px-4 py-1.5 text-sm font-semibold transition-all duration-200 text-left",
              open
                ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-900/5"
                : "bg-white hover:bg-slate-50 text-slate-500",
            )}
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <sec.icon className="h-4 w-4 text-slate-500" /> {sec.label}
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 rounded-full ml-1">
              {lines.length}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {sec.mode === "perfil" ? (
            <PerfilTable
              lines={lines}
              pvars={pvars}
              plantillas={plantillas}
              onSave={onSave}
              onDelete={onDelete}
            />
          ) : (
            <AccesorioTable
              lines={lines}
              pvars={pvars}
              variantes={variantes}
              onSave={onSave}
              onSaveMulti={onSaveMulti}
              onUpdateCatalogPrice={onUpdateCatalogPrice}
              onDelete={onDelete}
            />
          )}
          <div className="px-3 py-1 bg-slate-50 border-t">
            <Button
              size="sm"
              variant="ghost"
              className="text-[11px] h-6 text-blue-600"
              onClick={onAdd}
            >
              <Plus className="h-3 w-3 mr-1" /> Agregar componente
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TABLA PERFILES — Plantilla | F. Cantidad | F. Perfil (ML) | Ángulo
// Usa id_plantilla. El SKU se calcula en la cotización.
// Fórmula de perfil: usa mm en la fórmula, preview muestra ML
// ═══════════════════════════════════════════════════════════════════

function PerfilTable({
  lines,
  pvars,
  plantillas,
  onSave,
  onDelete,
}: {
  lines: RecetaLinea[];
  pvars: FormulaVariables;
  plantillas: any[];
  onSave: (id: string, f: string, v: any) => Promise<void>;
  onDelete: (r: RecetaLinea) => void;
}) {
  if (lines.length === 0)
    return (
      <div className="px-4 py-3 text-xs text-slate-400 italic">
        Sin perfiles en esta sección
      </div>
    );
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200/60 text-[11px]">
          <th className="text-left py-1.5 px-3 font-semibold w-[200px]">
            Perfil (Plantilla)
          </th>
          <th className="text-left py-1.5 px-2 font-semibold w-[180px]">
            Fórmula de Cantidad
          </th>
          <th className="text-left py-1.5 px-2 font-semibold">
            Fórmula de Perfil (mm → ML)
          </th>
          <th className="text-center py-1.5 px-2 font-semibold w-[60px]">
            Ángulo
          </th>
          <th className="text-right py-1.5 px-2 font-semibold w-[120px]">
            Preview
          </th>
          <th className="w-[30px]"></th>
        </tr>
      </thead>
      <tbody>
        {lines.map((r) => (
          <PerfilRow
            key={r.id_receta}
            line={r}
            pvars={pvars}
            plantillas={plantillas}
            onSave={onSave}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}

function PerfilRow({
  line: r,
  pvars,
  plantillas,
  onSave,
  onDelete,
}: {
  line: RecetaLinea;
  pvars: FormulaVariables;
  plantillas: any[];
  onSave: (id: string, f: string, v: any) => Promise<void>;
  onDelete: (r: RecetaLinea) => void;
}) {
  const cantP = useMemo(
    () =>
      r.formula_cantidad ? evaluateFormula(r.formula_cantidad, pvars) : null,
    [r.formula_cantidad, pvars],
  );
  const perfP = useMemo(
    () => (r.formula_perfil ? evaluateFormula(r.formula_perfil, pvars) : null),
    [r.formula_perfil, pvars],
  );

  // Perfil preview: resultado en mm → convertir a metros lineales (÷1000)
  const perfilML = perfP && !perfP.error ? perfP.value / 1000 : null;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
      {/* Plantilla selector — same UX as inventory module */}
      <td className="py-1 px-3">
        <PlantillaSelector
          value={r.id_plantilla || ""}
          plantillas={plantillas}
          onChange={(v) => onSave(r.id_receta, "id_plantilla", v || null)}
        />
      </td>

      {/* F. Cantidad — fórmula natural con paréntesis */}
      <td className="py-1 px-2">
        <InlineFormula
          value={r.formula_cantidad || ""}
          pvars={pvars}
          onSave={(v) => onSave(r.id_receta, "formula_cantidad", v || null)}
          placeholder="Ej: 2"
        />
      </td>

      {/* F. Perfil — fórmula natural, preview en ML */}
      <td className="py-1 px-2">
        <InlineFormula
          value={r.formula_perfil || ""}
          pvars={pvars}
          onSave={(v) => onSave(r.id_receta, "formula_perfil", v || null)}
          placeholder="Ej: ancho-16"
        />
      </td>

      {/* Ángulo */}
      <td className="py-1 px-2 text-center">
        <select
          className="bg-transparent border-0 text-center text-xs w-14 cursor-pointer hover:bg-blue-50 rounded py-0.5"
          value={r.angulo ?? 90}
          onChange={(e) =>
            onSave(r.id_receta, "angulo", Number(e.target.value))
          }
        >
          <option value={90}>90°</option>
          <option value={45}>45°</option>
          <option value={0}>0°</option>
        </select>
      </td>

      {/* Preview — Cant × ML */}
      <td className="py-1 px-2 text-right font-mono text-[10px] whitespace-nowrap">
        {cantP && !cantP.error && (
          <span className="text-emerald-600 font-semibold">×{cantP.value}</span>
        )}
        {perfilML !== null && (
          <span
            className="text-blue-600 ml-1.5"
            title={`${perfP!.value.toFixed(0)} mm`}
          >
            {perfilML.toFixed(3)} ML
          </span>
        )}
        {(cantP?.error || perfP?.error) && (
          <span className="text-red-400" title={cantP?.error || perfP?.error}>
            ⚠
          </span>
        )}
      </td>

      {/* Delete */}
      <td className="py-1 px-1">
        <button
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5 transition-opacity"
          onClick={() => onDelete(r)}
          title="Eliminar"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PLANTILLA SELECTOR — Code-first display
// Searches cat_plantillas by id_plantilla or nombre_generico
// Shows id_plantilla CODE prominently (most important for user)
// ═══════════════════════════════════════════════════════════════════

function PlantillaSelector({
  value,
  plantillas,
  onChange,
}: {
  value: string;
  plantillas: any[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => plantillas.find((p: any) => p.id_plantilla === value),
    [plantillas, value],
  );

  const filtered = useMemo(() => {
    if (!plantillas) return [];
    if (!search) return plantillas.slice(0, 200);
    const q = search.toLowerCase();
    return plantillas
      .filter(
        (p: any) =>
          p.id_plantilla?.toLowerCase().includes(q) ||
          p.nombre_generico?.toLowerCase().includes(q),
      )
      .slice(0, 200);
  }, [plantillas, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between pl-3 text-left font-normal h-8 text-xs",
            !value && "text-muted-foreground",
            value && "font-medium text-foreground border-primary/50",
          )}
        >
          <span className="truncate">
            {selected
              ? `${value} — ${selected.nombre_generico}`
              : "Buscar plantilla..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false} className="overflow-visible">
          <CommandInput
            placeholder="Buscar por código o nombre..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden pointer-events-auto">
            {filtered.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {search ? "Sin resultados." : "Escribe para buscar..."}
              </div>
            )}
            <CommandGroup>
              {filtered.map((p: any) => (
                <CommandItem
                  key={p.id_plantilla}
                  value={p.id_plantilla + " " + p.nombre_generico}
                  onSelect={() => {
                    onChange(p.id_plantilla);
                    setOpen(false);
                    setSearch("");
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(p.id_plantilla);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "cursor-pointer pointer-events-auto",
                    "data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary font-medium",
                    value === p.id_plantilla && "bg-primary/20 font-bold",
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      value === p.id_plantilla ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col w-full">
                    <span className="font-medium font-mono">
                      {p.id_plantilla}
                    </span>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span>{p.nombre_generico}</span>
                      {p.id_familia && (
                        <span className="text-slate-400">{p.id_familia}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TABLA ACCESORIOS — SKU | Descripción | F. Cantidad | Precio
// Usa SKU completo de cat_productos_variantes.
// Accesorios usan mm completos en fórmulas de cantidad.
// ═══════════════════════════════════════════════════════════════════

function AccesorioTable({
  lines,
  pvars,
  variantes,
  onSave,
  onSaveMulti,
  onUpdateCatalogPrice,
  onDelete,
}: {
  lines: RecetaLinea[];
  pvars: FormulaVariables;
  variantes: any[];
  onSave: (id: string, f: string, v: any) => Promise<void>;
  onSaveMulti: (id: string, fields: Record<string, any>) => Promise<void>;
  onUpdateCatalogPrice: (id_sku: string, precio: number) => Promise<void>;
  onDelete: (r: RecetaLinea) => void;
}) {
  if (lines.length === 0)
    return (
      <div className="px-4 py-3 text-xs text-slate-400 italic">
        Sin accesorios en esta sección
      </div>
    );
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200/60 text-[11px]">
          <th className="text-left py-1.5 px-3 font-semibold w-[250px]">
            SKU (Catálogo)
          </th>
          <th className="text-left py-1.5 px-2 font-semibold">Descripción</th>
          <th className="text-left py-1.5 px-2 font-semibold w-[220px]">
            Fórmula de Cantidad
          </th>
          <th className="text-right py-1.5 px-2 font-semibold w-[80px]">
            S/ (Catálogo)
          </th>
          <th className="text-right py-1.5 px-2 font-semibold w-[60px]">
            Preview
          </th>
          <th className="w-[30px]"></th>
        </tr>
      </thead>
      <tbody>
        {lines.map((r) => (
          <AccesorioRow
            key={r.id_receta}
            line={r}
            pvars={pvars}
            variantes={variantes}
            onSave={onSave}
            onSaveMulti={onSaveMulti}
            onUpdateCatalogPrice={onUpdateCatalogPrice}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}

function AccesorioRow({
  line: r,
  pvars,
  variantes,
  onSave,
  onSaveMulti,
  onUpdateCatalogPrice,
  onDelete,
}: {
  line: RecetaLinea;
  pvars: FormulaVariables;
  variantes: any[];
  onSave: (id: string, f: string, v: any) => Promise<void>;
  onSaveMulti: (id: string, fields: Record<string, any>) => Promise<void>;
  onUpdateCatalogPrice: (id_sku: string, precio: number) => Promise<void>;
  onDelete: (r: RecetaLinea) => void;
}) {
  const cantP = useMemo(
    () =>
      r.formula_cantidad ? evaluateFormula(r.formula_cantidad, pvars) : null,
    [r.formula_cantidad, pvars],
  );

  // Current SKU from id_sku_catalogo field directly
  const currentSku = r.id_sku_catalogo || null;

  // Load product info (price) from server when we have a SKU
  const [catalogProduct, setCatalogProduct] = useState<any>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Load catalog product on mount and when SKU changes
  useEffect(() => {
    if (!currentSku) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCatalogProduct(null);
      return;
    }
    let cancelled = false;
    setLoadingPrice(true);
    recetasApi
      .getProductoPorSku(currentSku)
      .then((p) => {
        if (!cancelled && p) setCatalogProduct(p);
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoadingPrice(false); });
    return () => { cancelled = true; };
  }, [currentSku]);

  // When user selects a new SKU from catalog
  function handleSkuSelect(sku: string, producto: any) {
    setCatalogProduct(producto);
    onSaveMulti(r.id_receta, {
      id_sku_catalogo: sku,
      nombre_componente: producto?.nombre_completo || r.nombre_componente,
    });
  }

  // Price editing → update catalog directly (immediate, not batched)
  function handlePriceChange(newPrice: number) {
    if (currentSku && newPrice > 0) {
      onUpdateCatalogPrice(currentSku, newPrice);
      // Optimistically update local state so display refreshes
      setCatalogProduct((prev: any) => prev ? { ...prev, costo_mercado_unit: newPrice } : prev);
    } else {
      onSave(r.id_receta, "precio_unitario_manual", newPrice || null);
    }
  }

  const displayPrice =
    catalogProduct?.costo_mercado_unit ?? r.precio_unitario_manual ?? 0;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
      {/* SKU — shows SKU code prominently */}
      <td className="py-1 px-3">
        <CatalogSkuSelector
          value={currentSku || ""}
          onChange={handleSkuSelect}
        />
      </td>

      {/* Descripción */}
      <td className="py-1 px-2">
        <InlineText
          value={r.nombre_componente}
          onSave={(v) => onSave(r.id_receta, "nombre_componente", v)}
        />
      </td>

      {/* F. Cantidad */}
      <td className="py-1 px-2">
        <InlineFormula
          value={r.formula_cantidad || ""}
          pvars={pvars}
          onSave={(v) => onSave(r.id_receta, "formula_cantidad", v || null)}
          placeholder="Ej: hojas*2"
        />
      </td>

      {/* Precio catálogo (muestra valor actual, editable al click) */}
      <td className="py-1 px-2 text-right">
        {loadingPrice ? (
          <span className="text-[10px] text-slate-400 animate-pulse">...</span>
        ) : (
          <InlineNumber value={displayPrice} onSave={handlePriceChange} />
        )}
      </td>

      {/* Preview */}
      <td className="py-1 px-2 text-right font-mono text-[10px]">
        {cantP && !cantP.error && (
          <span className="text-emerald-600 font-semibold">
            {Number(cantP.value.toFixed(2))}
          </span>
        )}
        {cantP?.error && (
          <span className="text-red-400" title={cantP.error}>
            ⚠
          </span>
        )}
      </td>

      {/* Delete */}
      <td className="py-1 px-1">
        <button
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5 transition-opacity"
          onClick={() => onDelete(r)}
          title="Eliminar"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CATALOG SKU SELECTOR — Uses catApi.getProductos (same as inventory)
// Server-side search against vw_stock_realtime on Enter key
// Shows: nombre_completo, SKU, stock (identical to ServerProductCombobox)
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// INPUTS INLINE — Fórmulas naturales con paréntesis
// ═══════════════════════════════════════════════════════════════════

function InlineFormula({
  value,
  pvars,
  onSave,
  placeholder,
}: {
  value: string;
  pvars: FormulaVariables;
  onSave: (v: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  const [dirty, setDirty] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
    setDirty(false);
  }

  const validation = useMemo(
    () => (local ? validateFormula(local) : null),
    [local],
  );

  function commit() {
    if (dirty && local !== value) {
      onSave(local);
      setDirty(false);
    }
  }

  // Display formula naturally with all parentheses visible
  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        className={cn(
          "w-full bg-transparent border-b text-xs px-1 py-0.5 outline-none transition-all duration-200 rounded-sm focus:bg-white focus:ring-1 focus:ring-slate-900/10 focus:border-slate-300",
          dirty
            ? "border-slate-400 text-slate-900 font-medium bg-slate-50"
            : "border-transparent hover:border-slate-300",
          validation && !validation.valid && local
            ? "border-red-400 text-red-600"
            : "",
        )}
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          setDirty(true);
        }}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        placeholder={placeholder}
        spellCheck={false}
      />
      {dirty && <span className="text-blue-400 text-[8px] shrink-0">●</span>}
    </div>
  );
}

function InlineText({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  const [dirty, setDirty] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
    setDirty(false);
  }
  function commit() {
    if (dirty && local !== value && local.trim()) {
      onSave(local.trim());
      setDirty(false);
    }
  }
  return (
    <input
      type="text"
      className={cn(
        "w-full bg-transparent border-0 border-b text-xs px-0 py-0.5 outline-none transition-colors text-slate-600",
        dirty ? "border-blue-400" : "border-transparent hover:border-slate-300",
      )}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        setDirty(true);
      }}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
    />
  );
}

function InlineNumber({
  value,
  onSave,
}: {
  value: number;
  onSave: (v: number) => void;
}) {
  const [local, setLocal] = useState(String(value || ""));
  const [dirty, setDirty] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(String(value || ""));
    setDirty(false);
  }
  function commit() {
    const n = parseFloat(local) || 0;
    if (dirty && n !== value) {
      onSave(n);
      setDirty(false);
    }
  }
  return (
    <input
      type="text"
      className={cn(
        "w-full bg-transparent border-0 border-b text-xs px-0 py-0.5 outline-none transition-colors text-right font-mono",
        dirty ? "border-blue-400" : "border-transparent hover:border-slate-300",
      )}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        setDirty(true);
      }}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
      placeholder="0"
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// DIALOG AGREGAR COMPONENTE
// ═══════════════════════════════════════════════════════════════════

function AddDialog({
  open,
  seccion,
  mode,
  modelId,
  modelo,
  plantillas,
  variantes,
  pvars,
  onClose,
  onCreated,
}: {
  open: boolean;
  seccion: string;
  mode: "perfil" | "accesorio";
  modelId: string;
  modelo: RecetaModelo | null | undefined;
  plantillas: any[];
  variantes: any[];
  pvars: FormulaVariables;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToastHelper();
  const isPerfil = mode === "perfil";
  const secDef = SECCIONES.find((s) => s.key === seccion);

  const [form, setForm] = useState({
    nombre: "",
    plantilla: "",
    sku: "",
    formulaCant: "",
    formulaPerfil: "",
    angulo: 90,
    precio: "",
  });
  const [saving, setSaving] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm({
        nombre: "",
        plantilla: "",
        sku: "",
        formulaCant: "",
        formulaPerfil: "",
        angulo: 90,
        precio: "",
      });
    }
  }

  function up(k: string, v: any) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleAdd() {
    setSaving(true);
    try {
      let id_plantilla: string | null = null;
      let id_material: string | null = null;
      let id_acabado: string | null = null;
      let id_marca: string | null = null;
      let nombre = form.nombre;

      if (isPerfil) {
        id_plantilla = form.plantilla || null;
        nombre = nombre || form.plantilla;
      } else {
        if (form.sku) {
          const parts = form.sku.split("-");
          id_material = parts[0] || null;
          id_plantilla = parts[1] || null;
          id_acabado = parts[2] || null;
          id_marca = parts[3] || null;
          const v = variantes.find((vr: any) => vr.id_sku === form.sku);
          nombre = nombre || v?.nombre_completo || form.sku;
        }
      }

      const id = `${modelId}-${id_plantilla || "X"}-${Date.now()}`;
      await recetasApi.createRecetaLinea({
        id_receta: id,
        id_modelo: modelId,
        id_sistema: modelo?.id_sistema || null,
        id_plantilla,
        id_material_receta: id_material,
        id_acabado_receta: id_acabado,
        id_marca_receta: id_marca,
        nombre_componente: nombre || "Nuevo componente",
        tipo: isPerfil ? "Perfil" : "Accesorio",
        cantidad_base: 0,
        angulo: isPerfil ? form.angulo : 0,
        condicion: "BASE",
        formula_cantidad: form.formulaCant || null,
        formula_perfil: isPerfil ? form.formulaPerfil || null : null,
        seccion: seccion,
        orden_visual: 0,
        precio_unitario_manual: form.precio ? Number(form.precio) : null,
      });
      toast.success("Agregado", nombre || "Componente");
      onCreated();
    } catch (e: any) {
      toast.error("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isPerfil ? "Agregar Perfil" : "Agregar Accesorio"}
          </DialogTitle>
          <DialogDescription>
            Sección: {secDef?.icon && <secDef.icon className="h-3.5 w-3.5 inline-block mr-1 text-slate-500 mb-0.5" />} {secDef?.label}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {isPerfil ? (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-medium">Plantilla *</label>
                <PlantillaSelector
                  value={form.plantilla}
                  plantillas={plantillas}
                  onChange={(v) => up("plantilla", v)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium">
                  Nombre (opcional)
                </label>
                <Input
                  className="h-8 text-xs"
                  value={form.nombre}
                  onChange={(e) => up("nombre", e.target.value)}
                  placeholder="Ej: Riel Superior"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">F. Cantidad</label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={form.formulaCant}
                    onChange={(e) => up("formulaCant", e.target.value)}
                    placeholder="Ej: 2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">
                    F. Perfil (mm)
                  </label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={form.formulaPerfil}
                    onChange={(e) => up("formulaPerfil", e.target.value)}
                    placeholder="Ej: ancho-16"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">Ángulo</label>
                  <Select
                    value={String(form.angulo)}
                    onValueChange={(v) => up("angulo", Number(v))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90°</SelectItem>
                      <SelectItem value="45">45°</SelectItem>
                      <SelectItem value="0">0°</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-medium">
                  SKU del Catálogo *
                </label>
                <CatalogSkuSelector
                  value={form.sku}
                  onChange={(sku, producto) => {
                    up("sku", sku);
                    if (producto) {
                      up("nombre", producto.nombre_completo || "");
                      up("precio", String(producto.costo_mercado_unit || ""));
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">Descripción</label>
                  <Input
                    className="h-8 text-xs"
                    value={form.nombre}
                    onChange={(e) => up("nombre", e.target.value)}
                    placeholder="Auto-llenado del catálogo"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">Precio S/</label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-8 text-xs font-mono"
                    value={form.precio}
                    onChange={(e) => up("precio", e.target.value)}
                    placeholder="Del catálogo"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium">
                  Fórmula de Cantidad
                </label>
                <Input
                  className="h-8 text-xs font-mono"
                  value={form.formulaCant}
                  onChange={(e) => up("formulaCant", e.target.value)}
                  placeholder="Ej: hojas*2   ó   ((2*ancho)+(4*alto))/1000"
                />
                <p className="text-[9px] text-muted-foreground">
                  Variables: ancho, alto, hojas, crucesH, crucesV · Funciones:
                  ceil, floor, round, abs, min, max
                </p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={saving || (isPerfil ? !form.plantilla : !form.sku)}
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Plus className="h-3 w-3 mr-1" />
            )}{" "}
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
