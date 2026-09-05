
"use client"
import { formatPrice } from "@/lib/utils"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Save, RefreshCw, Package, AlertTriangle, Check, Eye, LogOut, Plus, Pencil, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { CATEGORIES } from "@/lib/types"
import { initialProducts } from "@/lib/products"
import { 
  getAllOrders, 
  getPendingTransferenceOrders,
  confirmTransference,
  getOrderStats,
  updateOrderStatus,
  type Order,
  type OrderStats
} from "@/lib/order-service"
import type { Product } from "@/lib/types"

type ProductForm = Omit<Product, "active" | "featured" | "subcategory"> & {
  active: boolean
  featured: boolean
  subcategory: Product["subcategory"] | null
}

const emptyProductForm: ProductForm = {
  id: "",
  name: "",
  description: "",
  price: 0,
  image: "/images/otros.jpg",
  category: "otros",
  subcategory: null,
  stock: 0,
  featured: false,
  active: true,
}


  export default function AdminPage() {
  const { products, updateStock } = useCart()
  const [editedStocks, setEditedStocks] = useState<Record<string, number>>({})
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<"stock" | "products" | "orders">("stock")
  const [adminProducts, setAdminProducts] = useState<Product[]>([])
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(emptyProductForm.image)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [productError, setProductError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [pendingTransferences, setPendingTransferences] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [confirmingOrder, setConfirmingOrder] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  const refreshOrdersData = async () => {
    const [allOrders, pending, orderStats] = await Promise.all([
      getAllOrders(),
      getPendingTransferenceOrders(),
      getOrderStats(),
    ])

    setOrders(allOrders)
    setPendingTransferences(pending)
    setStats(orderStats)
  }

  const refreshProductsData = async () => {
    const response = await fetch("/api/admin/products", { cache: "no-store" })
    if (!response.ok) return
    const payload = await response.json() as { data?: Product[] }
    if (payload.data) setAdminProducts(payload.data)
  }

  const openNewProductForm = () => {
    setEditingProductId(null)
    setProductForm(emptyProductForm)
    setSelectedImageFile(null)
    setImagePreview(emptyProductForm.image)
    setProductError(null)
    setIsProductFormOpen(true)
  }

  const openEditProductForm = (product: Product) => {
    setEditingProductId(product.id)
    setProductForm({ ...product, subcategory: product.subcategory ?? null, active: product.active !== false, featured: product.featured === true })
    setSelectedImageFile(null)
    setImagePreview(product.image)
    setProductError(null)
    setIsProductFormOpen(true)
  }

  const handleProductFormChange = (field: keyof ProductForm, value: string | number | boolean | null) => {
    setProductForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedImageFile(file)
    if (file) setImagePreview(URL.createObjectURL(file))
  }

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProductError(null)

    let image = productForm.image
    if (selectedImageFile) {
      const imageData = new FormData()
      imageData.append("file", selectedImageFile)
      imageData.append("productId", productForm.id)

      const imageResponse = await fetch("/api/admin/product-images", {
        method: "POST",
        body: imageData,
      })
      const imagePayload = await imageResponse.json() as { data?: { url: string }; error?: string }
      if (!imageResponse.ok || !imagePayload.data?.url) {
        setProductError(imagePayload.error ?? "No se pudo subir la imagen")
        return
      }
      image = imagePayload.data.url
    }

    const response = await fetch(editingProductId ? `/api/admin/products/${editingProductId}` : "/api/products", {
      method: editingProductId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...productForm, image }),
    })
    const payload = await response.json() as { data?: Product; error?: string }
    if (!response.ok || !payload.data) {
      setProductError(payload.error ?? "No se pudo guardar el producto")
      return
    }

    await refreshProductsData()
    setIsProductFormOpen(false)
  }

  const handleToggleProduct = async (product: Product) => {
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, active: product.active === false }),
    })
    if (response.ok) await refreshProductsData()
  }

  const handleStockChange = (productId: string, value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedStocks((prev) => ({ ...prev, [productId]: numValue }))
      setSavedProducts((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const handleSave = async (productId: string) => {
    const newStock = editedStocks[productId]
    if (newStock !== undefined) {
      const updated = await updateStock(productId, newStock)
      if (!updated) {
        alert("No se pudo actualizar el stock. Verifica tu sesión e intenta nuevamente.")
        return
      }

      setEditedStocks((prev) => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
      setSavedProducts((prev) => new Set(prev).add(productId))
      setTimeout(() => {
        setSavedProducts((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
      }, 2000)
    }
  }

  const handleResetAll = async () => {
    if (confirm("¿Estás seguro de que deseas restablecer el stock a los valores iniciales? Esto no se puede deshacer.")) {
      const results = await Promise.all(
        initialProducts.map((product) => updateStock(product.id, product.stock))
      )
      if (results.some((updated) => !updated)) {
        alert("No se pudo restablecer todo el stock. Verifica tu sesión e intenta nuevamente.")
        return
      }
      setEditedStocks({})
      alert("Todo el stock ha sido restablecido a los valores iniciales.")
    }
  }

  // Load orders on component mount
  useEffect(() => {
    void refreshOrdersData()
    void refreshProductsData()
  }, [])

  const handleConfirmTransference = async (orderId: string) => {
    setConfirmingOrder(orderId)
    
    const updatedOrder = await confirmTransference(orderId)
    
    if (updatedOrder) {
      // Send confirmation email to customer
      // Notificación por email deshabilitada en MVP
      
      // Update local state
      await refreshOrdersData()
      
      alert("Transferencia confirmada. Se ha enviado un email al cliente.")
    } else {
      alert("Error al confirmar la transferencia.")
    }
    
    setConfirmingOrder(null)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Sin Stock", color: "text-destructive" }
    if (stock <= 5) return { label: "Stock Bajo", color: "text-accent" }
    return { label: "En Stock", color: "text-primary" }
  }

  const totalProducts = products.length
  const outOfStock = products.filter((p) => p.stock === 0).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length

  // Marcar pedido como entregado/no entregado
  const handleToggleDelivered = async (orderId: string, delivered: boolean) => {
    const newStatus = delivered ? "delivered" : "confirmed"
    const updatedOrder = await updateOrderStatus(orderId, newStatus)
    if (updatedOrder) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: updatedOrder.status } : o))
    }
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <div className="border-b border-border bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
                Panel de Administración
              </h1>
              <p className="mt-1 text-muted-foreground">
                Gestiona stock, pedidos y transferencias bancarias
              </p>
            </div>
            <Button variant="outline" onClick={() => void handleLogout()} className="gap-2 self-start">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "stock"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Gestión de Stock
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "products"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "orders"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pedidos
            {pendingTransferences.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                {pendingTransferences.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Catálogo</h2>
                <p className="text-sm text-muted-foreground">Administra productos simples. Las promos se agregarán en una etapa separada.</p>
              </div>
              <Button onClick={openNewProductForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            </div>

            {isProductFormOpen && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingProductId ? "Editar producto" : "Nuevo producto"}</CardTitle>
                  <CardDescription>Seleccioná una imagen JPG, PNG o WEBP de hasta 5 MB.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(event) => void handleProductSubmit(event)} className="grid gap-4 md:grid-cols-2">
                    <Input placeholder="ID único (ej. mate-012)" value={productForm.id} disabled={Boolean(editingProductId)} onChange={(event) => handleProductFormChange("id", event.target.value)} required />
                    <Input placeholder="Nombre" value={productForm.name} onChange={(event) => handleProductFormChange("name", event.target.value)} required />
                    <Textarea className="md:col-span-2" placeholder="Descripción" value={productForm.description} onChange={(event) => handleProductFormChange("description", event.target.value)} required />
                    <Input type="number" min="0" step="0.01" placeholder="Precio" value={productForm.price} onChange={(event) => handleProductFormChange("price", Number(event.target.value))} required />
                    <Input type="number" min="0" step="1" placeholder="Stock" value={productForm.stock} onChange={(event) => handleProductFormChange("stock", Number(event.target.value))} required />
                    <div className="md:col-span-2 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                      <div className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted">
                        <Image src={imagePreview} alt="Vista previa del producto" fill className="object-cover" sizes="96px" />
                      </div>
                      <div className="space-y-1">
                        <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                        <p className="text-xs text-muted-foreground">
                          {selectedImageFile ? selectedImageFile.name : editingProductId ? "Conserva la imagen actual si no seleccionás otra." : "Se usará la imagen predeterminada si no seleccionás otra."}
                        </p>
                      </div>
                    </div>
                    <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={productForm.category} onChange={(event) => handleProductFormChange("category", event.target.value)}>
                      {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={productForm.subcategory ?? ""} onChange={(event) => handleProductFormChange("subcategory", event.target.value || null)}>
                      <option value="">Sin subcategoría</option>
                      <option value="mates-imperiales">Mates Imperiales</option>
                      <option value="mates-tradicionales">Mates Tradicionales</option>
                      <option value="mates-torpedos">Mates Torpedos</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={productForm.featured} onChange={(event) => handleProductFormChange("featured", event.target.checked)} /> Destacado</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={productForm.active} onChange={(event) => handleProductFormChange("active", event.target.checked)} /> Activo</label>
                    {productError && <p className="md:col-span-2 text-sm text-destructive">{productError}</p>}
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="submit">Guardar producto</Button>
                      <Button type="button" variant="outline" onClick={() => setIsProductFormOpen(false)}>Cancelar</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              {adminProducts.map((product) => (
                <Card key={product.id} className={product.active === false ? "opacity-60" : undefined}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted"><Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" /></div>
                    <div className="min-w-0 flex-1"><h3 className="truncate font-medium">{product.name}</h3><p className="text-sm text-muted-foreground">{product.id} · {formatPrice(product.price)} · Stock: {product.stock}</p><p className="text-xs text-muted-foreground">{product.active === false ? "Inactivo" : "Activo"}</p></div>
                    <div className="flex gap-2"><Button size="icon" variant="outline" title="Editar producto" onClick={() => openEditProductForm(product)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="outline" title="Activar o desactivar producto" onClick={() => void handleToggleProduct(product)}><Power className="h-4 w-4" /></Button></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === "stock" && (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{products.length}</p>
                    <p className="text-sm text-muted-foreground">Productos Totales</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {products.filter((p) => p.stock === 0).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Sin Stock</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <AlertTriangle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {products.filter((p) => p.stock > 0 && p.stock <= 5).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Stock Bajo ({"<"}5)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Banner */}
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm text-foreground">
                  <strong>Cómo funciona:</strong> Los niveles de stock se almacenan en el 
                  almacenamiento local del navegador. Cuando los clientes completan compras, el stock 
                  disminuye automáticamente. Para conectar a una base de datos real para uso en producción, 
                  reemplaza la lógica localStorage en <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">lib/cart-context.tsx</code> con 
                  tus llamadas API de base de datos.
                </p>
              </CardContent>
            </Card>

            <div className="mb-8">
              <Button variant="outline" onClick={() => void handleResetAll()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Restablecer Todo el Stock
              </Button>
            </div>

            {/* Product List by Category */}
            {CATEGORIES.map((category) => {
              const categoryProducts = products.filter((p) => p.category === category.id)
              if (categoryProducts.length === 0) return null

              return (
                <Card key={category.id} className="mb-6">
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryProducts.map((product) => {
                        const currentStock = editedStocks[product.id] ?? product.stock
                        const status = 
                          currentStock === 0 
                            ? { label: "Sin Stock", color: "text-destructive" }
                            : currentStock <= 5 
                            ? { label: "Stock Bajo", color: "text-accent" }
                            : { label: "En Stock", color: "text-primary" }
                        const isSaved = savedProducts.has(product.id)
                        const hasChanges = editedStocks[product.id] !== undefined && 
                                           editedStocks[product.id] !== product.stock

                        return (
                          <div
                            key={product.id}
                            className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                          >
                            {/* Product Info */}
                            <div className="flex flex-1 items-center gap-4">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-foreground truncate">
                                  {product.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  ${product.price.toFixed(2)} · ID: {product.id}
                                </p>
                              </div>
                            </div>

                            {/* Stock Controls */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <label htmlFor={`stock-${product.id}`} className="text-sm text-muted-foreground">
                                  Stock:
                                </label>
                                <Input
                                  id={`stock-${product.id}`}
                                  type="number"
                                  min="0"
                                  value={currentStock}
                                  onChange={(e) => handleStockChange(product.id, e.target.value)}
                                  className="w-20"
                                />
                              </div>
                              <span className={`text-sm font-medium ${status.color}`}>
                                {status.label}
                              </span>
                              <Button
                                size="sm"
                                onClick={() => void handleSave(product.id)}
                                disabled={!hasChanges && !isSaved}
                                variant={isSaved ? "secondary" : "default"}
                                className="gap-1.5"
                              >
                                {isSaved ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Guardado
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4" />
                                    Guardar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            {/* Order Stats */}
            {stats && (
              <div className="mb-8 grid gap-4 sm:grid-cols-4">
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                      <p className="text-sm text-muted-foreground">Pedidos Totales</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.pendingTransferences}</p>
                      <p className="text-sm text-muted-foreground">Transferencias Pendientes</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.confirmedOrders}</p>
                      <p className="text-sm text-muted-foreground">Pedidos Confirmados</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pending Transferences Section */}
            {pendingTransferences.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-foreground">⏳ Transferencias Pendientes de Verificación</h2>
                <div className="space-y-4">
                  {pendingTransferences.map((order) => (
                    <Card key={order.id} className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {order.customer.firstName} {order.customer.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground">Pedido: {order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString("es-AR")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">{formatPrice(order.total)}</p>
                              <p className="text-sm text-yellow-700 font-medium">Pendiente de Verificación</p>
                            </div>
                          </div>

                          {expandedOrder === order.id && (
                            <div className="border-t border-yellow-200 pt-4 space-y-3">
                              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Email:</span>
                                  <p className="font-medium">{order.customer.email}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Teléfono:</span>
                                  <p className="font-medium">{order.customer.phone}</p>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-muted-foreground">Dirección:</span>
                                  <p className="font-medium">
                                    {order.customer.address}, {order.customer.city} {order.customer.postalCode}
                                  </p>
                                </div>
                              </div>

                              <div className="border-t border-yellow-200 pt-3">
                                <p className="font-medium text-sm mb-2 text-foreground">Productos:</p>
                                <ul className="space-y-1 text-sm">
                                  {order.items.map((item) => (
                                    <li key={item.product.id} className="text-muted-foreground">
                                      {item.product.name} x{item.quantity} - {formatPrice(item.product.price * item.quantity)}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex gap-2 pt-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmTransference(order.id)}
                                  disabled={confirmingOrder === order.id}
                                  className="gap-2"
                                >
                                  <Check className="h-4 w-4" />
                                  {confirmingOrder === order.id ? "Confirmando..." : "Confirmar Transferencia Recibida"}
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              {expandedOrder === order.id ? "Ocultar" : "Ver Detalles"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Orders Section */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">Todos los Pedidos</h2>
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">No hay pedidos aún</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {[...orders].reverse().map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {order.customer.firstName} {order.customer.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Pedido: {order.id} · {new Date(order.createdAt).toLocaleDateString("es-AR")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.paymentMethod === "transferencia" ? "Transferencia Bancaria" : order.paymentMethod === "tarjeta" ? "Tarjeta de Crédito" : "Efectivo"} 
                              {order.paymentMethod === "transferencia" && ` · ${order.transferenceStatus === "confirmado" ? "✓ Confirmado" : "⏳ Pendiente"}`}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {order.status === "delivered" ? "Entregado" : "No entregado"}
                              </span>
                              <Button
                                size="sm"
                                variant={order.status === "delivered" ? "outline" : "default"}
                                onClick={() => void handleToggleDelivered(order.id, order.status !== "delivered")}
                              >
                                {order.status === "delivered" ? "Marcar como NO entregado" : "Marcar como Entregado"}
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">${order.total.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} item{order.items.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
