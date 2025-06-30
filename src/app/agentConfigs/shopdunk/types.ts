// ShopDunk E-commerce Types

export interface Product {
  id: string;
  name: string;
  nameVi: string; // Vietnamese name
  category: string;
  subcategory: string;
  brand: string;
  price: number; // in VND
  originalPrice?: number; // for discount calculation
  discount?: number; // percentage
  description: string;
  descriptionVi: string;
  specifications: Record<string, string>;
  stock: number;
  variants?: ProductVariant[];
  images: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  nameVi: string;
  price?: number; // if different from base price
  stock: number;
  attributes: Record<string, string>; // e.g., color, storage
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  addedAt: string;
}

export interface Cart {
  id: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: Address;
  isVerified: boolean;
  orders: Order[];
  createdAt: string;
}

export interface Address {
  street: string;
  ward: string;
  district: string;
  city: string;
  province: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod?: string;
  shippingAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface OTPSession {
  phone: string;
  code: string;
  attempts: number;
  expiresAt: Date;
  verified: boolean;
}

export interface SessionState {
  currentProductContext?: Product;
  cartId?: string;
  customerVerified: boolean;
  customerInfo?: {
    phone: string;
    name: string;
  };
  lastResponse?: string;
  conversationTurns: number;
  lastActivityTime: Date;
} 