export interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  material: string;
  categoryId?: string | null;
  featured: boolean;
  sale: boolean;
  status: 'in_stock' | 'out_of_stock' | 'discontinued';
  popularity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderProductItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

export interface Order {
  _id: string;
  id?: string;
  orderId: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district?: string;
  area: string;
  note?: string;
  products: OrderProductItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSales: number;
}

export type AdminStats = DashboardStats;
