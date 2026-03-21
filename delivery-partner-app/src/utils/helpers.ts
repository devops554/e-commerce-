// src/utils/helpers.ts

import { OrderStatus, PaymentMethod } from '../types';
import { Colors } from './theme';

export const formatCurrency = (amount: number): string => {
  const val = amount ?? 0;
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatDistance = (meters: number): string => {
  const m = meters ?? 0;
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
};

export const formatTime = (minutes: number): string => {
  const min = minutes ?? 0;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    CREATED: 'Created',
    PAID: 'Paid',
    CONFIRMED: 'Confirmed',
    PACKED: 'Packed',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    RETURNED: 'Returned',
    FAILED_DELIVERY: 'Delivery Failed',
    FAILED_PICKUP: 'Pickup Failed',
    ASSIGNED_TO_DELIVERY: 'Assigned',
  };
  return labels[status] || status;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'DELIVERED':
      return Colors.success;
    case 'OUT_FOR_DELIVERY':
      return Colors.primary;
    case 'PACKED':
    case 'SHIPPED':
    case 'CONFIRMED':
      return Colors.warning;
    case 'FAILED':
    case 'CANCELLED':
    case 'FAILED_DELIVERY':
    case 'FAILED_PICKUP':
      return Colors.danger;
    case 'ASSIGNED_TO_DELIVERY':
      return Colors.warning;
    default:
      return Colors.textSecondary;
  }
};

export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    cod: 'Cash on Delivery',
    razorpay: 'Online Payment',
  };
  return labels[method?.toLowerCase()] || method;
};

export const isCOD = (method: string): boolean => method?.toLowerCase() === 'cod';

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