"use client"

import { useState } from "react"
import { RecipeModelList } from "./recipe-model-list"
import { RecipeEditor } from "./recipe-editor"

export function RecipeEditorPage() {
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null)

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-4">
            {/* Page Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">📐 Editor de Recetas</h1>
                    <p className="text-muted-foreground">
                        Gestiona las recetas de ingeniería — edita todos los campos, fórmulas y vínculos SKU.
                    </p>
                </div>
            </div>

            {/* Two-Panel Layout — full width */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-3 min-h-0">
                {/* Left Panel: Model List */}
                <div className="border rounded-lg bg-white overflow-hidden flex flex-col">
                    <RecipeModelList
                        selectedModelId={selectedModelId}
                        onSelectModel={(id) => setSelectedModelId(id || null)}
                    />
                </div>

                {/* Right Panel: Recipe Editor — fills all available space */}
                <div className="border rounded-lg bg-white overflow-hidden flex flex-col">
                    <RecipeEditor modelId={selectedModelId || ""} />
                </div>
            </div>
        </div>
    )
}
