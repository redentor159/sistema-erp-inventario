"use client";

import React, { useMemo } from "react";
import type { Tipologia, TipologiaCruce, CalculatedGridCell, TipologiaItem } from "@/types/tipologias";

interface GeneradorSVGProps {
    tipologia: Tipologia;
    cruces: TipologiaCruce[];
    items: TipologiaItem[];
    calculatedCells: CalculatedGridCell[];
    selectedItemId?: string | null;
    onCellDrop?: (colIndex: number, rowIndex: number, payload: any) => void;
    onItemClick?: (item: TipologiaItem) => void;
    onItemRemove?: (item: TipologiaItem) => void;
}

// Estilos de la Industria (CAD-like)
const COLORS = {
    marcoAluminio: "#e5e7eb", // gris claro metálico
    marcoBorde: "#9ca3af",
    vidrioFill: "#a8d5e5",
    vidrioStroke: "#7dd3fc",
    cotaLine: "#374151",
    cotaText: "#111827",
    simbologiaLine: "#64748b",
};

export function GeneradorSVG({
    tipologia,
    cruces,
    items,
    calculatedCells,
    selectedItemId,
    onCellDrop,
    onItemClick,
    onItemRemove,
}: GeneradorSVGProps) {
    const { ancho_total_mm, alto_total_mm } = tipologia;

    // 1. Configuración del ViewBox (Añadir márgenes para las cotas perimetrales)
    const margin = 300; // Margen dinámico generoso para dibujar textos y líneas por fuera
    const viewBoxWidth = ancho_total_mm + margin * 2;
    const viewBoxHeight = alto_total_mm + margin * 2;

    // Transformación para mover el origen (0,0) del marco principal dentro del ViewBox
    const originX = margin;
    const originY = margin;

    const ESPESOR_MARCO_EXTERIOR = 45;
    const ESPESOR_HOJA_INTERIOR = 35;

    // Estado para "hover" de las celdas durante drag and drop
    const [dragOverCell, setDragOverCell] = React.useState<number | null>(null);

    return (
        <svg
            className="w-full h-full drop-shadow-sm select-none"
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
        >
            <defs>
                {/* Patrones o gradientes para dar volumen al aluminio (Opcional, lo dejamos sólido por ahora para limpieza CAD) */}
                <marker id="tick" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <line x1="0" y1="10" x2="10" y2="0" stroke={COLORS.cotaLine} strokeWidth="15" />
                </marker>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.simbologiaLine} />
                </marker>
            </defs>

            {/* Todo el dibujo principal se desplaza según el originX, originY */}
            <g transform={`translate(${originX}, ${originY})`}>

                {/* ==========================================
            CAPA 1: MARCO EXTERIOR Y CRUCES (MULLIONS)
           ========================================== */}
                <g id="capa-1-estructura">
                    {/* Fondo o Hueco total */}
                    <rect
                        x={0}
                        y={0}
                        width={ancho_total_mm}
                        height={alto_total_mm}
                        fill="#ffffff"
                        stroke={COLORS.marcoBorde}
                        strokeWidth={1}
                    />

                    {/* Marco Exterior Geométrico (Simulado como un Path hueco o varios Rects perimetrales) */}
                    <rect x={0} y={0} width={ancho_total_mm} height={ESPESOR_MARCO_EXTERIOR} fill={COLORS.marcoAluminio} stroke={COLORS.marcoBorde} strokeWidth="2" />
                    <rect x={0} y={alto_total_mm - ESPESOR_MARCO_EXTERIOR} width={ancho_total_mm} height={ESPESOR_MARCO_EXTERIOR} fill={COLORS.marcoAluminio} stroke={COLORS.marcoBorde} strokeWidth="2" />
                    <rect x={0} y={0} width={ESPESOR_MARCO_EXTERIOR} height={alto_total_mm} fill={COLORS.marcoAluminio} stroke={COLORS.marcoBorde} strokeWidth="2" />
                    <rect x={ancho_total_mm - ESPESOR_MARCO_EXTERIOR} y={0} width={ESPESOR_MARCO_EXTERIOR} height={alto_total_mm} fill={COLORS.marcoAluminio} stroke={COLORS.marcoBorde} strokeWidth="2" />

                    {/* Perfiles Divisorios (Cruces) */}
                    {cruces.map((cruce) => {
                        const esVertical = cruce.tipo_eje === "X";

                        // Calculamos el inicio restando la mitad del espesor para que la cota quede al centro
                        const xOffset = esVertical ? cruce.distancia_desde_origen_mm - cruce.espesor_perfil_mm / 2 : 0;
                        const yOffset = !esVertical ? cruce.distancia_desde_origen_mm - cruce.espesor_perfil_mm / 2 : 0;

                        const w = esVertical ? cruce.espesor_perfil_mm : ancho_total_mm;
                        const h = !esVertical ? cruce.espesor_perfil_mm : alto_total_mm;

                        return (
                            <rect
                                key={cruce.id}
                                x={xOffset}
                                y={yOffset}
                                width={w}
                                height={h}
                                fill={COLORS.marcoAluminio}
                                stroke={COLORS.marcoBorde}
                                strokeWidth="2"
                            />
                        );
                    })}
                </g>

                {/* ==========================================
            CAPA 2: GRID BASE (Drop Targets)
           ========================================== */}
                <g id="capa-2-celdas-base">
                    {calculatedCells.map((cell, idx) => {
                        // Para dibujar dentro del hueco neto, usamos x_start + espesores adyacentes correspondientes.
                        // Offset X del espacio interior (hueco)
                        let interiorX = cell.x_start_mm;
                        if (cell.colIndex === 1) interiorX += ESPESOR_MARCO_EXTERIOR;
                        else {
                            const cruceIzq = cruces.find(c => c.tipo_eje === 'X' && c.distancia_desde_origen_mm === cell.x_start_mm);
                            if (cruceIzq) interiorX += cruceIzq.espesor_perfil_mm / 2;
                        }

                        // Offset Y del espacio interior (hueco)
                        let interiorY = cell.y_start_mm;
                        if (cell.rowIndex === 1) interiorY += ESPESOR_MARCO_EXTERIOR;
                        else {
                            const cruceSup = cruces.find(c => c.tipo_eje === 'Y' && c.distancia_desde_origen_mm === cell.y_start_mm);
                            if (cruceSup) interiorY += cruceSup.espesor_perfil_mm / 2;
                        }

                        // Dimensiones netas ajustadas si tocan los marcos exteriores
                        let wNetoReal = cell.width_neto_mm;
                        if (cell.colIndex === 1) wNetoReal -= ESPESOR_MARCO_EXTERIOR;
                        if (cell.x_start_mm + cell.width_bruto_mm >= ancho_total_mm) wNetoReal -= ESPESOR_MARCO_EXTERIOR;

                        let hNetoReal = cell.height_neto_mm;
                        if (cell.rowIndex === 1) hNetoReal -= ESPESOR_MARCO_EXTERIOR;
                        if (cell.y_start_mm + cell.height_bruto_mm >= alto_total_mm) hNetoReal -= ESPESOR_MARCO_EXTERIOR;

                        const isHovered = dragOverCell === idx;

                        return (
                            <g
                                key={`cell-${idx}`}
                                transform={`translate(${interiorX}, ${interiorY})`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (dragOverCell !== idx) setDragOverCell(idx);
                                }}
                                onDragLeave={() => {
                                    if (dragOverCell === idx) setDragOverCell(null);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverCell(null);
                                    const rawData = e.dataTransfer.getData("application/json");
                                    if (rawData && onCellDrop) {
                                        try {
                                            const payload = JSON.parse(rawData);
                                            onCellDrop(cell.colIndex, cell.rowIndex, payload);
                                        } catch (err) {
                                            console.error("Invalid drag payload", err);
                                        }
                                    }
                                }}
                            >
                                {/* Capa Base: Fondo de Celda con Highlight si esta Draggeando */}
                                <rect
                                    x={0}
                                    y={0}
                                    width={wNetoReal}
                                    height={hNetoReal}
                                    fill={isHovered ? "#e0f2fe" : "transparent"}
                                    className="transition-colors duration-200"
                                />
                            </g>
                        );
                    })}
                </g>

                {/* ==========================================
            CAPA 3 & 4: HOJAS Y VIDRIOS (ITEMS SPANNING)
           ========================================== */}
                <g id="capa-3-4-items-asignados">
                    {items.map((item) => {
                        // 1. Encontrar la celda de inicio (Top-Left)
                        const startCell = calculatedCells.find(c => c.colIndex === item.grid_col_start && c.rowIndex === item.grid_row_start);
                        if (!startCell) return null;

                        // 2. Encontrar la celda de fin (Bottom-Right basado en el span)
                        const endCol = item.grid_col_start + item.grid_col_span - 1;
                        const endRow = item.grid_row_start + item.grid_row_span - 1;
                        const endCell = calculatedCells.find(c => c.colIndex === endCol && c.rowIndex === endRow) || startCell;

                        // 3. Determinar tipo de apertura y configuración
                        type AperturaMock = "Corrediza" | "Fijo" | "Proyectante" | "Fijo_Sin_Marco";

                        let tipoApertura: AperturaMock = "Fijo";
                        let numHojas = 1;
                        let configuracion = "F";

                        const isCorrediza = item.tipo_dibujo === 'Corrediza' || (!item.tipo_dibujo && (item.tipo_apertura?.toLowerCase().includes("corrediza") || item.producto_id?.includes("S")));
                        const isProyectante = item.tipo_dibujo === 'Proyectante' || item.tipo_dibujo === 'Batiente' || (!item.tipo_dibujo && (item.tipo_apertura?.toLowerCase().includes("proyectante") || item.producto_id?.includes("3831") || item.producto_id?.includes("42")));
                        const isFijoSM = item.tipo_dibujo === 'Fijo_Sin_Marco' || (!item.tipo_dibujo && (item.producto_id?.includes("FSM") || item.tipo_apertura?.includes("Sin Marco")));

                        if (isCorrediza) {
                            tipoApertura = "Corrediza";
                            configuracion = item.configuracion_hojas || "CC";
                            numHojas = configuracion.length;
                        } else if (isProyectante) {
                            tipoApertura = "Proyectante";
                            numHojas = 1;
                            configuracion = item.configuracion_hojas || "P_SUP";
                        } else if (isFijoSM) {
                            tipoApertura = "Fijo_Sin_Marco";
                            numHojas = 1;
                            configuracion = "FSM";
                        } else {
                            tipoApertura = "Fijo";
                            numHojas = 1;
                            configuracion = "F";
                        }

                        // 4. Calcular el Bounding Box Total (Hueco Neto Expandido)
                        let interiorX = startCell.x_start_mm;
                        if (startCell.colIndex === 1) interiorX += ESPESOR_MARCO_EXTERIOR;
                        else {
                            const cruceIzq = cruces.find(c => c.tipo_eje === 'X' && c.distancia_desde_origen_mm === startCell.x_start_mm);
                            if (cruceIzq) interiorX += cruceIzq.espesor_perfil_mm / 2;
                        }

                        let interiorY = startCell.y_start_mm;
                        if (startCell.rowIndex === 1) interiorY += ESPESOR_MARCO_EXTERIOR;
                        else {
                            const cruceSup = cruces.find(c => c.tipo_eje === 'Y' && c.distancia_desde_origen_mm === startCell.y_start_mm);
                            if (cruceSup) interiorY += cruceSup.espesor_perfil_mm / 2;
                        }

                        // Ancho Total = X final de la celda fin - X de inicio de esta celda
                        let spanWidthBruto = (endCell.x_start_mm + endCell.width_bruto_mm) - startCell.x_start_mm;
                        let wNetoReal = spanWidthBruto;

                        // Restar el descuento izquierdo de la primer celda
                        if (startCell.colIndex === 1) wNetoReal -= ESPESOR_MARCO_EXTERIOR;
                        else {
                            const cruceIzq = cruces.find(c => c.tipo_eje === 'X' && c.distancia_desde_origen_mm === startCell.x_start_mm);
                            if (cruceIzq) wNetoReal -= cruceIzq.espesor_perfil_mm / 2;
                        }

                        // Restar el descuento derecho de la celda final
                        if ((endCell.x_start_mm + endCell.width_bruto_mm) >= ancho_total_mm) wNetoReal -= ESPESOR_MARCO_EXTERIOR;
                        else {
                            const cruceDer = cruces.find(c => c.tipo_eje === 'X' && c.distancia_desde_origen_mm === (endCell.x_start_mm + endCell.width_bruto_mm));
                            if (cruceDer) wNetoReal -= cruceDer.espesor_perfil_mm / 2;
                        }


                        // Alto Total
                        let spanHeightBruto = (endCell.y_start_mm + endCell.height_bruto_mm) - startCell.y_start_mm;
                        let hNetoReal = spanHeightBruto;

                        if (startCell.rowIndex === 1) hNetoReal -= ESPESOR_MARCO_EXTERIOR;
                        else {
                            const cruceSup = cruces.find(c => c.tipo_eje === 'Y' && c.distancia_desde_origen_mm === startCell.y_start_mm);
                            if (cruceSup) hNetoReal -= cruceSup.espesor_perfil_mm / 2;
                        }

                        if ((endCell.y_start_mm + endCell.height_bruto_mm) >= alto_total_mm) hNetoReal -= ESPESOR_MARCO_EXTERIOR;
                        else {
                            const cruceInf = cruces.find(c => c.tipo_eje === 'Y' && c.distancia_desde_origen_mm === (endCell.y_start_mm + endCell.height_bruto_mm));
                            if (cruceInf) hNetoReal -= cruceInf.espesor_perfil_mm / 2;
                        }

                        return (
                            <g
                                key={`item-${item.id}`}
                                transform={`translate(${interiorX}, ${interiorY})`}
                                onClick={() => onItemClick && onItemClick(item)}
                                className="cursor-pointer group"
                            >
                                {/* Fondo invisible para capturar clicks de expansión en todo el marco */}
                                <rect x={0} y={0} width={wNetoReal} height={hNetoReal} fill="transparent" />

                                {/* Capas 2, 3 y 4: Hojas, Vidrios y Simbología Visual */}
                                {tipoApertura === 'Fijo_Sin_Marco' ? (
                                    <g>
                                        <rect
                                            x={0} y={0} width={wNetoReal} height={hNetoReal}
                                            fill={COLORS.vidrioFill} fillOpacity="0.4" stroke={COLORS.vidrioStroke} strokeWidth="1"
                                        />
                                        {/* Cruces Internos */}
                                        {Array.from({ length: item.cruces_verticales || 0 }).map((_, cv) => {
                                            const xPos = (wNetoReal / ((item.cruces_verticales || 0) + 1)) * (cv + 1);
                                            return <rect key={`cv-${cv}`} x={xPos - 5} y={0} width={10} height={hNetoReal} fill={COLORS.marcoAluminio} stroke={COLORS.marcoBorde} strokeWidth="1" />;
                                        })}
                                        {Array.from({ length: item.cruces_horizontales || 0 }).map((_, ch) => {
                                            const yPos = (hNetoReal / ((item.cruces_horizontales || 0) + 1)) * (ch + 1);
                                            return <rect key={`ch-${ch}`} x={0} y={yPos - 5} width={wNetoReal} height={10} fill={COLORS.marcoAluminio} stroke={COLORS.marcoBorde} strokeWidth="1" />;
                                        })}
                                    </g>
                                ) : (
                                    Array.from({ length: numHojas }).map((_, i) => {
                                        const hojaWidth = wNetoReal / numHojas;
                                        const hX = i * hojaWidth;
                                        const confType = configuracion[i] || "C";

                                        // Flecha condicional
                                        let isRightArrow = i % 2 === 0;
                                        if (configuracion === 'FCCF') {
                                            isRightArrow = i === 2; // OXXO: La hoja 1 (izda) va a la izda (isRight=false), la 2 (dcha) va a la dcha (isRight=true)
                                        }

                                        return (
                                            <g key={`hoja-${i}`} transform={`translate(${hX}, 0)`}>
                                                {/* Marco de la hoja */}
                                                <rect
                                                    x={0} y={0} width={hojaWidth} height={hNetoReal}
                                                    fill={COLORS.marcoAluminio} stroke={COLORS.marcoBorde} strokeWidth="1.5"
                                                    className="group-hover:stroke-blue-500 transition-colors"
                                                />

                                                {/* 45 grados cuts */}
                                                <line x1={0} y1={0} x2={ESPESOR_HOJA_INTERIOR} y2={ESPESOR_HOJA_INTERIOR} stroke={COLORS.marcoBorde} strokeWidth="1" />
                                                <line x1={hojaWidth} y1={0} x2={hojaWidth - ESPESOR_HOJA_INTERIOR} y2={ESPESOR_HOJA_INTERIOR} stroke={COLORS.marcoBorde} strokeWidth="1" />
                                                <line x1={0} y1={hNetoReal} x2={ESPESOR_HOJA_INTERIOR} y2={hNetoReal - ESPESOR_HOJA_INTERIOR} stroke={COLORS.marcoBorde} strokeWidth="1" />
                                                <line x1={hojaWidth} y1={hNetoReal} x2={hojaWidth - ESPESOR_HOJA_INTERIOR} y2={hNetoReal - ESPESOR_HOJA_INTERIOR} stroke={COLORS.marcoBorde} strokeWidth="1" />

                                                {/* Vidrio */}
                                                <rect
                                                    x={ESPESOR_HOJA_INTERIOR} y={ESPESOR_HOJA_INTERIOR}
                                                    width={Math.max(0, hojaWidth - ESPESOR_HOJA_INTERIOR * 2)}
                                                    height={Math.max(0, hNetoReal - ESPESOR_HOJA_INTERIOR * 2)}
                                                    fill={COLORS.vidrioFill} fillOpacity="0.4" stroke={COLORS.vidrioStroke} strokeWidth="1"
                                                />

                                                {/* Cruces Internos en el Sash */}
                                                {Array.from({ length: item.cruces_verticales || 0 }).map((_, cv) => {
                                                    const cols = (item.cruces_verticales || 0) + 1;
                                                    const xPos = ESPESOR_HOJA_INTERIOR + ((hojaWidth - ESPESOR_HOJA_INTERIOR * 2) / cols) * (cv + 1);
                                                    return <rect key={`cv-${cv}`} x={xPos - 5} y={ESPESOR_HOJA_INTERIOR} width={10} height={hNetoReal - ESPESOR_HOJA_INTERIOR * 2} fill={COLORS.marcoAluminio} stroke={COLORS.marcoBorde} strokeWidth="1" />;
                                                })}
                                                {Array.from({ length: item.cruces_horizontales || 0 }).map((_, ch) => {
                                                    const rows = (item.cruces_horizontales || 0) + 1;
                                                    const yPos = ESPESOR_HOJA_INTERIOR + ((hNetoReal - ESPESOR_HOJA_INTERIOR * 2) / rows) * (ch + 1);
                                                    return <rect key={`ch-${ch}`} x={ESPESOR_HOJA_INTERIOR} y={yPos - 5} width={hojaWidth - ESPESOR_HOJA_INTERIOR * 2} height={10} fill={COLORS.marcoAluminio} stroke={COLORS.marcoBorde} strokeWidth="1" />;
                                                })}

                                                {/* Flechas de movimiento (Corrediza) */}
                                                {tipoApertura === 'Corrediza' && confType === 'C' && (
                                                    <g transform={`translate(${hojaWidth / 2}, ${hNetoReal / 2}) scale(2)`}>
                                                        {isRightArrow ? (
                                                            <path d="M-15,-8 L5,-8 L5,-16 L20,0 L5,16 L5,8 L-15,8 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
                                                        ) : (
                                                            <path d="M15,-8 L-5,-8 L-5,-16 L-20,0 L-5,16 L-5,8 L15,8 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
                                                        )}
                                                    </g>
                                                )}

                                                {/* Fijo cruzado */}
                                                {(tipoApertura === 'Fijo' || confType === 'F') && (
                                                    <g stroke={COLORS.simbologiaLine} strokeWidth="1" strokeDasharray="5 5">
                                                        <line x1={ESPESOR_HOJA_INTERIOR} y1={ESPESOR_HOJA_INTERIOR} x2={hojaWidth - ESPESOR_HOJA_INTERIOR} y2={hNetoReal - ESPESOR_HOJA_INTERIOR} />
                                                        <line x1={hojaWidth - ESPESOR_HOJA_INTERIOR} y1={ESPESOR_HOJA_INTERIOR} x2={ESPESOR_HOJA_INTERIOR} y2={hNetoReal - ESPESOR_HOJA_INTERIOR} />
                                                    </g>
                                                )}

                                                {/* Proyectante / Batiente */}
                                                {tipoApertura === 'Proyectante' && (
                                                    <path
                                                        d={
                                                            confType === 'P_INF'
                                                                ? `M${ESPESOR_HOJA_INTERIOR},${hNetoReal - ESPESOR_HOJA_INTERIOR} L${hojaWidth / 2},${ESPESOR_HOJA_INTERIOR} L${hojaWidth - ESPESOR_HOJA_INTERIOR},${hNetoReal - ESPESOR_HOJA_INTERIOR}` // Base abajo, Vértice arriba (Banderola/Invertida)
                                                                : configuracion === 'B_IZQ'
                                                                    ? `M${ESPESOR_HOJA_INTERIOR},${ESPESOR_HOJA_INTERIOR} L${hojaWidth - ESPESOR_HOJA_INTERIOR},${hNetoReal / 2} L${ESPESOR_HOJA_INTERIOR},${hNetoReal - ESPESOR_HOJA_INTERIOR}` // Base izq, vértice dcha
                                                                    : configuracion === 'B_DER'
                                                                        ? `M${hojaWidth - ESPESOR_HOJA_INTERIOR},${ESPESOR_HOJA_INTERIOR} L${ESPESOR_HOJA_INTERIOR},${hNetoReal / 2} L${hojaWidth - ESPESOR_HOJA_INTERIOR},${hNetoReal - ESPESOR_HOJA_INTERIOR}` // Base dcha, vértice izq
                                                                        : `M${ESPESOR_HOJA_INTERIOR},${ESPESOR_HOJA_INTERIOR} L${hojaWidth / 2},${hNetoReal - ESPESOR_HOJA_INTERIOR} L${hojaWidth - ESPESOR_HOJA_INTERIOR},${ESPESOR_HOJA_INTERIOR}` // Base arriba, vértice abajo (Proyectante normal P_SUP)
                                                        }
                                                        fill="none" stroke={COLORS.simbologiaLine} strokeWidth="2" strokeDasharray="8 8"
                                                    />
                                                )}
                                            </g>
                                        );
                                    })
                                )}

                                {/* Botón visible al Hover para borrar explícitamente */}
                                {onItemRemove && (
                                    <g
                                        transform={`translate(${wNetoReal - 40}, 8)`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onItemRemove(item);
                                        }}
                                        className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <rect x={0} y={0} width={32} height={32} rx={6} fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" />
                                        <line x1={8} y1={8} x2={24} y2={24} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                        <line x1={24} y1={8} x2={8} y2={24} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                    </g>
                                )}

                                {/* Highlight Item Seleccionado */}
                                {selectedItemId === item.id && (
                                    <rect
                                        x={0} y={0} width={wNetoReal} height={hNetoReal}
                                        fill="none" stroke="#2563eb" strokeWidth="4"
                                        pointerEvents="none"
                                        className="animate-pulse"
                                    />
                                )}
                            </g>
                        );
                    })}
                </g>

                {/* ==========================================
            SISTEMA DE COTAS PERIMETRALES (DIMENSIONING)
           ========================================== */}
                <g id="cotas-perimetrales" className="font-mono text-4xl">

                    {/* COTA CERO: TOTAL ANCHO (Arriba) */}
                    <line x1={0} y1={-150} x2={ancho_total_mm} y2={-150} stroke={COLORS.cotaLine} strokeWidth="3" markerStart="url(#tick)" markerEnd="url(#tick)" />
                    {/* Lineas guias */}
                    <line x1={0} y1={-160} x2={0} y2={-10} stroke={COLORS.cotaLine} strokeWidth="1" strokeDasharray="5 5" />
                    <line x1={ancho_total_mm} y1={-160} x2={ancho_total_mm} y2={-10} stroke={COLORS.cotaLine} strokeWidth="1" strokeDasharray="5 5" />
                    {/* Texto de la cota */}
                    <text x={ancho_total_mm / 2} y={-170} fill={COLORS.cotaText} textAnchor="middle" fontWeight="bold">
                        {ancho_total_mm} mm
                    </text>

                    {/* COTA TOTAL ALTO (Izquierda) */}
                    <line x1={-150} y1={0} x2={-150} y2={alto_total_mm} stroke={COLORS.cotaLine} strokeWidth="3" markerStart="url(#tick)" markerEnd="url(#tick)" />
                    <line x1={-160} y1={0} x2={-10} y2={0} stroke={COLORS.cotaLine} strokeWidth="1" strokeDasharray="5 5" />
                    <line x1={-160} y1={alto_total_mm} x2={-10} y2={alto_total_mm} stroke={COLORS.cotaLine} strokeWidth="1" strokeDasharray="5 5" />

                    {/* Rotar texto de altura */}
                    <g transform={`translate(-170, ${alto_total_mm / 2}) rotate(-90)`}>
                        <text x={0} y={0} fill={COLORS.cotaText} textAnchor="middle" fontWeight="bold">
                            {alto_total_mm} mm
                        </text>
                    </g>

                    {/* COTAS PARCIALES (Cruces X) dibujadas abajo */}
                    {(() => {
                        const lineasX = [0, ...cruces.filter(c => c.tipo_eje === 'X').sort((a, b) => a.distancia_desde_origen_mm - b.distancia_desde_origen_mm).map(c => c.distancia_desde_origen_mm), ancho_total_mm];
                        const cotasComponentes = [];
                        for (let i = 0; i < lineasX.length - 1; i++) {
                            const xStart = lineasX[i];
                            const xEnd = lineasX[i + 1];
                            const dist = xEnd - xStart;
                            const mid = xStart + dist / 2;

                            cotasComponentes.push(
                                <g key={`cota-partial-x-${i}`}>
                                    <line x1={xStart} y1={alto_total_mm + 100} x2={xEnd} y2={alto_total_mm + 100} stroke={COLORS.cotaLine} strokeWidth="2" markerStart="url(#tick)" markerEnd="url(#tick)" />
                                    <line x1={xStart} y1={alto_total_mm + 10} x2={xStart} y2={alto_total_mm + 110} stroke={COLORS.cotaLine} strokeWidth="1" strokeDasharray="5 5" />
                                    <text x={mid} y={alto_total_mm + 140} fill={COLORS.cotaText} textAnchor="middle" fontSize="32px">
                                        {dist}
                                    </text>
                                </g>
                            );
                        }
                        // Ultima linea guia derecha
                        cotasComponentes.push(<line key="cota-partial-end" x1={ancho_total_mm} y1={alto_total_mm + 10} x2={ancho_total_mm} y2={alto_total_mm + 110} stroke={COLORS.cotaLine} strokeWidth="1" strokeDasharray="5 5" />);
                        return cotasComponentes;
                    })()}

                </g>
            </g>
        </svg>
    );
}
