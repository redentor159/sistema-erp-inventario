"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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

interface ProductComboboxProps {
    value: string
    onChange: (value: string, producto: any) => void
    productos: any[]
}

export function ProductCombobox({ value, onChange, productos }: ProductComboboxProps) {
    const [open, setOpen] = React.useState(false)

    // Find selected product
    const selectedProduct = productos?.find((p) => p.id_sku === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between pl-3 text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    {selectedProduct ? selectedProduct.nombre_completo : "Buscar SKU..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar SKU o nombre..." />
                    <CommandList>
                        <CommandEmpty>No se encontraron productos.</CommandEmpty>
                        <CommandGroup>
                            {productos?.map((product) => (
                                <CommandItem
                                    key={product.id_sku}
                                    value={product.nombre_completo}
                                    onSelect={() => {
                                        onChange(product.id_sku, product)
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer"
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === product.id_sku ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{product.nombre_completo}</span>
                                        <span className="text-xs text-muted-foreground">
                                            Stock: {Number(product.stock_actual).toLocaleString()}
                                        </span>
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
