import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { chatService } from '../../services/chatService'
import { supabase } from '../../lib/supabase'

export const useChatMessages = (friendId, session) => {
  const queryClient = useQueryClient()
  const debounceRef = useRef(null)

  const query = useQuery({
    queryKey: ['chatMessages', friendId, session?.user?.id],
    queryFn: () => chatService.getChatroomMessages(friendId, session),
    enabled: !!friendId && !!session?.user?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  })

  useEffect(() => {
    if (!friendId || !session?.user?.id) return

    // Nombre de canal consistente independiente del orden de los IDs
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

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const msg = payload.new
          // Solo procesar mensajes de esta conversación
          const isRelevant =
            (msg.remitente === session.user.id && msg.destinatario === friendId) ||
            (msg.remitente === friendId && msg.destinatario === session.user.id)
          if (isRelevant) debouncedInvalidate()
        }
      )
      .subscribe()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [friendId, session?.user?.id, queryClient])

  return query
}