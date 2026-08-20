// Query do snapshot público (cache alinhado ao HTTP).

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import type { PortfolioSnapshot } from '../types';

export const portfolioKeys = {
  snapshot: ['portfolio', 'snapshot'] as const,
};

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioKeys.snapshot,
    queryFn: ({ signal }) => api.get<PortfolioSnapshot>('/public/portfolio', signal),
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
