import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { chatService } from '../../services/chatService'
import { getSupabase } from '../../lib/supabase'

const PAGE_SIZE = 30

export const useChatMessages = (friendId, session) => {
  const queryClient = useQueryClient()
  const debounceRef = useRef(null)

  const query = useInfiniteQuery({
    queryKey: ['chatMessages', friendId, session?.user?.id],
    queryFn: async ({ pageParam = 1 }) => {
      // Todas las páginas usan getChatroomMessagesPaginated
      const data = await chatService.getChatroomMessagesPaginated(
        friendId, pageParam, PAGE_SIZE, session
      )

      // En la primera carga también marcamos leídos via RPC
      // sin usar sus datos — solo para el efecto secundario
      if (pageParam === 1) {
        chatService.getChatroomMessages(friendId, session).catch(() => {})
      }

      // Agrupar por fecha localmente
      const groups = chatService.groupMessagesByDate(data || [])

      return {
        groups,
        page: pageParam,
        hasMore: data?.length >= PAGE_SIZE
      }
    },
    getPreviousPageParam: (firstPage) => {
      if (!firstPage.hasMore) return undefined
      return firstPage.page + 1
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