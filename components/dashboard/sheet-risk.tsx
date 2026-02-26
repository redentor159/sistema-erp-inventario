"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function SheetRisk() {
  const [exchangeRate, setExchangeRate] = useState(3.75);
  // Simulation base values (Example: 10,000 USD inventory)
  const usdInventory = 15000;

  const currentValPEN = usdInventory * 3.75;
  const simulatedValPEN = usdInventory * exchangeRate;
  const diff = simulatedValPEN - currentValPEN;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
        <div>
          <h3 className="text-lg font-medium">
            Gestión de Riesgos y Simulación
          </h3>
          <p className="text-sm text-muted-foreground">
            Análisis "What-If" para volatilidad cambiaria y probabilidad de
            quiebre.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Simulador de Tipo de Cambio
            </CardTitle>
            <CardDescription>
              Impacto en Valor de Reposición (USD Inventory)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Tipo de Cambio Proyectado</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">S/</span>
                  <Input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-24 text-right font-bold"
                    step="0.01"
                  />
                </div>
              </div>
              <Slider
                value={[exchangeRate]}
                min={3.5}
                max={4.5}
                step={0.01}
                onValueChange={(vals) => setExchangeRate(vals[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3.50</span>
                <span>3.75 (Ref)</span>
                <span>4.50</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2 border">
              <div className="flex justify-between text-sm">
                <span>Valor Actual (TC 3.75):</span>
                <span>S/ {currentValPEN.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Valor Simulado:</span>
                <span>S/ {simulatedValPEN.toLocaleString()}</span>
              </div>
              <div
                className={`flex justify-between text-sm font-medium ${diff > 0 ? "text-red-500" : "text-green-500"}`}
              >
                <span>Impacto / Diferencia:</span>
                <span className="flex items-center">
                  {diff > 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  S/ {Math.abs(diff).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riesgo Probabilístico de Quiebre</CardTitle>
            <CardDescription>Basado en varianza de Lead Time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Este modelo estima la probabilidad de que un proveedor se
                retrase más allá del stock de seguridad disponible.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      Proveedor: ACEROS AREQUIPA
                    </span>
                    <span className="text-red-500 font-bold">
                      Alto Riesgo (85%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[85%]"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      Proveedor: CORPORACION FURUKAWA
                    </span>
                    <span className="text-green-500 font-bold">
                      Bajo Riesgo (12%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[12%]"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Proveedor: MIYASATO</span>
                    <span className="text-yellow-500 font-bold">
                      Riesgo Medio (45%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[45%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
