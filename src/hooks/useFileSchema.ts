import useSWR from 'swr'
import { FormField } from '@/types/contact-schema'

export function useFileSchema(userId: string) {
  const { data, error, isLoading } = useSWR<FormField[]>(
    userId ? `/api/schema/files/${userId}` : null,
    async (url: string) => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch file schema')
      }
      
      return response.json()
    }
  )

  return {
    fields: data,
    isLoading,
    error,
  }
}

