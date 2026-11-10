import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ArrowLeft,
  AlertCircle,
  Eye,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'
import api from '../../lib/api'
import { Product, Category } from '../../types'

const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [form, setForm] = useState({
    name: '',
    price: '',
    size: '',
    unit: 'ml',
    stock: '',
    categoryId: '',
    shortDesc: '',
    description: '',
    safetyNotes: '',
    isPublished: true,
    isFeatured: false,
    ingredientsText: '',
  })

  // Fetch all admin products
  const { data: productsData, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get('/products/admin/all')
      return res.data
    },
  })

  // Fetch categories
  const { data: categoriesData } = useQuery<{ categories: Category[] }>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/admin/categories')
      return res.data
    },
  })

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm({
      name: '',
      price: '',
      size: '',
      unit: 'ml',
      stock: '50',
      categoryId: categoriesData?.categories?.[0]?.id || '',
      shortDesc: '',
      description: '',
      safetyNotes: '',
      isPublished: true,
      isFeatured: false,
      ingredientsText: '',
    })
    setErrorMsg('')
    setModalOpen(true)
  }

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod)
    setForm({
      name: prod.name,
      price: String(prod.price),
      size: prod.size,
      unit: prod.unit,
      stock: String(prod.stock),
      categoryId: prod.categoryId || '',
      shortDesc: (prod as any).shortDesc || '',
      description: prod.description || '',
      safetyNotes: prod.safetyNotes || '',
      isPublished: prod.isPublished,
      isFeatured: prod.isFeatured,
      ingredientsText: (prod.ingredients || []).map((i) => i.name).join(', '),
    })
    setErrorMsg('')
    setModalOpen(true)
  }

  // Save product mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const ingredients = form.ingredientsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }))

      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        size: form.size,
        unit: form.unit,
        stock: parseInt(form.stock) || 0,
        categoryId: form.categoryId || undefined,
        shortDesc: form.shortDesc,
        description: form.description,
        safetyNotes: form.safetyNotes,
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
        ingredients,
      }

      if (editingProduct) {
        return (await api.put(`/products/admin/${editingProduct.id}`, payload)).data
      } else {
        return (await api.post('/products/admin', payload)).data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setModalOpen(false)
      setSuccessMsg(
        editingProduct ? 'Product updated successfully.' : 'Product created successfully.'
      )
      setTimeout(() => setSuccessMsg(''), 3000)
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to save product.')
    },
  })

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return (await api.delete(`/products/admin/${id}`)).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setSuccessMsg('Product deleted.')
      setTimeout(() => setSuccessMsg(''), 3000)
    },
  })

  // Toggle published status
  const togglePublish = async (prod: Product) => {
    try {
      await api.put(`/products/admin/${prod.id}`, {
        isPublished: !prod.isPublished,
      })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    } catch (err: any) {
      alert('Could not update status.')
    }
  }

  const products = productsData?.products || []

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="page-container max-w-7xl space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
          <Link to="/admin" className="hover:text-forest transition-colors">Overview</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Products</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-charcoal">
              Product Catalogue Management
            </h1>
            <p className="text-xs text-charcoal/60 mt-1">
              Manage Botanique formulations, ingredient declarations, prices, and publication
              status.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Formulation</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/20 text-forest text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Regulatory note */}
        <div className="p-4 rounded-2xl bg-white border border-beige text-xs text-charcoal/70 flex items-start gap-3">
          <ShieldAlert size={16} className="text-forest shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Catalogue Policy:</strong> All product descriptions must remain factual. Do
            not invent clinical claims, dermatological endorsements, or ingredient
            percentages. Formulations containing beeswax must not be designated as vegan.
          </p>
        </div>

        {/* Table Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm">
          {isLoading ? (
            <div className="h-64 bg-cream/70 rounded-2xl animate-pulse" />
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige text-charcoal/50 font-medium">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Size</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Published</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige/60">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 font-medium text-charcoal">
                        <Link
                          to={`/products/${prod.slug}`}
                          target="_blank"
                          className="hover:underline hover:text-forest flex items-center gap-1.5"
                        >
                          <span>{prod.name}</span>
                          <Eye size={12} className="text-sage" />
                        </Link>
                      </td>
                      <td className="py-3 text-charcoal/70">
                        {prod.category?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 text-charcoal/70">
                        {prod.size} {prod.unit}
                      </td>
                      <td className="py-3 font-serif font-semibold text-charcoal">
                        ₹{Number(prod.price).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`badge ${
                            prod.stock > 10
                              ? 'bg-green-100 text-green-800'
                              : prod.stock > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          } text-[10px]`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => togglePublish(prod)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                            prod.isPublished
                              ? 'bg-forest text-cream'
                              : 'bg-stone-200 text-charcoal/70'
                          }`}
                        >
                          {prod.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1 text-charcoal/60 hover:text-forest transition-colors"
                          title="Edit Product"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${prod.name}?`)) {
                              deleteMutation.mutate(prod.id)
                            }
                          }}
                          className="p-1 text-charcoal/60 hover:text-red-700 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-charcoal/60 py-8 text-center">
              No products found in database. Seed or add a new formulation.
            </p>
          )}
        </div>

        {/* ─── Add/Edit Product Modal ──────────────────────────────── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-beige shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-beige">
                <h2 className="font-serif text-xl font-medium text-charcoal">
                  {editingProduct ? 'Edit Formulation' : 'Add New Botanical Formulation'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-full hover:bg-beige text-charcoal"
                >
                  <X size={18} />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  saveMutation.mutate()
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Product Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                      placeholder="e.g. Rose Face Oil"
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                      className="input text-xs bg-white"
                    >
                      <option value="">Select category…</option>
                      {categoriesData?.categories?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="label">Price (INR) *</label>
                    <input
                      type="number"
                      step="1"
                      value={form.price}
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                      required
                      placeholder="1450"
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Size *</label>
                    <input
                      type="text"
                      value={form.size}
                      onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                      required
                      placeholder="30"
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Unit *</label>
                    <select
                      value={form.unit}
                      onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                      className="input text-xs bg-white"
                    >
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Stock Units in Atelier</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Short Subtitle / Summary</label>
                  <input
                    type="text"
                    value={form.shortDesc}
                    onChange={(e) => setForm((p) => ({ ...p, shortDesc: e.target.value }))}
                    placeholder="Brief 1-sentence botanical description"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">
                    Declared Ingredients (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.ingredientsText}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, ingredientsText: e.target.value }))
                    }
                    placeholder="e.g. Squalane, Jojoba Seed Oil, Rosehip Seed Oil, Rose Extract, Tocopherol"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Full Product Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Enter truthful, conservative product description…"
                    className="input text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="label">Safety Notes & Cautions</label>
                  <input
                    type="text"
                    value={form.safetyNotes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, safetyNotes: e.target.value }))
                    }
                    placeholder="For external use only. Patch test before first use."
                    className="input text-xs"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-charcoal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, isPublished: e.target.checked }))
                      }
                      className="rounded border-beige text-forest"
                    />
                    <span>Publish to Live Store</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-charcoal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, isFeatured: e.target.checked }))
                      }
                      className="rounded border-beige text-forest"
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-beige">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-primary text-xs py-2.5 px-6"
                  >
                    {saveMutation.isPending ? 'Saving…' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProductsPage

