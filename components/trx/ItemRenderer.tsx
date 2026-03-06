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
    className?: string; // Permitir estilos adicionales
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

    // GROSORES VISUALES (MÁS FINOS Y ESTÉTICOS)
    const marcoW = Math.min(10, drawW * 0.04);
    const hojaW_grosor = Math.min(8, drawW * 0.035);

    const zX = pad + marcoW;
    const zY = pad + marcoW;
    const zW = drawW - marcoW * 2;
    const zH = drawH - marcoW * 2;

    // ============================================================================
    // PARSER DE CONFIGURACION
    // ============================================================================
    // Ejemplos de config válidos:
    // "FCCF" -> ["F","C","C","F"] (Legacy/Continuo)
    // "F/A_IZQ/F" -> ["F", "A_IZQ", "F"] (Con separador)
    // "V_FP_SUP" -> div en Y, ["F", "P_SUP"] (Vertical, fijo arriba, proyectante abajo)

    let rawConfig = configHojas ? configHojas.toUpperCase() : "F";
    let isVertical = rawConfig.startsWith("V_");

    if (isVertical) {
        rawConfig = rawConfig.replace("V_", "");
    }

    let divisiones: string[] = [];
    if (rawConfig.includes("/")) {
        divisiones = rawConfig.split("/");
    } else if (/^[CFGP]+$/.test(rawConfig)) {
        // Configuraciones continuas como "FCCF", "CCCCCC", "CFFC", "P"
        divisiones = rawConfig.split("");
    } else {
        // Configuraciones especiales de panel único que pueden tener subguiones (ej. "P_SUP", "A_IZQ", "OB")
        divisiones = [rawConfig];
    }

    const numHojas = divisiones.length || 1;
    const wDiv = isVertical ? zW : (zW / numHojas);
    const hDiv = isVertical ? (zH / numHojas) : zH;

    // ============================================================================
    // LÓGICA DE APERTURAS (FLECHAS) Y CIERRES
    // ============================================================================
    const getCapaLogicaCorredizas = (index: number) => {
        let direction: "left" | "right" | "up" | "down" = "right";
        let handleSide: "left" | "right" | "top" | "bottom" = "left";

        // Guillotinas (G)
        if (isVertical) {
            const isBottomHalf = index >= numHojas / 2;
            direction = isBottomHalf ? "up" : "down";
            handleSide = isBottomHalf ? "bottom" : "top";
            return { direction, handleSide };
        }

        // Corredizas (C)
        if (numHojas === 2) {
            if (index === 0) { direction = "right"; handleSide = "left"; }
            if (index === 1) { direction = "left"; handleSide = "right"; }
        } else if (numHojas === 4) {
            // FCCF o CCCC - Las hojas abren hacia el extremo (Fujos)
            if (index === 0) { direction = "right"; handleSide = "left"; }
            if (index === 1) { direction = "left"; handleSide = "right"; } // Centro izq abre izq
            if (index === 2) { direction = "right"; handleSide = "left"; } // Centro der abre dcha
            if (index === 3) { direction = "left"; handleSide = "right"; }
        } else if (numHojas === 3) {
            // Asumimos FCF o CFC
            if (index === 0) { direction = "right"; handleSide = "left"; }
            if (index === 1) { direction = "right"; handleSide = "left"; } // Central abre der
            if (index === 2) { direction = "left"; handleSide = "right"; }
        } else {
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
                        <stop offset="42%" stopColor="#ffffff" stopOpacity="0.9" />
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
                    <rect x={pad} y={pad} width={drawW} height={drawH} fill={baseColor} stroke={strokeColor} strokeWidth="1" />
                    <rect x={zX} y={zY} width={zW} height={zH} fill="none" stroke={innerStrokeColor} strokeWidth="1" filter="url(#innerDepth)" />
                    <g stroke={strokeColor} strokeWidth="0.5" strokeOpacity="0.7">
                        <line x1={pad} y1={pad} x2={zX} y2={zY} />
                        <line x1={pad + drawW} y1={pad} x2={zX + zW} y2={zY} />
                        <line x1={pad} y1={pad + drawH} x2={zX} y2={zY + zH} />
                        <line x1={pad + drawW} y1={pad + drawH} x2={zX + zW} y2={zY + zH} />
                    </g>
                </g>

                {/* ==================== CAPAS 2-4: HOJAS Y CRISTALES ==================== */}
                <g id="hojas">
                    {divisiones.map((tipoPanel, i) => {
                        // Posición de la hoja según si es vertical o horizontal
                        const hX = isVertical ? zX : zX + i * wDiv;
                        const hY = isVertical ? zY + i * hDiv : zY;

                        const cX = hX + hojaW_grosor;
                        const cY = hY + hojaW_grosor;
                        const cW = wDiv - hojaW_grosor * 2;
                        const cH = hDiv - hojaW_grosor * 2;

                        return (
                            <g key={`hoja-${i}`}>
                                {/* Perfil de la Hoja */}
                                <rect
                                    x={hX} y={hY} width={wDiv} height={hDiv}
                                    fill={baseColor} stroke={strokeColor} strokeWidth="0.5"
                                />
                                {/* Hueco del cristal en la hoja */}
                                <rect
                                    x={cX} y={cY} width={cW} height={cH}
                                    fill="#ffffff" stroke={innerStrokeColor} strokeWidth="1"
                                />

                                {/* Cortes a 45 grados de la hoja */}
                                <g stroke={innerStrokeColor} strokeWidth="0.5">
                                    <line x1={hX} y1={hY} x2={cX} y2={cY} />
                                    <line x1={hX + wDiv} y1={hY} x2={cX + cW} y2={cY} />
                                    <line x1={hX} y1={hY + hDiv} x2={cX} y2={cY + cH} />
                                    <line x1={hX + wDiv} y1={hY + hDiv} x2={cX + cW} y2={cY + cH} />
                                </g>

                                {/* Cristal translúcido con gradiente */}
                                {cW > 0 && cH > 0 && (
                                    <rect x={cX} y={cY} width={cW} height={cH} fill="url(#glassGradient)" stroke="#cbd5e1" strokeWidth="0.5" />
                                )}

                                {/* Simbología Central (Flechas y Giros) */}
                                {cW > 0 && cH > 0 && (() => {
                                    const centerX = cX + cW / 2;
                                    const centerY = cY + cH / 2;

                                    // Lógica de Letras
                                    const isC = tipoPanel.startsWith("C") || tipoPanel.startsWith("G");
                                    const isF = tipoPanel.startsWith("F");
                                    const isP = tipoPanel.startsWith("P");
                                    const isA = tipoPanel.startsWith("A");
                                    const isOB = tipoPanel.startsWith("OB");
                                    const isPL = tipoPanel.startsWith("PL");

                                    if (isC) {
                                        // FLECHA ROJA O NARANJA
                                        const arrowW = Math.min(cW * 0.45, 40);
                                        const arrowH = Math.min(cH * 0.12, 14);
                                        const arrowColor = "#ef4444";

                                        const handleW = 4;
                                        const handleH = Math.min(cH * 0.15, 30);
                                        // Las flechas verticales (Guillotina)
                                        const { direction, handleSide } = getCapaLogicaCorredizas(i);

                                        return (
                                            <g>
                                                {direction === "right" && (
                                                    <g filter="url(#softShadow)" transform={`translate(${centerX - arrowW / 2}, ${centerY})`}>
                                                        <rect x="0" y={-arrowH / 4} width={arrowW - arrowH / 2} height={arrowH / 2} fill={arrowColor} />
                                                        <polygon points={`${arrowW - arrowH / 2},${-arrowH / 1.5} ${arrowW},0 ${arrowW - arrowH / 2},${arrowH / 1.5}`} fill={arrowColor} strokeLinejoin="round" />
                                                    </g>
                                                )}
                                                {direction === "left" && (
                                                    <g filter="url(#softShadow)" transform={`translate(${centerX - arrowW / 2}, ${centerY})`}>
                                                        <polygon points={`${arrowH / 2},${-arrowH / 1.5} 0,0 ${arrowH / 2},${arrowH / 1.5}`} fill={arrowColor} strokeLinejoin="round" />
                                                        <rect x={arrowH / 2} y={-arrowH / 4} width={arrowW - arrowH / 2} height={arrowH / 2} fill={arrowColor} />
                                                    </g>
                                                )}
                                                {direction === "up" && (
                                                    <g filter="url(#softShadow)" transform={`translate(${centerX}, ${centerY - arrowW / 2})`}>
                                                        <rect x={-arrowH / 4} y={arrowH / 2} width={arrowH / 2} height={arrowW - arrowH / 2} fill={arrowColor} />
                                                        <polygon points={`${-arrowH / 1.5},${arrowH / 2} 0,0 ${arrowH / 1.5},${arrowH / 2}`} fill={arrowColor} strokeLinejoin="round" />
                                                    </g>
                                                )}
                                                {direction === "down" && (
                                                    <g filter="url(#softShadow)" transform={`translate(${centerX}, ${centerY - arrowW / 2})`}>
                                                        <polygon points={`${-arrowH / 1.5},${arrowW - arrowH / 2} 0,${arrowW} ${arrowH / 1.5},${arrowW - arrowH / 2}`} fill={arrowColor} strokeLinejoin="round" />
                                                        <rect x={-arrowH / 4} y={0} width={arrowH / 2} height={arrowW - arrowH / 2} fill={arrowColor} />
                                                    </g>
                                                )}

                                                {/* Cierre Embutido (Tirador) */}
                                                {handleSide === "left" && <rect x={hX + 3} y={centerY - handleH / 2} width={handleW} height={handleH} fill="#111" rx="2" filter="url(#softShadow)" />}
                                                {handleSide === "right" && <rect x={hX + wDiv - handleW - 3} y={centerY - handleH / 2} width={handleW} height={handleH} fill="#111" rx="2" filter="url(#softShadow)" />}
                                                {handleSide === "top" && <rect x={centerX - handleH / 2} y={hY + 3} width={handleH} height={handleW} fill="#111" rx="2" filter="url(#softShadow)" />}
                                                {handleSide === "bottom" && <rect x={centerX - handleH / 2} y={hY + hDiv - handleW - 3} width={handleH} height={handleW} fill="#111" rx="2" filter="url(#softShadow)" />}
                                            </g>
                                        );
                                    }
                                    else if (isF && tipoPanel.length <= 3) {
                                        // CRUZ FINA GRIS PÁLIDO
                                        return (
                                            <g stroke="#94a3b8" strokeWidth="0.75" opacity="0.6">
                                                <line x1={cX} y1={cY} x2={cX + cW} y2={cY + cH} />
                                                <line x1={cX + cW} y1={cY} x2={cX} y2={cY + cH} />
                                            </g>
                                        );
                                    }
                                    else if (isP) {
                                        // PROYECTANTE (P_SUP, P_INF, P_IZQ, P_DER)
                                        // Vértice apunta hacia donde ABRE el paño exteriormente (y donde está la manilla interiormente).
                                        // Base de la línea punteada es el eje de rotación (bisagras).
                                        let vX = centerX; let vY = cY + cH; // P_SUP (Vértice abajo, bisagra arriba)
                                        let b1X = cX; let b1Y = cY;
                                        let b2X = cX + cW; let b2Y = cY;

                                        if (tipoPanel === "P_INF") {
                                            vX = centerX; vY = cY; // Vértice arriba
                                            b1X = cX; b1Y = cY + cH; // Bisagra abajo
                                            b2X = cX + cW; b2Y = cY + cH;
                                        }

                                        return (
                                            <polygon
                                                points={`${b1X},${b1Y} ${b2X},${b2Y} ${vX},${vY}`}
                                                fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5,3" opacity="0.8"
                                            />
                                        );
                                    }
                                    else if (isA) {
                                        // ABATIBLE (A_IZQ, A_DER)
                                        // Bisagra a la izquierda, vértice a la derecha y así.
                                        let vX = cX; let vY = centerY; // Por defecto A_DER (bisagra Derecha, Vértice a la Izq)
                                        let b1X = cX + cW; let b1Y = cY;
                                        let b2X = cX + cW; let b2Y = cY + cH;

                                        if (tipoPanel === "A_IZQ") { // Bisagra a la izquierda, manilla a la derecha (vértice a la derecha)
                                            vX = cX + cW; vY = centerY;
                                            b1X = cX; b1Y = cY;
                                            b2X = cX; b2Y = cY + cH;
                                        }

                                        return (
                                            <polygon
                                                points={`${b1X},${b1Y} ${b2X},${b2Y} ${vX},${vY}`}
                                                fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5,3" opacity="0.8"
                                            />
                                        );
                                    }
                                    else if (isOB) {
                                        // Oscilobatiente: Ambas cruces A_IZQ + P_SUP
                                        return (
                                            <g>
                                                <polygon
                                                    points={`${cX},${cY} ${cX},${cY + cH} ${cX + cW},${centerY}`}
                                                    fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5,3" opacity="0.8"
                                                />
                                                <polygon
                                                    points={`${cX},${cY + cH} ${cX + cW},${cY + cH} ${centerX},${cY}`}
                                                    fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5,3" opacity="0.8"
                                                />
                                            </g>
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
                        <line x1={pad} y1={pad + drawH + 20} x2={pad + drawW} y2={pad + drawH + 20} />
                        <line x1={pad} y1={pad + drawH + 16} x2={pad} y2={pad + drawH + 24} strokeWidth="1" stroke="#475569" />
                        <line x1={pad + drawW} y1={pad + drawH + 16} x2={pad + drawW} y2={pad + drawH + 24} strokeWidth="1" stroke="#475569" />
                        <text x={pad + drawW / 2} y={pad + drawH + 32} textAnchor="middle" stroke="none" fontWeight="600" letterSpacing="0.5">
                            {anchoMm} mm
                        </text>

                        <line x1={pad + drawW + 20} y1={pad} x2={pad + drawW + 20} y2={pad + drawH} />
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
