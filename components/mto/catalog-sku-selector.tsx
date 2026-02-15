import { useState, useEffect } from "react"
import { Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { recetasApi } from "@/lib/api/recetas"

interface CatalogSkuSelectorProps {
    value: string
    onChange: (sku: string, producto: any) => void
    initialSearch?: string
    placeholder?: string
}

export function CatalogSkuSelector({ value, onChange, initialSearch = "", placeholder = "Buscar producto..." }: CatalogSkuSelectorProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState(initialSearch)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])
    const [selectedObject, setSelectedObject] = useState<any>(null)

    // Load selected product name on mount from server
    useEffect(() => {
        if (value && !selectedObject) {
            // Optimistic check: maybe it's in results?
            const inResults = results.find(r => r.id_sku === value)
            if (inResults) {
                setSelectedObject(inResults)
            } else {
                recetasApi.getProductoPorSku(value).then(product => {
                    if (product) setSelectedObject(product)
                }).catch(console.error)
            }
        }
    }, [value, results]) // Added results dependency

    // Initial fetch when opening
    useEffect(() => {
        if (open && results.length === 0) {
            handleSearch(search)
        }
    }, [open])

    const handleSearch = async (term: string) => {
        setLoading(true)
        try {
            const data = await recetasApi.buscarProductosCatalogo(term, 50)
            setResults(data)
        } catch (err) {
            console.error(err)
            setResults([])
        } finally { setLoading(false) }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            handleSearch(search)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-8 text-xs font-normal"
                >
                    <span className="truncate font-mono">
                        {value ? value : placeholder}
                    </span>
                    {selectedObject && <span className="ml-2 text-[10px] text-muted-foreground truncate max-w-[150px]">{selectedObject.nombre_completo}</span>}
                    <Search className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
                        placeholder="Buscar SKU o nombre (Enter)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleSearch(search)} disabled={loading}>
                        {loading ? "..." : "Buscar"}
                    </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {results.length === 0 && !loading && (
                        <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron productos.</p>
                    )}
                    {results.map((product) => (
                        <div
                            key={product.id_sku}
                            className={`flex items-start gap-2 p-2 rounded-sm cursor-pointer hover:bg-accent text-sm ${value === product.id_sku ? "bg-accent" : ""}`}
                            onClick={() => {
                                onChange(product.id_sku, product)
                                setSelectedObject(product)
                                setOpen(false)
                            }}
                        >
                            <Check className={`h-4 w-4 mt-1 ${value === product.id_sku ? "opacity-100" : "opacity-0"}`} />
                            <div className="flex-1">
                                <div className="font-medium">{product.nombre_completo}</div>
                                <div className="text-xs text-muted-foreground flex justify-between">
                                    <span className="font-mono">{product.id_sku}</span>
                                    <span>Stock: {product.stock_actual}</span>
                                </div>
                                <div className="text-xs text-green-600 font-semibold mt-1">
                                    Precio: {product.moneda_reposicion} {product.costo_mercado_unit?.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
