// Hooks React Query do painel: sessão, CRUDs, conteúdo, tema e mídia.

import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import { portfolioKeys } from '@/features/portfolio/api/portfolio.queries';
import type {
  MediaAsset,
  Project,
  SiteContent,
  Skill,
  SkillCategoryDto,
  ThemeResponse,
  TimelineEntry,
} from '@/features/portfolio/types';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export const adminKeys = {
  me: ['admin', 'me'] as const,
  skills: ['admin', 'skills'] as const,
  skillCategories: ['admin', 'skill-categories'] as const,
  projects: ['admin', 'projects'] as const,
  timeline: ['admin', 'timeline'] as const,
  content: ['admin', 'content'] as const,
  media: ['admin', 'media'] as const,
  theme: ['admin', 'theme'] as const,
};

export function useSession() {
  return useQuery({
    queryKey: adminKeys.me,
    queryFn: () => api.get<{ user: AdminUser }>('/auth/me'),

    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api.post<{ status: string; expiresInSeconds: number }>('/auth/login', input),
  });
}

export function useVerifyTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { code: string }) =>
      api.post<{ user: AdminUser; usedRecoveryCode: boolean; remainingRecoveryCodes: number }>(
        '/auth/verify-2fa',
        input,
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.me, { user: data.user });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<{ status: string }>('/auth/logout'),
    onSuccess: () => queryClient.clear(),
  });
}

function createResourceHooks<T>(resource: string, key: QueryKey) {
  const invalidate = (queryClient: ReturnType<typeof useQueryClient>): void => {
    void queryClient.invalidateQueries({ queryKey: key });
    void queryClient.invalidateQueries({ queryKey: portfolioKeys.snapshot });
  };

  return {
    useList: () =>
      useQuery({
        queryKey: key,
        queryFn: () => api.get<T[]>(`/admin/${resource}`),
        staleTime: 30 * 1000,
      }),

    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (input: unknown) => api.post<T>(`/admin/${resource}`, input),
        onSuccess: () => invalidate(queryClient),
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...input }: { id: string } & Record<string, unknown>) =>
          api.patch<T>(`/admin/${resource}/${id}`, input),
        onSuccess: () => invalidate(queryClient),
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => api.delete<void>(`/admin/${resource}/${id}`),
        onSuccess: () => invalidate(queryClient),
      });
    },

    useReorder: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (ids: string[]) => api.post<{ status: string }>(`/admin/${resource}/reorder`, { ids }),
        onSuccess: () => invalidate(queryClient),
      });
    },
  };
}

export const skillsApi = createResourceHooks<Skill>('skills', adminKeys.skills);
export const skillCategoriesApi = createResourceHooks<SkillCategoryDto>(
  'skill-categories',
  adminKeys.skillCategories,
);
export const projectsApi = createResourceHooks<Project>('projects', adminKeys.projects);
export const timelineApi = createResourceHooks<TimelineEntry>('timeline', adminKeys.timeline);

export function useContent() {
  return useQuery({
    queryKey: adminKeys.content,
    queryFn: () => api.get<SiteContent>('/admin/content'),
  });
}

export function useSaveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SiteContent) => api.put<{ status: string }>('/admin/content', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.content });
      void queryClient.invalidateQueries({ queryKey: portfolioKeys.snapshot });
    },
  });
}

export function useThemeSettings() {
  return useQuery({
    queryKey: adminKeys.theme,
    queryFn: () => api.get<ThemeResponse>('/admin/theme'),
  });
}

export function useSaveThemeSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ThemeResponse>) => api.put<ThemeResponse>('/admin/theme', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.theme });

      void queryClient.invalidateQueries({ queryKey: portfolioKeys.snapshot });
    },
  });
}

export function useMedia() {
  return useQuery({
    queryKey: adminKeys.media,
    queryFn: () => api.get<MediaAsset[]>('/admin/media'),
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);

      return api.post<MediaAsset>('/admin/media', form);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.media });
      void queryClient.invalidateQueries({ queryKey: portfolioKeys.snapshot });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/admin/media/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.media });
      void queryClient.invalidateQueries({ queryKey: portfolioKeys.snapshot });
    },
  });
}
