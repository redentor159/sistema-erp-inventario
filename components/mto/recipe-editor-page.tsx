"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { RecipeModelList } from "./recipe-model-list";
import { RecipeEditor } from "./recipe-editor";
import { RecipeMassAudit } from "./recipe-mass-audit";

export function RecipeEditorPage() {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ruler className="h-6 w-6 text-slate-600" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Editor de Recetas
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Gestiona las recetas de ingeniería — edita todos los campos,
            fórmulas y vínculos SKU.
          </p>
        </div>
        <RecipeMassAudit onNavigate={(id) => setSelectedModelId(id || null)} />
      </div>

      {/* Two-Panel Layout — full width */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 min-h-0">
        {/* Left Panel: Model List */}
        <div className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden flex flex-col">
          <RecipeModelList
            selectedModelId={selectedModelId}
            onSelectModel={(id) => setSelectedModelId(id || null)}
          />
        </div>

        {/* Right Panel: Recipe Editor — fills all available space */}
        <div className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden flex flex-col">
          <RecipeEditor modelId={selectedModelId || ""} />
        </div>
      </div>
    </div>
  );
}
