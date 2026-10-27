"use client"

import { useMemo, useState } from "react"
import { Check, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { findProductColor, getProductColorStyle, normalizeColorName, suggestProductColors, type ProductColorDefinition } from "@/lib/product-colors"

interface ProductColorEditorProps {
  value: string
  customColors: Record<string, string>
  onChange: (value: string) => void
  onCustomColorsChange: (colors: Record<string, string>) => void
}

export function ProductColorEditor({ value, customColors, onChange, onCustomColorsChange }: ProductColorEditorProps) {
  const [newColorOpen, setNewColorOpen] = useState(false)
  const [newColorName, setNewColorName] = useState("")
  const [newColorHex, setNewColorHex] = useState("#808080")
  const [newColorError, setNewColorError] = useState<string | null>(null)
  const colors = value.split(",").map((color) => color.trim()).filter(Boolean)
  const draft = value.split(",").pop()?.trim() ?? ""
  const exactColor = findProductColor(draft)
  const suggestions = useMemo(() => suggestProductColors(draft), [draft])

  const replaceDraft = (color: ProductColorDefinition) => {
    const previous = colors.slice(0, -1)
    onChange([...previous, color.name].join(", "))
  }

  const removeColor = (index: number) => {
    onChange(colors.filter((_, colorIndex) => colorIndex !== index).join(", "))
  }

  const addCustomColor = () => {
    const name = newColorName.trim()
    const normalized = normalizeColorName(name)
    if (!name || !/^#[0-9a-f]{6}$/i.test(newColorHex)) {
      setNewColorError("Indica un nombre y un código HEX válido.")
      return
    }
    if (findProductColor(name) || colors.some((color) => normalizeColorName(color) === normalized)) {
      setNewColorError("Ese color ya existe o equivale a uno registrado.")
      return
    }
    onChange([...colors, name].join(", "))
    onCustomColorsChange({ ...customColors, [name]: newColorHex.toLowerCase() })
    setNewColorName("")
    setNewColorHex("#808080")
    setNewColorError(null)
    setNewColorOpen(false)
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Ej.: Marrón, Verde oliva, Azul marino"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Colores del producto"
      />
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => (
            <span key={`${color}-${index}`} className="inline-flex items-center gap-2 rounded-full border bg-background px-2 py-1 text-xs">
              <span className="h-3 w-3 rounded-full border" style={getProductColorStyle(color, customColors)} />
              {color}
              <button type="button" onClick={() => removeColor(index)} aria-label={`Quitar ${color}`} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {draft && !exactColor && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <p>El color “{draft}” no se encuentra registrado.</p>
          {suggestions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button key={suggestion.id} type="button" variant="outline" size="sm" onClick={() => replaceDraft(suggestion)} className="gap-2 bg-background">
                  <span className="h-4 w-4 rounded-full border" style={getProductColorStyle(suggestion.name)} />
                  {suggestion.name}
                </Button>
              ))}
            </div>
          ) : <p className="mt-1 text-xs">No encontramos alternativas similares. Podés agregarlo como color nuevo.</p>}
        </div>
      )}
      {exactColor && <p className="flex items-center gap-1 text-xs text-primary"><Check className="h-3 w-3" />Color reconocido como {exactColor.name}</p>}
      <Button type="button" variant="outline" size="sm" onClick={() => { setNewColorOpen((open) => !open); setNewColorError(null) }} className="gap-2">
        <Plus className="h-4 w-4" />Agregar nuevo color
      </Button>
      {newColorOpen && (
        <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Input placeholder="Nombre del nuevo color" value={newColorName} onChange={(event) => setNewColorName(event.target.value)} />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">HEX <Input className="h-9 w-24 p-1" type="color" value={newColorHex} onChange={(event) => setNewColorHex(event.target.value)} /></label>
          <Button type="button" size="sm" onClick={addCustomColor}>Agregar</Button>
          {newColorError && <p className="text-xs text-destructive sm:col-span-3">{newColorError}</p>}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Separá los colores con comas. Podés conservar nombres personalizados y corregirlos con las sugerencias.</p>
    </div>
  )
}
