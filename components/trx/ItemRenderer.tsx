"use client";

import React from "react";

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

interface ItemRendererProps {
    anchoMm: number;
    altoMm: number;
    colorCode: string;
    tipoDibujo: string;
    configHojas: string;
    showCotas?: boolean;
    etiqueta?: string;
    className?: string;
}

const ACABADO_COLORS: Record<string, string> = {
    BLA: "#FFFFFF",
    CHA: "#D2C5B4", // Champagna más sutil
    MAD: "#8B5A2B",
    MAT: "#D0D0D0",
    NEG: "#2B2B2B", // Negro mate, no puro
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ItemRenderer({
    anchoMm,
    altoMm,
    colorCode,
    tipoDibujo,
    configHojas,
    showCotas = true,
    etiqueta,
    className = "",
}: ItemRendererProps) {
    if (!anchoMm || !altoMm || anchoMm <= 0 || altoMm <= 0) {
        return (
            <div className={`flex items-center justify-center text-xs text-muted-foreground ${className}`}>
                Ingrese dimensiones
            </div>
        );
    }

    // DIMENSIONES BASE Y ESCALA
    const scale = 300 / Math.max(anchoMm, altoMm);
    const drawW = anchoMm * scale;
    const drawH = altoMm * scale;
    const pad = showCotas ? 45 : 5;
    const viewBoxW = drawW + pad * 2;
    const viewBoxH = drawH + pad * 2;

    const baseColor = ACABADO_COLORS[colorCode] || ACABADO_COLORS.MAT;
    const isDark = colorCode === "NEG";
    const strokeColor = isDark ? "#111111" : "#777777";
    const innerStrokeColor = isDark ? "#333333" : "#AAAAAA";

    // Analizar hojas
    const config = configHojas ? configHojas.toUpperCase() : "F";
    const hojas = config.split("");
    const numHojas = hojas.length || 1;

    // GROSORES VISUALES (MÁS FINOS Y ESTÉTICOS)
    // Marco exterior más fino
    const marcoW = Math.min(10, drawW * 0.04);
    // Marco de hoja más fino
    const hojaW_grosor = Math.min(8, drawW * 0.035);

    const zX = pad + marcoW;
    const zY = pad + marcoW;
    const zW = drawW - marcoW * 2;
    const zH = drawH - marcoW * 2;
    const anchoHoja = zW / numHojas;

    // ============================================================================
    // LÓGICA DE APERTURAS (FLECHAS) Y CIERRES
    // ============================================================================
    // Determina la dirección de apertura y lado del tirador según esquema
    const getCapaLogica = (index: number) => {
        const tipo = hojas[index];
        if (tipo !== "C") return null;

        let direction: "left" | "right" = "right";
        let handleSide: "left" | "right" = "left"; // Donde va el cierre rojo/negro

        if (numHojas === 2) {
            // Esquema D o CC: la hoja izq abre a la derecha, la der a la izquierda.
            // Los tiradores están en el lado exterior
            if (index === 0) { direction = "right"; handleSide = "left"; }
            if (index === 1) { direction = "left"; handleSide = "right"; }
        } else if (numHojas === 4) {
            if (config === "FCCF" || config === "CCCC") {
                // Las hojas centrales abren hacia afuera (hacia los fijos laterales)
                // Es decir, izq-centro abre a la IZQUIERDA. der-centro abre a la DERECHA.
                // Los tiradores están en el centro (donde se encuentran).
                if (index === 0) { direction = "right"; handleSide = "left"; } // Si 1 es corrediza
                if (index === 1) { direction = "left"; handleSide = "right"; } // Centro Izq
                if (index === 2) { direction = "right"; handleSide = "left"; } // Centro Der
                if (index === 3) { direction = "left"; handleSide = "right"; } // Si 4 es corrediza
            } else {
                // Por defecto 4 hojas "todas móviles" (Esquema F)
                const isRightHalf = index >= numHojas / 2;
                direction = isRightHalf ? "left" : "right";
                handleSide = isRightHalf ? "right" : "left";
            }
        } else if (numHojas === 3) {
            // FCF: la central abre hacia el lado que tenga la cerradura (asumimos derecha)
            if (index === 0) { direction = "right"; handleSide = "left"; }
            if (index === 1) { direction = "right"; handleSide = "left"; } // central
            if (index === 2) { direction = "left"; handleSide = "right"; }
        } else {
            // Fallback genérico
            const isRightHalf = index >= numHojas / 2;
            direction = isRightHalf ? "left" : "right";
            handleSide = isRightHalf ? "right" : "left";
        }

        return { direction, handleSide };
    };

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <svg
                viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
                style={{ maxWidth: "100%", maxHeight: "100%", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" }}
            >
                <defs>
                    <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.85" />
                        <stop offset="35%" stopColor="#e0f2fe" stopOpacity="0.4" />
                        <stop offset="42%" stopColor="#ffffff" stopOpacity="0.9" /> {/* Brillo más fino */}
                        <stop offset="48%" stopColor="#bae6fd" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.4" />
                    </linearGradient>

                    <filter id="innerDepth">
                        <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25" />
                    </filter>

                    <filter id="softShadow">
                        <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#000" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* ==================== CAPA 1: MARCO EXTERIOR ==================== */}
                <g id="marco-exterior">
                    {/* Contorno perimetral */}
                    <rect x={pad} y={pad} width={drawW} height={drawH} fill={baseColor} stroke={strokeColor} strokeWidth="1" />

                    {/* Hueco donde van las hojas, con sombra para dar profundidad */}
                    <rect x={zX} y={zY} width={zW} height={zH} fill="none" stroke={innerStrokeColor} strokeWidth="1" filter="url(#innerDepth)" />

                    {/* Cortes a 45 grados (ingles) del marco exterior */}
                    <g stroke={strokeColor} strokeWidth="0.5" strokeOpacity="0.7">
                        <line x1={pad} y1={pad} x2={zX} y2={zY} />
                        <line x1={pad + drawW} y1={pad} x2={zX + zW} y2={zY} />
                        <line x1={pad} y1={pad + drawH} x2={zX} y2={zY + zH} />
                        <line x1={pad + drawW} y1={pad + drawH} x2={zX + zW} y2={zY + zH} />
                    </g>
                </g>

                {/* ==================== CAPAS 2-4: HOJAS Y CRISTALES ==================== */}
                <g id="hojas">
                    {hojas.map((tipo, i) => {
                        const hX = zX + i * anchoHoja;
                        const cX = hX + hojaW_grosor;
                        const cY = zY + hojaW_grosor;
                        const cW = anchoHoja - hojaW_grosor * 2;
                        const cH = zH - hojaW_grosor * 2;
                        const logica = getCapaLogica(i);

                        return (
                            <g key={`hoja-${i}`}>
                                {/* Perfil de la Hoja */}
                                <rect
                                    x={hX} y={zY} width={anchoHoja} height={zH}
                                    fill={baseColor} stroke={strokeColor} strokeWidth="0.5"
                                />
                                {/* Hueco del cristal en la hoja */}
                                <rect
                                    x={cX} y={cY} width={cW} height={cH}
                                    fill="#ffffff" stroke={innerStrokeColor} strokeWidth="1"
                                />

                                {/* Cortes a 45 grados de la hoja */}
                                <g stroke={innerStrokeColor} strokeWidth="0.5">
                                    <line x1={hX} y1={zY} x2={cX} y2={cY} />
                                    <line x1={hX + anchoHoja} y1={zY} x2={cX + cW} y2={cY} />
                                    <line x1={hX} y1={zY + zH} x2={cX} y2={cY + cH} />
                                    <line x1={hX + anchoHoja} y1={zY + zH} x2={cX + cW} y2={cY + cH} />
                                </g>

                                {/* Cristal translúcido con gradiente */}
                                {cW > 0 && cH > 0 && (
                                    <rect x={cX} y={cY} width={cW} height={cH} fill="url(#glassGradient)" stroke="#cbd5e1" strokeWidth="0.5" />
                                )}

                                {/* Simbología Central (Flechas y Cruces) */}
                                {cW > 0 && cH > 0 && (() => {
                                    const centerX = cX + cW / 2;
                                    const centerY = cY + cH / 2;

                                    if (tipo === "C" && logica) {
                                        // FLECHA ROJA PROFESIONAL (Estilo catálogo)
                                        const arrowW = Math.min(cW * 0.45, 40);
                                        const arrowH = Math.min(cH * 0.12, 14);
                                        const arrowColor = "#ef4444"; // Rojo vibrante típico de catálogos

                                        // Cierre Embutido (Tirador negro en el perfil lateral)
                                        const handleW = 4;
                                        const handleH = Math.min(cH * 0.15, 30);
                                        const handleY = centerY - handleH / 2;

                                        return (
                                            <g>
                                                {/* Flecha indicadora de apertura */}
                                                {logica.direction === "right" ? (
                                                    <g filter="url(#softShadow)" transform={`translate(${centerX - arrowW / 2}, ${centerY})`}>
                                                        <rect x="0" y={-arrowH / 4} width={arrowW - arrowH / 2} height={arrowH / 2} fill={arrowColor} />
                                                        <polygon points={`${arrowW - arrowH / 2},${-arrowH / 1.5} ${arrowW},0 ${arrowW - arrowH / 2},${arrowH / 1.5}`} fill={arrowColor} strokeLinejoin="round" />
                                                    </g>
                                                ) : (
                                                    <g filter="url(#softShadow)" transform={`translate(${centerX - arrowW / 2}, ${centerY})`}>
                                                        <polygon points={`${arrowH / 2},${-arrowH / 1.5} 0,0 ${arrowH / 2},${arrowH / 1.5}`} fill={arrowColor} strokeLinejoin="round" />
                                                        <rect x={arrowH / 2} y={-arrowH / 4} width={arrowW - arrowH / 2} height={arrowH / 2} fill={arrowColor} />
                                                    </g>
                                                )}

                                                {/* Cierre Embutido (Tirador) */}
                                                {logica.handleSide === "left" ? (
                                                    <rect x={hX + 3} y={handleY} width={handleW} height={handleH} fill="#111" rx="2" filter="url(#softShadow)" />
                                                ) : (
                                                    <rect x={hX + anchoHoja - handleW - 3} y={handleY} width={handleW} height={handleH} fill="#111" rx="2" filter="url(#softShadow)" />
                                                )}
                                            </g>
                                        );
                                    } else if (tipo === "F") {
                                        // CRUZ FINA GRIS PÁLIDO
                                        return (
                                            <g stroke="#94a3b8" strokeWidth="0.75" opacity="0.6">
                                                <line x1={cX} y1={cY} x2={cX + cW} y2={cY + cH} />
                                                <line x1={cX + cW} y1={cY} x2={cX} y2={cY + cH} />
                                            </g>
                                        );
                                    } else if (tipo === "P") {
                                        // PROYECTANTE (Triángulo con vértice arriba)
                                        return (
                                            <polygon
                                                points={`${cX},${cY + cH} ${cX + cW},${cY + cH} ${centerX},${cY}`}
                                                fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5,3" opacity="0.8"
                                            />
                                        );
                                    } else if (tipo === "A") {
                                        // ABATIBLE (Triángulo con vértice lateral)
                                        return (
                                            <polygon
                                                points={`${cX + cW},${cY} ${cX + cW},${cY + cH} ${cX},${centerY}`}
                                                fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5,3" opacity="0.8"
                                            />
                                        );
                                    }
                                    return null;
                                })()}
                            </g>
                        );
                    })}
                </g>

                {/* ==================== CAPA 5: COTAS PROFESIONALES ==================== */}
                {showCotas && (
                    <g fontFamily="sans-serif" fontSize="10" fill="#64748b" stroke="#94a3b8" strokeWidth="0.5">
                        {/* COTA INFERIOR (ANCHO) */}
                        <line x1={pad} y1={pad + drawH + 20} x2={pad + drawW} y2={pad + drawH + 20} />
                        {/* Ticks laterales horizontales (Perpendiculares) */}
                        <line x1={pad} y1={pad + drawH + 16} x2={pad} y2={pad + drawH + 24} strokeWidth="1" stroke="#475569" />
                        <line x1={pad + drawW} y1={pad + drawH + 16} x2={pad + drawW} y2={pad + drawH + 24} strokeWidth="1" stroke="#475569" />
                        <text x={pad + drawW / 2} y={pad + drawH + 32} textAnchor="middle" stroke="none" fontWeight="600" letterSpacing="0.5">
                            {anchoMm} mm
                        </text>

                        {/* COTA DERECHA (ALTO) */}
                        <line x1={pad + drawW + 20} y1={pad} x2={pad + drawW + 20} y2={pad + drawH} />
                        {/* Ticks laterales verticales (Perpendiculares) */}
                        <line x1={pad + drawW + 16} y1={pad} x2={pad + drawW + 24} y2={pad} strokeWidth="1" stroke="#475569" />
                        <line x1={pad + drawW + 16} y1={pad + drawH} x2={pad + drawW + 24} y2={pad + drawH} strokeWidth="1" stroke="#475569" />
                        <text
                            x={pad + drawW + 28}
                            y={pad + drawH / 2}
                            textAnchor="middle"
                            stroke="none"
                            fontWeight="600"
                            letterSpacing="0.5"
                            transform={`rotate(90, ${pad + drawW + 28}, ${pad + drawH / 2})`}
                        >
                            {altoMm} mm
                        </text>
                    </g>
                )}

                {/* ==================== ETIQUETA SUPERIOR ==================== */}
                {etiqueta && showCotas && (
                    <text
                        x={pad + drawW / 2}
                        y={pad - 12}
                        textAnchor="middle"
                        fontFamily="sans-serif"
                        fontSize="11"
                        fontWeight="600"
                        fill="#334155"
                        letterSpacing="0.5"
                    >
                        {etiqueta}
                    </text>
                )}
            </svg>
        </div>
    );
}
