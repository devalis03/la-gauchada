"use client"

import { Suspense, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/lib/cart-context"
import { CATEGORIES, SUBCATEGORIES, type Category, type SubcategoryId } from "@/lib/types"

function ProductsContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") as Category | null
  const initialSubcategory = searchParams.get("subcategory") as SubcategoryId | null
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory)
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubcategoryId | null>(initialSubcategory)
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(initialCategory === "mates" ? "mates" : null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { products } = useCart()

  const filteredProducts = useMemo(() => {
    let filtered = products
    
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }
    
    if (selectedSubcategory) {
      filtered = filtered.filter((product) => product.subcategory === selectedSubcategory)
    }
    
    return filtered
  }, [products, selectedCategory, selectedSubcategory])

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setSelectedSubcategory(null)
    if (category === "mates") {
      setExpandedCategory(expandedCategory === "mates" ? null : "mates")
    } else {
      setExpandedCategory(null)
    }
  }

  const handleSubcategorySelect = (subcategory: SubcategoryId) => {
    setSelectedSubcategory(subcategory)
    setSelectedCategory("mates")
  }

  const CategoryFilters = ({ onSelect }: { onSelect?: () => void }) => (
    <div className="space-y-2">
      <button
        onClick={() => {
          setSelectedCategory(null)
          setSelectedSubcategory(null)
          setExpandedCategory(null)
          onSelect?.()
        }}
        className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
          !selectedCategory && !selectedSubcategory
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        Todos los Productos
      </button>

      {CATEGORIES.map((category) => {
        const isMates = category.id === "mates"
        const isSelected = selectedCategory === category.id && !selectedSubcategory
        const isExpanded = expandedCategory === category.id

        return (
          <div key={category.id}>
            <button
              onClick={() => handleCategorySelect(category.id)}
              className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors flex items-center justify-between ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span>{category.name}</span>
              {isMates && (
                <span className="transition-transform">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              )}
            </button>

            {isMates && isExpanded && (
              <div className="ml-4 space-y-1 mt-1">
                {SUBCATEGORIES.map((subcategory) => {
                  const isSubcategorySelected = selectedSubcategory === subcategory.id
                  return (
                    <button
                      key={subcategory.id}
                      onClick={() => {
                        handleSubcategorySelect(subcategory.id)
                        onSelect?.()
                      }}
                      className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                        isSubcategorySelected
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {subcategory.name}
                    </button>
                  )
                })}
                <button
                  onClick={() => {
                    setSelectedCategory("mates")
                    setSelectedSubcategory(null)
                    onSelect?.()
                  }}
                  className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                    selectedCategory === "mates" && !selectedSubcategory
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  Todos los Mates
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Nuestros Productos
          </h1>
          <p className="mt-2 text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            {selectedCategory && ` en ${CATEGORIES.find((c) => c.id === selectedCategory)?.name}`}
            {selectedSubcategory && ` - ${SUBCATEGORIES.find((s) => s.id === selectedSubcategory)?.name}`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Categorías
              </h2>
              <CategoryFilters />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetTitle className="mb-2">Categorías</SheetTitle>
                <SheetDescription className="mb-6">Selecciona una categoría para filtrar</SheetDescription>
                <CategoryFilters onSelect={() => setIsFilterOpen(false)} />
              </SheetContent>
            </Sheet>

            {(selectedCategory || selectedSubcategory) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null)
                  setSelectedSubcategory(null)
                  setExpandedCategory(null)
                }}
                className="text-muted-foreground"
              >
                Limpiar filtro
              </Button>
            )}
          </div>

          {/* Product Grid */}
          <div>
            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  No hay productos en esta categoría.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedSubcategory(null)
                    setExpandedCategory(null)
                  }}
                  className="mt-2"
                >
                  Ver todos los productos
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  )
}
