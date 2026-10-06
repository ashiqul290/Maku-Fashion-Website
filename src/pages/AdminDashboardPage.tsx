import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Eye,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  UploadCloud,
  X,
  RefreshCw,
  AlertCircle,
  Tags
} from 'lucide-react';
import { Product, Order, AdminStats, Category } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ConfirmationModal } from '../components/ConfirmationModal.tsx';
import { BrandLogo } from '../components/BrandLogo.tsx';

async function readApiResponse<T>(response: Response): Promise<T> {
  const body = await response.text();
  try {
    return JSON.parse(body) as T;
  } catch {
    const detail = body.trim().slice(0, 160);
    throw new Error(
      `Server returned an invalid response (${response.status}).${detail ? ` ${detail}` : ' The response body was empty.'}`
    );
  }
}

interface AdminDashboardPageProps {
  onBackToStore: () => void;
  onRefreshProducts: () => void;
  onRefreshCategories: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onBackToStore,
  onRefreshProducts,
  onRefreshCategories
}) => {
  const { adminUser, adminToken, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Product Modal State (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    descriptionFabric: '',
    descriptionFeatures: '',
    price: '',
    discountPrice: '',
    material: '',
    stock: '',
    colors: '',
    sizes: '',
    images: [] as string[],
    sale: false,
    featured: false,
    categoryId: ''
  });
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // View Order Details Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const fetchAdminData = async () => {
    if (!adminToken) return;
    setIsLoading(true);

    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/products'),
        fetch('/api/orders', { headers: { Authorization: `Bearer ${adminToken}` } })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setProducts(prodData.products || []);
      }

      if (ordersRes.ok) {
        const orderData = await ordersRes.json();
        setOrders(orderData.orders || []);
      }

      const categoriesRes = await fetch('/api/categories');
      if (!categoriesRes.ok) throw new Error(`Category request failed (${categoriesRes.status})`);
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      showToast('Error loading data', 'Please check server connection', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [adminToken]);

  const handleSaveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adminToken) return;

    try {
      const response = await fetch(
        editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories',
        {
          method: editingCategoryId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + adminToken
          },
          body: JSON.stringify({ name: categoryName.trim() })
        }
      );
      const data = await readApiResponse<{ success: boolean; category: Category; error?: string }>(response);
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to save category.');

      setCategories(previous => editingCategoryId
        ? previous.map(category => category._id === data.category._id ? data.category : category)
        : [...previous, data.category].sort((a, b) => a.name.localeCompare(b.name))
      );
      showToast(editingCategoryId ? 'Category updated' : 'Category created', data.category.name, 'success');
      setCategoryName('');
      setEditingCategoryId(null);
      onRefreshCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save category.';
      console.error('Error saving category:', err);
      showToast('Error saving category', message, 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!adminToken || !categoryToDelete) return;

    try {
      const response = await fetch(`/api/categories/${categoryToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + adminToken }
      });
      const data = await readApiResponse<{ success: boolean; error?: string }>(response);
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to delete category.');

      setCategories(previous => previous.filter(category => category._id !== categoryToDelete._id));
      showToast('Category deleted', `${categoryToDelete.name}; its products are now uncategorized.`, 'info');
      setCategoryToDelete(null);
      onRefreshCategories();
      onRefreshProducts();
      fetchAdminData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category.';
      console.error('Error deleting category:', err);
      showToast('Error deleting category', message, 'error');
    }
  };

  // Open Product Modal for Add or Edit
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      description: '',
      descriptionFabric: '',
      descriptionFeatures: '',
      price: '',
      discountPrice: '',
      material: '',
      stock: '15',
      colors: 'Black, Dusty Rose, Mocha Brown, Olive Gold',
      sizes: '52, 54, 56, 58',
      categoryId: categories[0]?._id || '',
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'],
      sale: false,
      featured: false
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    const descriptionSections = product.description.match(
      /^Overview:\n([\s\S]*?)\n\nFabric & Feel:\n([\s\S]*?)\n\nFeatures & Styling:\n([\s\S]*)$/
    );
    setProductFormData({
      name: product.name,
      description: descriptionSections ? descriptionSections[1] : product.description,
      descriptionFabric: descriptionSections?.[2] || '',
      descriptionFeatures: descriptionSections?.[3] || '',
      price: product.price.toString(),
      discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
      material: product.material || '',
      stock: product.stock.toString(),
      colors: product.colors?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      categoryId: product.categoryId || '',
      images: product.images || [],
      sale: !!product.sale,
      featured: !!product.featured
    });
    setIsProductModalOpen(true);
  };

  // Upload one or more images and add each saved URL to the product image list.
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const validFiles = files.filter(file => supportedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024);
    const rejectedFiles = files.filter(file => !validFiles.includes(file));
    if (rejectedFiles.length) {
      const reason = rejectedFiles.some(file => file.size > 10 * 1024 * 1024)
        ? 'Each image must be smaller than 10 MB and use JPG, PNG, WebP, GIF, or AVIF format.'
        : 'Use JPG, PNG, WebP, GIF, or AVIF images.';
      showToast('Some images were skipped', reason, 'error');
    }
    if (!validFiles.length) {
      input.value = '';
      return;
    }

    setImageUploadLoading(true);
    try {
      const uploadedUrls: string[] = [];
      const failedFiles: string[] = [];

      for (const file of validFiles) {
        try {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => typeof reader.result === 'string'
              ? resolve(reader.result)
              : reject(new Error('Could not read image file.'));
            reader.onerror = () => reject(new Error('Could not read image file.'));
            reader.readAsDataURL(file);
          });

          const res = await fetch('/api/admin/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({ image: base64Data })
          });
          const responseText = await res.text();
          let data: { url?: string; error?: string } = {};
          try { data = responseText ? JSON.parse(responseText) : {}; } catch { /* Keep the HTTP status as the error. */ }
          if (!res.ok || !data.url) {
            throw new Error(data.error || `Server returned ${res.status} ${res.statusText}`);
          }
          uploadedUrls.push(data.url);
        } catch (err) {
          console.error(`Image upload failed for ${file.name}:`, err);
          failedFiles.push(`${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`);
        }
      }

      if (uploadedUrls.length) {
        setProductFormData(prev => ({
          ...prev,
          images: [...prev.images.filter(url => url.trim()), ...uploadedUrls]
        }));
      }
      if (failedFiles.length) {
        showToast('Some images failed to upload', failedFiles.join(' · ').slice(0, 220), 'error');
      } else {
        showToast(`${uploadedUrls.length} image${uploadedUrls.length === 1 ? '' : 's'} uploaded`, undefined, 'success');
      }
    } finally {
      setImageUploadLoading(false);
      input.value = '';
    }
  };

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    const payload = {
      name: productFormData.name.trim(),
      description: [
        `Overview:\n${productFormData.description.trim()}`,
        `Fabric & Feel:\n${productFormData.descriptionFabric.trim()}`,
        `Features & Styling:\n${productFormData.descriptionFeatures.trim()}`
      ].join('\n\n'),
      price: parseFloat(productFormData.price) || 0,
      discountPrice: productFormData.discountPrice ? parseFloat(productFormData.discountPrice) : undefined,
      material: productFormData.material.trim(),
      stock: parseInt(productFormData.stock, 10) || 0,
      categoryId: productFormData.categoryId || null,
      colors: productFormData.colors
        .split(',')
        .map(c => c.trim())
        .filter(Boolean),
      sizes: productFormData.sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      images: productFormData.images.map(img => img.trim()).filter(Boolean),
      sale: productFormData.sale,
      featured: productFormData.featured
    };

    try {
      let res;
      if (editingProduct) {
        // Update product
        res = await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create product
        res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      showToast(
        editingProduct ? 'Product updated successfully' : 'New product created',
        data.product.name,
        'success'
      );
      setIsProductModalOpen(false);
      fetchAdminData();
      onRefreshProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      showToast('Error saving product', err.message, 'error');
    }
  };

  // Handle Delete Product
  const handleConfirmDelete = async () => {
    if (!productToDelete || !adminToken) return;

    try {
      const res = await fetch(`/api/products/${productToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete product');
      }

      showToast('Product deleted', productToDelete.name, 'info');
      setProductToDelete(null);
      fetchAdminData();
      onRefreshProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      showToast('Error deleting product', err.message, 'error');
    }
  };

  // Handle Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!adminToken) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order status');
      }

      showToast('Order status updated', `Order marked as ${newStatus}`, 'success');

      // Update locally
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, status: newStatus as any } : o))
      );

      if (viewingOrder && viewingOrder._id === orderId) {
        setViewingOrder(prev => (prev ? { ...prev, status: newStatus as any } : null));
      }

      fetchAdminData();
    } catch (err: any) {
      console.error('Error updating order:', err);
      showToast('Error updating order', err.message, 'error');
    }
  };

  // Filter products
  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.material && p.material.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    const matchesSearch =
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch) ||
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.city.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1E7DA] text-[#856525]">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col md:flex-row">
      {/* ----------------- SIDEBAR ----------------- */}
      <aside className="w-full md:w-64 bg-[#1F1D1B] text-[#FAF8F5] border-r border-[#332E29] flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-[#2C2723]">
            <BrandLogo size="sm" inverted={true} />
            <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-semibold block mt-2">
              Staff Portal
            </span>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#B38838] text-white font-semibold shadow-sm'
                  : 'text-[#C7B7A7] hover:bg-[#2C2723] hover:text-[#FAF8F5]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-[#B38838] text-white font-semibold shadow-sm'
                  : 'text-[#C7B7A7] hover:bg-[#2C2723] hover:text-[#FAF8F5]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-[#B38838] text-white font-semibold shadow-sm'
                  : 'text-[#C7B7A7] hover:bg-[#2C2723] hover:text-[#FAF8F5]'
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#B38838] text-white font-semibold shadow-sm'
                  : 'text-[#C7B7A7] hover:bg-[#2C2723] hover:text-[#FAF8F5]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </button>
          </nav>
        </div>

        {/* Footer info & logout */}
        <div className="p-4 border-t border-[#2C2723] space-y-3">
          <div className="text-[11px] text-[#A8988A] truncate">
            Signed in as: <br />
            <strong className="text-[#FAF8F5]">{adminUser?.email}</strong>
          </div>

          <div className="space-y-1">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-[#2C2723] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ----------------- MAIN WORKSPACE ----------------- */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-[#1F1D1B]">
              {activeTab === 'overview' && 'Executive Overview'}
              {activeTab === 'products' && 'Product Inventory'}
              {activeTab === 'categories' && 'Category Management'}
              {activeTab === 'orders' && 'Order Processing Center'}
            </h1>
            <p className="text-xs text-[#786A5E] mt-0.5">
              Arabian Saaj Modest Fashion Management Suite
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="p-2 text-[#6B5E51] hover:text-[#1F1D1B] hover:bg-[#FAF8F5] rounded-xl border border-[#E8DFD8] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'products' && (
              <button
                onClick={openAddProductModal}
                className="px-4 py-2.5 bg-[#1F1D1B] hover:bg-[#3D352D] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#C5A059]" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'categories' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveCategory} className="lg:col-span-1 bg-white rounded-2xl border border-[#E8DFD8] shadow-xs p-6 space-y-4 self-start">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1F1D1B]">
                  {editingCategoryId ? 'Edit Category' : 'Create Category'}
                </h2>
                <p className="text-xs text-[#786A5E] mt-1">
                  Categories appear automatically in the store navigation dropdown.
                </p>
              </div>
              <label className="block text-xs font-medium text-[#1F1D1B]">
                Category name
                <input
                  required
                  maxLength={60}
                  value={categoryName}
                  onChange={event => setCategoryName(event.target.value)}
                  placeholder="e.g. Cookware Sets"
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl focus:outline-none focus:border-[#B38838]"
                />
              </label>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F1D1B] text-white text-xs font-semibold rounded-xl hover:bg-[#3D352D]">
                  <Plus className="w-4 h-4" />
                  {editingCategoryId ? 'Save Changes' : 'Create Category'}
                </button>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={() => { setEditingCategoryId(null); setCategoryName(''); }}
                    className="px-4 py-2.5 border border-[#E8DFD8] rounded-xl text-xs text-[#5C5044]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DFD8] shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-[#1F1D1B]">Store Categories</h2>
                <span className="text-xs text-[#786A5E]">{categories.length} total</span>
              </div>
              {categories.length === 0 ? (
                <p className="py-10 text-center text-xs text-[#786A5E]">No categories yet. Create one to add it to the navigation dropdown.</p>
              ) : (
                <div className="divide-y divide-[#F0EAE1]">
                  {categories.map(category => (
                    <div key={category._id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1F1D1B]">{category.name}</p>
                        <p className="text-[11px] text-[#8C7C6E]">
                          {products.filter(product => product.categoryId === category._id).length} products
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => { setEditingCategoryId(category._id); setCategoryName(category.name); }}
                          aria-label={`Edit ${category.name}`}
                          className="p-2 text-[#8C7C6E] hover:text-[#B38838] hover:bg-[#F7F1E4] rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(category)}
                          aria-label={`Delete ${category.name}`}
                          className="p-2 text-[#8C7C6E] hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#786A5E]">
                  Total Sales
                </span>
                <p className="font-serif text-2xl font-bold text-[#1F1D1B]">
                  ৳{(stats?.totalSales || 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Live Gross Revenue
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#786A5E]">
                  Total Orders
                </span>
                <p className="font-serif text-2xl font-bold text-[#1F1D1B]">
                  {stats?.totalOrders ?? orders.length}
                </p>
                <span className="text-[10px] text-[#8C7C6E]">All customer bookings</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#786A5E]">
                  Pending Orders
                </span>
                <p className="font-serif text-2xl font-bold text-amber-700">
                  {stats?.pendingOrders ?? orders.filter(o => o.status === 'Pending').length}
                </p>
                <span className="text-[10px] text-amber-700">Awaiting confirmation</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#786A5E]">
                  Completed
                </span>
                <p className="font-serif text-2xl font-bold text-emerald-700">
                  {stats?.completedOrders ?? orders.filter(o => o.status === 'Delivered').length}
                </p>
                <span className="text-[10px] text-emerald-700">Delivered successfully</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-xs space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#786A5E]">
                  Total Products
                </span>
                <p className="font-serif text-2xl font-bold text-[#1F1D1B]">
                  {stats?.totalProducts ?? products.length}
                </p>
                <span className="text-[10px] text-[#8C7C6E]">Active in modest catalog</span>
              </div>
            </div>

            {/* Recent Orders in Overview */}
            <div className="bg-white rounded-2xl border border-[#E8DFD8] shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-[#1F1D1B]">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#B38838] hover:underline font-medium"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8DFD8] text-[#786A5E] uppercase tracking-wider font-semibold">
                      <th className="py-2.5">Order Ref</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">City</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFEB]">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order._id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 font-mono font-medium text-[#1F1D1B]">
                          {order.orderId}
                        </td>
                        <td className="py-3 font-medium text-[#1F1D1B]">
                          {order.customerName}
                          <p className="text-[11px] text-[#8C7C6E]">{order.phone}</p>
                        </td>
                        <td className="py-3 text-[#5C5044]">{order.city}</td>
                        <td className="py-3 font-serif font-bold text-[#1F1D1B]">
                          ৳{order.total.toLocaleString()}
                        </td>
                        <td className="py-3">{getStatusBadge(order.status)}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-1.5 text-[#B38838] hover:bg-[#F7F1E4] rounded-lg transition-colors"
                            title="View Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-[#E8DFD8] shadow-xs p-6 space-y-4">
            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#9E8E81] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Filter by product name, fabric..."
                  className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
                />
              </div>

              <span className="text-xs text-[#786A5E]">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8DFD8] text-[#786A5E] uppercase tracking-wider font-semibold">
                    <th className="py-3">Product</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Material</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Stock</th>
                    <th className="py-3">Tags</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB]">
                  {filteredProducts.map(product => {
                    const img =
                      product.images?.[0] ||
                      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80';
                    return (
                      <tr key={product._id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 flex items-center gap-3">
                          <img
                            src={img}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-14 object-cover rounded-lg bg-[#FAF8F5] border border-[#E8DFD8]"
                          />
                          <div>
                            <h4 className="font-serif font-bold text-[#1F1D1B] max-w-xs truncate">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-[#8C7C6E]">
                              {product.colors?.length} colors • {product.sizes?.length} sizes
                            </p>
                          </div>
                        </td>

                        <td className="py-3 text-[#5C5044]">
                          {categories.find(category => category._id === product.categoryId)?.name || 'Uncategorized'}
                        </td>

                        <td className="py-3 text-[#5C5044]">
                          {product.material || 'Not specified'}
                        </td>

                        <td className="py-3">
                          <div className="font-serif font-bold text-[#1F1D1B]">
                            ৳{product.discountPrice || product.price}
                          </div>
                          {product.discountPrice && (
                            <div className="text-[10px] text-[#9E8E81] line-through">
                              ৳{product.price}
                            </div>
                          )}
                        </td>

                        <td className="py-3">
                          <span
                            className={`font-semibold ${
                              product.stock <= 5 ? 'text-rose-600' : 'text-[#1F1D1B]'
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        <td className="py-3 space-x-1">
                          {product.sale && (
                            <span className="bg-[#B38838] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Sale
                            </span>
                          )}
                          {product.featured && (
                            <span className="bg-[#1F1D1B] text-[#FAF8F5] text-[10px] px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </td>

                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => openEditProductModal(product)}
                            className="p-1.5 text-[#5C5044] hover:text-[#B38838] hover:bg-[#F2ECE4] rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-[#E8DFD8] shadow-xs p-6 space-y-4">
            {/* Search & Status Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#9E8E81] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  placeholder="Search by customer name, phone, or order ID..."
                  className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
                />
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['ALL', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(
                  status => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        orderStatusFilter === status
                          ? 'bg-[#1F1D1B] text-[#FAF8F5] border-[#1F1D1B]'
                          : 'bg-[#FAF8F5] text-[#5C5044] border-[#E8DFD8] hover:border-[#B38838]'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8DFD8] text-[#786A5E] uppercase tracking-wider font-semibold">
                    <th className="py-3">Order ID</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Items</th>
                    <th className="py-3">Total</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB]">
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 font-mono font-medium text-[#1F1D1B]">
                        {order.orderId}
                      </td>

                      <td className="py-3 text-[#786A5E]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3">
                        <div className="font-semibold text-[#1F1D1B]">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-[#8C7C6E]">{order.phone}</div>
                        <div className="text-[11px] text-[#8C7C6E] truncate max-w-xs">
                          {order.city}
                        </div>
                      </td>

                      <td className="py-3 text-[#5C5044]">
                        {order.products.length} {order.products.length === 1 ? 'item' : 'items'}
                      </td>

                      <td className="py-3 font-serif font-bold text-[#1F1D1B]">
                        ৳{order.total.toLocaleString()}
                      </td>

                      <td className="py-3">{getStatusBadge(order.status)}</td>

                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E8DFD8] text-[#1F1D1B] rounded-lg font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ----------------- PRODUCT CREATE / EDIT MODAL ----------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
          <div
            onClick={() => setIsProductModalOpen(false)}
            className="fixed inset-0 bg-[#1F1D1B]/70 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E8DFD8] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-4">
              <h3 className="font-serif text-xl font-bold text-[#1F1D1B]">
                {editingProduct ? 'Edit Modest Product' : 'Add New Modest Creation'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-[#8C7C6E] hover:text-[#1F1D1B] rounded-full hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productFormData.name}
                  onChange={e =>
                    setProductFormData({ ...productFormData, name: e.target.value })
                  }
                  placeholder="e.g. Royal Dubai Silk Abaya"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                  Category
                </label>
                <select
                  value={productFormData.categoryId}
                  onChange={event => setProductFormData({ ...productFormData, categoryId: event.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-[11px] text-[#8C7C6E] mt-1">Create a category in the Categories tab first.</p>
                )}
              </div>

              {/* Price and Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                    Regular Price (৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productFormData.price}
                    onChange={e =>
                      setProductFormData({ ...productFormData, price: e.target.value })
                    }
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                    Discount Price (৳) <span className="text-[#9E8E81]">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productFormData.discountPrice}
                    onChange={e =>
                      setProductFormData({ ...productFormData, discountPrice: e.target.value })
                    }
                    placeholder="2100"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productFormData.stock}
                    onChange={e =>
                      setProductFormData({ ...productFormData, stock: e.target.value })
                    }
                    placeholder="20"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                  />
                </div>
              </div>

              {/* Material / Fabric */}
              <div>
                <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                  Fabric / Material <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productFormData.material}
                  onChange={e =>
                    setProductFormData({ ...productFormData, material: e.target.value })
                  }
                  placeholder="e.g. 100% Authentic Medina Silk, Imported Korean Nidha"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                />
              </div>

              {/* Colors & Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                    Colors (comma separated)
                  </label>
                  <input
                    type="text"
                    value={productFormData.colors}
                    onChange={e =>
                      setProductFormData({ ...productFormData, colors: e.target.value })
                    }
                    placeholder="Midnight Black, Emerald, Mauve"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                    Sizes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={productFormData.sizes}
                    onChange={e =>
                      setProductFormData({ ...productFormData, sizes: e.target.value })
                    }
                    placeholder="52, 54, 56, 58 or Standard"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                  />
                </div>
              </div>

              {/* Product description sections */}
              <div className="space-y-3">
                <p className="font-medium text-[#1F1D1B] uppercase tracking-wider text-[11px]">
                  Product Description <span className="text-rose-500">*</span>
                </p>
                <div>
                  <label className="block text-xs font-medium text-[#615346] mb-1">Overview</label>
                  <textarea
                    required
                    rows={2}
                    value={productFormData.description}
                    onChange={e => setProductFormData({ ...productFormData, description: e.target.value })}
                    placeholder="Give a short introduction to the product..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#615346] mb-1">Fabric & Feel</label>
                  <textarea
                    rows={2}
                    value={productFormData.descriptionFabric}
                    onChange={e => setProductFormData({ ...productFormData, descriptionFabric: e.target.value })}
                    placeholder="Describe the fabric, texture, opacity, and drape..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#615346] mb-1">Features & Styling</label>
                  <textarea
                    rows={2}
                    value={productFormData.descriptionFeatures}
                    onChange={e => setProductFormData({ ...productFormData, descriptionFeatures: e.target.value })}
                    placeholder="Mention fit, useful details, and styling suggestions..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                  />
                </div>
              </div>

              {/* Product images */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-medium text-[#1F1D1B] uppercase tracking-wider text-[11px]">
                    Product Images <span className="text-[#786A5E] normal-case">(Image 1 is the main image)</span>
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-[#B38838] hover:text-[#916C26] font-semibold">
                    <UploadCloud className="w-4 h-4" />
                    <span>{imageUploadLoading ? 'Uploading...' : 'Upload Images'}</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif"
                      multiple
                      disabled={imageUploadLoading}
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  {productFormData.images.map((imageUrl, index) => (
                    <div key={`${index}-${imageUrl}`} className="flex items-center gap-3 rounded-xl border border-[#E8DFD8] bg-[#FAF8F5] p-2.5">
                      <div className="w-14 h-16 shrink-0 overflow-hidden rounded-lg border border-[#E8DFD8] bg-white">
                        {imageUrl.trim() ? (
                          <img src={imageUrl} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-[#9E8E81]">Preview</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <label className="block text-[11px] font-semibold text-[#615346]">
                          Image {index + 1}{index === 0 ? ' · Main image' : ''}
                        </label>
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={e => setProductFormData(prev => ({
                            ...prev,
                            images: prev.images.map((url, imageIndex) => imageIndex === index ? e.target.value : url)
                          }))}
                          placeholder="Paste image URL..."
                          className="w-full px-3 py-2 bg-white border border-[#E8DFD8] rounded-lg text-[#1F1D1B] text-xs focus:outline-none focus:border-[#B38838]"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => setProductFormData(prev => {
                              const images = [...prev.images];
                              [images[0], images[index]] = [images[index], images[0]];
                              return { ...prev, images };
                            })}
                            className="text-[11px] font-medium text-[#916C26] hover:underline"
                          >
                            Set as main image
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductFormData(prev => ({
                          ...prev,
                          images: prev.images.filter((_, imageIndex) => imageIndex !== index)
                        }))}
                        aria-label={`Remove image ${index + 1}`}
                        className="shrink-0 p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setProductFormData(prev => ({ ...prev, images: [...prev.images, ''] }))}
                  className="text-xs font-semibold text-[#916C26] hover:underline"
                >
                  + Add image URL
                </button>
                {imageUploadLoading && (
                  <p className="text-[11px] text-[#B38838] animate-pulse">Uploading images...</p>
                )}
              </div>

              {/* Flags: Sale & Featured */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.sale}
                    onChange={e =>
                      setProductFormData({ ...productFormData, sale: e.target.checked })
                    }
                    className="rounded border-[#E8DFD8] text-[#B38838] focus:ring-0"
                  />
                  <span className="text-[#1F1D1B] font-medium">Mark as Sale Item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.featured}
                    onChange={e =>
                      setProductFormData({ ...productFormData, featured: e.target.checked })
                    }
                    className="rounded border-[#E8DFD8] text-[#B38838] focus:ring-0"
                  />
                  <span className="text-[#1F1D1B] font-medium">Show in Featured on Homepage</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E8DFD8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 border border-[#E8DFD8] text-[#5C5044] rounded-xl hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1F1D1B] hover:bg-[#38322C] text-[#FAF8F5] font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Save New Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- ORDER VIEW DETAILS MODAL ----------------- */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
          <div
            onClick={() => setViewingOrder(null)}
            className="fixed inset-0 bg-[#1F1D1B]/70 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E8DFD8] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-4">
              <div>
                <span className="text-[10px] text-[#8C7C6E] uppercase tracking-wider font-semibold">
                  Order Management
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1F1D1B]">
                  {viewingOrder.orderId}
                </h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1.5 text-[#8C7C6E] hover:text-[#1F1D1B] rounded-full hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status changer */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DFD8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[#8C7C6E] block mb-1">Current Order Status:</span>
                <div>{getStatusBadge(viewingOrder.status)}</div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#1F1D1B] font-medium">Update Status:</span>
                <select
                  value={viewingOrder.status}
                  onChange={e => handleUpdateOrderStatus(viewingOrder._id, e.target.value)}
                  className="bg-white border border-[#E8DFD8] rounded-lg px-3 py-1.5 text-xs text-[#1F1D1B] focus:outline-none focus:border-[#B38838]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Delivery address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DFD8] space-y-1">
                <h4 className="font-serif font-bold text-[#1F1D1B]">Customer Information</h4>
                <p className="font-medium text-[#1F1D1B]">{viewingOrder.customerName}</p>
                <p className="text-[#5C5044]">Phone: <strong>{viewingOrder.phone}</strong></p>
                {viewingOrder.email && <p className="text-[#5C5044]">Email: {viewingOrder.email}</p>}
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DFD8] space-y-1">
                <h4 className="font-serif font-bold text-[#1F1D1B]">Delivery Destination</h4>
                <p className="text-[#1F1D1B] font-medium">{viewingOrder.city}{viewingOrder.district ? ` • ${viewingOrder.district}` : ''} • {viewingOrder.area}</p>
                <p className="text-[#5C5044] leading-relaxed">{viewingOrder.address}</p>
                {viewingOrder.note && (
                  <p className="text-[11px] text-[#8C7C6E] italic mt-1">
                    Note: {viewingOrder.note}
                  </p>
                )}
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#1F1D1B]">
                Items Ordered ({viewingOrder.products.length})
              </h4>
              <div className="divide-y divide-[#F5EFEB] border border-[#E8DFD8] rounded-xl overflow-hidden bg-white">
                {viewingOrder.products.map((p, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-12 object-cover rounded-md bg-[#FAF8F5]"
                        />
                      )}
                      <div>
                        <h5 className="font-semibold text-[#1F1D1B]">{p.name}</h5>
                        <p className="text-[11px] text-[#8C7C6E]">
                          Color: {p.color} • Size: {p.size} • Qty: {p.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-[#1F1D1B]">
                      ৳{(p.price * p.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DFD8] space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>৳{viewingOrder.deliveryCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode</span>
                <span>{viewingOrder.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-[#E8DFD8] flex justify-between items-baseline font-bold text-sm text-[#1F1D1B]">
                <span>Total Amount Due:</span>
                <span className="font-serif text-lg text-[#1F1D1B]">
                  ৳{viewingOrder.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PRODUCT DELETE CONFIRMATION ----------------- */}
      <ConfirmationModal
        isOpen={!!productToDelete}
        title="Delete Product?"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep Product"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
      <ConfirmationModal
        isOpen={!!categoryToDelete}
        title="Delete Category?"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? Products in this category will remain in the store but become uncategorized.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep Category"
        isDestructive={true}
        onConfirm={handleDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
