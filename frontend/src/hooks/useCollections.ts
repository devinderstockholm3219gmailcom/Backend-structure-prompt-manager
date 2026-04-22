import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@lib/axios'
import type { ApiResponse, Collection, Prompt } from '../types'

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ collections: Collection[] }>>('/collections')
      return data.data.collections   // ← unwrap { success, data: { collections } }
    }
  })
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{
        collection: Collection
        prompts: Prompt[]
      }>>(`/collections/${id}`)
      return data.data   // ← { collection, prompts }
    },
    enabled: !!id
  })
}

export function useCreateCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      api.post<ApiResponse<{ collection: Collection }>>('/collections', body)
        .then(r => r.data.data.collection),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] })
  })
}

export function useDeleteCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/collections/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] })
  })
}