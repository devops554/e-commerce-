// src/types/index.ts

export type VehicleType = 'BIKE' | 'SCOOTER' | 'CAR' | 'VAN';
export type AvailabilityStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type PaymentMethod = 'COD' | 'ONLINE' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus =
  | 'created'
  | 'pending'
  | 'paid'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'returned'
  | 'failed_delivery';

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
  aadhaarNumber?: string;
  aadhaarImage?: string;
  panNumber?: string;
  panImage?: string;
  drivingLicenseImage?: string;
}

export interface DeliveryPartner {
  _id: string;
  name: string;
  phone: string;
  email: string;
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