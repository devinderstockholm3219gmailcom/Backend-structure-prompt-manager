import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@lib/axios'
import type { ApiResponse, Prompt, PaginatedPrompts } from '../types'

export function usePrompts(page = 1, search = '') {
  return useQuery({
    queryKey: ['prompts', page, search],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedPrompts>>('/prompts', {
        params: { page, limit: 9, search }
      })
      return data.data   // ← { prompts, pagination }
    }
  })
}

export function usePrompt(id: string) {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ prompt: Prompt }>>(`/prompts/${id}`)
      return data.data.prompt
    },
    enabled: !!id
  })
}

export function useCreatePrompt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Prompt>) =>
      api.post<ApiResponse<{ prompt: Prompt }>>('/prompts', body)
        .then(r => r.data.data.prompt),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prompts'] })
  })
}

export function useUpdatePrompt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Prompt> & { id: string }) =>
      api.patch<ApiResponse<{ prompt: Prompt }>>(`/prompts/${id}`, body)
        .then(r => r.data.data.prompt),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prompts'] })
  })
}

export function useDeletePrompt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/prompts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prompts'] })
  })
}