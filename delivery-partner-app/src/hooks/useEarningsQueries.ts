// src/hooks/useEarningsQueries.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { earningsAPI } from '../api/services';

export const EARNINGS_KEYS = {
  summary: ['earnings', 'summary'],
  list: ['earnings', 'list'],
  payouts: ['earnings', 'payouts'],
  offers: ['earnings', 'offers'],
};

export const useEarningsSummary = () =>
  useQuery({ queryKey: EARNINGS_KEYS.summary, queryFn: earningsAPI.getSummary, staleTime: 30_000 });

export const useAssignedReturnEarnings = () =>
  useQuery({ queryKey: EARNINGS_KEYS.list, queryFn: earningsAPI.getList, staleTime: 30_000 });

export const usePayoutHistory = () =>
  useQuery({ queryKey: EARNINGS_KEYS.payouts, queryFn: earningsAPI.getPayoutHistory, staleTime: 60_000 });

export const useActiveOffers = () =>
  useQuery({ queryKey: EARNINGS_KEYS.offers, queryFn: earningsAPI.getActiveOffers, staleTime: 60_000 });

export const useRaiseDispute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ earningsId, note }: { earningsId: string; note: string }) =>
      earningsAPI.raiseDispute(earningsId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.list });
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.summary });
    },
  });
};

export const useRequestPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: earningsAPI.requestPayout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.list });
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.summary });
    },
  });
};
