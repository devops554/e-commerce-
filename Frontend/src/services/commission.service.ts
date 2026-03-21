import axiosClient from '../lib/axiosClient';

// ── Types ──────────────────────────────────────────────────────────────────

export interface RateConfig {
  _id: string;
  name: string;
  warehouseId?: { _id: string; name: string } | string;
  basePay: number;
  baseKm: number;
  distanceSlabs: { fromKm: number; toKm: number | null; ratePerKm: number }[];
  weightSlabs: { fromKg: number; toKg: number | null; flatPay: number }[];
  sizeMultipliers: { small: number; medium: number; large: number; xl: number };
  codBonus: number;
  firstDeliveryDayBonus: number;
  fiveStarRatingBonus: number;
  cancelAfterAcceptPenalty: number;
  lateDeliveryPenalty: number;
  unjustifiedFailurePenalty: number;
  isActive: boolean;
}

export interface SurgeRule {
  _id: string;
  name: string;
  triggerType: 'MANUAL' | 'TIME_WINDOW' | 'DATE_RANGE' | 'WEATHER' | 'DEMAND';
  multiplier: number;
  startHour?: number;
  endHour?: number;
  validFrom?: string;
  validTo?: string;
  applicableWarehouses: string[];
  demandThresholdPercent?: number;
  isActive: boolean;
  manuallyActivatedAt?: string;
  manuallyDeactivatedAt?: string;
}

export interface DeliveryZone {
  _id: string;
  name: string;
  zoneType: 'METRO_CORE' | 'METRO_OUTER' | 'SUBURBAN' | 'RURAL';
  multiplier: number;
  pincodes: string[];
  isActive: boolean;
}

