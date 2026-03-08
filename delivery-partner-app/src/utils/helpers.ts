// src/utils/helpers.ts

import { OrderStatus, PaymentMethod } from '../types';
import { Colors } from './theme';

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    created: 'Created',
    pending: 'Pending',
    paid: 'Paid',
    confirmed: 'Confirmed',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    failed: 'Failed',
    cancelled: 'Cancelled',
    returned: 'Returned',
    failed_delivery: 'Delivery Failed',
  };
  return labels[status] || status;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'delivered':
      return Colors.success;
    case 'out_for_delivery':
      return Colors.primary;
    case 'packed':
    case 'shipped':
    case 'confirmed':
      return Colors.warning;
    case 'failed':
    case 'cancelled':
    case 'failed_delivery':
      return Colors.danger;
    default:
      return Colors.textSecondary;
  }
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    COD: 'Cash on Delivery',
    ONLINE: 'Online Payment',
    WALLET: 'Wallet',
  };
  return labels[method];
};

export const isCOD = (method: PaymentMethod): boolean => method === 'COD';

export const maskPhone = (phone: string): string => {
  return phone.replace(/(\d{2})\d{6}(\d{2})/, '$1XXXXXX$2');
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};