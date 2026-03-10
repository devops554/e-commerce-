// src/types/index.ts

export type VehicleType = 'BIKE' | 'SCOOTER' | 'CAR' | 'VAN';
export type AvailabilityStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type OrderStatus =
  | 'PENDING'
  | 'CREATED'
  | 'PAID'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'FAILED_DELIVERY';

// Backend uses lowercase 'cod' | 'razorpay' — match exactly
export type PaymentMethod = 'cod' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ShipmentStatus =
  | 'ORDER_PLACED'
  | 'ASSIGNED_TO_DELIVERY'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_DELIVERY'
  | 'CANCELLED'
  | 'RETURNED';

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  lastUpdated: string;
}

export interface DeliveryPartnerStats {
  totalDeliveries: number;
  rating: number;
}

export interface DeliveryPartnerDocuments {
  aadhaarNumber?: string | null;
  aadhaarImage?: string | null;
  panNumber?: string | null;
  panImage?: string | null;
  drivingLicenseImage?: string | null;
}

export interface Address {
  addressLine?: string;
  city?: string;
  state?: string;
  country: string;
  pincode?: string;
}

export interface DeliveryPartner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  bloodGroup?: string;
  permanentAddress?: Address;
  currentAddress?: Address;
  profileImage?: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  warehouseId: string;
  availabilityStatus: AvailabilityStatus;
  accountStatus: AccountStatus;
  currentLocation: CurrentLocation;
  stats: DeliveryPartnerStats;
  documents: DeliveryPartnerDocuments;
  token?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  variant: string;
  warehouse: string;
  quantity: number;
  price: number;
  title: string;
  status: string;
}

export interface OrderHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

// The raw order object as returned nested inside a Shipment
export interface PopulatedOrder {
  _id: string;
  orderId: string;           // human-readable e.g. "ORD-1773041001182-705"
  user: string;              // ObjectId string (not populated in available orders)
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  history: OrderHistory[];
  totalAmount: number;
  deliveryFee?: number;
  createdAt: string;
  updatedAt: string;
}

// The delivery partner reference nested in shipment
export interface ShipmentDeliveryPartner {
  _id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
}

// ─── Shipment — what the backend actually returns for available orders ────────
export interface Shipment {
  _id: string;
  orderId: Order;           // populated nested order object
  deliveryPartnerId: ShipmentDeliveryPartner;
  warehouseId: string | { _id: string; name: string; location?: { latitude: number; longitude: number } };
  status: ShipmentStatus;
  trackingNumber: string;
  distance?: number;                 // km — may be added by backend
  estimatedTime?: number;            // minutes
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Keep Order type for backward-compat with other screens (history, active delivery)
export interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    phone: string;
  };
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  history: OrderHistory[];
  totalAmount: number;
  deliveryFee: number;
  distance?: number;
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  type: 'COD_COLLECTED' | 'DELIVERY_EARNING' | 'INCENTIVE' | 'WITHDRAWAL';
  amount: number;
  orderId?: string;
  description: string;
  createdAt: string;
}

export interface WalletSummary {
  totalEarnings: number;
  todayEarnings: number;
  codCollected: number;
  incentives: number;
  withdrawals: number;
  availableBalance: number;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface AuthResponse {
  partner: DeliveryPartner;
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}