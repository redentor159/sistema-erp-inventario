"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { supabase } from "@/lib/supabase/client"

interface InlineProductComboboxProps {
    value?: string
    onChange: (value: string, producto: any) => void
    disabled?: boolean
}

// Cache global: evita re-fetches cuando hay múltiples filas en el formulario
let _cache: any[] | null = null

export function InlineProductCombobox({ value, onChange, disabled }: InlineProductComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [productos, setProductos] = React.useState<any[]>([])

    // Carga todos los productos al abrir el popover (solo la primera vez)
    const handleOpenChange = async (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen || productos.length > 0) return

        if (_cache) {
            setProductos(_cache)
            return
        }

        setLoading(true)
        try {
            // Carga completa paginada bypasseando límite de 1000 de Supabase
            let allData: any[] = []
            let from = 0
            const CHUNK = 1000
            while (true) {
                const { data, error } = await supabase
                    .from('vw_stock_realtime')
                    .select('id_sku, nombre_completo, stock_actual, costo_estandar, costo_mercado_unit')
                    .order('orden_prioridad', { ascending: true })
                    .order('id_sku', { ascending: true })
                    .range(from, from + CHUNK - 1)
                if (error) throw error
                if (!data || data.length === 0) break
                allData = allData.concat(data)
                if (data.length < CHUNK) break
                from += CHUNK
            }
            _cache = allData
            setProductos(allData)
        } catch (err) {
            console.error("Error cargando productos:", err)
        } finally {
            setLoading(false)
        }
    }

    // Filtrado en memoria — instantáneo, sin llamadas al servidor
    const filtered = React.useMemo(() => {
        if (!search) return productos.slice(0, 2000)
        const q = search.toLowerCase()
        return productos
            .filter(p =>
                p.nombre_completo?.toLowerCase().includes(q) ||
                p.id_sku?.toLowerCase().includes(q)
            )
            .slice(0, 500)
    }, [productos, search])

    const selected = productos.find(p => p.id_sku === value)

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between pl-3 text-left font-normal",
                        !value && "text-muted-foreground",
                        value && "font-medium text-foreground border-primary/50"
                    )}
                >
                    <span className="truncate">
                        {selected ? selected.nombre_completo : "Buscar SKU o nombre..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[420px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar SKU o nombre..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                        {loading && (
                            <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cargando productos...
                            </div>
                        )}
                        {!loading && filtered.length === 0 && (
                            <CommandEmpty>No se encontraron productos.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {!loading && filtered.map((product) => (
                                <CommandItem
                                    key={product.id_sku}
                                    value={product.id_sku}
                                    onSelect={() => {
                                        onChange(product.id_sku, product)
                                        setOpen(false)
                                        setSearch("")
                                    }}
                                    className={cn(
                                        "cursor-pointer",
                                        value === product.id_sku && "bg-primary/20 font-bold"
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 text-primary shrink-0",
                                            value === product.id_sku ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col w-full min-w-0">
                                        <span className="font-medium truncate">{product.nombre_completo}</span>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                                            <span>SKU: {product.id_sku}</span>
                                            <span className={cn(
                                                "font-medium",
                                                Number(product.stock_actual) > 0 ? "text-green-600" : "text-red-500"
                                            )}>
                                                Stock: {Number(product.stock_actual).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
