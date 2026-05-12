import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { chatService } from '../../services/chatService'
import { getSupabase } from '../../lib/supabase'

const PAGE_SIZE = 20

export const useChatMessages = (friendId, session) => {
  const queryClient = useQueryClient()
  const debounceRef = useRef(null)

  const query = useInfiniteQuery({
    queryKey: ['chatMessages', friendId, session?.user?.id],
    queryFn: async ({ pageParam = 1 }) => {
      if (pageParam === 1) {
        // Primera carga — usa RPC que agrupa por fecha y marca leídos
        const data = await chatService.getChatroomMessages(friendId, session)
        return { groups: data, page: 1, isFirstPage: true }
      } else {
        // Páginas siguientes — query directa paginada
        const data = await chatService.getChatroomMessagesPaginated(
          friendId, pageParam, PAGE_SIZE, session
        )
        return { messages: data, page: pageParam, isFirstPage: false }
      }
    },
    getNextPageParam: (lastPage) => {
      // Si la última página trajo menos mensajes que PAGE_SIZE, no hay más
      if (lastPage.isFirstPage) return undefined
      if (!lastPage.messages || lastPage.messages.length < PAGE_SIZE) return undefined
      return lastPage.page + 1
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.page <= 1) return undefined
      return firstPage.page - 1
    },
    initialPageParam: 1,
    enabled: !!friendId && !!session?.user?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  })

  useEffect(() => {
    if (!friendId || !session?.user?.id) return

    const sortedIds = [session.user.id, friendId].sort()
    const channelName = `chat_messages_${sortedIds[0]}_${sortedIds[1]}`

    const debouncedInvalidate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['chatMessages', friendId, session.user.id]
        })
      }, 300)
    }

    const channel = getSupabase()
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new
          const isRelevant =
            (msg.remitente === session.user.id && msg.destinatario === friendId) ||
            (msg.remitente === friendId && msg.destinatario === session.user.id)
          if (isRelevant) debouncedInvalidate()
        }
      )
      .subscribe()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      getSupabase().removeChannel(channel)
    }
  }, [friendId, session?.user?.id, queryClient])

  return query
}