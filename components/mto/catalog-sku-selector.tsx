import { useState, useEffect, useMemo } from "react"
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
import { recetasApi } from "@/lib/api/recetas"
import { useQuery } from "@tanstack/react-query"

interface CatalogSkuSelectorProps {
    value: string
    onChange: (sku: string, producto: any) => void
    initialSearch?: string
    placeholder?: string
}

export function CatalogSkuSelector({
    value,
    onChange,
    initialSearch = "",
    placeholder = "Buscar accesorio..."
}: CatalogSkuSelectorProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState(initialSearch)

    // Cargar todos los variantes una vez y cachear con React Query
    const { data: allProducts = [], isLoading } = useQuery({
        queryKey: ["catVariantesAccesorios"],
        queryFn: () => recetasApi.getVariantesAccesorios(),
        staleTime: 5 * 60 * 1000, // Cache 5 minutos
    })

    // Filtrado en memoria — igual que ProductCombobox de Entradas/Salidas
    const filteredProducts = useMemo(() => {
        if (!allProducts.length) return []
        if (!search) return allProducts.slice(0, 2000)

        const q = search.toLowerCase()
        return allProducts
            .filter((p: any) =>
                p.nombre_completo?.toLowerCase().includes(q) ||
                p.id_sku?.toLowerCase().includes(q)
            )
            .slice(0, 3000)
    }, [allProducts, search])

    // Producto actualmente seleccionado
    const selectedProduct = useMemo(() =>
        allProducts.find((p: any) => p.id_sku === value),
        [allProducts, value]
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-8 text-xs font-normal",
                        value && "font-medium border-primary/50"
                    )}
                >
                    <span className="truncate font-mono">
                        {selectedProduct
                            ? `${value} — ${selectedProduct.nombre_completo}`
                            : (value || placeholder)}
                    </span>
                    {isLoading
                        ? <Loader2 className="ml-2 h-3 w-3 animate-spin shrink-0 opacity-50" />
                        : <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    }
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
                        <CommandEmpty>
                            {isLoading ? "Cargando productos..." : "No se encontraron productos."}
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredProducts.map((product: any) => (
                                <CommandItem
                                    key={product.id_sku}
                                    value={product.id_sku}
                                    onSelect={() => {
                                        onChange(product.id_sku, product)
                                        setOpen(false)
                                        setSearch("")
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
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
                                            "mr-2 h-4 w-4 text-primary",
                                            value === product.id_sku ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col w-full">
                                        <div className="flex justify-between">
                                            <span className="truncate">{product.nombre_completo}</span>
                                            {product.costo_mercado_unit != null && (
                                                <span className="text-green-600 font-semibold ml-2 shrink-0">
                                                    S/ {Number(product.costo_mercado_unit).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                                            <span className="font-mono">{product.id_sku}</span>
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