export interface PartnerOffer {
  _id: string;
  title: string;
  description?: string;
  offerType: string;
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  tiers: { targetCount: number; bonusAmount: number; label?: string }[];
  applicableWarehouses: string[];
  applicablePartners: string[];
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface PartnerEarning {
  _id: string;
  partnerId: {
    _id: string;
    name: string;
    phone: string;
    payoutMethod?: {
      method: 'BANK' | 'UPI';
      accountNumber?: string;
      ifsc?: string;
      upiId?: string;
    }
  } | string;
  orderId: { _id: string; orderId: string } | string;
  shipmentId: string;
  distanceKm: number;
  weightKg: number;
  packageSize: string;
  surgeMultiplier: number;
  zoneMultiplier: number;
  zoneName?: string;
  activeSurgeNames: string[];
  basePay: number;
  distancePay: number;
  weightPay: number;
  sizePay: number;
  surgePay: number;
  zonePay: number;
  codBonus: number;
  firstDeliveryBonus: number;
  targetBonus: number;
  penalties: number;
  penaltyReason?: string;
  totalEarned: number;
  payoutStatus: 'PENDING' | 'REQUESTED' | 'APPROVED' | 'PAID' | 'DISPUTED';
  paidAt?: string;
  payoutTransactionId?: string;
  deliveredAt: string;
}

export interface EarningsSummary {
  _id: string;
  partnerName: string;
  partnerPhone: string;
  payoutMethod?: {
    method: 'BANK' | 'UPI';
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
  };
  totalDeliveries: number;
  totalEarned: number;
  totalPending: number;
  totalRequested: number;
  totalApproved: number;
  totalPaid: number;
}

export interface CommissionConfig {
  _id: string;
  payoutMode: 'MANUAL' | 'RAZORPAY';
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayXAccountNumber: string;
  minPayoutAmount: number;
  isActive: boolean;
}

export interface EarningsListResponse {
  data: PartnerEarning[];
  total: number;
  page: number;
  totalPages: number;
}

// ── Service ────────────────────────────────────────────────────────────────

export const commissionService = {
  // Rate Config
  getRateConfigs: () =>
    axiosClient.get<RateConfig[]>('/admin/commission/rate-config').then(r => r.data),
  createRateConfig: (dto: Partial<RateConfig>) =>
    axiosClient.post<RateConfig>('/admin/commission/rate-config', dto).then(r => r.data),
  updateRateConfig: (id: string, dto: Partial<RateConfig>) =>
    axiosClient.patch<RateConfig>(`/admin/commission/rate-config/${id}`, dto).then(r => r.data),
  deleteRateConfig: (id: string) =>
    axiosClient.delete(`/admin/commission/rate-config/${id}`).then(r => r.data),

  // Surge Rules
  getSurgeRules: () =>
    axiosClient.get<SurgeRule[]>('/admin/commission/surge-rules').then(r => r.data),
  createSurgeRule: (dto: Partial<SurgeRule>) =>
    axiosClient.post<SurgeRule>('/admin/commission/surge-rules', dto).then(r => r.data),
  updateSurgeRule: (id: string, dto: Partial<SurgeRule>) =>
    axiosClient.patch<SurgeRule>(`/admin/commission/surge-rules/${id}`, dto).then(r => r.data),
  toggleSurge: (id: string, isActive: boolean) =>
    axiosClient.patch<SurgeRule>(`/admin/commission/surge-rules/${id}/toggle`, { isActive }).then(r => r.data),
  activateRain: () =>
    axiosClient.post('/admin/commission/surge-rules/rain/activate').then(r => r.data),
  deactivateRain: () =>
    axiosClient.post('/admin/commission/surge-rules/rain/deactivate').then(r => r.data),

  // Zones
  getZones: () =>
    axiosClient.get<DeliveryZone[]>('/admin/commission/zones').then(r => r.data),
  createZone: (dto: Partial<DeliveryZone>) =>
    axiosClient.post<DeliveryZone>('/admin/commission/zones', dto).then(r => r.data),
  updateZone: (id: string, dto: Partial<DeliveryZone>) =>
    axiosClient.patch<DeliveryZone>(`/admin/commission/zones/${id}`, dto).then(r => r.data),
  addPincodes: (id: string, pincodes: string[]) =>
    axiosClient.post(`/admin/commission/zones/${id}/add-pincodes`, { pincodes }).then(r => r.data),

  // Offers
  getOffers: () =>
    axiosClient.get<PartnerOffer[]>('/admin/commission/offers').then(r => r.data),
  createOffer: (dto: Partial<PartnerOffer>) =>
    axiosClient.post<PartnerOffer>('/admin/commission/offers', dto).then(r => r.data),
  updateOffer: (id: string, dto: Partial<PartnerOffer>) =>
    axiosClient.patch<PartnerOffer>(`/admin/commission/offers/${id}`, dto).then(r => r.data),
  toggleOffer: (id: string, isActive: boolean) =>
    axiosClient.patch(`/admin/commission/offers/${id}/toggle`, { isActive }).then(r => r.data),

  // Earnings
  getEarnings: (params: { partnerId?: string; payoutStatus?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) =>
    axiosClient.get<EarningsListResponse>('/admin/commission/earnings', { params }).then(r => r.data),
  getEarningsSummary: () =>
    axiosClient.get<EarningsSummary[]>('/admin/commission/earnings/summary').then(r => r.data),
  getDisputedEarnings: () =>
    axiosClient.get<PartnerEarning[]>('/admin/commission/earnings/disputed').then(r => r.data),
  approveBulk: (earningsIds: string[]) =>
    axiosClient.patch('/admin/commission/earnings/approve-bulk', { earningsIds }).then(r => r.data),
  processPayout: (data: {
    partnerId: string;
    amount: number;
    mode: 'RAZORPAY' | 'MANUAL_UPI' | 'BANK' | 'CASH';
    transactionId?: string;
    earningsIds: string[];
    note?: string;
  }) =>
    axiosClient.post('/admin/commission/earnings/payout', data).then(r => r.data),
  resolveDispute: (id: string, data: { finalAmount: number; resolution: string }) =>
    axiosClient.patch(`/admin/commission/earnings/${id}/resolve-dispute`, data).then(r => r.data),
  getCodReport: () =>
    axiosClient.get('/admin/delivery/cod-report').then(r => r.data),

  // Global Config
  getConfig: () =>
    axiosClient.get<CommissionConfig>('/admin/commission/config').then(r => r.data),
  updateConfig: (dto: Partial<CommissionConfig>) =>
    axiosClient.patch<CommissionConfig>('/admin/commission/config', dto).then(r => r.data),
};
